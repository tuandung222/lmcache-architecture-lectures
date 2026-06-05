---
sidebar_position: 0
sidebar_label: "🗺️ Roadmap & Syllabus"
---

# LMCache Internals: Deep Dive into KV Cache Sharing Architecture

Chào mừng bạn đến với kho lưu trữ bài giảng **LMCache Internals: Deep Dive into KV Cache Sharing Architecture**. Chuỗi bài giảng này được thiết kế đặc biệt cho các **AI Serving Engineer, Deep Learning Engineer và Systems Architect** muốn tìm hiểu sâu sắc về cách tối ưu hóa LLM serving bằng cơ chế chia sẻ, lưu trữ và offload Key-Value (KV) Cache giữa nhiều tiến trình và GPU khác nhau qua thư viện **LMCache**.

Mục tiêu tối thượng của chuỗi bài giảng này là giúp bạn không chỉ **hiểu chi tiết cấu trúc mã nguồn** của LMCache, mà còn **nắm vững các nguyên lý phân cấp lưu trữ, giao tiếp P2P, và disaggregation (phân tách Prefill-Decode)** để áp dụng vào các hệ thống AI serving quy mô lớn.

---

## 🗺️ Lộ trình Chuỗi Bài Giảng (Roadmap)

Dự án được chia làm 5 bài học phân tích kiến trúc và mã nguồn chi tiết:

| Bài học | Chủ đề | Nội dung cốt lõi | Tài liệu |
| :--- | :--- | :--- | :--- |
| **Bài 0** | **KV Cache Sharing Fundamentals** | Bản chất của KV Cache, bài toán trùng lặp tiền tố (prefix reuse), sự cần thiết của việc chia sẻ KV Cache liên GPU/liên Node, mô hình Local vs Remote vs P2P. | [Bài 0 Docs](./lesson_0_kv_cache_sharing_fundamentals.md) |
| **Bài 1** | **LMCache Core Architecture** | Kiến trúc 3 lớp: Frontend (API/Connector), Cache Engine (quản lý logic), và Storage Backend (quản lý lưu trữ vật lý). Token-to-block mapping và quản lý siêu dữ liệu (metadata). | [Bài 1 Docs](./lesson_1_lmcache_architecture.md) |
| **Bài 2** | **Hierarchical Storage & Memory Management** | Cơ chế lưu trữ phân cấp (GPU L1, CPU RAM L2, Local Disk L3, Remote Redis/MinIO L4). Kỹ thuật serialization/deserialization hiệu năng cao và GPUDirect Storage (GDS). | [Bài 2 Docs](./lesson_2_hierarchical_storage.md) |
| **Bài 3** | **Prefill-Decode Disaggregation (PD)** | Phân tách nút Prefill (tính toán nặng) và Decode (băng thông bộ nhớ). Cơ chế truyền KV Cache thời gian thực qua Transfer Channel và giải thuật đồng bộ bất đồng bộ. | [Bài 3 Docs](./lesson_3_prefill_decode_disaggregation.md) |
| **Bài 4** | **vLLM & SGLang Integration** | Cách LMCache nhúng vào các Serving Engine nổi tiếng (vLLM, SGLang). Phân tích chi tiết Connector, Multi-Process (MP) Adapter và cơ chế hooking/interception KV Cache. | [Bài 4 Docs](./lesson_4_vllm_sglang_integration.md) |

---

## 📂 Cấu trúc Repository

```bash
lmcache-architecture-lectures/
├── README.md                          # Giới thiệu tổng quan lộ trình học
├── docusaurus.config.ts               # Cấu hình Docusaurus website
├── docs/                              # Thư mục lưu trữ tài liệu các bài giảng chi tiết
│   ├── roadmap.md                     # Lộ trình & Syllabus bài giảng
│   ├── lesson_0_kv_cache_sharing_fundamentals.md
│   ├── lesson_1_lmcache_architecture.md
│   ├── lesson_2_hierarchical_storage.md
│   ├── lesson_3_prefill_decode_disaggregation.md
│   └── lesson_4_vllm_sglang_integration.md
```

---

## 🛠️ Yêu cầu chuẩn bị (Prerequisites)

Để tiếp thu tốt nhất chuỗi bài giảng này, người học nên trang bị trước:
1. **Kiến thức về vLLM/SGLang**: Đã hiểu cơ chế PagedAttention, Continuous Batching, cách vLLM quản lý KV Cache qua các khối (blocks).
2. **Python nâng cao**: Hiểu lập trình bất đồng bộ (`asyncio`), đa tiến trình (`multiprocessing`), và lập trình mạng (socket, gRPC/REST APIs).
3. **Phần cứng và Mạng**: Hiểu cơ bản về băng thông bộ nhớ GPU (HBM), RAM máy chủ, PCIe, và các giao thức mạng tốc độ cao (RDMA, InfiniBand).
