const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface ArticleJsonLdProps {
  title: string;
  slug: string;
  locale: string;
  excerpt?: string | null;
  content: string;
  publishedAt?: Date | null;
  updatedAt: Date;
  authorName?: string | null;
  authorBio?: string | null;
  authorAvatarUrl?: string | null;
  featuredImage?: string | null;
  categoryName?: string | null;
}

export function ArticleJsonLd({
  title,
  slug,
  locale,
  excerpt,
  content,
  publishedAt,
  updatedAt,
  authorName,
  authorBio,
  authorAvatarUrl,
  featuredImage,
  categoryName,
}: ArticleJsonLdProps) {
  const pageUrl = `${BASE_URL}/${locale}/blog/${slug}`;
  const description = excerpt || content.slice(0, 160);
  const wordCount = content.split(/\s+/).length;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: pageUrl,
    image: featuredImage || `${BASE_URL}/og-image.png`,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt.toISOString(),
    wordCount,
    ...(categoryName && { articleSection: categoryName }),
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
          ...(authorBio && { description: authorBio }),
          ...(authorAvatarUrl && { image: authorAvatarUrl }),
        }
      : {
          '@type': 'Organization',
          '@id': `${BASE_URL}/#organization`,
          name: 'Trvel',
        },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Trvel',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${BASE_URL}/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
