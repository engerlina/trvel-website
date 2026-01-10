'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom link handling - internal vs external
        a: ({ href, children, ...props }) => {
          const isInternal = href?.startsWith('/');
          if (isInternal) {
            return (
              <Link href={href || '/'} className="text-brand-600 hover:text-brand-700 underline decoration-brand-300 hover:decoration-brand-500">
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 underline decoration-brand-300 hover:decoration-brand-500"
              {...props}
            >
              {children}
            </a>
          );
        },
        // Custom image handling with Next.js Image
        img: ({ src, alt }) => {
          if (!src) return null;
          // For external images, use regular img tag with styling
          // Next.js Image requires known dimensions for external URLs
          return (
            <span className="block my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ''}
                className="w-full rounded-2xl shadow-soft-lg"
              />
            </span>
          );
        },
        // Styled headings
        h1: ({ children }) => (
          <h1 className="text-display font-bold text-navy-500 mt-12 mb-6">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-heading-lg font-bold text-navy-500 mt-12 mb-6">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-heading font-bold text-navy-500 mt-8 mb-4">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-body-lg font-bold text-navy-500 mt-6 mb-3">{children}</h4>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-navy-400 leading-relaxed mb-6">{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="text-navy-400 list-disc pl-6 mb-6 space-y-2 marker:text-brand-400">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="text-navy-400 list-decimal pl-6 mb-6 space-y-2 marker:text-brand-400">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-navy-400">{children}</li>
        ),
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-brand-400 bg-cream-50 py-4 px-6 rounded-r-xl italic text-navy-400 my-8">
            {children}
          </blockquote>
        ),
        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-navy-500">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Code blocks
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-cream-100 text-accent-600 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-navy-500 text-cream-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-6">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-navy-500 text-cream-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-6">
            {children}
          </pre>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="border-cream-300 my-12" />
        ),
        // Tables (GFM)
        table: ({ children }) => (
          <div className="overflow-x-auto my-8">
            <table className="min-w-full border-collapse border border-cream-300 rounded-xl overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-cream-100">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-cream-300 px-4 py-3 text-left font-semibold text-navy-500">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-cream-300 px-4 py-3 text-navy-400">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
