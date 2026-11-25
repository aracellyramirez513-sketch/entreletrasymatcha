import Head from 'next/head'
import Link from 'next/link'
import { getLibros, getLibro, getContextoSerie } from '../../lib/notion'
import { Stars, Pill, SiteHeader, Newsletter, Footer, TiendaBanner } from '../../components/ui'
import Comentarios from '../../components/Comentarios'
import { recortar } from '../../lib/seo'

// Convierte el texto plano que viene de Notion en párrafos reales.
// Notion guarda los saltos como \n y el HTML los colapsa, por eso hay que partirlos a mano.
function Parrafos({ texto, style, gap = '1rem' }) {
  const partes = String(texto || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)

  if (partes.length === 0) return null

  return (
    <>
      {partes.map((p, i) => (
        <p key={i} style={{ ...style, margin: i === partes.length - 1 ? 0 : `0 0 ${gap}` }}>{p}</p>
      ))}
    </>
  )
}

// Miniatura de un libro dentro de la tira de la serie.
// Con reseña es un link, sin reseña queda apagada, y la actual va marcada.
function MiniLibro({ libro }) {
  const marco = libro.actual
    ? '2px solid #c9a84c'
    : libro.slug
      ? '1px solid var(--border-warm)'
      : '1px dashed #c4b49c'

  const contenido = (
    <div style={{ position:'relative', width:56 }}>
      <div style={{ width:56, height:84, borderRadius:6, border:marco, overflow:'hidden', background:'var(--bg-tag)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {libro.portada
          ? <img src={libro.portada} alt={libro.titulo} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <span style={{ fontSize:18, color:'var(--text-muted)', fontFamily:'sans-serif' }}>{libro.numero || '?'}</span>}
      </div>
      {libro.numero && (
        <span style={{ position:'absolute', top:4, left:4, background: libro.actual ? '#c9a84c' : '#9b7b5e', color:'#fff', fontSize:10, fontFamily:'sans-serif', fontWeight:700, borderRadius:3, padding:'1px 5px' }}>{libro.numero}</span>
      )}
    </div>
  )

  if (libro.slug && !libro.actual) {
    return (
      <Link href={`/resena/${libro.slug}`} title={libro.titulo} style={{ textDecoration:'none' }}>
        {contenido}
      </Link>
    )
  }

  return (
    <div title={libro.actual ? `${libro.titulo} (estás acá)` : `${libro.titulo} — reseña en camino`}
      style={{ opacity: libro.slug ? 1 : 0.45, cursor:'default' }}>
      {contenido}
    </div>
  )
}

// Tarjeta de anterior / siguiente
function TarjetaVecina({ libro, direccion }) {
  const esSiguiente = direccion === 'siguiente'

  return (
    <Link href={`/resena/${libro.slug}`}
      style={{ display:'flex', gap:12, alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:12, textDecoration:'none', flexDirection: esSiguiente ? 'row-reverse' : 'row' }}>
      {libro.portada
        ? <img src={libro.portada} alt="" style={{ width:38, height:56, objectFit:'cover', borderRadius:4, border:'1px solid var(--border-warm)', flexShrink:0 }} />
        : <div style={{ width:38, height:56, borderRadius:4, background:'var(--bg-tag)', flexShrink:0 }} />}
      <div style={{ minWidth:0, textAlign: esSiguiente ? 'right' : 'left', flex:1 }}>
        <p style={{ margin:0, fontSize:11, fontFamily:'sans-serif', color:'#9b7b5e', textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {esSiguiente ? 'Siguiente' : 'Anterior'}{libro.numero ? ` · Libro ${libro.numero}` : ''}
        </p>
        <p style={{ margin:'3px 0 0', fontSize:14, color:'var(--text-dark)', lineHeight:1.35 }}>{libro.titulo}</p>
      </div>
    </Link>
  )
}

function NavSerie({ contexto }) {
  if (!contexto || !Array.isArray(contexto.libros) || contexto.libros.length === 0) return null

  const { orden, libros, anterior, siguiente, posicion, total } = contexto
  const hayVecinos = Boolean(anterior || siguiente)
  const hayTira = libros.length > 1

  if (!orden && !hayVecinos && !hayTira) return null

  return (
    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
      <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Seguir leyendo la serie</p>

      {orden && (
        <Link href={`/orden/${orden.slug}`}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 16px', marginBottom:hayVecinos || hayTira ? '1rem' : 0, textDecoration:'none' }}>
          <div style={{ minWidth:0 }}>
            {posicion && total ? (
              <p style={{ margin:0, fontSize:12, fontFamily:'sans-serif', color:'#9b7b5e' }}>Libro {posicion} de {total}</p>
            ) : null}
            <p style={{ margin:'2px 0 0', fontSize:15, color:'var(--text-dark)' }}>{orden.titulo}</p>
          </div>
          <span style={{ fontSize:13, fontFamily:'sans-serif', color:'var(--text-accent)', whiteSpace:'nowrap' }}>Ver el orden completo →</span>
        </Link>
      )}

      {hayVecinos && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginBottom: hayTira ? '1.25rem' : 0 }}>
          {anterior && <TarjetaVecina libro={anterior} direccion="anterior" />}
          {siguiente && <TarjetaVecina libro={siguiente} direccion="siguiente" />}
        </div>
      )}

      {hayTira && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {libros.map((l, i) => <MiniLibro key={l.slug || `sin-resena-${i}`} libro={l} />)}
        </div>
      )}
    </div>
  )
}

export default function DetalleLibro({ libro, slug, contexto }) {
  if (!libro) return <div className="container"><p>No encontrado</p></div>

  const tags = Array.isArray(libro.tags) ? libro.tags : (libro.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
  const tropes = Array.isArray(libro.tropes) ? libro.tropes : []
  const protagonistas = [1,2,3].filter(n => libro[`protagonista${n}_nombre`]).map(n => ({
    nombre: libro[`protagonista${n}_nombre`],
    rol:    libro[`protagonista${n}_rol`],
    desc:   libro[`protagonista${n}_descripcion`],
    tags:   (libro[`protagonista${n}_tags`]||'').split(',').map(t=>t.trim()).filter(Boolean),
  }))

  const tituloSEO = `${libro.titulo}${libro.autor ? ` de ${libro.autor}` : ''}: reseña | Entre letras y matcha`

  const ordenDeLaSerie = contexto && contexto.orden ? contexto.orden : null
  const lineaSerie = libro.serie
    ? `${libro.serie}${libro.numero_serie ? ` · Libro ${libro.numero_serie}` : ''}`
    : ''

  return (
    <>
      <Head>
        <title>{tituloSEO}</title>
        <meta name="description" content={recortar(libro.sinopsis)} />
        <meta property="og:title" content={tituloSEO} />
        <meta property="og:description" content={recortar(libro.sinopsis)} />
        {libro.portada && <meta property="og:image" content={libro.portada} />}
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:680, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          {/* Hero */}
          <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:24, marginBottom:'2rem', alignItems:'start' }}>
            {libro.portada && (
              <img src={libro.portada} alt={libro.titulo}
                style={{ width:140, height:200, objectFit:'cover', borderRadius:8, border:'1px solid var(--border-warm)' }} />
            )}
            <div>
              <Pill>{libro.categoria}</Pill>
              <h1 style={{ fontSize:26, fontWeight:700, margin:'0.5rem 0 0.25rem', color:'var(--text-dark)', lineHeight:1.2 }}>{libro.titulo}</h1>
              {lineaSerie && (
                ordenDeLaSerie ? (
                  <p style={{ fontSize:13, margin:'0 0 0.25rem', fontFamily:'sans-serif', fontStyle:'italic' }}>
                    <Link href={`/orden/${ordenDeLaSerie.slug}`} style={{ color:'var(--text-accent)', textDecoration:'none' }}>{lineaSerie}</Link>
                  </p>
                ) : (
                  <p style={{ fontSize:13, color:'#9b7b5e', margin:'0 0 0.25rem', fontFamily:'sans-serif', fontStyle:'italic' }}>{lineaSerie}</p>
                )
              )}
              <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>{libro.autor}</p>
              <Stars n={libro.calificacion} size={18} />

              {tropes.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:'0.75rem' }}>
                  {tropes.map(t => <Pill key={t}>{t}</Pill>)}
                </div>
              )}
              {tags.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:'0.5rem' }}>
                  {tags.map(t => <Pill key={t} bg="var(--bg-tag-dark)">{t}</Pill>)}
                </div>
              )}
            </div>
          </div>

          {/* Sinopsis */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Sinopsis</p>
            <Parrafos texto={libro.sinopsis} style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.8 }} />
          </div>

          {/* Protagonistas */}
          {protagonistas.length > 0 && (
            <div style={{ marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Los protagonistas</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                {protagonistas.map((p, i) => (
                  <div key={i} style={{ background:'#f5ede4', border:'1px solid #d4bfaa', borderLeft:'4px solid #9b7b5e', borderRadius:10, padding:'1rem' }}>
                    <div style={{ fontSize:32, fontWeight:700, color:'#9b7b5e', marginBottom:'0.5rem', lineHeight:1 }}>{p.nombre.charAt(0).toUpperCase()}</div>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--text-dark)', margin:'0 0 2px', fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.05em' }}>{p.nombre}</p>
                    {p.rol && <p style={{ fontSize:11, color:'#9b7b5e', margin:'0 0 0.75rem', fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }}>{p.rol}</p>}
                    {p.desc && (
                      <div style={{ margin:'0 0 0.75rem' }}>
                        <Parrafos texto={p.desc} style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.65 }} gap="0.6rem" />
                      </div>
                    )}
                    {p.tags.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {p.tags.map(t => <span key={t} style={{ fontSize:11, padding:'2px 9px', borderRadius:4, fontFamily:'sans-serif', background:'#efe3d8', color:'#7a5c45', border:'1px solid #d4bfaa', textTransform:'uppercase', letterSpacing:'0.05em' }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reseña */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Mi reseña</p>
            <Parrafos texto={libro.resena} style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.85, fontStyle:'italic' }} gap="1.1rem" />
          </div>

          {/* Para quién es */}
          {libro.para_quien && (
            <div style={{ background:'#edf4e8', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>¿Para quién es?</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {libro.para_quien.split('|').map(p => p.trim()).filter(Boolean).map((punto, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ color:'var(--text-accent)', fontSize:16, lineHeight:1.5, flexShrink:0 }}>✦</span>
                    <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.75, margin:0 }}>{punto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links de compra */}
          {(() => {
            const tiendas = [
              { link: libro.link_amazon,       nombre: 'Amazon',             detalle: 'Kindle y en inglés',    borde: '#e0b800', color: '#806800', suave: '#a08a40', icono: 'carro' },
              { link: libro.link_buscalibre,   nombre: 'Buscalibre',         detalle: 'papel, envío a tu país', borde: '#60a0d0', color: '#0060a0', suave: '#4a86b5', icono: 'libros' },
              { link: libro.link_mercadolibre, nombre: 'Mercado Libre Chile', detalle: 'envío en Chile',        borde: '#d9c200', color: '#2d3277', suave: '#6b6fa0', icono: 'bolsa' },
              { link: libro.link_kobo,         nombre: 'Kobo',               detalle: 'ebook',                  borde: '#d4537e', color: '#72243e', suave: '#993556', icono: 'tablet' },
            ].filter(t => t.link)
            if (!tiendas.length) return null
            return (
              <div style={{ background:'#edf4e8', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
                <h2 style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'var(--text-dark)', margin:'0 0 1rem' }}>¿Dónde comprarlo?</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
                  {tiendas.map(t => (
                    <a key={t.nombre} href={t.link} target="_blank" rel="sponsored noopener noreferrer"
                       style={{ display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', gap:8, padding:'14px 16px', borderRadius:10, background:'#ffffff', border:`1.5px solid ${t.borde}`, color:t.color, fontSize:15, fontFamily:'sans-serif', fontWeight:600, textDecoration:'none', textAlign:'center' }}>
                      <IconoTienda tipo={t.icono} />
                      <span>{t.nombre}</span>
                      <span style={{ fontSize:12, fontWeight:400, color:t.suave }}>· {t.detalle}</span>
                    </a>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Navegación de la serie */}
          <NavSerie contexto={contexto} />

          {/* Tienda */}
          <TiendaBanner />

          {/* Comentarios */}
          <Comentarios slug={slug} />
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const libros = await getLibros()
  return {
    paths: libros.map(l => ({ params: { slug: l.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const libro = await getLibro(params.slug)
  if (!libro) return { notFound: true }

  let contexto = null
  try {
    contexto = await getContextoSerie(libro)
  } catch (e) {
    contexto = null
  }

  return { props: { libro, slug: params.slug, contexto }, revalidate: 60 }
}

// Íconos simples de línea para los botones de "¿Dónde comprarlo?"
function IconoTienda({ tipo }) {
  const props = { width:19, height:19, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', 'aria-hidden':true, style:{ flexShrink:0 } }
  if (tipo === 'libros') return <svg {...props}><path d="M4 19V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14" /><path d="M9 19V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v12" /><path d="M14.5 6.5l3-.8a1 1 0 0 1 1.2.7l3 11.6" /><path d="M3 19h18" /></svg>
  if (tipo === 'bolsa')  return <svg {...props}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
  if (tipo === 'tablet') return <svg {...props}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 17h2" /></svg>
  return <svg {...props}><circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /><path d="M3 4h2l2.2 11h11.3L21 8H6.2" /></svg>
}
