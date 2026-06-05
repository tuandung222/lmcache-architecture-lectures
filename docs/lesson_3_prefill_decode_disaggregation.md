---
sidebar_position: 4
sidebar_label: "Bài 3: Phân tách Prefill-Decode (PD Disaggregation)"
---

# Bài 3: LMCache trong kiến trúc phân tách Prefill-Decode (PD Disaggregation)

Trong các hệ thống Serving LLM lớn, xu hướng thiết kế mới nhất là **Prefill-Decode Disaggregation (Phân tách Prefill-Decode)**. LMCache đóng vai trò là xương sống kết nối mạng để truyền tải KV Cache giữa hai phân tầng này một cách nhanh chóng và hiệu quả.

---

## 1. Tại sao cần Phân tách Prefill-Decode?

Khi chạy chung cả pha Prefill và Decode trên cùng một GPU, chúng ta sẽ gặp phải hiện tượng **interference (nhiễu lẫn nhau)**:
*   **Prefill:** Cần năng lực tính toán cực lớn (Compute-heavy), chạy trong thời gian ngắn nhưng chiếm dụng tài nguyên tính toán của GPU.
*   **Decode:** Cần băng thông bộ nhớ (Memory-bandwidth bound), chạy trong thời gian dài với các bước tính toán nhỏ lẻ (sinh từng token).

Nếu chạy chung, một request đang thực hiện pha Prefill dài sẽ làm gián đoạn (chặn) toàn bộ các request khác đang chạy pha Decode, dẫn đến hiện tượng **jitter** (độ trễ sinh token tiếp theo tăng vọt).

```
Kiến trúc truyền thống (Shared GPU):
[Request A (Prefill)] ──► GPU ◄── [Request B (Decode Step)]  ==> Tranh chấp tài nguyên, gây trễ!

Kiến trúc phân tách (Disaggregated):
[Prefill Node (GPU Compute)]  ───►  LMCache  ───►  [Decode Node (GPU Memory)]
   (Tính KV Cache)              (Transfer)             (Giải mã sinh token)
```

---

## 2. Vai trò của LMCache trong PD Disaggregation

Trong kiến trúc phân tách, sau khi **Prefill Node** hoàn thành việc tính toán KV Cache cho prompt, nó không thể trực tiếp chạy tiếp pha Decode (vì pha Decode sẽ được phân phối sang một **Decode Node** khác để tối ưu hóa throughput). 

Vì vậy, KV Cache của prompt cần được chuyển từ Prefill Node sang Decode Node qua mạng. LMCache hiện thực hóa việc này qua lớp `pd_backend.py` và `pd_backend_async.py` nằm tại thư mục `lmcache/v1/storage_backend/`.

### A. Cơ chế Transfer Channel (`lmcache/v1/transfer_channel`)
*   LMCache thiết lập các kết nối mạng tốc độ cao (TCP sockets, gRPC, hoặc RDMA) giữa các máy chủ Prefill và Decode.
*   Khi Prefill Node kết thúc tính toán, lớp `PDBackend` sẽ đóng gói (serialize) KV Cache và đẩy vào kênh truyền bất đồng bộ `TransferChannel`.
*   Decode Node có thể truy vấn trước hoặc lấy ngay khi nhận được tín hiệu request, giảm thiểu tối đa thời gian chờ của GPU.

### B. Đồng bộ bất đồng bộ và che giấu độ trễ (Latency Hiding)
*   **`pd_backend_async.py`:** Phiên bản bất đồng bộ của PD Backend cho phép Decode Node bắt đầu sinh token ngay khi các khối KV Cache đầu tiên được truyền tới, thay vì đợi toàn bộ KV Cache của prompt siêu dài được truyền xong.
*   Quá trình giải tuần tự hóa (deserialization) và đẩy dữ liệu lên VRAM của GPU được thực hiện song song với luồng thực thi CUDA (CUDA streams), giúp ẩn đi chi phí truyền dẫn mạng.

---

## 3. Khảo sát Mã nguồn `pd_backend.py`

Nhìn vào mã nguồn lớp `PDBackend` trong `lmcache/v1/storage_backend/pd_backend.py`:
*   Nó kế thừa từ `AbstractBackend`.
*   Phương thức `put(self, key, value)` thực hiện việc gửi KV Cache qua kết nối client-server đến một offload server hoặc một node đích trực tiếp.
*   Phương thức `get(self, key)` gửi yêu cầu truy xuất và chặn (hoặc bất đồng bộ) chờ nhận gói tin phản hồi chứa các khối KV cache đã được serialize từ xa, sau đó tái cấu trúc lại thành các Tensor của PyTorch để phục vụ suy luận.

Trong bài tiếp theo, chúng ta sẽ xem cách tích hợp các thành phần này vào các Engine như vLLM hay SGLang và cơ chế hook mã nguồn để can thiệp vào Block Manager của chúng.
