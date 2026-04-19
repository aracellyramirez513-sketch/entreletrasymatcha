import Head from 'next/head'
import Link from 'next/link'
import { getOrdenes, getOrden } from '../../lib/notion'
import { Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'

const tipoOrdenInfo = {
  'Orden estricto':             { color: '#712B13', bg: '#FAECE7', border: '#F0997B', desc: 'Leer estrictamente en este orden — los libros se conectan directamente.' },
  'Standalones interconectados':{ color: '#0F6E56', bg: '#E1F5EE', border: '#5DCAA5', desc: 'Cada libro se puede leer suelto, pero los personajes aparecen entre sí.' },
  'Cronológico':                { color: '#854F0B', bg: '#FAEEDA', border: '#EF9F27', desc: 'Orden de los eventos dentro de la historia, no orden de publicación.' },
  'Orden de publicación':       { color: '#0C447C', bg: '#E6F1FB', border: '#85B7EB', desc: 'En el orden que fueron publicados originalmente.' },
}

const estadoInfo = {
  'Completa':  { color: '#27500A', bg: '#EAF3DE', border: '#97C459' },
  'En curso':  { color: '#854F0B', bg: '#FAEEDA', border: '#EF9F27' },
  'Pausada':   { color: '#444441', bg: '#F1EFE8', border: '#B4B2A9' },
  'Abandonada':{ color: '#791F1F', bg: '#FCEBEB', border: '#F09595' },
}

export default function DetalleOrden({ orden }) {
  if (!orden) return <div className="container"><p>No encontrado</p></div>

  const tropes = Array.isArray(orden.tropes) ? orden.tropes : []
  const librosSerie = orden.libros_serie || []
  const tipoInfo = tipoOrdenInfo[orden.tipo_orden] || null
  const estInfo = estadoInfo[orden.estado] || null

  return (
    <>
      <Head>
        <title>{orden.titulo} — Orden de lectura · Entre letras y matcha</title>
        <meta name="description" content={`Orden de lectura de ${orden.titulo} de ${orden.autor}. ${orden.descripcion}`} />
        <meta property="og:title" content={`${orden.titulo} — Orden de lectura`} />
        {orden.portada_saga && <meta property="og:image" content={orden.portada_saga} />}
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:700, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          {/* Badge de universo si existe */}
          {orden.universo && (
            <Link href={`/universo/${orden.universo.slug}`} style={{ textDecoration:'none' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#EEEDFE', color:'#3C3489', border:'1px solid #AFA9EC', padding:'6px 14px', borderRadius:20, fontSize:12, fontFamily:'sans-serif', marginBottom:'1rem', cursor:'pointer', fontWeight:500 }}>
                <span style={{ fontSize:14 }}>🌌</span>
                <span>Parte del universo <strong style={{ fontWeight:700 }}>{orden.universo.nombre}</strong></span>
                <span>→</span>
              </div>
            </Link>
          )}

          {/* Hero de la saga */}
          <div style={{ display:'grid', gridTemplateColumns: orden.portada_saga ? '140px 1fr' : '1fr', gap:24, marginBottom:'2rem', alignItems:'start' }}>
            {orden.portada_saga && (
              <img src={orden.portada_saga} alt={orden.titulo}
                style={{ width:140, height:200, objectFit:'cover', borderRadius:8, border:'1px solid var(--border-warm)' }} />
            )}
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'0.75rem' }}>
                {orden.categoria && <Pill>{orden.categoria}</Pill>}
                <Pill bg="#fff" color="var(--text-muted)" border="var(--border)">{librosSerie.length || orden.num_libros} libros</Pill>
                {estInfo && <Pill bg={estInfo.bg} color={estInfo.color} border={estInfo.border}>{orden.estado}</Pill>}
              </div>
              <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 0.25rem', color:'var(--text-dark)', lineHeight:1.2 }}>{orden.titulo}</h1>
              <p style={{ fontSize:14, color:'#9b7b5e', margin:'0 0 0.25rem', fontFamily:'sans-serif', fontStyle:'italic' }}>{orden.autor}</p>
              {orden.pareja && (
                <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>💕 {orden.pareja}</p>
              )}
              {orden.descripcion && (
                <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.75, margin:'0 0 1rem' }}>{orden.descripcion}</p>
              )}
              {tropes.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {tropes.map(t => <Pill key={t}>{t}</Pill>)}
                </div>
              )}
            </div>
          </div>

          {/* Tipo de orden y notas */}
          {(tipoInfo || orden.notas_orden) && (
            <div style={{ background: tipoInfo ? tipoInfo.bg : 'var(--bg-sidebar)', border:`1px solid ${tipoInfo ? tipoInfo.border : 'var(--border)'}`, borderLeft:`4px solid ${tipoInfo ? tipoInfo.color : 'var(--border)'}`, borderRadius:12, padding:'1rem 1.25rem', marginBottom:'2rem' }}>
              {tipoInfo && (
                <>
                  <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:tipoInfo.color, margin:'0 0 4px', fontWeight:600, opacity:0.85 }}>
                    Tipo de lectura · {orden.tipo_orden}
                  </p>
                  <p style={{ fontSize:13, color:'var(--text-body)', margin:0, lineHeight:1.6 }}>
                    {tipoInfo.desc}
                  </p>
                </>
              )}
              {orden.notas_orden && (
                <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.7, margin: tipoInfo ? '10px 0 0' : 0, paddingTop: tipoInfo ? '10px' : 0, borderTop: tipoInfo ? '1px dashed rgba(0,0,0,0.1)' : 'none' }}>
                  <span style={{ fontWeight:600, color:tipoInfo ? tipoInfo.color : 'var(--text-dark)' }}>Nota de Ari: </span>
                  {orden.notas_orden}
                </p>
              )}
            </div>
          )}

          {/* Lista de libros en orden */}
          {librosSerie.length > 0 && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 1.25rem' }}>Orden de lectura</p>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {librosSerie.map((libro, i) => (
                  <LibroCard key={libro.id || i} libro={libro} index={i} />
                ))}
              </div>
            </div>
          )}

          {librosSerie.length === 0 && (
            <div style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', textAlign:'center', color:'var(--text-muted)', fontStyle:'italic', fontSize:13 }}>
              Los libros de esta serie aún están siendo añadidos.
            </div>
          )}
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

function LibroCard({ libro, index }) {
  const tropes = Array.isArray(libro.tropes) ? libro.tropes : []

  return (
    <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:16, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        {libro.portada
          ? <img src={libro.portada} alt={libro.titulo}
              style={{ width:70, height:102, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)', display:'block' }}
              onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
          : <div style={{ width:70, height:102, borderRadius:6, background:'var(--bg-tag)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📖</div>
        }
        <span style={{ position:'absolute', top:-8, left:-8, minWidth:24, height:24, padding:'0 6px', background:'var(--btn-bg)', color:'#fff', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontFamily:'sans-serif', fontWeight:700, border:'2px solid var(--bg)' }}>
          {libro.numero != null && libro.numero !== '' ? `#${libro.numero}` : index + 1}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-dark)', margin:'0 0 2px', lineHeight:1.3 }}>{libro.titulo}</h3>
        {libro.autor && <p style={{ fontSize:12, color:'#9b7b5e', margin:'0 0 4px', fontFamily:'sans-serif', fontStyle:'italic' }}>{libro.autor}</p>}

        {libro.calificacion ? (
          <p style={{ fontSize:13, color:'var(--text-accent)', fontFamily:'sans-serif', margin:'0 0 6px', letterSpacing:'0.05em' }}>
            {'★'.repeat(Math.floor(Number(libro.calificacion)))}
            <span style={{ color:'var(--text-muted)', marginLeft:6, fontSize:11 }}>{libro.calificacion}/5</span>
          </p>
        ) : null}

        {libro.protagonistas && (
          <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 6px', fontFamily:'sans-serif' }}>
            💕 {libro.protagonistas}
          </p>
        )}

        {libro.sinopsis && (
          <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'0 0 10px' }}>
            {libro.sinopsis}
          </p>
        )}

        {tropes.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
            {tropes.map(t => <Pill key={t}>{t}</Pill>)}
          </div>
        )}

        {libro.standalone && (
          <p style={{ fontSize:11, color:'#0F6E56', fontFamily:'sans-serif', margin:'0 0 8px', fontWeight:500 }}>
            ✓ Se puede leer standalone
          </p>
        )}

        {libro.advertencias && (
          <details style={{ fontSize:12, margin:'0 0 10px' }}>
            <summary style={{ cursor:'pointer', color:'#791F1F', fontFamily:'sans-serif', fontWeight:500 }}>
              ⚠ Advertencias de contenido
            </summary>
            <p style={{ fontSize:12, color:'var(--text-body)', margin:'6px 0 0', padding:'6px 10px', background:'#FCEBEB', borderRadius:6, border:'1px solid #F7C1C1', lineHeight:1.5 }}>
              {libro.advertencias}
            </p>
          </details>
        )}

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {libro.resena_slug && (
            <Link href={`/resena/${libro.resena_slug}`} style={{ padding:'6px 14px', borderRadius:6, background:'var(--btn-bg)', color:'#fff', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>
              Leer reseña completa →
            </Link>
          )}
          {libro.link_amazon && (
            <a href={libro.link_amazon} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:6, background:'#fff8e7', border:'1px solid #f0c060', color:'#b07800', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>
              Amazon
            </a>
          )}
          {libro.link_buscalibre && (
            <a href={libro.link_buscalibre} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:6, background:'#e7f5ff', border:'1px solid #60a0d0', color:'#0060a0', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>
              Buscalibre
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const ordenes = await getOrdenes()
  return {
    paths: ordenes.map(o => ({ params: { slug: o.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const orden = await getOrden(params.slug)
  if (!orden) return { notFound: true }
  return { props: { orden }, revalidate: 60 }
}
