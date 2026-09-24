import Head from 'next/head'
import Link from 'next/link'
import { getVinetas, getVineta } from '../../lib/notion'
import { Stars, Pill, SiteHeader, Newsletter, Footer } from '../../components/ui'

const visualTypes = { manga:'Manga', manhwa:'Manhwa', manhua:'Manhua', 'cómic':'Cómic', comic:'Cómic' }
const statusColors = {
  'En curso': { color:'#5a7a50', bg:'#e8ede3', border:'#b0c8a0' },
  'Completo': { color:'#3a6a7a', bg:'#e4f0f5', border:'#aacfda' },
}

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

export default function DetalleVineta({ vineta }) {
  if (!vineta) return <div className="container"><p>No encontrado</p></div>
  const st = statusColors[vineta.estado] || statusColors['En curso']
  const tags = Array.isArray(vineta.tags) ? vineta.tags : (vineta.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
  const tipo = visualTypes[vineta.visualtype] || ''
  const tituloSEO = `${vineta.titulo}: ${tipo ? `reseña del ${tipo.toLowerCase()}` : 'reseña'} | Entre letras y matcha`
  const descripcionSEO = vineta.sinopsis?.slice(0,160)

  return (
    <>
      <Head>
        <title>{tituloSEO}</title>
        <meta name="description" content={descripcionSEO} />
        <meta property="og:title" content={tituloSEO} />
        <meta property="og:description" content={descripcionSEO} />
        {vineta.portada && <meta property="og:image" content={vineta.portada} />}
      </Head>
      <div className="container">
        <SiteHeader />
        <div style={{ maxWidth:680, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--v-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:24, marginBottom:'2rem', alignItems:'start' }}>
            {vineta.portada && <img src={vineta.portada} alt={vineta.titulo} style={{ width:140, height:200, objectFit:'cover', borderRadius:8, border:'1px solid var(--v-border)' }} />}
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'0.75rem' }}>
                <Pill bg="#fff" color="var(--v-accent)" border="var(--v-border)">{visualTypes[vineta.visualtype]||vineta.visualtype}</Pill>
                <Pill bg={st.bg} color={st.color} border={st.border}>{vineta.estado}</Pill>
              </div>
              <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 0.25rem', color:'var(--text-dark)', lineHeight:1.2 }}>{vineta.titulo}</h1>
              <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 4px', fontFamily:'sans-serif' }}>{vineta.autor}</p>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>{vineta.genero} · {vineta.plataforma}</p>
              <Stars n={vineta.calificacion} size={18} />
              {tags.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:'0.75rem' }}>{tags.map(t => <Pill key={t}>{t}</Pill>)}</div>}
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--v-border)', paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Sinopsis</p>
            <Parrafos texto={vineta.sinopsis} style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.8 }} />
          </div>

          <div style={{ background:'var(--v-bg)', border:'1px solid var(--v-border)', borderRadius:12, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>Mi reseña</p>
            <Parrafos texto={vineta.resena} style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.85, fontStyle:'italic' }} gap="1.1rem" />
          </div>

          {vineta.link_compra && (
            <div style={{ marginBottom:'1.5rem' }}>
              <p style={{ fontSize:11, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', margin:'0 0 0.75rem' }}>¿Dónde leerlo?</p>
              <a href={vineta.link_compra} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', borderRadius:8, background:'#e7f5ff', border:'1px solid #60a0d0', color:'#0060a0', fontSize:13, fontFamily:'sans-serif', textDecoration:'none', fontWeight:500 }}>Ver plataforma</a>
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
  const vinetas = await getVinetas()
  return { paths: vinetas.map(v => ({ params: { slug: v.slug } })), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const vineta = await getVineta(params.slug)
  if (!vineta) return { notFound: true }
  return { props: { vineta }, revalidate: 60 }
}
