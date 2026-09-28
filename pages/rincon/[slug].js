import Head from 'next/head'
import Link from 'next/link'
import { getRincon, getPost } from '../../lib/notion'
import { Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'
import Comentarios from '../../components/Comentarios'

const entryTypes = {
  reflexion:   { label:'Reflexión',        color:'#7a6a50', bg:'#f5ede4', border:'#d4bfaa' },
  'reflexión': { label:'Reflexión',        color:'#7a6a50', bg:'#f5ede4', border:'#d4bfaa' },
  noticia:     { label:'Noticia literaria', color:'#3a6a7a', bg:'#e4f0f5', border:'#aacfda' },
  lista:       { label:'Lista',            color:'#5a7a50', bg:'#e8ede3', border:'#b0c8a0' },
  cita:        { label:'Cita',             color:'#7a5080', bg:'#f0e8f5', border:'#c8aad4' },
}

const SITIO = 'Entre letras y matcha'

// ─── Helpers de texto y links ────────────────────────────────────────────────

function textoPlano(segs) {
  return (segs || []).map(s => s.texto).join('')
}

// Separadores que pueden ir entre dos links sin que la línea deje de ser
// "solo links". Ej: "Amazon · Buscalibre" o "Amazon | Buscalibre".
const SOLO_SEPARADOR = /^[\s·|/,\-–]*$/

function esSoloLinks(segs) {
  const utiles = (segs || []).filter(s => !SOLO_SEPARADOR.test(s.texto))
  return utiles.length > 0 && utiles.every(s => s.link)
}

function esInterno(url) {
  const u = String(url || '')
  return u.startsWith('/') || u.includes('entreletrasymatcha.com')
}

function esAfiliado(url) {
  const u = String(url || '').toLowerCase()
  return u.includes('amazon.') || u.includes('amzn.') || u.includes('buscalibre') || u.includes('mercadolibre')
}

// Links externos se abren en otra pestaña. Los de compra llevan
// rel="sponsored", que es lo que Google pide para links de afiliados.
function propsLink(url) {
  if (esInterno(url)) return {}
  return {
    target: '_blank',
    rel: esAfiliado(url) ? 'sponsored noopener noreferrer' : 'noopener noreferrer',
  }
}

function etiquetaTienda(url) {
  const u = String(url || '').toLowerCase()
  if (esInterno(url)) return 'Leer mi reseña'
  if (u.includes('amazon.') || u.includes('amzn.')) return 'Ver en Amazon'
  if (u.includes('buscalibre')) return 'Buscalibre'
  if (u.includes('mercadolibre')) return 'Mercado Libre'
  if (u.includes('goodreads')) return 'Goodreads'
  try { return new URL(url).hostname.replace(/^www\./, '') } catch (e) { return 'Ver link' }
}

// Si el texto del link es la URL pegada tal cual, se reemplaza por un nombre legible
function etiquetaBoton(texto, url) {
  const t = String(texto || '').trim()
  if (!t || /^https?:\/\//i.test(t)) return etiquetaTienda(url)
  return t
}

function separarImagenes(str) {
  return String(str || '').split('|').map(s => s.trim()).filter(Boolean)
}

function recortar(str, max = 160) {
  const t = String(str || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const corte = t.slice(0, max - 1)
  const espacio = corte.lastIndexOf(' ')
  return (espacio > 80 ? corte.slice(0, espacio) : corte) + '…'
}

// ─── Armado de la lista ──────────────────────────────────────────────────────
// Cada Encabezado 2 o 3 de Notion abre la tarjeta de un libro.
// Lo que va antes del primer encabezado es la introducción.
// Un divisor (---) cierra la tarjeta actual: lo que viene después es el cierre.

function armarLista(bloques) {
  const intro = []
  const libros = []
  const cierre = []
  let actual = null

  for (const b of bloques) {
    if (b.tipo === 'heading_2' || b.tipo === 'heading_3') {
      actual = { id: b.id, titulo: b.texto, bloques: [] }
      libros.push(actual)
      continue
    }
    if (b.tipo === 'divider' && actual) {
      actual = null
      continue
    }
    if (actual) actual.bloques.push(b)
    else if (libros.length === 0) intro.push(b)
    else cierre.push(b)
  }

  return { intro, libros, cierre }
}

// Dentro de una tarjeta:
// la primera imagen es la portada, la primera línea corta es la autora,
// las líneas que son solo links se vuelven botones, el resto es la sinopsis.
function armarTarjeta(libro) {
  let portada = null
  let autora = null
  const cuerpo = []
  const botones = []

  for (const b of libro.bloques) {
    if (b.tipo === 'image' && !portada) { portada = b; continue }

    if (b.tipo === 'bookmark') {
      botones.push({ url: b.url, texto: etiquetaBoton(textoPlano(b.caption), b.url) })
      continue
    }

    if (b.tipo === 'paragraph') {
      const plano = textoPlano(b.texto).trim()
      if (!plano) continue

      if (esSoloLinks(b.texto)) {
        b.texto.filter(s => s.link).forEach(s => botones.push({ url: s.link, texto: etiquetaBoton(s.texto, s.link) }))
        continue
      }

      if (!autora && cuerpo.length === 0 && plano.length <= 80 && !b.texto.some(s => s.link)) {
        autora = plano
        continue
      }
    }

    cuerpo.push(b)
  }

  return { portada, autora, cuerpo, botones }
}

// ─── Componentes de contenido ────────────────────────────────────────────────

function Texto({ segs, et }) {
  return (
    <>
      {(segs || []).map((s, i) => {
        const style = {}
        if (s.negrita) style.fontWeight = 700
        if (s.cursiva) style.fontStyle = 'italic'
        const deco = []
        if (s.subrayado) deco.push('underline')
        if (s.tachado) deco.push('line-through')
        if (deco.length) style.textDecoration = deco.join(' ')
        if (s.codigo) {
          style.fontFamily = 'monospace'
          style.background = '#fff'
          style.padding = '0 4px'
          style.borderRadius = 4
        }
        if (s.link) {
          return (
            <a key={i} href={s.link} {...propsLink(s.link)}
              style={{ ...style, color: et.color, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {s.texto}
            </a>
          )
        }
        return <span key={i} style={style}>{s.texto}</span>
      })}
    </>
  )
}

function Botones({ links, et }) {
  if (!links.length) return null
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'10px 0 4px' }}>
      {links.map((l, i) => {
        const principal = i === 0
        return (
          <a key={i} href={l.url} {...propsLink(l.url)}
            style={{
              display:'inline-block',
              padding:'7px 14px',
              borderRadius:8,
              fontSize:13,
              fontFamily:'sans-serif',
              fontWeight:500,
              textDecoration:'none',
              border:`1px solid ${principal ? et.color : et.border}`,
              background: principal ? et.color : '#fff',
              color: principal ? '#fff' : et.color,
            }}>
            {l.texto} {esInterno(l.url) ? '→' : '↗'}
          </a>
        )
      })}
    </div>
  )
}

const estiloParrafo = { fontSize:16, color:'var(--text-body)', lineHeight:1.85, margin:'0 0 1rem', whiteSpace:'pre-wrap' }

const estiloParrafoCompacto = { fontSize:14, color:'var(--text-body)', lineHeight:1.7, margin:'0 0 8px', whiteSpace:'pre-wrap' }

function Bloque({ b, et, alt, cursiva, compacto }) {
  switch (b.tipo) {
    case 'paragraph': {
      if (!textoPlano(b.texto).trim()) return <div style={{ height:8 }} />
      if (esSoloLinks(b.texto)) {
        return <Botones et={et} links={b.texto.filter(s => s.link).map(s => ({ url: s.link, texto: etiquetaBoton(s.texto, s.link) }))} />
      }
      const base = compacto ? estiloParrafoCompacto : estiloParrafo
      return <p style={{ ...base, fontStyle: cursiva ? 'italic' : 'normal' }}><Texto segs={b.texto} et={et} /></p>
    }
    case 'heading_1':
    case 'heading_2':
      return <h2 style={{ fontSize:21, fontWeight:700, color:'var(--text-dark)', lineHeight:1.3, margin:'1.75rem 0 0.75rem' }}><Texto segs={b.texto} et={et} /></h2>
    case 'heading_3':
      return <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text-dark)', lineHeight:1.3, margin:'1.5rem 0 0.5rem' }}><Texto segs={b.texto} et={et} /></h3>
    case 'image': {
      const caption = textoPlano(b.caption)
      return (
        <figure style={{ margin:'1.25rem 0' }}>
          <img src={b.url} alt={caption || alt || ''} loading="lazy"
            style={{ width:'100%', borderRadius:8, border:`1px solid ${et.border}`, display:'block' }} />
          {caption && (
            <figcaption style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'sans-serif', marginTop:6, textAlign:'center' }}>
              <Texto segs={b.caption} et={et} />
            </figcaption>
          )}
        </figure>
      )
    }
    case 'quote':
      return (
        <blockquote style={{ borderLeft:`3px solid ${et.color}`, margin:'1.25rem 0', padding:'0.25rem 0 0.25rem 1rem', fontStyle:'italic', fontSize:17, color:'var(--text-body)', lineHeight:1.75, whiteSpace:'pre-wrap' }}>
          <Texto segs={b.texto} et={et} />
        </blockquote>
      )
    case 'callout':
      return (
        <div style={{ display:'flex', gap:10, background:'#fff', border:`1px solid ${et.border}`, borderRadius:10, padding:'0.85rem 1rem', margin:'1rem 0', fontSize:15, color:'var(--text-body)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
          {b.icono && <span style={{ fontSize:18, lineHeight:1.4 }}>{b.icono}</span>}
          <div><Texto segs={b.texto} et={et} /></div>
        </div>
      )
    case 'divider':
      return <hr style={{ border:'none', borderTop:`1px solid ${et.border}`, margin:'1.5rem 0' }} />
    case 'bookmark':
      return <Botones et={et} links={[{ url: b.url, texto: etiquetaBoton(textoPlano(b.caption), b.url) }]} />
    default:
      return null
  }
}

// Dibuja una secuencia de bloques, juntando los ítems de lista seguidos
function Bloques({ bloques, et, alt, cursiva, compacto }) {
  const out = []
  let i = 0
  while (i < bloques.length) {
    const b = bloques[i]
    if (b.tipo === 'bulleted_list_item' || b.tipo === 'numbered_list_item') {
      const tipo = b.tipo
      const items = []
      while (i < bloques.length && bloques[i].tipo === tipo) { items.push(bloques[i]); i++ }
      const Tag = tipo === 'numbered_list_item' ? 'ol' : 'ul'
      out.push(
        <Tag key={items[0].id} style={{ fontSize: compacto ? 14 : 16, color:'var(--text-body)', lineHeight: compacto ? 1.7 : 1.8, margin: compacto ? '0 0 8px' : '0 0 1rem', paddingLeft:'1.4rem' }}>
          {items.map(it => <li key={it.id} style={{ marginBottom:4 }}><Texto segs={it.texto} et={et} /></li>)}
        </Tag>
      )
      continue
    }
    out.push(<Bloque key={b.id} b={b} et={et} alt={alt} cursiva={cursiva} compacto={compacto} />)
    i++
  }
  return <>{out}</>
}

function TarjetaLibro({ libro, numero, et }) {
  const { portada, autora, cuerpo, botones } = armarTarjeta(libro)
  const titulo = textoPlano(libro.titulo)
  return (
    <article style={{
      display:'grid',
      gridTemplateColumns: portada ? '90px minmax(0,1fr)' : 'minmax(0,1fr)',
      gap:16,
      background:'#fff',
      border:`1px solid ${et.border}`,
      borderRadius:12,
      padding:'1rem',
    }}>
      {portada && (
        <img src={portada.url} alt={`Portada de ${titulo}`} loading="lazy"
          style={{ width:90, height:135, objectFit:'cover', borderRadius:6, border:`1px solid ${et.border}` }}
          onError={e => { e.target.style.background = et.bg; e.target.src = '' }} />
      )}
      <div>
        <p style={{ fontSize:12, color:et.color, fontFamily:'sans-serif', fontWeight:500, margin:'0 0 2px' }}>
          {String(numero).padStart(2, '0')}
        </p>
        <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text-dark)', lineHeight:1.3, margin:'0 0 2px' }}>
          <Texto segs={libro.titulo} et={et} />
        </h2>
        {autora && (
          <p style={{ fontSize:13, color:'var(--text-author)', fontFamily:'sans-serif', margin:'0 0 8px' }}>{autora}</p>
        )}
        <Bloques bloques={cuerpo} et={et} alt={titulo} compacto />
        <Botones links={botones} et={et} />
      </div>
    </article>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function DetallePost({ post, slug }) {
  if (!post) return <div className="container"><p>No encontrado</p></div>

  const et = entryTypes[post.entrytype] || entryTypes.reflexion
  const esCita = post.entrytype === 'cita'
  const bloques = Array.isArray(post.bloques) ? post.bloques : []
  const tieneCuerpo = bloques.length > 0
  const imagenes = Array.isArray(post.imagenes) ? post.imagenes : separarImagenes(post.imagen)
  const tags = Array.isArray(post.tags) ? post.tags : (post.tags||'').split(',').map(t=>t.trim()).filter(Boolean)

  // Una lista solo se arma en tarjetas si el cuerpo tiene al menos un título de libro
  const lista = post.entrytype === 'lista' && tieneCuerpo ? armarLista(bloques) : null
  const conTarjetas = !!(lista && lista.libros.length > 0)
  const numLibros = conTarjetas ? lista.libros.length : 0

  // La grilla de arriba solo aparece si las imágenes no están ya en el cuerpo
  const cuerpoTieneImagenes = bloques.some(b => b.tipo === 'image')
  const mostrarGrilla = imagenes.length > 0 && !conTarjetas && !cuerpoTieneImagenes

  const etiqueta = conTarjetas ? `${et.label} · ${numLibros} ${numLibros === 1 ? 'libro' : 'libros'}` : et.label

  // ── SEO ──
  const primerParrafo = textoPlano(
    (bloques.find(b => b.tipo === 'paragraph' && textoPlano(b.texto).trim() && !esSoloLinks(b.texto)) || {}).texto
  )
  const tituloSEO = `${post.titulo} | ${SITIO}`
  const descripcionSEO = recortar(post.preview || primerParrafo || post.contenido || post.titulo)
  const imagenSEO = imagenes[0] || (bloques.find(b => b.tipo === 'image' && !b.subida) || {}).url || ''

  return (
    <>
      <Head>
        <title>{tituloSEO}</title>
        <meta name="description" content={descripcionSEO} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={SITIO} />
        <meta property="og:title" content={tituloSEO} />
        <meta property="og:description" content={descripcionSEO} />
        {imagenSEO && <meta property="og:image" content={imagenSEO} />}
        <meta name="twitter:card" content={imagenSEO ? 'summary_large_image' : 'summary'} />
      </Head>
      <div className="container">
        <SiteHeader />
        <div style={{ maxWidth:680, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:et.color, fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'0.75rem' }}>
              <Pill bg="#fff" color={et.color} border={et.border}>{etiqueta}</Pill>
              <span style={{ fontSize:12, color:et.color, fontFamily:'sans-serif', opacity:0.8 }}>Desde mi rincón</span>
              <span style={{ fontSize:12, color:et.color, fontFamily:'sans-serif', opacity:0.7, marginLeft:'auto' }}>{post.fecha}</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text-dark)', lineHeight:1.25, margin:'0 0 1rem' }}>{post.titulo}</h1>
            {tags.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{tags.map(t => <Pill key={t}>{t}</Pill>)}</div>}
          </div>

          {/* Imágenes de la propiedad Imagen URL */}
          {mostrarGrilla && (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(imagenes.length,3)},1fr)`, gap:8, marginBottom:'1.5rem' }}>
              {imagenes.map((img, i) => (
                <img key={i} src={img} alt={imagenes.length === 1 ? post.titulo : `${post.titulo}, imagen ${i+1}`}
                  style={{ width:'100%', borderRadius:8, border:`1px solid ${et.border}`, objectFit:'cover', maxHeight:300 }} />
              ))}
            </div>
          )}

          {/* Contenido */}
          {conTarjetas ? (
            <div>
              {lista.intro.length > 0 && <Bloques bloques={lista.intro} et={et} alt={post.titulo} />}
              <div style={{ display:'flex', flexDirection:'column', gap:14, margin:'1.5rem 0' }}>
                {lista.libros.map((libro, i) => <TarjetaLibro key={libro.id} libro={libro} numero={i + 1} et={et} />)}
              </div>
              {lista.cierre.length > 0 && <Bloques bloques={lista.cierre} et={et} alt={post.titulo} />}
            </div>
          ) : tieneCuerpo ? (
            <div style={{ background:et.bg, border:`1px solid ${et.border}`, borderLeft:`4px solid ${et.color}`, borderRadius:12, padding:'1.5rem' }}>
              <Bloques bloques={bloques} et={et} alt={post.titulo} cursiva={esCita} />
            </div>
          ) : (
            <div style={{ background:et.bg, border:`1px solid ${et.border}`, borderLeft:`4px solid ${et.color}`, borderRadius:12, padding:'1.5rem' }}>
              <p style={{ fontSize:16, color:'var(--text-body)', lineHeight:1.85, fontStyle: esCita ? 'italic' : 'normal', whiteSpace:'pre-wrap', margin:0 }}>
                {post.contenido || post.preview}
              </p>
            </div>
          )}

          {/* Comentarios. pageType="rincon" los separa de los de reseñas con el mismo slug */}
          <div style={{ marginTop:'2.5rem' }}>
            <Comentarios slug={slug} pageType="rincon" />
          </div>
        </div>
        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const posts = await getRincon()
  return { paths: posts.map(p => ({ params: { slug: p.slug } })), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)
  if (!post) return { notFound: true }
  return { props: { post, slug: params.slug }, revalidate: 60 }
}
