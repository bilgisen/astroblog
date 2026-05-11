/**
 * Media proxy endpoint.
 * Proxies Payload CMS media files through the frontend domain.
 * 
 * Usage: /media/api/media/file/image.jpg
 * Proxies to: https://paback.paraanaliz.workers.dev/api/media/file/image.jpg
 * 
 * This ensures OG images are served from paraanaliz.com domain,
 * which social media crawlers can reliably access.
 */

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

const PUBLIC_API_URL =
  import.meta.env.PAYLOAD_API_URL ?? 'https://paback.paraanaliz.workers.dev';

export const GET: APIRoute = async ({ params }) => {
  const path = params.path;
  if (!path) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const paback = (cfEnv as unknown as { PABACK?: Fetcher }).PABACK;
    let res: Response;

    if (paback) {
      res = await paback.fetch(`http://paback/${path}`);
    } else {
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
  } catch {
    return new Response('Error', { status: 500 });
  }
};
