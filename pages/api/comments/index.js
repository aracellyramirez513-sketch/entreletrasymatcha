import { supabase, SITE_ID } from '../../../lib/supabase';

// Rate limit simple en memoria.
// No es infalible en serverless (cada instancia tiene su propio Map),
// pero corta el spam torpe sin costo ni infraestructura extra.
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60 * 1000; // ventana de 1 minuto
const RATE_LIMIT_MAX = 3;        // máximo 3 comentarios por ventana

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_LIMIT_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return true;
}

function cleanupRateLimit() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.start > RATE_LIMIT_MS * 5) rateLimitMap.delete(ip);
  }
}

export default async function handler(req, res) {
  // ---------- LEER ----------
  if (req.method === 'GET') {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Falta el parámetro slug' });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('id, author_name, content, parent_id, created_at')
      .eq('site', SITE_ID)
      .eq('slug', slug)
      .eq('approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error leyendo comentarios:', error);
      return res.status(500).json({ error: 'No se pudieron cargar los comentarios' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ comments: data || [] });
  }

  // ---------- ESCRIBIR ----------
  if (req.method === 'POST') {
    cleanupRateLimit();

    const ip = getIp(req);
    if (!checkRateLimit(ip)) {
      return res
        .status(429)
        .json({ error: 'Estás comentando muy rápido. Espera un momento e inténtalo de nuevo.' });
    }

    const { slug, author_name, content, parent_id, website } = req.body || {};

    // Honeypot: campo invisible que solo los bots rellenan.
    // Respondemos 200 fingiendo éxito para no darles pistas.
    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Falta el slug' });
    }

    const name = typeof author_name === 'string' ? author_name.trim() : '';
    const text = typeof content === 'string' ? content.trim() : '';

    if (name.length < 2 || name.length > 40) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 40 caracteres.' });
    }

    if (text.length < 2 || text.length > 2000) {
      return res.status(400).json({ error: 'El comentario debe tener entre 2 y 2000 caracteres.' });
    }

    // Comentarios llenos de links son casi siempre spam
    const linkCount = (text.match(/https?:\/\//gi) || []).length;
    if (linkCount > 2) {
      return res.status(400).json({ error: 'Demasiados enlaces en el comentario.' });
    }

    const { error } = await supabase.from('comments').insert({
      site: SITE_ID,
      slug,
      author_name: name,
      content: text,
      parent_id: parent_id || null,
      approved: false, // siempre entra pendiente de tu aprobación
    });

    if (error) {
      console.error('Error guardando comentario:', error);
      return res.status(500).json({ error: 'No se pudo guardar el comentario' });
    }

    return res.status(201).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Método no permitido' });
}
