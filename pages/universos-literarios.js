import Head from 'next/head'
import Link from 'next/link'
import { getUniversos, getOrdenes } from '../lib/notion'
import { SiteHeader, Newsletter, Footer } from '../components/ui'

export default function UniversosLiterarios({ universos }) {
  return (
    <>
      <Head>
        <title>Universos literarios · Entre letras y matcha</title>
        <meta name="description" content="Explora los universos literarios donde los libros se conectan entre sí, con personajes cruzados, mundos compartidos y tropes recurrentes." />
        <meta property="og:title" content="Universos literarios — Entre letras y matcha" />
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:900, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
              <span style={{ fontSize:20 }}>🌌</span>
              <span style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'#3C3489', fontFamily:'sans-serif', fontWeight:600 }}>Mundos conectados</span>
            </div>
            <h1 style={{ fontSize:34, fontWeight:700, margin:'0 0 0.75rem', color:'var(--text-dark)', lineHeight:1.15 }}>
              Universos literarios
            </h1>
            <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.7, margin:'0 auto', maxWidth:560 }}>
              Series que comparten mundo, personajes que aparecen en los libros de otros, y tropes que se repiten entre sagas. Explora las conexiones que hacen que cada lectura sea más rica.
            </p>
          </div>

          {universos.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
              {universos.map(u => <UniversoCard key={u.id} universo={u} />)}
            </div>
          ) : (
            <div style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontStyle:'italic', fontSize:14 }}>
              Aún no hay universos publicados. ¡Vuelve pronto!
            </div>
          )}
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

function UniversoCard({ universo }) {
  const tropes = Array.isArray(universo.tropes_principales) ? universo.tropes_principales : []
  const numSeries = universo.num_series || 0

  return (
    <Link href={`/universo/${universo.slug}`} style={{ textDecoration:'none' }}>
      <div style={{ background:'#EEEDFE', border:'1px solid #AFA9EC', borderRadius:16, padding:'1.25rem', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s', height:'100%', display:'flex', flexDirection:'column' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(60, 52, 137, 0.15)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'0.75rem' }}>
          {universo.imagen_autor ? (
            <img src={universo.imagen_autor} alt={universo.autor}
              style={{ width:56, height:56, objectFit:'cover', borderRadius:'50%', border:'2px solid #AFA9EC', flexShrink:0 }}
              onError={e => { e.target.style.display='none' }} />
          ) : (
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#fff', border:'2px solid #AFA9EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
              🌌
            </div>
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontSize:18, fontWeight:700, margin:'0 0 2px', color:'#26215C', lineHeight:1.2 }}>
              {universo.nombre}
            </h3>
            {universo.autor && (
              <p style={{ fontSize:13, color:'#3C3489', margin:0, fontFamily:'sans-serif', fontStyle:'italic' }}>
                {universo.autor}
              </p>
            )}
          </div>
        </div>

        {universo.descripcion && (
          <p style={{ fontSize:13, color:'#26215C', lineHeight:1.6, margin:'0 0 0.75rem', flex:1, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {universo.descripcion}
          </p>
        )}

        {tropes.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:'0.75rem' }}>
            {tropes.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontFamily:'sans-serif', background:'#fff', color:'#3C3489', border:'1px solid #CECBF6' }}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'0.75rem', borderTop:'1px dashed rgba(60, 52, 137, 0.2)' }}>
          <span style={{ fontSize:11, color:'#534AB7', fontFamily:'sans-serif', opacity:0.85 }}>
            {numSeries > 0 ? `${numSeries} ${numSeries === 1 ? 'serie conectada' : 'series conectadas'}` : 'Próximamente'}
          </span>
          <span style={{ fontSize:11, color:'#3C3489', fontFamily:'sans-serif', fontWeight:600 }}>
            Explorar →
          </span>
        </div>
      </div>
    </Link>
  )
}

export async function getStaticProps() {
  const [universos, ordenes] = await Promise.all([
    getUniversos(),
    getOrdenes(),
  ])

  const universosEnriquecidos = universos.map(u => {
    const seriesDelUniverso = ordenes.filter(o => o.universo && o.universo.id === u.id)
    return { ...u, num_series: seriesDelUniverso.length }
  })

  return { props: { universos: universosEnriquecidos }, revalidate: 60 }
}
