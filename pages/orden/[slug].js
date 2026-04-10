import Head from 'next/head'
import Link from 'next/link'
import { getOrdenes, getOrden } from '../../lib/notion'
import { Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'

export default function DetalleOrden({ orden }) {
  if (!orden) return <div className="container"><p>No encontrado</p></div>

  const tropes = Array.isArray(orden.tropes) ? orden.tropes : []
  const libros = orden.titulos_libros || []
  const imagenes = orden.imagenes_libros || []
  const linksAmazon = orden.links_amazon || []
  const linksBusca = orden.links_buscalibre || []
  const linksMeli = orden.links_mercadolibre || []

  return (
    <>
      <Head>
        <title>{orden.titulo} — Orden de lectura · Entre letras y matcha</title>
        <meta name="description" content={`Orden de lectura de ${orden.titulo} de ${orden.autora}. ${orden.descripcion}`} />
        <meta property="og:title" content={`${orden.titulo} — Orden de lectura`} />
        {orden.portada_saga && <meta property="og:image" content={orden.portada_saga} />}
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:700, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          {/* Hero de la saga */}
          <div style={{ display:'grid', gridTemplateColumns: orden.portada_saga ? '140px 1fr' : '1fr', gap:24, marginBottom:'2rem', alignItems:'start' }}>
            {orden.portada_saga && (
              <img src={orden.portada_saga} alt={orden.titulo}
                style={{ width:140, height:200, objectFit:'cover', borderRadius:8, border:'1px solid var(--border-warm)' }} />
            )}
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'0.75rem' }}>
                <Pill>{orden.categoria}</Pill>
                <Pill bg="#fff" color="var(--text-muted)" border="var(--border)">{libros.length} libros</Pill>
              </div>
              <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 0.25rem', color:'var(--text-dark)', lineHeight:1.2 }}>{orden.titulo}</h1>
              <p style={{ fontSize:14, color:'#9b7b5e', margin:'0 0 0.25rem', fontFamily:'sans-serif', fontStyle:'italic' }}>{orden.autora}</p>
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

          {/* Lista de libros en orden */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 1.25rem' }}>Orden de lectura</p>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {libros.map((titulo, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:16, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    {imagenes[i]
                      ? <img src={imagenes[i]} alt={titulo}
                          style={{ width:60, height:88, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)', display:'block' }}
                          onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
                      : <div style={{ width:60, height:88, borderRadius:6, background:'var(--bg-tag)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📖</div>
                    }
                    <span style={{ position:'absolute', top:-8, left:-8, width:24, height:24, background:'var(--btn-bg)', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontFamily:'sans-serif', fontWeight:700, border:'2px solid var(--bg)' }}>{i+1}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-dark)', margin:'0 0 0.5rem', lineHeight:1.3 }}>{titulo}</h3>
                    <p style={{ fontSize:12, color:'#9b7b5e', margin:'0 0 0.75rem', fontFamily:'sans-serif', fontStyle:'italic' }}>{orden.autora}</p>
                    {(linksAmazon[i] || linksBusca[i] || linksMeli[i]) && (
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {linksAmazon[i] && <a href={linksAmazon[i]} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:6, background:'#fff8e7', border:'1px solid #f0c060', color:'#b07800', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Amazon</a>}
                        {linksBusca[i] && <a href={linksBusca[i]} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:6, background:'#e7f5ff', border:'1px solid #60a0d0', color:'#0060a0', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Buscalibre</a>}
                        {linksMeli[i] && <a href={linksMeli[i]} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:6, background:'#fff8e0', border:'1px solid #e0b800', color:'#806800', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Mercado Libre</a>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
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
