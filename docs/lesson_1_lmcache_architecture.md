---
sidebar_position: 2
sidebar_label: "Bài 1: Kiến trúc LMCache"
---

# Bài 1: Chi tiết Kiến trúc Hệ thống LMCache

Để cung cấp khả năng chia sẻ KV Cache hiệu năng cao trên quy mô cụm máy chủ, LMCache sử dụng thiết kế kiến trúc phân tầng gồm 3 lớp chính: **Frontend**, **Cache Engine**, và **Storage Backend**. Bài học này sẽ đi sâu phân tích sơ đồ kiến trúc tổng quan và chức năng của từng lớp trong mã nguồn LMCache.

---

## 1. Sơ đồ Kiến trúc Tổng quan (System Overview)

Dưới đây là sơ đồ mô tả cách LMCache hoạt động và tương tác với Serving Engine (ví dụ: vLLM):

```
┌──────────────────────────────────────────────────────────────┐
│                    LLM serving engine (vLLM)                 │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │   vLLM Block Manager  │ ◄───► │   LMCache Connector    │  │
│  └───────────────────────┘       └───────────┬────────────┘  │
└──────────────────────────────────────────────┼───────────────┘
                                               │ (API Calls)
┌──────────────────────────────────────────────▼───────────────┐
│                      LMCache Cache Engine                    │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │    Token Database     │       │    Event Manager       │  │
│  └───────────────────────┘       └────────────────────────┘  │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │   Memory Manager      │       │    Lookup Client       │  │
│  └───────────────────────┘       └────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Read/Write)
┌──────────────────────────────▼───────────────┐
│                    LMCache Storage Backend                   │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │ Local Memory (CPU RAM)│       │ Local Disk (SSD/NVMe)  │  │
│  └───────────────────────┘       └────────────────────────┘  │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │ Remote Storage (Redis)│       │ Peer-to-Peer Network   │  │
│  └───────────────────────┘       └────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Phân tích các thành phần kiến trúc

### A. LMCache Frontend & Connectors (`lmcache/integration`)
Lớp này đóng vai trò cầu nối, chịu trách nhiệm tích hợp LMCache trực tiếp vào luồng xử lý của Serving Engine.
*   **Intercepting (Đánh chặn):** Khi Serving Engine lập lịch xử lý một request mới, Connector sẽ intercept phần prompt tokens và tính toán mã băm (hash value) của các tiền tố để truy vấn cache.
*   **Cache Lookup:** Gửi yêu cầu kiểm tra xem KV Cache của phần tiền tố đó đã tồn tại trên LMCache chưa bằng hàm `lookup()`.
*   **Retrieve & Inject:** Nếu trúng cache (cache hit), Connector sẽ tải các khối KV cache về và nạp vào bộ đệm của GPU.
*   **Store:** Nếu trượt cache (cache miss), sau khi GPU hoàn thành pha Prefill và tính ra KV Cache mới, Connector sẽ gửi các khối này lên LMCache bằng hàm `store()` để lưu trữ cho lần truy vấn sau.

### B. LMCache Cache Engine (`lmcache/v1/cache_engine.py`)
Là bộ não điều phối toàn bộ logic của LMCache.
*   **Metadata Management:** Quản lý mối quan hệ giữa danh sách các token (token IDs) và vị trí của các khối cache tương ứng trong bộ nhớ.
*   **Token Database (`lmcache/v1/token_database.py`):** Cung cấp cấu trúc dữ liệu lưu trữ cây tiền tố (Prefix Tree / Trie) và bản đồ tra cứu (Lookup Maps) để nhanh chóng xác định xem một chuỗi token có khối cache tương ứng hay không.
*   **Memory Allocator (`lmcache/v1/lazy_memory_allocator.py`):** Quản lý cấp phát bộ nhớ đệm tạm thời khi thực hiện serialization/deserialization hoặc trung chuyển cache để tránh việc phân mảnh và overhead do cấp phát bộ nhớ liên tục trong Python.

### C. LMCache Storage Backend (`lmcache/v1/storage_backend`)
Lớp chịu trách nhiệm lưu trữ vật lý các khối KV Cache và định hình các thuộc tính hiệu năng của LMCache. Tất cả các backend đều phải cài đặt giao diện kế thừa từ lớp trừu tượng `abstract_backend.py`.
*   **`local_cpu_backend.py`:** Lưu cache trên RAM của CPU máy chủ. Đây là phân tầng lưu trữ nhanh nhất ngoài GPU VRAM, truy xuất qua PCIe bus.
*   **`local_disk_backend.py`:** Lưu cache trên ổ cứng cục bộ (NVMe SSD). Tốc độ chậm hơn RAM nhưng dung lượng lưu trữ cực kỳ lớn.
*   **`remote_backend.py`:** Lưu cache trên các dịch vụ phân tán từ xa như Redis, MinIO, S3. Cho phép chia sẻ cache giữa các máy chủ khác nhau trong cụm.
*   **`p2p_backend.py`:** Cơ chế chia sẻ ngang hàng trực tiếp giữa các tiến trình Serving Engine đang chạy song song, giảm tải cho bộ lưu trữ trung tâm.

---

## 3. Khảo sát luồng xử lý lưu trữ và truy vấn (Control Flow)

Khi một request đến hệ thống, luồng xử lý diễn ra như sau:

```
[vLLM Engine]              [LMCache Connector]             [Cache Engine]        [Storage Backend]
      │                             │                             │                      │
      │── 1. Gửi request ──────────>│                             │                      │
      │   (prompt tokens)           │── 2. Kiểm tra cache hit ───>│                      │
      │                             │      (Token Hash)           │── 3. Query backend ─>│
      │                             │                             │◄── 4. Cache Hit ─────│
      │◄── 5. Trả về KV Cache ──────│◄── 6. Trả về KV Cache ──────│                      │
      │   (Inject to GPU VRAM)      │                             │                      │
```

Nếu trượt cache (cache miss):
*   GPU tự tính toán KV Cache (Prefill phase).
*   Connector gửi KV Cache vừa tính toán tới LMCache Engine.
*   LMCache Engine ghi nhận vào `TokenDatabase`, đồng thời đẩy bất đồng bộ (async) xuống các lớp `StorageBackend` đã được cấu hình (ví dụ: vừa ghi vào CPU RAM cục bộ, vừa đẩy lên Redis từ xa).

Trong bài học sau, chúng ta sẽ khảo sát chi tiết cách LMCache quản lý bộ nhớ phân cấp và cơ chế nén dữ liệu để truyền tải KV cache với băng thông tối ưu nhất.
