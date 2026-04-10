import Head from 'next/head'
import Link from 'next/link'
import { getLibros, getLibro } from '../../lib/notion'
import { Stars, Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'

export default function DetalleLibro({ libro }) {
  if (!libro) return <div className="container"><p>No encontrado</p></div>

  const tags = Array.isArray(libro.tags) ? libro.tags : (libro.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
  const tropes = Array.isArray(libro.tropes) ? libro.tropes : []
  const protagonistas = [1,2,3].filter(n => libro[`protagonista${n}_nombre`]).map(n => ({
    nombre: libro[`protagonista${n}_nombre`],
    rol:    libro[`protagonista${n}_rol`],
    desc:   libro[`protagonista${n}_descripcion`],
    tags:   (libro[`protagonista${n}_tags`]||'').split(',').map(t=>t.trim()).filter(Boolean),
  }))

  return (
    <>
      <Head>
        <title>{libro.titulo} — Entre letras y matcha</title>
        <meta name="description" content={libro.sinopsis?.slice(0,160)} />
        <meta property="og:title" content={`${libro.titulo} — Entre letras y matcha`} />
        <meta property="og:description" content={libro.sinopsis?.slice(0,160)} />
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
              {libro.serie && <p style={{ fontSize:13, color:'#9b7b5e', margin:'0 0 0.25rem', fontFamily:'sans-serif', fontStyle:'italic' }}>{libro.serie}{libro.numero_serie ? ` · Libro ${libro.numero_serie}` : ''}</p>}
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
            <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.8 }}>{libro.sinopsis}</p>
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
                    {p.desc && <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.65, margin:'0 0 0.75rem' }}>{p.desc}</p>}
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
            <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.85, fontStyle:'italic' }}>{libro.resena}</p>
          </div>

          {/* Para quién es */}
          {libro.para_quien && (
            <div style={{ background:'#edf4e8', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>¿Para quién es?</p>
              <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.75 }}>{libro.para_quien}</p>
            </div>
          )}

          {/* Links de compra */}
          {(libro.link_amazon || libro.link_buscalibre || libro.link_mercadolibre) && (
            <div style={{ marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>¿Dónde comprarlo?</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {libro.link_amazon && <a href={libro.link_amazon} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', borderRadius:8, background:'#fff8e7', border:'1px solid #f0c060', color:'#b07800', fontSize:13, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Amazon</a>}
                {libro.link_buscalibre && <a href={libro.link_buscalibre} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', borderRadius:8, background:'#e7f5ff', border:'1px solid #60a0d0', color:'#0060a0', fontSize:13, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Buscalibre</a>}
                {libro.link_mercadolibre && <a href={libro.link_mercadolibre} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', borderRadius:8, background:'#fff8e0', border:'1px solid #e0b800', color:'#806800', fontSize:13, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Mercado Libre</a>}
              </div>
            </div>
          )}
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
  return { props: { libro }, revalidate: 60 }
}
