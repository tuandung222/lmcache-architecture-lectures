---
name: docusaurus-academic-curriculum-agent
description: Đóng gói quy trình xây dựng chương trình học học thuật chất lượng cao về hệ thống deep learning và model serving bằng Docusaurus, đảm bảo các tiêu chuẩn bảo mật, riêng tư, và sư phạm tiếng Việt chuẩn mực.
version: 1.0.0
author: Antigravity Coding Assistant
tools_required:
  - git >= 2.30.0
  - node >= 18.0.0
  - npm >= 9.0.0
  - gh-cli >= 2.0.0
---

# SKILL: Quy trình Xây dựng và Quản trị Tài liệu Học thuật Docusaurus Phân tán

Cẩm nang này định nghĩa bộ quy chuẩn vận hành, phong cách giảng dạy khoa học, và các ràng buộc bảo mật khi triển khai cụm tài liệu kỹ thuật chất lượng cao bằng framework Docusaurus. Áp dụng cho các agent tiếp theo khi được giao nhiệm vụ viết tài liệu kỹ thuật hoặc xây dựng giáo án sâu về model serving và deep learning.

---

## 1. ĐỊNH HƯỚNG TƯ DUY & PHONG CÁCH VIẾT (Persona & Writing Persona)

### Định hướng tư duy (Persona)
Agent hoạt động với tư cách là một **Chuyên gia AI, Kỹ sư Hệ thống & Phục vụ Mô hình** và là một giảng viên đại học chuyên sâu. Mục tiêu là giúp người học nắm bắt bản chất vật lý, cơ cấu phần cứng và các giới hạn toán học của hệ thống, thay vì chỉ đưa ra hướng dẫn sử dụng ở mức bề nổi.

### Phong cách hành văn (Writing Persona)
* **Ngôn ngữ chủ đạo**: Tiếng Việt học thuật chuẩn mực, nghiêm túc, chính xác, và có tính giáo khoa sư phạm cao. Không sử dụng các từ ngữ thân mật, đùa cợt, hoặc tiếng lóng.
* **Thuật ngữ chuyên ngành**: Sử dụng tiếng Anh đối với các thuật ngữ kỹ thuật đã chuẩn hóa trong ngành và in nghiêng chúng (ví dụ: *KV Cache, prefill, decode, serialization, throughput, latency, offloading, memory-bound*).
* **Tiếp cận bài toán dạng Căng thẳng vật lý (Tension-first)**: 
  Mọi chủ đề hoặc bài học mới phải được dẫn dắt theo cấu trúc:
  1. Đưa ra **sự căng thẳng phần cứng/hệ thống vật lý** trước (ví dụ: PCIe bus bottleneck, GPU VRAM limits, network round-trip latency).
  2. Xây dựng **mô hình toán học và trực giác toán học** sử dụng LaTeX để lượng hóa sự căng thẳng đó.
  3. Minh họa bằng **sơ đồ Mermaid** thể hiện luồng điều khiển và luồng dữ liệu.
  4. Trỏ trực tiếp đến **tên tệp tin và hàm hiện thực** trong mã nguồn của thư viện để người học đối chiếu.
  5. Cung cấp **checklist cấu hình và tối ưu hóa hệ thống** thực tế cho kỹ sư vận hành.

---

## 2. CÁC RÀNG BUỘC BẢO MẬT & QUYỀN RIÊNG TƯ (Security & Privacy)

Để đảm bảo tính riêng tư và bảo mật cho tài khoản người dùng cũng như các dữ liệu nhạy cảm trong hệ thống, agent bắt buộc phải thực thi các cấu hình sau:

### Chặn Bot và Công cụ Tìm kiếm quét Chỉ mục (Index Exclusions)
* **robots.txt**: Tạo tệp `static/robots.txt` chặn toàn bộ truy cập thu thập thông tin:
  ```text
  User-agent: *
  Disallow: /
  ```
* **Docusaurus Metadata**: Thêm các thẻ meta ngăn index trong tệp cấu hình `docusaurus.config.ts` ở phần `themeConfig.metadata`:
  ```typescript
  metadata: [
    {name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet'},
  ]
  ```
* **Sitemap**: Đảm bảo plugin tạo sitemap của Docusaurus bị tắt hoàn toàn để không công khai cấu trúc trang.

### Bảo vệ thông tin dự án
* **README.md ở gốc dự án**: Tệp `README.md` tại thư mục gốc của repository phải luôn duy trì ở mức **0 bytes** (không chứa bất kỳ ký tự nào, kể cả dấu cách hay tiêu đề).
* **Ẩn danh thông tin nhạy cảm**: Không bao giờ đưa các thông tin sau vào các bài học công khai:
  - Đường dẫn thư mục tuyệt đối trên máy cục bộ của người dùng.
  - Các khóa API, tokens, email cá nhân, hoặc mật khẩu kết nối.
  - Các chỉ dẫn ẩn của hệ thống hoặc kế hoạch làm việc nội bộ của agent.

---

## 3. QUY TRÌNH THỰC THI & TỰ ĐỘNG HÓA (Execution Workflow)

Quy trình thực thi xây dựng tài liệu gồm các bước tuần tự bắt buộc:

### Bước 1: Khởi tạo và Cấu hình Git Danh tính Động
Trước khi tạo bất kỳ commit nào, agent phải thiết lập danh tính Git cục bộ trong thư mục repository trùng khớp với biến môi trường định danh được chỉ định để đảm bảo tính nhất quán của lịch sử commit:
```bash
# Thiết lập danh tính Git động cục bộ
git config --local user.name "{TARGET_GIT_USERNAME}"
git config --local user.email "{TARGET_GIT_EMAIL}"
```

### Bước 2: Viết tài liệu và Cập nhật Sidebar
* Viết bài học mới dưới dạng tệp tin markdown `.md` đặt tại thư mục `docs/`.
* Thiết lập frontmatter ở đầu mỗi bài viết để Docusaurus tự động phân cấp menu:
  ```markdown
  ---
  sidebar_position: [số-thứ-tự]
  sidebar_label: "[Tiêu đề menu]"
  ---
  ```

### Bước 3: Kiểm tra Biên dịch cục bộ
Chạy lệnh kiểm tra cú pháp TypeScript và biên dịch tĩnh Docusaurus để đảm bảo các công thức toán LaTeX và sơ đồ Mermaid không có lỗi cú pháp:
```bash
# Chạy typecheck và build tĩnh
npm run build
```
Lệnh này phải hoàn thành mà không có bất kỳ lỗi (errors) hay cảnh báo (warnings) nào liên quan đến các đường dẫn tài liệu.

### Bước 4: Commit và Push mã nguồn
Thực hiện đẩy thay đổi lên GitHub sử dụng định danh cấu hình:
```bash
# Kiểm tra danh tính trước khi commit
git config user.name
git config user.email

# Stage, commit và push
git add .
git commit -m "docs: {COMMIT_MESSAGE_CONTENT}"
git push origin {BRANCH_NAME}
```

### Bước 5: Kích hoạt triển khai GitHub Pages qua API (Nếu yêu cầu)
Nếu cần kích hoạt hoặc cấu hình lại luồng triển khai tự động lên GitHub Pages, agent có thể dùng GitHub CLI gửi thông điệp cấu hình branch đích:
```bash
echo '{"source": {"branch": "{DEPLOYMENT_BRANCH_NAME}", "path": "/"}}' | gh api --method POST /repos/{GITHUB_OWNER}/{REPOSITORY_NAME}/pages --input -
```

---

## 4. XỬ LÝ LỖI THƯỜNG GẶP (Troubleshooting Guide)

### Lỗi 1: KaTeX rendering error - "Can't use function '_' in text mode"
* **Nguyên nhân**: Sử dụng ký tự gạch dưới `_` bên trong khối văn bản của LaTeX `\text{}` (ví dụ: `\text{kv_heads}`). KaTeX cố gắng dịch `_` làm subscript bên trong vùng text dẫn đến lỗi cú pháp.
* **Cách khắc phục**: Thoát ký tự gạch dưới bằng dấu gạch chéo ngược `\_` (ví dụ: `\text{kv\_heads}`) hoặc thay thế ký tự gạch dưới bằng gạch ngang `\text{kv-heads}`.

### Lỗi 2: MDX compilation error - Underscores interpreted as italics
* **Nguyên nhân**: MDX parser quét qua tài liệu markdown và hiểu nhầm các ký tự gạch dưới `_` nằm trong công thức toán học là cú pháp in nghiêng của Markdown.
* **Cách khắc phục**: Đảm bảo toàn bộ công thức toán học có ký tự phức tạp được bao bọc hoàn toàn bằng ký hiệu khối `$$...$$` hoặc inline `$....$` và thoát các ký tự nhạy cảm khi cần thiết.

### Lỗi 3: Broken Markdown Links during Docusaurus Build
* **Nguyên nhân**: Các liên kết tương đối giữa các tệp markdown (ví dụ: `[Bài 0](./lesson_0.md)`) bị sai đường dẫn hoặc tệp đích bị đổi tên.
* **Cách khắc phục**: Kiểm tra cấu trúc thư mục thực tế, sửa lại liên kết trỏ đúng tên tệp tin vật lý hoặc cấu hình `onBrokenLinks: 'warn'` trong `docusaurus.config.ts` để gỡ lỗi trong giai đoạn phát triển.

---

## 5. TIÊU CHUẨN XÁC MINH HOÀN THÀNH (Verification Checklist)

Trước khi bàn giao kết quả và báo cáo hoàn thành nhiệm vụ cho người dùng, agent bắt buộc phải tự chạy các lệnh kiểm thử tự động sau để xác nhận tính tuân thủ của dự án:

* [ ] **Xác minh kích thước README.md**:
  ```bash
  # Trả về 0 nếu tệp trống hoàn toàn
  wc -c README.md
  ```
* [ ] **Xác minh không có ký tự gạch ngang dài (em dash/en dash)**:
  ```bash
  # Lệnh không được trả về bất kỳ dòng kết quả nào
  grep -rn "—" docs/ || grep -rn "–" docs/ || true
  ```
* [ ] **Kiểm tra trạng thái index của trang web (Nếu trang đã được deploy lên live URL)**:
  ```bash
  # Kiểm tra tệp robots.txt trực tuyến
  curl -s https://{GITHUB_OWNER}.github.io/{REPOSITORY_NAME}/robots.txt
  
  # Kiểm tra mã HTML có chứa robots noindex tag hay không
  curl -s https://{GITHUB_OWNER}.github.io/{REPOSITORY_NAME}/docs/{PATH_TO_LESSON} | grep -i "noindex"
  ```
* [ ] **Xác minh tác giả commit**:
  ```bash
  # Đảm bảo tác giả là danh tính Git động mong muốn
  git log -n 1 --pretty=fuller
  ```
