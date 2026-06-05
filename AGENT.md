# AGENT.md

## 1. Project overview

This repository is a Vietnamese Docusaurus curriculum for the **LMCache** library. It is designed for deep learning engineers, AI serving developers, and systems engineers who want to understand the exact mechanics of Key-Value (KV) Cache sharing, hierarchical cache offloading, and Prefill-Decode (PD) disaggregation.

The goal is to provide a rigorous, academic-grade guide explaining the theoretical roots of KV Cache reuse, distributed storage architectures (CPU RAM, local NVMe, Redis, GPUDirect Storage), and the integration details with serving frameworks like vLLM and SGLang.

This file is the operating manual for future agents. Treat it as the stable source of truth for writing quality, repository safety, verification, privacy, and completion criteria.

---

## 2. Repository map

- `docs/`: public Vietnamese curriculum chapters.
  - `docs/roadmap.md`: syllabus and learning paths.
  - `docs/lesson_0_kv_cache_sharing_fundamentals.md`: fundamentals of KV Cache sharing.
  - `docs/lesson_1_lmcache_architecture.md`: core system components of LMCache.
  - `docs/lesson_2_hierarchical_storage.md`: storage layers and memory operations.
  - `docs/lesson_3_prefill_decode_disaggregation.md`: prefill-decode disaggregation.
  - `docs/lesson_4_vllm_sglang_integration.md`: integration adapters and multi-process configurations.
  - `docs/case_studies/`: folder containing real-world case studies.
    - `docs/case_studies/roadmap_case_studies.md`: case studies overview.
    - `docs/case_studies/case_0_chatbot_multi_round.md`: multi-round chatbot case study.
    - `docs/case_studies/case_1_rag_at_scale.md`: enterprise RAG serving case study.
    - `docs/case_studies/case_2_prefill_decode_disaggregation.md`: disaggregated serving case study.
- `src/`: Docusaurus landing page and styling.
- `static/`: public static assets and `robots.txt`.
- `.github/workflows/`: CI and GitHub Pages deployment workflow.
- `README.md`: must remain empty.

---

## 3. Curriculum-wide content standard

Public content must be highly educational, technically rigorous, and written for advanced learners. Do not expose private task instructions, local absolute paths, credentials, internal notes, hidden constraints, or agent coordination details in public docs.

A curriculum chapter should teach by introducing a concrete tension first (e.g. why CPU-GPU memory copy creates latency bottlenecks, why multi-GPU serving complicates caching) before offering the solution.

Use `Phần` for course sections. Do not use em dash characters. Use commas, colons, semicolons, or parentheses instead.

---

## 4. Pedagogical writing style

Future agents must write with the persona of an **AI Expert, Deep Learning & Model Serving Specialist**, and a dedicated professor. The goal is to help students grasp the absolute roots, system mechanics, and mathematical bounds of KV Cache caching, rather than just high-level summaries, so they can confidently apply and implement them in real-world systems.

The prose must be highly professional, precise, serious, patient, and technically deep. It must read like an original academic lecture series in Vietnamese, not a translated or marketing-oriented document.

Use Vietnamese as the main language. Use English technical terms when they are standard in the industry: *KV Cache, prefill, decode, offloading, serialization, deserialization, prefix reuse, latency, throughput, tensor parallelism, GPUDirect Storage, cache eviction, hit rate, page table*. Explain a term before relying on it heavily.

Avoid casual language, slang, and jokes. The tone should be authoritative, academic, and accessible.

For every important concept, follow this pedagogical flow:
1. Start from a concrete hardware/system tension (e.g., VRAM constraints, network latency, PCIe bottleneck).
2. Build mathematical intuition, formulate equations (using LaTeX), and prove key terms.
3. Show the corresponding clean pseudocode or architectural flow.
4. Reference the actual file and function in `LMCache` where this is implemented.
5. Provide actionable performance tuning checklists and practical implementation guides.

---

## 5. Math, diagrams, and examples

Math must be taught, not just displayed.
- Explain every variable in equations.
- Use LaTeX formatting ($formula$ or $$formula$$).
- Follow equations with intuitive prose, such as: `Đọc công thức này theo nghĩa toán học và thực tế...` or `Bản chất của công thức nằm ở việc...`.

Use Mermaid diagrams to illustrate data flow, hierarchical caching states, communication protocols, and multi-process coordination.

---

## 6. Source material and attribution policy

The official `LMCache` repository is the source of truth for architectural details and implementation. Do not copy prose directly. Explain in original Vietnamese. Code snippets should be short and used only when they clarify a concept.

---

## 7. Public privacy and safety constraints

`README.md` must remain empty (0 bytes). Do not add any characters or placeholders to it.

Public docs must not mention:
- private user instructions or hidden agent constraints.
- the fact that `README.md` is empty.
- local absolute paths.
- credentials, tokens, secrets, API keys, or private URLs.

Privacy controls:
- `static/robots.txt` must disallow all crawling.
- Docusaurus must include `noindex,nofollow,noarchive,nosnippet` metadata.
- Sitemap generation must remain disabled.

---

## 8. Commands and verification

Safe read-only or verification commands:
- `npm run typecheck`: run TypeScript verification.
- `npm run build`: build the Docusaurus site.
- `git status --short --branch`: inspect repository state.
- `gh api repos/tuandung222/lmcache-architecture-lectures/pages`: verify GitHub Pages deployment status.

Commands requiring explicit approval/actions:
- Configuring or enabling GitHub Pages for the first time.
- Manual publishing or deploying.
- Pushing to GitHub if not already requested.
- Changing repository visibility.

---

## 9. Completion checklist

Before reporting completion, verify the relevant items:
- `README.md` is still 0 bytes.
- `npm run typecheck` and `npm run build` pass without errors.
- No em dash characters appear in public or source text.
- Public docs read like original Vietnamese teaching material.
- If pushed, the commit author and committer are the intended identity (`tuandung222`).
- The deployed website returns `HTTP 200` on the live URL.
- Search engine exclusions are active on the live site (verified through `robots.txt` disallowing `/` and `<meta name="robots" content="noindex..."/>` in page source).
- `/sitemap.xml` should return 404.

---

## 10. Repo specialization: LMCache Internals

### Audience
Write for people who already understand transformer inference but want to build or run state-of-the-art LLM serving clusters using caching.

### Learning promise
A reader should finish this curriculum able to explain:
- How LMCache extends vLLM and SGLang from single-GPU prefix reuse to cluster-wide sharing.
- The precise architecture and data flow between the Frontend, Cache Engine, and Storage Backends.
- The performance and overhead trade-offs of hierarchical storage (VRAM vs CPU RAM vs SSD vs Object Storage).
- The inner workings of serialization and deserialization techniques for KV Cache tensors.
- The mechanics of Prefill-Decode disaggregation using Transfer Channel.
- How multi-process setups (Tensor Parallelism) avoid redundant caching operations using consolidated connectors.

### Misconceptions to actively prevent
- LMCache does not replace the serving engine's scheduler or local block manager; it extends them.
- Offloading KV Cache to host RAM or Disk is not always faster; it is a latency-throughput trade-off that depends on prompt length and hardware speed (PCIe, GDS).
- Sharing KV Cache across networks is beneficial only if the transfer latency is lower than the local compute latency (prefill time).
- Serializing PyTorch tensors is not a free operation; memory pinning and native C++ implementations are required to avoid CPU page-faults and Python runtime bottlenecks.

---

## 11. Maintenance notes for future agents

Keep this file concise enough to be read, but specific enough to guide action. If it becomes too long, split public teaching guidance into a student-facing authoring guide and keep operational constraints here.

Update this file when:
- commands change
- directory structure changes
- privacy or deployment posture changes
- QA rules change
- agents repeatedly make the same mistake
- course scope expands in a stable way
