---
sidebar_position: 0
sidebar_label: "🗺️ Tổng quan Case Studies"
---

# LMCache Case Studies: Ứng dụng Thực tế & Tối ưu Hệ thống

Bên cạnh việc nắm vững các nguyên lý kiến trúc lý thuyết, việc hiểu cách áp dụng LMCache vào các tình huống thực tế là cực kỳ quan trọng đối với các kỹ sư vận hành hệ thống AI serving. Phần này cung cấp 3 bài học phân tích tình huống cụ thể (*case studies*), mô tả các vấn đề nghẽn cổ chai phần cứng thực tế và cách LMCache giúp khắc phục.

---

## 🗺️ Danh sách các Case Studies

Dưới đây là các case study được phân tích chi tiết trong khóa học:

| Case Study | Tác vụ ứng dụng | Tình huống kỹ thuật | Tài liệu |
| :--- | :--- | :--- | :--- |
| **Case 0** | **Multi-round Chatbot** | Tối ưu hóa bộ nhớ cho hệ thống chatbot hội thoại nhiều lượt với prompt dài và lịch sử hội thoại phình to. Phân tích chi phí tính toán lại so với truyền tải. | [Case 0 Docs](./case_0_chatbot_multi_round.md) |
| **Case 1** | **RAG at Scale** | Phục vụ hệ thống RAG (Retrieval-Augmented Generation) doanh nghiệp trên cụm đa máy chủ với hàng triệu câu hỏi truy cập dữ liệu trùng lặp. | [Case 1 Docs](./case_1_rag_at_scale.md) |
| **Case 2** | **PD Disaggregation** | Triển khai phân tách cụm Prefill và cụm Decode chuyên biệt trong các hệ thống API thương mại quy mô lớn để ổn định độ trễ ITL. | [Case 2 Docs](./case_2_prefill_decode_disaggregation.md) |

---

## 🎯 Mục tiêu học tập

Sau khi nghiên cứu xong các case study này, người học sẽ có khả năng:
1. Xác định chính xác khi nào nên kích hoạt chế độ cache cục bộ (*CPU Host RAM*), khi nào cần cache từ xa (*Redis/S3*).
2. Xây dựng công thức ước lượng băng thông mạng tối thiểu cần thiết để vận hành cụm phân tách Prefill-Decode.
3. Thiết lập các adapter tích hợp và cấu hình các biến môi trường để tối ưu hóa hiệu quả lưu trữ của vLLM/SGLang.
