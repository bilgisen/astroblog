/**
 * Media proxy endpoint.
 * Proxies Payload CMS media files through the frontend domain.
 *
 * Usage: /media/api/media/file/image.jpg
 * Proxies to: https://admin.paraanaliz.com/api/media/file/image.jpg
 *
 * This ensures OG images are served from paraanaliz.com domain,
 * which social media crawlers can reliably access.
 */

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

const PUBLIC_API_URL =
  import.meta.env.PAYLOAD_API_URL ?? 'https://admin.paraanaliz.com';

export const GET: APIRoute = async ({ params }) => {
  const path = params.path;
  if (!path) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // @ts-ignore
    const paback = (cfEnv as any).PABACK;
    let res: Response;

    if (paback) {
      // Production: Service Binding
      res = await paback.fetch(`http://admin/${path}`);
    } else {
      // Local dev: Public URL
      res = await fetch(`${PUBLIC_API_URL}/${path}`);
    }

    if (!res.ok) {
      return new Response('Not found', { status: 404 });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('Media proxy error:', err);
    return new Response('Error', { status: 500 });
  }
};
