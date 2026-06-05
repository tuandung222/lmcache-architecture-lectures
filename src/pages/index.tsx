import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero custom-hero', styles.heroBanner)}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.25)', marginBottom: '1.5rem' }}>
          DOCUMENTATION & ARCHITECTURE STUDY
        </div>
        <Heading as="h1" className="hero__title" style={{ fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem' }}>
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{ maxWidth: '750px', margin: '0 auto 2.5rem auto', fontSize: '1.2rem', lineHeight: '1.6', opacity: 0.85 }}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease' }}
            to="/docs/roadmap">
            Bắt đầu học ngay 🚀
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '8px', marginLeft: '1rem', border: '1px solid var(--card-border)' }}
            href="https://github.com/tuandung222/lmcache-architecture-lectures">
            View on GitHub 🛠️
          </Link>
        </div>
      </div>
    </header>
  );
}

interface FeatureItem {
  title: string;
  badge: string;
  description: string;
}

const CorePillars: FeatureItem[] = [
  {
    title: 'Hierarchical Storage',
    badge: 'Memory Management',
    description: 'Giải phóng và lưu trữ KV Cache phân tầng từ GPU VRAM xuống CPU RAM, ổ đĩa cục bộ (SSD/NVMe) và bộ nhớ đám mây (Redis, S3/MinIO).',
  },
  {
    title: 'Cross-Engine Sharing',
    badge: 'Distributed Caching',
    description: 'Chia sẻ và tái sử dụng KV Cache giữa nhiều tiến trình Serving và GPU khác nhau trong cùng một cụm máy chủ, loại bỏ trùng lặp tính toán.',
  },
  {
    title: 'PD Disaggregation',
    badge: 'Architecture & Network',
    description: 'Hỗ trợ phân tách các nút Prefill và Decode thông qua kênh truyền KV Cache mạng tốc độ cao (RDMA, TCP, gRPC) thời gian thực.',
  },
];

interface LectureItem {
  number: string;
  title: string;
  desc: string;
  path: string;
  category: 'Background' | 'Core Architecture' | 'Storage Backend' | 'Distributed & Networking' | 'Integration';
}

const Lectures: LectureItem[] = [
  {
    number: 'Bài 0',
    title: 'Tổng quan về Chia sẻ KV Cache (KV Cache Sharing)',
    desc: 'Tìm hiểu về pha Prefill vs Decode, bài toán trùng lặp tiền tố (prefix reuse), giới hạn của APC cục bộ và động lực ra đời của LMCache.',
    path: '/docs/lesson_0_kv_cache_sharing_fundamentals',
    category: 'Background'
  },
  {
    number: 'Bài 1',
    title: 'Chi tiết Kiến trúc Hệ thống LMCache',
    desc: 'Phân tích thiết kế 3 lớp: Frontend/Connectors, LMCache Cache Engine, và Storage Backends. Cách quản lý Metadata và Token Database.',
    path: '/docs/lesson_1_lmcache_architecture',
    category: 'Core Architecture'
  },
  {
    number: 'Bài 2',
    title: 'Bộ nhớ phân tầng & Kỹ thuật Serialization',
    desc: 'Cơ chế giải phóng bộ nhớ (eviction) LRU phân tầng, kỹ thuật Zero-copy Host Memory và GPUDirect Storage (GDS) tối ưu hóa băng thông.',
    path: '/docs/lesson_2_hierarchical_storage',
    category: 'Storage Backend'
  },
  {
    number: 'Bài 3',
    title: 'LMCache trong kiến trúc phân tách Prefill-Decode',
    desc: 'Giải pháp PD Disaggregation, thiết kế kênh truyền Transfer Channel bất đồng bộ và kỹ thuật che giấu độ trễ truyền dẫn qua mạng.',
    path: '/docs/lesson_3_prefill_decode_disaggregation',
    category: 'Distributed & Networking'
  },
  {
    number: 'Bài 4',
    title: 'Tích hợp LMCache vào vLLM và SGLang',
    desc: 'Cách LMCache can thiệp (hook) vào Block Manager của vLLM và SGLang. Giải quyết bài toán Tensor Parallelism với Multi-Process (MP) Connector.',
    path: '/docs/lesson_4_vllm_sglang_integration',
    category: 'Integration'
  }
];

function CategoryBadge({ category }: { category: LectureItem['category'] }) {
  const colors: Record<LectureItem['category'], { bg: string, text: string }> = {
    'Background': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
    'Core Architecture': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    'Storage Backend': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    'Distributed & Networking': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
    'Integration': { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
  };

  const color = colors[category];

  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: color.bg, color: color.text, alignSelf: 'flex-start' }}>
      {category}
    </span>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} | Deep Dive KV Cache Caching & Offloading`}
      description="Chuỗi bài giảng phân tích chi tiết kiến trúc, thuật toán và mã nguồn của thư viện LMCache dành cho Distributed LLM Serving.">
      <HomepageHeader />
      
      <main style={{ padding: '4rem 0', background: 'var(--ifm-background-color)' }}>
        {/* Core Pillars Section */}
        <section className="container" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Heading as="h2" style={{ fontSize: '2rem', fontWeight: 700 }}>
              🚀 Ba Trụ Cột Tối Ưu Của LMCache
            </Heading>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Các nguyên lý cốt lõi giúp tối ưu hóa hiệu năng phục vụ mô hình ngôn ngữ lớn ở cấp độ cụm máy chủ.
            </p>
          </div>
          <div className="row" style={{ gap: '2rem', justifyContent: 'center', margin: 0 }}>
            {CorePillars.map((item, idx) => (
              <div 
                key={idx} 
                className="col col--3 custom-card" 
                style={{ 
                  flex: '1 1 300px', 
                  maxWidth: '360px', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  background: 'var(--card-bg)', 
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                  {item.badge}
                </div>
                <Heading as="h3" style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
                  {item.title}
                </Heading>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Lectures List Section */}
        <section className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Heading as="h2" style={{ fontSize: '2rem', fontWeight: 700 }}>
              📚 Nội Dung Chuỗi Bài Giảng
            </Heading>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Hãy đi tuần tự từ Bài 0 đến Bài 4 để xây dựng nền tảng vững chắc nhất về LMCache.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {Lectures.map((lecture, idx) => (
              <Link 
                to={lecture.path} 
                key={idx}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  className="lecture-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    padding: '1.5rem 2rem',
                    borderRadius: '12px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa', minWidth: '80px' }}>
                    {lecture.number}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <Heading as="h3" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                        {lecture.title}
                      </Heading>
                      <CategoryBadge category={lecture.category} />
                    </div>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {lecture.desc}
                    </p>
                  </div>
                  <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>
                    ➔
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
