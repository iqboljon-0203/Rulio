import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, posts } from '@/lib/blog/posts';
import { SITE_URL } from '@/lib/seo';
import { BlogFooter, BlogHeader } from '../BlogChrome';
import styles from '../blog.module.css';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: 'uz',
        mainEntityOfPage: url,
        image: `${SITE_URL}/opengraph-image.png`,
        author: { '@type': 'Organization', name: 'Rulio', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'Rulio', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Rulio', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className={styles.page}>
      <BlogHeader />
      <main className={styles.wrap}>
        <article className={styles.article}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
          <nav className={styles.crumbs} aria-label="Yo'l">
            <Link href="/">Rulio</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
          </nav>
          <div className={styles.meta}>
            <span className={styles.tag}>{post.category}</span>
            <time dateTime={post.date}>{fmtDate(post.date)}</time>
            <span>· {post.readMinutes} daqiqa o&apos;qish</span>
          </div>
          <h1 className={styles.h1}>{post.title}</h1>
          <p className={styles.lead}>{post.intro}</p>

          <div className={styles.body}>
            {post.sections.map((s) => (
              <section key={s.h2}>
                <h2>{s.h2}</h2>
                {s.paragraphs?.map((p, i) => (
                  <p key={i} style={{ marginTop: 10 }}>
                    {p}
                  </p>
                ))}
                {s.list &&
                  (s.ordered ? (
                    <ol style={{ marginTop: 10 }}>{s.list.map((li) => <li key={li}>{li}</li>)}</ol>
                  ) : (
                    <ul style={{ marginTop: 10 }}>{s.list.map((li) => <li key={li}>{li}</li>)}</ul>
                  ))}
                {s.note && (
                  <p className={styles.note} style={{ marginTop: 14 }}>
                    {s.note}
                  </p>
                )}
              </section>
            ))}
          </div>

          <aside className={styles.ctaBox}>
            <h2>Bilimingizni sinab ko&apos;ring</h2>
            <p>1250+ rasmiy savol, 63 bilet va xatolar tahlili. Birinchi 5 bilet bepul.</p>
            <Link href="/login" className={styles.ctaBtn}>
              Testni bepul boshlash
            </Link>
          </aside>

          {post.sources && post.sources.length > 0 && (
            <div className={styles.sources}>
              <h3>Manbalar</h3>
              <ul>
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <section className={styles.related}>
            <h2>Boshqa maqolalar</h2>
            <div className={styles.relatedList}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}>
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <BlogFooter />
    </div>
  );
}
