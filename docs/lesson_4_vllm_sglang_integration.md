---
sidebar_position: 5
sidebar_label: "Bài 4: Tích hợp vLLM & SGLang"
---

# Bài 4: Tích hợp LMCache vào vLLM và SGLang

Để LMCache có thể hoạt động mà không yêu cầu người dùng phải thay đổi mã nguồn ứng dụng phục vụ LLM, thư viện này cung cấp các lớp Adapter và Connector tích hợp sâu vào mã nguồn của **vLLM** và **SGLang**. Bài học này sẽ phân tích các cơ chế tích hợp đó.

---

## 1. Cơ chế Đánh chặn & Nhúng (Interception & Adaptation)

Trong các Serving Engine, việc quản lý KV Cache vật lý được đảm nhận bởi **Block Manager** (như `BlockSpaceManager` trong vLLM). LMCache nhúng vào luồng này thông qua hai hoạt động chính:

1.  **Retrieve Hook (Đánh chặn khi lập lịch):**
    Trước khi vLLM phân bổ một khối VRAM trống và bắt đầu tính toán pha Prefill, Adapter của LMCache sẽ can thiệp để kiểm tra xem tiền tố (prefix) của prompt hiện tại đã được LMCache lưu trữ ở đâu đó (CPU RAM, Disk hoặc Redis) hay chưa. Nếu có, nó sẽ tải về và ghi đè trực tiếp vào các khối VRAM của GPU, đồng thời báo cho vLLM bỏ qua pha Prefill cho các token này.
2.  **Store Hook (Lưu trữ sau khi sinh):**
    Sau khi vLLM hoàn thành pha Prefill và tính toán xong KV Cache cho các token mới, Adapter sẽ đón bắt sự kiện này và gửi nội dung của các khối KV Cache mới sinh lên LMCache Engine theo cơ chế bất đồng bộ (để không làm chậm luồng suy luận chính).

---

## 2. Giải pháp cho Multi-Process & Tensor Parallelism (`lmcache_mp_connector.py`)

Khi phục vụ các mô hình LLM lớn, chúng ta thường sử dụng **Tensor Parallelism (TP)** để phân mảnh mô hình và chạy trên nhiều GPU song song (ví dụ: TP=2, TP=4, TP=8).

### Thách thức:
*   Mỗi GPU Worker chỉ lưu trữ một phần (shard) của KV Cache tương ứng với các phân mảnh Attention Heads của nó.
*   Nếu từng GPU Worker tự liên lạc độc lập với LMCache để lưu trữ/tải cache, nó sẽ tạo ra lượng lớn kết nối mạng trùng lặp và gây nghẽn băng thông của Storage Backend.

### Giải pháp của LMCache:
LMCache sử dụng **Multi-Process Connector** (`lmcache/integration/vllm/lmcache_mp_connector.py`) và **Multi-Process Adapter** (`vllm_multi_process_adapter.py`):

```
┌─────────────────────────────────────────────────────────────────┐
│                    vLLM Multi-Process Engine                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   GPU Worker 0   │  │   GPU Worker 1   │  │   GPU Worker 2   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │            │
│  ┌────────▼─────────────────────▼─────────────────────▼─────────┐  │
│  │                     LMCache MP Connector                     │  │
│  │              (Phối hợp phân mảnh KV Cache)                   │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ (Single Consolidated Request)
                        ┌─────────▼─────────┐
                        │   LMCache Engine  │
                        └───────────────────┘
```

*   **Consolidated Requests (Yêu cầu hợp nhất):** MP Connector đóng vai trò như một bộ điều phối trung tâm. Nó thu thập thông tin KV cache từ toàn bộ các GPU Workers, gộp chúng lại thành một yêu cầu hợp nhất và giao tiếp với LMCache Engine thông qua một tiến trình đại diện duy nhất.
*   **Worker Synchronization:** Điều phối các tiến trình worker đồng bộ ghi nhận và lấy đúng phân đoạn KV Cache của mình dựa trên phân chia Tensor Parallelism, giảm thiểu tối đa overhead giao tiếp IPC (Inter-Process Communication).

---

## 3. Khảo sát Mã nguồn `vllm_v1_adapter.py`

Tệp tin `vllm_v1_adapter.py` (nằm trong `lmcache/integration/vllm/`) chứa logic tương thích với kiến trúc mới vLLM v1:
*   Nó đóng gói lớp `LMCacheV1Adapter` chịu trách nhiệm giao tiếp với vLLM v1 EngineCore.
*   Phương thức `process_input` nhận các yêu cầu lập lịch và gọi LMCache Connector để kiểm tra cache.
*   Nó sử dụng các hàm tối ưu hóa như `rebuild_kv_cache` để ghi đè các block vật lý trên GPU một cách nhanh nhất từ dữ liệu tải về.

Bài học này khép lại chuỗi phân tích chi tiết về LMCache. Bạn đã nắm được toàn bộ nguyên lý từ bản chất KV Cache, cấu trúc 3 lớp của LMCache, quản lý bộ nhớ phân cấp, phân tách PD cho tới cách tích hợp thực tế vào Serving Engine.
