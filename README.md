# LMCache Internals: Deep Dive into KV Cache Sharing Architecture

Chuỗi tài liệu giảng học & phân tích chi tiết về kiến trúc lưu trữ, chia sẻ và tối ưu hoá Key-Value (KV) Cache giữa nhiều tiến trình và GPU của thư viện **LMCache**.

Được biên soạn nhằm giúp các kỹ sư AI Serving, Systems Architect hiểu cách thức hoạt động bên trong của LMCache, cách nó tích hợp vào các Engine nổi tiếng như vLLM, SGLang, và cách hiện thực hệ thống lưu trữ cache phân tầng hiệu năng cao.

---

## 🗺️ Lộ trình Bài giảng (Roadmap)

Dự án gồm 5 bài học lý thuyết & phân tích mã nguồn đi từ nền tảng đến thực tế:

*   **Bài 0:** [Tổng quan về Chia sẻ KV Cache](./docs/lesson_0_kv_cache_sharing_fundamentals.md) - Tại sao vLLM/SGLang cần LMCache? Bản chất và bài toán prefix reuse cục bộ vs phân tán.
*   **Bài 1:** [Kiến trúc LMCache](./docs/lesson_1_lmcache_architecture.md) - Cấu trúc 3 lớp: Frontend, Cache Engine và Storage Backend.
*   **Bài 2:** [Bộ nhớ phân tầng (Hierarchical Storage)](./docs/lesson_2_hierarchical_storage.md) - CPU RAM, NVMe Disk, Redis/MinIO, GPUDirect Storage và kỹ thuật serialization zero-copy.
*   **Bài 3:** [Phân tách Prefill-Decode (PD Disaggregation)](./docs/lesson_3_prefill_decode_disaggregation.md) - Kênh truyền dữ liệu tốc độ cao (Transfer Channel) giữa các Prefill Node và Decode Node.
*   **Bài 4:** [Tích hợp vLLM & SGLang](./docs/lesson_4_vllm_sglang_integration.md) - Can thiệp (hooking) vào Block Manager và giải quyết bài toán Tensor Parallelism (TP) với Multi-Process Connector.

---

## 🚀 Chạy local Website bài giảng

Chuỗi bài giảng này được xây dựng trên framework Docusaurus. Để chạy local:

```bash
# Cài đặt dependencies
npm install

# Khởi chạy dev server local (truy cập tại http://localhost:3000)
npm run start

# Build phiên bản production để chuẩn bị deploy
npm run build
```

---

*Biên soạn bởi tuandung222.*
