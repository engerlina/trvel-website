import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Header, Footer } from '@/components/layout';
import { BlogCard, MarkdownContent } from '@/components/blog';
import { prisma } from '@/lib/db';
import { Link } from '@/i18n/routing';
import { Clock, Calendar, ArrowLeft, Twitter, Linkedin, Facebook } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
      authors: post.author ? [post.author.name] : undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

async function getPost(locale: string, slug: string) {
  return prisma.post.findUnique({
    where: {
      slug_locale: { slug, locale },
    },
    include: {
      author: true,
      category: true,
    },
  });
}

async function getRelatedPosts(locale: string, currentSlug: string, categoryId?: number | null) {
  return prisma.post.findMany({
    where: {
      locale,
      slug: { not: currentSlug },
      published_at: { not: null },
      ...(categoryId && { category_id: categoryId }),
    },
    include: {
      author: true,
      category: true,
    },
    orderBy: { published_at: 'desc' },
    take: 3,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const post = await getPost(locale, slug);

  if (!post || !post.published_at) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(locale, slug, post.category_id);

  const formattedDate = new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.published_at));

  const shareUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Article Header */}
        <article>
          {/* Hero Section */}
          <header className="relative">
            {/* Featured Image or Gradient Background */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
              {post.featured_image ? (
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-brand-100 to-cream-300">
                  {/* Decorative pattern */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.3) 1px, transparent 0)`,
                      backgroundSize: '32px 32px'
                    }}
                  />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="relative -mt-48 md:-mt-56 pb-12">
              <div className="container-wide">
                <div className="max-w-3xl mx-auto">
                  {/* Back link and Category */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 text-navy-300 hover:text-brand-500 transition-colors bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('backToBlog')}
                    </Link>

                    {/* Category */}
                    {post.category && (
                      <span className="inline-block px-6 py-2.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold uppercase tracking-wider">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-navy-300 mb-8">
                    {post.author && (
                      <span className="font-medium text-navy-500">{post.author.name}</span>
                    )}
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </span>
                    {post.read_time && (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.read_time} {t('minRead')}
                      </span>
                    )}
                  </div>

                  {/* Share buttons */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-navy-300">{t('share')}:</span>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-navy-400 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-navy-400 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-navy-400 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="pb-20">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                {/* Prose content */}
                <MarkdownContent content={post.content} />

                {/* Author Box */}
                {post.author && (
                  <div className="mt-16 p-8 bg-cream-50 rounded-2xl border border-cream-200">
                    <div className="flex items-start gap-6">
                      {post.author.avatar_url ? (
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author.name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-white">
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-navy-300 mb-1">{t('writtenBy')}</p>
                        <h3 className="text-lg font-bold text-navy-500 mb-2">{post.author.name}</h3>
                        <p className="text-navy-400 text-sm">
                          {post.author.bio || t('authorBio')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 bg-cream-50 border-t border-cream-200">
            <div className="container-wide">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-12 text-center">
                {t('relatedPosts')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.id}
                    slug={relatedPost.slug}
                    title={relatedPost.title}
                    excerpt={relatedPost.excerpt}
                    featured_image={relatedPost.featured_image}
                    category={relatedPost.category?.name}
                    author={relatedPost.author?.name}
                    read_time={relatedPost.read_time}
                    published_at={relatedPost.published_at}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-brand-50 to-cream-100 rounded-3xl p-12 border border-brand-100">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-4">
                {t('ctaTitle')}
              </h2>
              <p className="text-navy-300 text-lg mb-8">
                {t('ctaDescription')}
              </p>
              <Link
                href={`/${locale}/get-started`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-accent-500/25 transition-all"
              >
                {t('ctaButton')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all posts
// Returns empty array if database is unavailable (e.g., during Vercel build)
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published_at: { not: null } },
      select: { slug: true, locale: true },
    });

    return posts.map((post) => ({
      locale: post.locale,
      slug: post.slug,
    }));
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
