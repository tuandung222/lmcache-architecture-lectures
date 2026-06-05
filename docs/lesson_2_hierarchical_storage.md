---
sidebar_position: 3
sidebar_label: "Bài 2: Bộ nhớ phân tầng (Hierarchical Storage)"
---

# Bài 2: Bộ nhớ phân tầng & Kỹ thuật Serialization trong LMCache

Để cân bằng giữa tốc độ truy xuất cực nhanh của bộ nhớ GPU và dung lượng lưu trữ khổng lồ nhưng chậm hơn của đĩa hoặc mạng, LMCache áp dụng mô hình quản lý **Bộ nhớ phân tầng (Hierarchical Storage)** cùng các kỹ thuật tuần tự hóa (Serialization) hiệu năng cao. Bài học này sẽ phân tích chi tiết thiết kế này.

---

## 1. Thiết kế Bộ nhớ phân tầng (Hierarchical Storage Layering)

LMCache cho phép quản trị viên cấu hình nhiều lớp lưu trữ cùng một lúc. Cache được tìm kiếm theo thứ tự từ nhanh nhất đến chậm nhất:

```
┌──────────────────┐  Băng thông: ~2-3 TB/s (HBM3)
│   Lớp 1: VRAM    │  Dung lượng: Nhỏ (~80-140 GB per GPU)
└────────┬─────────┘  Vận hành bởi: Serving Engine (vLLM)
         │ (Evict)
┌────────▼─────────┐  Băng thông: ~30-60 GB/s (PCIe Gen 5)
│ Lớp 2: CPU RAM   │  Dung lượng: Trung bình (256 GB - 2 TB)
└────────┬─────────┘  Vận hành bởi: local_cpu_backend.py
         │ (Evict)
┌────────▼─────────┐  Băng thông: ~7-14 GB/s (NVMe SSD)
│  Lớp 3: NVMe     │  Dung lượng: Lớn (Vài TB)
└────────┬─────────┘  Vận hành bởi: local_disk_backend.py
         │ (Evict)
┌────────▼─────────┐  Băng thông: Phụ thuộc mạng (10-100 Gbps)
│ Lớp 4: Redis/S3  │  Dung lượng: Vô hạn (Cloud/Distributed)
└──────────────────┘  Vận hành bởi: remote_backend.py
```

### Cách thức hoạt động của luồng Eviction (Thu hồi bộ nhớ):
*   Khi lớp trên bị đầy bộ nhớ (vượt ngưỡng cấu hình `max_local_cpu_size` hoặc `max_local_disk_size`), LMCache sử dụng chính sách thu hồi bộ nhớ **LRU (Least Recently Used)** để đẩy các khối cache ít được truy cập nhất xuống phân tầng thấp hơn.
*   Quá trình này được quản lý tập trung bởi `StorageManager` (`lmcache/v1/storage_backend/storage_manager.py`).

---

## 2. Kỹ thuật Tuần tự hóa (Serialization / Deserialization)

KV Cache của các mô hình LLM bản chất là các PyTorch Tensors được lưu trên VRAM GPU dưới dạng định dạng số học bán chính xác (FP16, BF16). Để lưu trữ chúng vào CPU RAM, Đĩa hoặc đẩy qua Mạng, chúng ta cần chuyển đổi chúng sang mảng byte tuần tự (Byte array) và ngược lại.

Tuy nhiên, quá trình này có thể gây ra **CPU overhead** và nút thắt cổ chai về băng thông nếu không được tối ưu. LMCache tối ưu hóa luồng này như thế nào?

### A. Tối ưu hóa bộ nhớ không sao chép (Zero-copy & Memory Pinning)
*   **Pinned Memory (Page-locked Host Memory):** Khi chuyển dữ liệu từ GPU sang CPU RAM, LMCache sử dụng bộ nhớ CPU được ghim (pinned memory). Kỹ thuật này giúp GPU sao chép trực tiếp vào bộ nhớ hệ thống thông qua bộ điều khiển DMA (Direct Memory Access) mà không cần sự can thiệp của CPU, tăng tốc độ truyền tải lên đáng kể.
*   **Lazy Memory Allocation (`lazy_memory_allocator.py`):** LMCache duy trì một pool bộ nhớ CPU đệm đã được cấp phát sẵn thay vì liên tục gọi `malloc()` / `free()` của hệ điều hành, giúp giảm thiểu tối đa hiện tượng phân mảnh bộ nhớ của Python runtime.

### B. Kỹ thuật Serialize trong Native Code (C++/CUDA)
*   Trong các phiên bản tối ưu, LMCache cung cấp các hàm serialize viết bằng C++ (`csrc/` hoặc `native_storage_ops.pyi`) để tránh giới hạn Global Interpreter Lock (GIL) của Python và tận dụng tối đa năng lực xử lý đa luồng của CPU.
*   Quá trình nén và tuần tự hóa được thực hiện song song (pipelined) với quá trình sinh token của mô hình, giúp che giấu độ trễ truyền dữ liệu (latency hiding).

---

## 3. GPUDirect Storage (GDS) Backend (`gds_backend.py`)

Đối với các hệ thống sử dụng phần cứng cao cấp của NVIDIA, LMCache hỗ trợ **GPUDirect Storage (GDS)**:

```
Truyền thống:
GPU VRAM ──(PCIe)──> CPU RAM ──(Page Cache)──> NVMe SSD  (CPU tốn chu kỳ xử lý)

Với GPUDirect Storage:
GPU VRAM ──────────────(PCIe direct path)─────────────> NVMe SSD  (Bypass hoàn toàn CPU!)
```

*   **Bypass CPU Host:** GDS cho phép di chuyển trực tiếp dữ liệu giữa GPU VRAM và ổ cứng NVMe thông qua PCIe bus mà không cần phải sao chép trung gian vào CPU RAM hay đi qua Page Cache của hệ điều hành.
*   **Hiệu năng:** GDS giúp giảm tải CPU xuống gần bằng 0 và đạt đến băng thông tối đa của phần cứng NVMe SSD (lên tới hàng chục GB/s), cực kỳ hữu ích khi cần lưu hoặc tải các khối KV cache có kích thước hàng Gigabyte của các prompt cực dài (ví dụ: prompt 100k+ tokens).

Trong bài học tiếp theo, chúng ta sẽ phân tích một ứng dụng nâng cao khác của LMCache là **Prefill-Decode Disaggregation (PD Disaggregation)** – cơ chế tách biệt các nút tính toán Prefill và Decode trên cụm server.
