import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async (context) => {
  const { request, locals } = context;
  
  // Cloudflare Pages stores env vars in locals.runtime.env
  // import.meta.env is for build-time/local dev
  const apiKey = (locals as any)?.runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('Newsletter Error: RESEND_API_KEY is missing.');
    return new Response(JSON.stringify({ 
      error: 'Sistem şu anda bülten kayıtlarını kabul edemiyor (Yapılandırma hatası).' 
    }), { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' }), { status: 400 });
    }

    // Pro-level: Send notification to admin AND potentially add to a contact list (if configured)
    // For now, we stick to the email notification but with more robust headers
    const { data, error } = await resend.emails.send({
      from: 'Para Analiz <onboarding@resend.dev>',
      to: 'info@paraanaliz.com',
      subject: '🚀 Yeni Bülten Aboneliği: ' + email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0088cc;">Yeni Abonelik Bildirimi</h2>
          <p>Web siteniz üzerinden yeni bir bülten kaydı alındı:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>E-posta:</strong> ${email}</p>
            <p style="margin: 5px 0 0;"><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          </div>
          <p style="font-size: 0.8rem; color: #666;">Bu e-posta otomatik olarak Resend üzerinden gönderilmiştir.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return new Response(JSON.stringify({ 
        error: 'E-posta servisi şu an yanıt vermiyor. Lütfen daha sonra tekrar deneyiniz.' 
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      message: 'Aboneliğiniz başarıyla kaydedildi.',
      id: data?.id 
    }), { status: 200 });

  } catch (err) {
    console.error('Newsletter Server Error:', err);
    return new Response(JSON.stringify({ error: 'Sunucu tarafında bir hata oluştu.' }), { status: 500 });
  }
};
