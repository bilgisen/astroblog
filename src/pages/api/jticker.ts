import type { APIRoute } from 'astro';

const API_BASE = 'https://veribor.fastapicloud.dev';

export const GET: APIRoute = async () => {
  try {
    const [summaryRes, gainersRes] = await Promise.all([
      fetch(`${API_BASE}/summary`),
      fetch(`${API_BASE}/stocks/gainers?limit=10`),
    ]);
    if (!summaryRes.ok || !gainersRes.ok) {
      console.error('JTicker proxy: upstream error', summaryRes.status, gainersRes.status);
      return new Response(JSON.stringify({ error: 'Veri kaynağı yanıt vermedi.' }), { status: 502 });
    }
    const summary = await summaryRes.json();
    const gainers = await gainersRes.json();
    return new Response(JSON.stringify({ summary, gainers }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=30',
      },
    });
  } catch (err) {
    console.error('JTicker proxy error:', err);
    return new Response(JSON.stringify({ error: 'Veri kaynağına ulaşılamadı.' }), { status: 502 });
  }
};
