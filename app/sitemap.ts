import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // We will assume the site URL is either VERCEL_URL or a fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

  const sitemapItems: MetadataRoute.Sitemap = [];

  try {
    // Fetch all published pages
    const { data: pages } = await supabase
      .from('portfolio_pages')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (pages) {
      for (const page of pages) {
        sitemapItems.push({
          url: `${baseUrl}${page.slug === 'home' ? '' : `/${page.slug}`}`,
          lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: page.slug === 'home' ? 1 : 0.8,
        });
      }
    }
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }

  // Ensure home page is included even if db fetch fails
  if (!sitemapItems.find(item => item.url === baseUrl || item.url === `${baseUrl}/`)) {
    sitemapItems.push({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  }

  return sitemapItems;
}
