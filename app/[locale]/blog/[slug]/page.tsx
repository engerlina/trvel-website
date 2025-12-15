import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');

  const post = await prisma.post.findUnique({
    where: {
      slug_locale: {
        slug: slug,
        locale: locale,
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.published_at && (
          <p className="text-gray-500 mb-8">
            {new Date(post.published_at).toLocaleDateString(locale)}
          </p>
        )}
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </main>
  );
}

