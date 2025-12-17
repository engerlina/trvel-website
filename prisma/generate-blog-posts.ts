import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// OpenRouter client for content generation (Claude Sonnet 4.5)
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// OpenAI client for image generation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'trvel-s3';
const S3_BASE_URL = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com`;

// Brand voice guidelines
const BRAND_VOICE = `
You are writing for Trvel, a premium eSIM provider. Follow these guidelines:
- Voice: Confident but not arrogant, clear but not dumbed down, warm but professional
- Focus on practical value for travelers
- Use active voice and specific numbers where possible
- Acknowledge pain points before presenting solutions
- Write at 8th-grade reading level for clarity
- Include a clear call-to-action at the end
- Never use excessive emojis or overly casual language
- Be helpful and authoritative, like a trusted travel advisor
`;

// Locale-specific context
const LOCALE_CONTEXT: Record<string, { currency: string; competitor: string; demonym: string; spelling: string }> = {
  'en-au': { currency: 'AUD', competitor: 'Telstra', demonym: 'Australian', spelling: 'British' },
  'en-sg': { currency: 'SGD', competitor: 'Singtel', demonym: 'Singaporean', spelling: 'British' },
  'en-gb': { currency: 'GBP', competitor: 'EE', demonym: 'British', spelling: 'British' },
  'ms-my': { currency: 'MYR', competitor: 'Maxis', demonym: 'Malaysian', spelling: 'British' },
  'id-id': { currency: 'IDR', competitor: 'Telkomsel', demonym: 'Indonesian', spelling: 'British' },
};

// Destination image prompts for travel photography
const DESTINATION_IMAGE_PROMPTS: Record<string, string> = {
  japan: 'Beautiful travel photography of Japan, cherry blossoms, Mount Fuji in background, golden hour lighting, warm tones, professional DSLR quality, no text',
  thailand: 'Stunning travel photography of Thailand, golden temple spires, tropical palm trees, warm sunset colors, professional DSLR quality, no text',
  'south-korea': 'Beautiful travel photography of Seoul South Korea, modern cityscape with traditional palace, cherry blossoms, warm lighting, professional DSLR quality, no text',
  singapore: 'Stunning travel photography of Singapore, Marina Bay Sands, Gardens by the Bay, modern architecture, twilight blue hour, professional DSLR quality, no text',
  indonesia: 'Beautiful travel photography of Bali Indonesia, rice terraces, tropical temple, golden hour sunset, lush green, professional DSLR quality, no text',
  malaysia: 'Stunning travel photography of Kuala Lumpur Malaysia, Petronas Towers, modern city with traditional elements, warm sunset, professional DSLR quality, no text',
  taiwan: 'Beautiful travel photography of Taiwan, Taipei 101, traditional temple, misty mountains, warm golden lighting, professional DSLR quality, no text',
  australia: 'Stunning travel photography of Sydney Australia, Opera House, Harbour Bridge, blue sky, warm coastal light, professional DSLR quality, no text',
  europe: 'Beautiful travel photography of European landmarks, Eiffel Tower or Colosseum, golden hour, warm tones, classic architecture, professional DSLR quality, no text',
  usa: 'Stunning travel photography of New York City, Manhattan skyline, Brooklyn Bridge, warm sunset glow, professional DSLR quality, no text',
  spain: 'Beautiful travel photography of Barcelona Spain, Sagrada Familia, Mediterranean vibes, warm golden light, professional DSLR quality, no text',
  greece: 'Stunning travel photography of Santorini Greece, white buildings, blue domes, Mediterranean sea, sunset colors, professional DSLR quality, no text',
  china: 'Beautiful travel photography of China, Great Wall or Shanghai skyline, misty mountains, warm golden light, professional DSLR quality, no text',
  general: 'Beautiful travel photography, airplane window view of clouds at sunset, wanderlust vibes, warm golden tones, professional DSLR quality, no text',
};

interface BlogPostData {
  locale: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  searchIntent: string;
  contentType: string;
  targetDestination: string;
}

// Parse CSV file
function parseCSV(csvContent: string): BlogPostData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      locale: values[0],
      primaryKeyword: values[1],
      secondaryKeywords: values[2],
      searchIntent: values[3],
      contentType: values[5],
      targetDestination: values[7],
    };
  });
}

// Generate blog content using OpenAI
async function generateBlogContent(data: BlogPostData): Promise<{ title: string; excerpt: string; content: string; slug: string }> {
  const localeContext = LOCALE_CONTEXT[data.locale];
  const isLocalLanguage = data.locale === 'ms-my' || data.locale === 'id-id';

  const languageInstruction = isLocalLanguage
    ? data.locale === 'ms-my'
      ? 'Write the entire article in Bahasa Malaysia (Malay). Use natural Malaysian language.'
      : 'Write the entire article in Bahasa Indonesia. Use natural Indonesian language.'
    : `Write in English using ${localeContext.spelling} spelling. Target ${localeContext.demonym} readers.`;

  const prompt = `${BRAND_VOICE}

${languageInstruction}

Write a comprehensive blog post about: "${data.primaryKeyword}"

Target audience: ${localeContext.demonym} travelers
Content type: ${data.contentType}
Related keywords to naturally include: ${data.secondaryKeywords}
Search intent: ${data.searchIntent}
${data.targetDestination !== 'general' ? `Destination focus: ${data.targetDestination}` : 'General travel/eSIM topic'}

Local context:
- Currency: ${localeContext.currency}
- Main carrier competitor: ${localeContext.competitor}

Requirements:
1. Create an engaging, SEO-optimized title (max 60 characters)
2. Write a compelling meta description/excerpt (max 160 characters)
3. Write 800-1200 words of valuable content
4. Use markdown formatting with ## for headings
5. Include practical tips and actionable advice
6. Naturally mention Trvel's benefits (instant activation, premium networks, 10-min guarantee, human support)
7. End with a clear call-to-action
8. Make it genuinely helpful, not salesy

Format your response EXACTLY like this:
TITLE: [Your title here]
EXCERPT: [Your excerpt here]
SLUG: [url-friendly-slug-here]
CONTENT:
[Your full markdown content here]`;

  const response = await openrouter.chat.completions.create({
    model: 'anthropic/claude-sonnet-4.5',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2500,
    temperature: 0.7,
  });

  const text = response.choices[0].message.content || '';

  // Parse the response
  const titleMatch = text.match(/TITLE:\s*(.+)/);
  const excerptMatch = text.match(/EXCERPT:\s*(.+)/);
  const slugMatch = text.match(/SLUG:\s*(.+)/);
  const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);

  return {
    title: titleMatch?.[1]?.trim() || data.primaryKeyword,
    excerpt: excerptMatch?.[1]?.trim() || '',
    slug: slugMatch?.[1]?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || data.primaryKeyword.toLowerCase().replace(/\s+/g, '-'),
    content: contentMatch?.[1]?.trim() || '',
  };
}

// Generate image using GPT Image model
async function generateImage(destination: string, title: string): Promise<Buffer | null> {
  const basePrompt = DESTINATION_IMAGE_PROMPTS[destination] || DESTINATION_IMAGE_PROMPTS.general;

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1.5',
      prompt: `${basePrompt}, for article about "${title}"`,
      n: 1,
      size: '1536x1024',
      quality: 'medium',
    });

    const b64Json = response.data?.[0]?.b64_json;
    if (!b64Json) return null;

    // Decode base64 to buffer
    return Buffer.from(b64Json, 'base64');
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

// Upload image to S3
async function uploadToS3(buffer: Buffer, filename: string): Promise<string> {
  const key = `blog/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  }));

  return `${S3_BASE_URL}/${key}`;
}

// Ensure categories exist for all locales
async function ensureCategories() {
  const categoryTemplates = [
    { slug: 'destination-guides', name: 'Destination Guides', nameMs: 'Panduan Destinasi', nameId: 'Panduan Destinasi' },
    { slug: 'tech', name: 'Tech & Connectivity', nameMs: 'Teknologi & Kesambungan', nameId: 'Teknologi & Konektivitas' },
    { slug: 'travel-tips', name: 'Travel Tips', nameMs: 'Tips Perjalanan', nameId: 'Tips Perjalanan' },
    { slug: 'comparisons', name: 'Comparisons', nameMs: 'Perbandingan', nameId: 'Perbandingan' },
  ];

  const locales = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'];

  for (const locale of locales) {
    for (const cat of categoryTemplates) {
      const name = locale === 'ms-my' ? cat.nameMs : locale === 'id-id' ? cat.nameId : cat.name;
      await prisma.category.upsert({
        where: { slug_locale: { slug: cat.slug, locale } },
        update: { name },
        create: { slug: cat.slug, locale, name },
      });
    }
  }
}

// Ensure authors exist
async function ensureAuthors() {
  const authors = [
    { slug: 'sarah-chen', name: 'Sarah Chen', bio: 'Travel writer and Asia specialist with over 10 years of experience.' },
    { slug: 'james-wilson', name: 'James Wilson', bio: 'Tech journalist and digital nomad who has tested connectivity solutions across 50+ countries.' },
    { slug: 'emma-thompson', name: 'Emma Thompson', bio: 'Former travel agent turned content creator, helping travelers stay connected abroad.' },
    { slug: 'ahmad-rizal', name: 'Ahmad Rizal', bio: 'Malaysian travel blogger specializing in Southeast Asian adventures.' },
    { slug: 'putri-dewi', name: 'Putri Dewi', bio: 'Indonesian travel enthusiast sharing tips for Indonesian travelers.' },
  ];

  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: {},
      create: author,
    });
  }
}

// Get category ID based on content type
async function getCategoryId(contentType: string, locale: string): Promise<number | null> {
  const categoryMap: Record<string, string> = {
    'destination-guide': 'destination-guides',
    'comparison': 'comparisons',
    'guide': 'travel-tips',
    'tutorial': 'tech',
  };

  const slug = categoryMap[contentType] || 'travel-tips';
  const category = await prisma.category.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  return category?.id || null;
}

// Get author ID based on locale
async function getAuthorId(locale: string): Promise<number | null> {
  const authorMap: Record<string, string> = {
    'en-au': 'emma-thompson',
    'en-sg': 'sarah-chen',
    'en-gb': 'james-wilson',
    'ms-my': 'ahmad-rizal',
    'id-id': 'putri-dewi',
  };

  const author = await prisma.author.findUnique({
    where: { slug: authorMap[locale] || 'sarah-chen' },
  });
  return author?.id || null;
}

// Main function
async function main() {
  console.log('Starting blog post generation...\n');

  // Read keywords CSV
  const csvPath = path.join(__dirname, '../.claude/seo-keywords.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const keywords = parseCSV(csvContent);

  console.log(`Found ${keywords.length} keywords to process\n`);

  // Ensure categories and authors exist
  await ensureCategories();
  await ensureAuthors();
  console.log('Categories and authors ensured\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    console.log(`\n[${i + 1}/${keywords.length}] Processing: ${keyword.primaryKeyword} (${keyword.locale})`);

    try {
      // Check if post already exists
      const existingPost = await prisma.post.findFirst({
        where: {
          locale: keyword.locale,
          slug: { contains: keyword.primaryKeyword.toLowerCase().replace(/\s+/g, '-').substring(0, 20) },
        },
      });

      if (existingPost) {
        console.log(`  Skipping - similar post already exists: ${existingPost.slug}`);
        continue;
      }

      // Generate content
      console.log('  Generating content...');
      const blogContent = await generateBlogContent(keyword);

      // Generate image
      console.log('  Generating image...');
      const imageBuffer = await generateImage(keyword.targetDestination, blogContent.title);

      let imageUrl = '';
      if (imageBuffer) {
        console.log('  Uploading to S3...');
        const filename = `${keyword.locale}-${blogContent.slug}-${Date.now()}.png`;
        imageUrl = await uploadToS3(imageBuffer, filename);
        console.log(`  Image uploaded: ${imageUrl}`);
      }

      // Get category and author IDs
      const categoryId = await getCategoryId(keyword.contentType, keyword.locale);
      const authorId = await getAuthorId(keyword.locale);

      // Calculate read time (average 200 words per minute)
      const wordCount = blogContent.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      // Create post in database
      console.log('  Saving to database...');
      await prisma.post.create({
        data: {
          slug: blogContent.slug,
          locale: keyword.locale,
          title: blogContent.title,
          excerpt: blogContent.excerpt,
          content: blogContent.content,
          featured_image: imageUrl || null,
          read_time: readTime,
          published_at: new Date(),
          category_id: categoryId,
          author_id: authorId,
        },
      });

      console.log(`  ✓ Created: "${blogContent.title}"`);
      successCount++;

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`  ✗ Error:`, error);
      errorCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Blog generation complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`========================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
