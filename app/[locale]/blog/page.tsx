import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/layout';
import { BlogCard } from '@/components/blog';
import { prisma } from '@/lib/db';
import { Plane, MapPin, Compass } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
    },
    openGraph: {
      title: t('pageTitle'),
      description: t('pageDescription'),
      url: `${BASE_URL}/${locale}/blog`,
    },
  };
}

async function getPosts(locale: string, categorySlug?: string) {
  // First find the category if slug provided
  let categoryId: number | undefined;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: {
        slug_locale: { slug: categorySlug, locale },
      },
    });
    categoryId = category?.id;
  }

  return prisma.post.findMany({
    where: {
      locale,
      published_at: { not: null },
      ...(categoryId && { category_id: categoryId }),
    },
    include: {
      author: true,
      category: true,
    },
    orderBy: { published_at: 'desc' },
  });
}

async function getCategories(locale: string) {
  return prisma.category.findMany({
    where: { locale },
    orderBy: { name: 'asc' },
  });
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const [posts, categories] = await Promise.all([
    getPosts(locale, category),
    getCategories(locale),
  ]);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-20 md:py-28">
          {/* Decorative background pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-brand-200/40 blur-2xl" />
          <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-accent-200/30 blur-3xl" />

          {/* Decorative icons */}
          <div className="absolute top-1/4 right-[15%] text-brand-300/30 hidden lg:block">
            <Plane className="w-12 h-12 rotate-45" />
          </div>
          <div className="absolute bottom-1/3 left-[10%] text-accent-300/30 hidden lg:block">
            <MapPin className="w-10 h-10" />
          </div>
          <div className="absolute top-1/2 right-[8%] text-cream-400/50 hidden lg:block">
            <Compass className="w-14 h-14" />
          </div>

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Decorative stamp */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-dashed border-brand-300/50 mb-8 rotate-6">
                <span className="text-brand-500 text-xs font-bold tracking-widest uppercase">Blog</span>
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-6">
                {t('heroTitle')}
              </h1>

              <p className="text-body-lg text-navy-300 max-w-xl mx-auto">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Category Filters */}
        {categories.length > 0 && (
          <section className="py-8 border-b border-cream-200 bg-white">
            <div className="container-wide">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <a
                  href={`/${locale}/blog`}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    !category
                      ? 'bg-navy-500 text-white'
                      : 'bg-cream-100 text-navy-400 hover:bg-cream-200'
                  }`}
                >
                  {t('allPosts')}
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/${locale}/blog?category=${cat.slug}`}
                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      category === cat.slug
                        ? 'bg-navy-500 text-white'
                        : 'bg-cream-100 text-navy-400 hover:bg-cream-200'
                    }`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog Content */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            {posts.length === 0 ? (
              /* Empty State */
              <div className="max-w-lg mx-auto text-center py-20">
                <div className="w-24 h-24 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-8">
                  <Compass className="w-12 h-12 text-brand-400" />
                </div>
                <h2 className="text-heading-lg font-bold text-navy-500 mb-4">
                  {t('emptyTitle')}
                </h2>
                <p className="text-navy-300 mb-8">
                  {t('emptyDescription')}
                </p>
                <a
                  href={`/${locale}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {t('exploreDestinations')}
                </a>
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && !category && (
                  <div className="mb-16">
                    <BlogCard
                      slug={featuredPost.slug}
                      title={featuredPost.title}
                      excerpt={featuredPost.excerpt}
                      featured_image={featuredPost.featured_image}
                      category={featuredPost.category?.name}
                      author={featuredPost.author?.name}
                      read_time={featuredPost.read_time}
                      published_at={featuredPost.published_at}
                      variant="featured"
                    />
                  </div>
                )}

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(category ? posts : remainingPosts).map((post) => (
                    <BlogCard
                      key={post.id}
                      slug={post.slug}
                      title={post.title}
                      excerpt={post.excerpt}
                      featured_image={post.featured_image}
                      category={post.category?.name}
                      author={post.author?.name}
                      read_time={post.read_time}
                      published_at={post.published_at}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-400/20 mb-6">
                <Plane className="w-8 h-8 text-brand-400" />
              </div>

              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                {t('newsletterTitle')}
              </h2>

              <p className="text-cream-300 text-lg mb-8">
                {t('newsletterDescription')}
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-cream-50 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all whitespace-nowrap"
                >
                  {t('subscribe')}
                </button>
              </form>

              <p className="text-cream-500 text-sm mt-4">
                {t('noSpam')}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
