import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Use environment variable for security
const resend = new Resend(import.meta.env.RESEND_API_KEY || 're_123456789'); // Fallback for local testing if not set

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Geçerli bir e-posta adresi giriniz.' }), { status: 400 });
    }

    // Send notification email to info@paraanaliz.com
    const { data, error } = await resend.emails.send({
      from: 'Para Analiz <onboarding@resend.dev>', // Resend verified domain or fallback
      to: 'info@paraanaliz.com',
      subject: 'Yeni Bülten Aboneliği',
      html: `<p>Yeni bir kullanıcı bültene abone oldu:</p><p><strong>Email:</strong> ${email}</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'E-posta gönderilirken bir hata oluştu.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Success' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
  }
};
