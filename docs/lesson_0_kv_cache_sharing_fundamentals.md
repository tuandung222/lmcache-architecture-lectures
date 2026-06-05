---
sidebar_position: 1
sidebar_label: "Bài 0: Tổng quan KV Cache Sharing"
---

# Bài 0: Tổng quan về Chia sẻ KV Cache (KV Cache Sharing)

Trong hệ thống phục vụ mô hình ngôn ngữ lớn (LLM Serving), **KV Cache** đóng vai trò quyết định đối với hiệu năng hệ thống. Tuy nhiên, việc quản lý và chia sẻ KV Cache hiệu quả vẫn là một thách thức lớn. Bài học này sẽ phân tích bản chất của KV Cache, bài toán trùng lặp tiền tố (prefix reuse), và tại sao chúng ta cần một giải pháp chia sẻ KV Cache phân tán như **LMCache**.

---

## 1. Bản chất của KV Cache trong LLM Inference

Quá trình suy luận LLM tự hồi quy (Autoregressive Generation) bao gồm hai giai đoạn chính:

1.  **Prefill Phase (Giai đoạn tiền nạp):**
    *   Hệ thống nhận vào toàn bộ prompt từ người dùng.
    *   Tính toán các ma trận Key (K) và Value (V) cho toàn bộ token trong prompt song song.
    *   Giai đoạn này cực kỳ tốn năng lực tính toán (**Compute-bound**).
2.  **Decode Phase (Giai đoạn giải mã):**
    *   Sinh ra từng token mới tại mỗi bước thời gian (iteration).
    *   Chỉ cần tính toán K và V cho token mới sinh, nhưng cần truy xuất K và V của tất cả các token trước đó trong bộ nhớ.
    *   Giai đoạn này cực kỳ tốn băng thông bộ nhớ (**Memory-bound**).

Để tránh việc phải tính toán lại K và V của các token trước đó ở mỗi bước sinh token mới, chúng được lưu lại trong bộ nhớ GPU dưới dạng **KV Cache**.

---

## 2. Thử thách về trùng lặp tiền tố (Prefix Reuse)

Trong thực tế, nhiều yêu cầu (requests) gửi đến hệ thống LLM chia sẻ chung một phần tiền tố (prefix) dài. Ví dụ:
*   **Hệ thống RAG (Retrieval-Augmented Generation):** Tài liệu tham khảo hoặc ngữ cảnh hệ thống (System Prompt) được đính kèm vào mỗi câu hỏi.
*   **Multi-round Conversations (Trò chuyện nhiều lượt):** Lịch sử cuộc hội thoại được gửi đi gửi lại kèm theo câu hỏi mới.
*   **Agentic Workflows:** Các prompt hướng dẫn lập trình, định dạng đầu ra (JSON schema) dài được dùng chung cho nhiều tác vụ.

Nếu không tối ưu, hệ thống sẽ phải thực hiện lại pha **Prefill** (tính toán lại KV Cache) cho phần tiền tố trùng lặp này ở mỗi request. Điều này dẫn đến sự lãng phí tài nguyên tính toán GPU cực lớn và làm tăng đáng kể thời gian phản hồi từ đầu (Time to First Token - TTFT).

```
Không có Prefix Caching:
Request 1: [System Prompt (2k tokens)] + [Question 1]  ==> Prefill 2k + Q1 tokens
Request 2: [System Prompt (2k tokens)] + [Question 2]  ==> Prefill 2k + Q2 tokens (Tính lại 2k tokens!)
```

---

## 3. Giới hạn của cơ chế Prefix Caching truyền thống (vLLM Block Manager)

Các công cụ phục vụ như vLLM đã hiện thực hóa cơ chế **Automatic Prefix Caching (APC)** ở cấp độ đơn instance bằng cách sử dụng cấu trúc bảng trang (Page Table) của **PagedAttention**:
*   Khi một request hoàn tất, các khối KV Cache của phần tiền tố được giữ lại trong VRAM GPU.
*   Nếu có request mới trùng khớp tiền tố (dựa trên thuật toán so khớp Hash), vLLM sẽ ánh xạ trực tiếp bảng trang logical sang các physical blocks sẵn có trên GPU VRAM.

### ⚠️ Hạn chế:
1.  **Chỉ hoạt động cục bộ (Single Instance / Single GPU):** Nếu hệ thống chạy trên cụm nhiều GPU (để tăng throughput hoặc tải lớn), KV cache trên GPU 0 không thể chia sẻ cho GPU 1.
2.  **Giới hạn dung lượng VRAM:** Khi VRAM bị đầy bởi các request đang xử lý (Running requests), các khối KV Cache cũ lưu trữ tiền tố sẽ bị giải phóng (evicted) để nhường chỗ, buộc hệ thống phải tính toán lại ở lần sau.

---

## 4. Giải pháp: Chia sẻ KV Cache Phân tán (Distributed KV Cache Sharing) với LMCache

**LMCache** ra đời nhằm giải quyết triệt để các hạn chế trên bằng cách xây dựng một hệ thống lưu trữ và chia sẻ KV Cache độc lập ngoài GPU VRAM.

```
                  ┌─────────────────────────────────────┐
                  │          LMCache Frontend           │
                  │  (Tích hợp vào vLLM/SGLang Engine)  │
                  └──────────────────┬──────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌────────────────────────┐              ┌────────────────────────┐
    │     Local Storage      │              │     Remote Storage     │
    │  (CPU Host RAM / Disk) │              │  (Redis / MinIO / S3)  │
    └────────────────────────┘              └────────────────────────┘
```

LMCache phân tách KV Cache ra khỏi vòng đời của một tiến trình Serving Engine và cung cấp các tính năng vượt trội:

*   **Cross-Engine/Cross-GPU Sharing:** KV cache được sinh ra từ bất kỳ GPU nào đều có thể được đẩy lên một bộ lưu trữ chung (ví dụ: Redis hoặc P2P network) và tải xuống bởi bất kỳ GPU nào khác trong cụm.
*   **Hierarchical Offloading (Giải phóng bộ nhớ phân tầng):** Khi VRAM GPU đầy, thay vì hủy bỏ hoàn toàn KV Cache, LMCache sẽ đẩy chúng xuống bộ nhớ CPU Host RAM, Disk cục bộ, hoặc các Object Storage đám mây (S3/MinIO).
*   **Prefill-Decode Disaggregation (PD Disaggregation):** Cho phép truyền nhanh KV Cache được sinh ra từ các node chuyên biệt cho pha Prefill sang các node chuyên giải mã (Decode nodes), giúp tối ưu hiệu năng tổng thể của toàn cụm máy chủ.

Trong các bài học tiếp theo, chúng ta sẽ đi sâu vào kiến trúc chi tiết, cách quản lý bộ nhớ phân tầng, cơ chế truyền tải mạng hiệu năng cao và cách LMCache tích hợp vào vLLM/SGLang.
