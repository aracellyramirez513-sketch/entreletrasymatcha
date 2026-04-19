import Head from 'next/head'
import Link from 'next/link'
import { getUniversos, getUniverso, getOrdenes } from '../../lib/notion'
import { Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'

export default function DetalleUniverso({ universo, seriesDelUniverso }) {
  if (!universo) return <div className="container"><p>Universo no encontrado</p></div>

  const tropes = Array.isArray(universo.tropes_principales) ? universo.tropes_principales : []

  return (
    <>
      <Head>
        <title>{universo.nombre} — Universo · Entre letras y matcha</title>
        <meta name="description" content={`Universo literario de ${universo.autor}. ${universo.descripcion}`} />
        <meta property="og:title" content={`${universo.nombre} — Universo literario`} />
        {universo.imagen_autor && <meta property="og:image" content={universo.imagen_autor} />}
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:760, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          {/* Hero del universo */}
          <div style={{ background:'#EEEDFE', border:'1px solid #AFA9EC', borderRadius:16, padding:'1.75rem', marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
              <span style={{ fontSize:18 }}>🌌</span>
              <span style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#3C3489', fontFamily:'sans-serif', fontWeight:600 }}>Universo literario</span>
            </div>

            <h1 style={{ fontSize:32, fontWeight:700, margin:'0 0 0.5rem', color:'#26215C', lineHeight:1.15 }}>
              {universo.nombre}
            </h1>

            <div style={{ display:'grid', gridTemplateColumns: universo.imagen_autor ? '80px 1fr' : '1fr', gap:16, alignItems:'center', marginTop:'1rem' }}>
              {universo.imagen_autor && (
                <img src={universo.imagen_autor} alt={universo.autor}
                  style={{ width:80, height:80, objectFit:'cover', borderRadius:'50%', border:'2px solid #AFA9EC' }}
                  onError={e => { e.target.style.display='none' }} />
              )}
              <div>
                {universo.autor && (
                  <p style={{ fontSize:15, color:'#3C3489', margin:0, fontFamily:'sans-serif', fontWeight:500 }}>
                    Por <span style={{ fontStyle:'italic' }}>{universo.autor}</span>
                  </p>
                )}
                {seriesDelUniverso.length > 0 && (
                  <p style={{ fontSize:13, color:'#534AB7', margin:'2px 0 0', fontFamily:'sans-serif', opacity:0.85 }}>
                    {seriesDelUniverso.length} {seriesDelUniverso.length === 1 ? 'serie' : 'series'} conectadas
                  </p>
                )}
              </div>
            </div>

            {universo.descripcion && (
              <p style={{ fontSize:15, color:'#26215C', lineHeight:1.75, margin:'1.25rem 0 0' }}>
                {universo.descripcion}
              </p>
            )}

            {tropes.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:'1rem' }}>
                {tropes.map(t => (
                  <span key={t} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontFamily:'sans-serif', background:'#fff', color:'#3C3489', border:'1px solid #CECBF6' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Series del universo */}
          {seriesDelUniverso.length > 0 ? (
            <div>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 1.25rem' }}>
                Series que forman este universo
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {seriesDelUniverso.map(serie => (
                  <SerieCard key={serie.id} serie={serie} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', textAlign:'center', color:'var(--text-muted)', fontStyle:'italic', fontSize:13 }}>
              Las series de este universo aún están siendo añadidas.
            </div>
          )}
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

function SerieCard({ serie }) {
  const tropes = Array.isArray(serie.tropes) ? serie.tropes : []
  const numLibros = serie.libros_serie?.length || serie.num_libros || 0

  return (
    <Link href={`/orden/${serie.slug}`} style={{ textDecoration:'none' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'grid', gridTemplateColumns: serie.portada_saga ? '90px 1fr' : '1fr', gap:16, cursor:'pointer', transition:'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        {serie.portada_saga && (
          <img src={serie.portada_saga} alt={serie.titulo}
            style={{ width:90, height:130, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)' }}
            onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
        )}
        <div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
            {serie.categoria && <Pill>{serie.categoria}</Pill>}
            <Pill bg="#fff" color="var(--text-muted)" border="var(--border)">{numLibros} libros</Pill>
            {serie.estado && <Pill>{serie.estado}</Pill>}
          </div>
          <h3 style={{ fontSize:17, fontWeight:700, margin:'0 0 4px', color:'var(--text-dark)' }}>{serie.titulo}</h3>
          {serie.pareja && (
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 6px', fontFamily:'sans-serif' }}>
              💕 {serie.pareja}
            </p>
          )}
          {serie.descripcion && (
            <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'0 0 8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {serie.descripcion}
            </p>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {tropes.slice(0, 3).map(t => <Pill key={t}>{t}</Pill>)}
            </div>
            <span style={{ fontSize:12, color:'var(--text-accent)', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>Ver orden →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export async function getStaticPaths() {
  const universos = await getUniversos()
  return {
    paths: universos.map(u => ({ params: { slug: u.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const [universo, ordenes] = await Promise.all([
    getUniverso(params.slug),
    getOrdenes(),
  ])
  if (!universo) return { notFound: true }

  const seriesDelUniverso = ordenes.filter(o => o.universo && o.universo.id === universo.id)

  return { props: { universo, seriesDelUniverso }, revalidate: 60 }
}
