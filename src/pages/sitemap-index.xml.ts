import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://paraanaliz.com/sitemap-main.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://paraanaliz.com/sitemap-blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://paraanaliz.com/sitemap-haberler.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://paraanaliz.com/sitemap-news.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
};
