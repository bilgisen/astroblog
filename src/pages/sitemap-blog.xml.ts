import type { APIRoute } from 'astro';
import { fetchBlogList } from '../lib/payload';

export const GET: APIRoute = async () => {
  let posts: any[] = [];
  try {
    const data = await fetchBlogList(1, 1000);
    posts = data.docs;
  } catch (e) {
    console.error('Error fetching blogs for sitemap:', e);
  }

  const urls = posts
    .map((post) => {
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : '';
      return `  <url>
    <loc>https://paraanaliz.com/yazarlar/${post.slug}</loc>
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
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
};
