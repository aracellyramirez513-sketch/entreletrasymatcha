import { getLibros, getOrdenes, getUniversos, getRincon, getVinetas } from '../lib/notion'

// Sitemap automático: se arma con lo publicado en Notion cada vez que Google lo pide.
const SITE_URL = 'https://www.entreletrasymatcha.com'

function fechaValida(f) {
  if (!f) return null
  const d = new Date(f)
  return isNaN(d) ? null : d.toISOString().slice(0, 10)
}

function escapar(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlXml({ ruta, fecha, prioridad }) {
  const lastmod = fechaValida(fecha)
  return [
    '  <url>',
    `    <loc>${escapar(SITE_URL + ruta)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    prioridad ? `    <priority>${prioridad}</priority>` : null,
    '  </url>',
  ].filter(Boolean).join('\n')
}

async function seguro(fn) {
  try { return await fn() } catch (e) { console.error('sitemap:', e.message); return [] }
}

export async function getServerSideProps({ res }) {
  const [libros, ordenes, universos, posts, vinetas] = await Promise.all([
    seguro(getLibros),
    seguro(getOrdenes),
    seguro(getUniversos),
    seguro(getRincon),
    seguro(getVinetas),
  ])

  const entradas = [
    { ruta: '/', prioridad: '1.0' },
    { ruta: '/universos-literarios', prioridad: '0.8' },
    { ruta: '/tienda', prioridad: '0.6' },
    ...libros.map(l => ({ ruta: `/resena/${l.slug}`, fecha: l.fecha, prioridad: '0.8', slug: l.slug })),
    ...ordenes.map(o => ({ ruta: `/orden/${o.slug}`, fecha: o.fecha, prioridad: '0.8', slug: o.slug })),
    ...universos.map(u => ({ ruta: `/universo/${u.slug}`, prioridad: '0.7', slug: u.slug })),
    ...posts.map(p => ({ ruta: `/rincon/${p.slug}`, fecha: p.fecha, prioridad: '0.6', slug: p.slug })),
    ...vinetas.map(v => ({ ruta: `/vineta/${v.slug}`, fecha: v.fecha, prioridad: '0.5', slug: v.slug })),
  ]

  // Descarta entradas sin slug y repetidas
  const vistas = new Set()
  const todas = entradas.filter(e => {
    if ('slug' in e && !e.slug) return false
    if (vistas.has(e.ruta)) return false
    vistas.add(e.ruta)
    return true
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...todas.map(urlXml),
    '</urlset>',
  ].join('\n')

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Vercel lo guarda 1 hora y lo renueva en segundo plano
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
