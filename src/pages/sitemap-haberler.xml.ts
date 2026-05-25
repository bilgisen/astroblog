import type { APIRoute } from 'astro';
import { fetchNewsList } from '../lib/payload';

export const GET: APIRoute = async () => {
  let news: any[] = [];
  try {
    const data = await fetchNewsList(1, 1000);
    news = data.docs;
  } catch (e) {
    console.error('Error fetching news for sitemap:', e);
  }

  const urls = news
    .map((item) => {
      const lastmod = item.updatedAt ? new Date(item.updatedAt).toISOString() : '';
      return `  <url>
    <loc>https://paraanaliz.com/haberler/${item.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=7200',
    },
  });
};
