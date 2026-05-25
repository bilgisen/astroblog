import type { APIRoute } from 'astro';
import { fetchNewsList } from '../lib/payload';

export const GET: APIRoute = async () => {
  let news: any[] = [];
  try {
    const data = await fetchNewsList(1, 300);
    news = data.docs;
  } catch (e) {
    console.error('Error fetching news for google news sitemap:', e);
  }

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Filter items published in the last 48 hours
  const recentNews = news.filter((item) => {
    if (!item.publishedAt) return false;
    const pubDate = new Date(item.publishedAt);
    return pubDate >= fortyEightHoursAgo;
  });

  const urls = recentNews
    .map((item) => {
      const pubDate = item.publishedAt ? new Date(item.publishedAt).toISOString() : '';
      const escapedTitle = (item.title || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `  <url>
    <loc>https://paraanaliz.com/haberler/${item.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>ParaAnaliz.com</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    },
  });
};
