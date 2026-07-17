const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SITE_URL = 'https://entreletrasymatcha.com';

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Solo Supabase puede llamar a este endpoint
  if (req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Faltan las variables de Telegram');
    return res.status(500).json({ error: 'Configuración incompleta' });
  }

  const { type, record } = req.body || {};

  if (type !== 'INSERT' || !record) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const nombre = escapeHtml(record.author_name);
  const texto = escapeHtml(record.content);
  const slug = record.slug;
  const sitio = record.site === 'rwm' ? 'RWM' : 'ELYM';
  const esRespuesta = record.parent_id ? ' (respuesta)' : '';

  const mensaje = [
    `💬 <b>Comentario nuevo en ${sitio}</b>${esRespuesta}`,
    ``,
    `<b>${nombre}</b> escribió en <code>/${slug}</code>:`,
    ``,
    `<i>${texto.slice(0, 500)}${texto.length > 500 ? '…' : ''}</i>`,
  ].join('\n');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: mensaje,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '👀 Ver la reseña',
                  url: `${SITE_URL}/resena/${slug}`,
                },
              ],
            ],
          },
        }),
      }
    );

    if (!tgRes.ok) {
      const detalle = await tgRes.text();
      console.error('Telegram rechazó el
