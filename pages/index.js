import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { getTodo } from '../lib/notion'
import { Stars, Pill, SiteHeader, Perfil, Sidebar, Newsletter, Footer } from '../components/ui'

const entryTypes = {
  reflexion:   { label:'Reflexión',       color:'#7a6a50', bg:'#f5ede4', border:'#d4bfaa' },
  'reflexión': { label:'Reflexión',       color:'#7a6a50', bg:'#f5ede4', border:'#d4bfaa' },
  noticia:     { label:'Noticia literaria',color:'#3a6a7a', bg:'#e4f0f5', border:'#aacfda' },
  lista:       { label:'Lista',           color:'#5a7a50', bg:'#e8ede3', border:'#b0c8a0' },
  cita:        { label:'Cita',            color:'#7a5080', bg:'#f0e8f5', border:'#c8aad4' },
}
const visualTypes = { manga:'Manga', manhwa:'Manhwa', manhua:'Manhua', 'cómic':'Cómic', comic:'Cómic' }
const statusColors = {
  'En curso': { color:'#5a7a50', bg:'#e8ede3', border:'#b0c8a0' },
  'Completo': { color:'#3a6a7a', bg:'#e4f0f5', border:'#aacfda' },
}

const catKeys = ['todo', 'resena', 'vineta', 'rincon', 'orden']
const categories = ['Todo','Entre libros','Entre viñetas','Desde mi rincón','Órdenes de lectura']

export default function Home({ libros, vinetas, rincon, leyendo, ordenes }) {
  const [activeCat, setActiveCat] = useState('todo')
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch]       = useState('')

  const libroDestacado = useMemo(() => libros.find(l => l.destacado) || null, [libros])
  const librosFavoritos = useMemo(() => libros.filter(l => l.favorito).slice(0, 5), [libros])

  const allItems = useMemo(() => { const items = [...libros, ...vinetas, ...rincon, ...ordenes]; return items.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")); }, [libros, vinetas, rincon, ordenes])

  const allTags = useMemo(() => {
    const set = new Set()
    allItems.forEach(item => {
      const tags = Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
      tags.forEach(t => set.add(t))
    })
    return Array.from(set).sort()
  }, [allItems])

  const filtered = useMemo(() => {
    let items = activeCat === 'todo' ? allItems : allItems.filter(i => i.type === activeCat || (activeCat==='orden' && i.type==='orden'))
    if (activeTag) items = items.filter(i => {
      const tags = Array.isArray(i.tags) ? i.tags : (i.tags||'').split(',').map(t=>t.trim())
      return tags.includes(activeTag)
    })
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        (i.titulo||'').toLowerCase().includes(q) ||
        (i.autor||i.autora||'').toLowerCase().includes(q) ||
        (Array.isArray(i.tags) ? i.tags.join(' ') : (i.tags||'')).toLowerCase().includes(q)
      )
    }
    return items
  }, [allItems, activeCat, activeTag, search])

  const isFiltered = activeCat !== 'todo' || activeTag || search

  function handleTag(tag) { setActiveTag(prev => prev===tag ? null : tag) }

  return (
    <>
      <Head>
        <title>Entre letras y matcha</title>
        <meta name="description" content="Reseñas de romance, dark romance, romantasy y más. Lecturas honestas con un matcha cerca." />
        <meta property="og:title" content="Entre letras y matcha" />
        <meta property="og:description" content="Reseñas de romance, dark romance, romantasy y más." />
      </Head>

      <div className="container">
        <SiteHeader />
        <Perfil />

        {!isFiltered && libroDestacado && (
          <DestacadoCard libro={libroDestacado} />
        )}

        {!isFiltered && librosFavoritos.length > 0 && (
          <FavoritosRow libros={librosFavoritos} />
        )}

        {!isFiltered && (
          <UniversosBanner />
        )}

        <div style={{ padding:'1.5rem 0 1rem' }}>
          {/* Filtros de categoría */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1.5rem' }}>
            {categories.map((cat, i) => (
              <button key={cat} className={`btn btn-pill ${activeCat===catKeys[i]?'active':''}`}
                onClick={() => setActiveCat(catKeys[i])}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid-sidebar">
            {/* Lista de contenido */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {filtered.length === 0
                ? <p style={{ color:'var(--text-muted)', fontStyle:'italic', fontSize:14 }}>No hay entradas con ese filtro aún.</p>
                : filtered.map((item, idx) => <ItemCard key={item.id||idx} item={item} activeTag={activeTag} handleTag={handleTag} />)
              }
            </div>

            {/* Sidebar */}
            <Sidebar leyendo={leyendo} search={search} setSearch={setSearch}
              activeTag={activeTag} allTags={allTags} handleTag={handleTag} />
          </div>
        </div>

        {/* Banner afiliados */}
        <div className="afiliados-banner">
          <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 4px', fontFamily:'sans-serif', letterSpacing:'0.1em', textTransform:'uppercase' }}>Afiliados</p>
          <p style={{ fontSize:14, color:'var(--text-body)', margin:0, fontStyle:'italic' }}>Compra los libros que recomiendo en Amazon</p>
        </div>

        <Newsletter />
        <Footer />
      </div>
    </>
  )
}

function UniversosBanner() {
  return (
    <Link href="/universos-literarios" style={{ textDecoration:'none' }}>
      <div style={{ margin:'1.5rem 0', background:'#EEEDFE', border:'1px solid #AFA9EC', borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(60, 52, 137, 0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:24 }}>🌌</span>
          <div>
            <p style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#3C3489', fontFamily:'sans-serif', fontWeight:600, margin:'0 0 2px' }}>Explora los mundos conectados</p>
            <p style={{ fontSize:15, fontWeight:700, color:'#26215C', margin:0, fontFamily:'Georgia, serif' }}>Universos literarios</p>
          </div>
        </div>
        <span style={{ fontSize:13, color:'#3C3489', fontFamily:'sans-serif', fontWeight:500, whiteSpace:'nowrap' }}>Ver todos →</span>
      </div>
    </Link>
  )
}

function DestacadoCard({ libro }) {
  return (
    <Link href={`/resena/${libro.slug}`} style={{ textDecoration:'none' }}>
      <div style={{ margin:'2rem 0 1rem', background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem', display:'grid', gridTemplateColumns:'140px 1fr', gap:20, cursor:'pointer', transition:'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.92'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        <img src={libro.portada} alt={libro.titulo}
          style={{ width:140, height:200, objectFit:'cover', borderRadius:8, border:'1px solid var(--border-warm)' }}
          onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
        <div>
          <span style={{ display:'inline-block', background:'var(--btn-bg)', color:'#fff', fontSize:10, padding:'4px 12px', borderRadius:20, fontFamily:'sans-serif', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>★ Destacado</span>
          <h2 style={{ fontSize:26, fontWeight:700, margin:'0 0 4px', color:'var(--text-dark)', lineHeight:1.2 }}>{libro.titulo}</h2>
          {libro.serie && <p style={{ fontSize:13, color:'#9b7b5e', margin:'0 0 4px', fontFamily:'sans-serif', fontStyle:'italic' }}>{libro.serie}{libro.numero_serie ? ` · Libro ${libro.numero_serie}` : ''}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <p style={{ fontSize:14, color:'var(--text-muted)', margin:0, fontFamily:'sans-serif' }}>{libro.autor}</p>
            <Pill>{libro.categoria}</Pill>
          </div>
          <Stars n={libro.calificacion} size={16} />
          <p style={{ fontSize:14, color:'var(--text-body)', lineHeight:1.65, margin:'10px 0 12px', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{libro.sinopsis}</p>
          <span style={{ fontSize:13, color:'var(--text-accent)', fontFamily:'sans-serif', fontWeight:500 }}>Leer la reseña completa →</span>
        </div>
      </div>
    </Link>
  )
}

function FavoritosRow({ libros }) {
  return (
    <div style={{ margin:'1.5rem 0' }}>
      <p style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 12px', fontFamily:'sans-serif' }}>★ Mis favoritos</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10 }}>
        {libros.map(libro => (
          <Link key={libro.id} href={`/resena/${libro.slug}`} style={{ textDecoration:'none' }}>
            <div style={{ cursor:'pointer', transition:'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <img src={libro.portada} alt={libro.titulo}
                style={{ width:'100%', aspectRatio:'2/3', objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)', marginBottom:6 }}
                onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text-dark)', margin:'0 0 2px', lineHeight:1.25, fontFamily:'Georgia,serif', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{libro.titulo}</p>
              <p style={{ fontSize:10, color:'var(--text-accent)', margin:0, fontFamily:'sans-serif' }}>{'★'.repeat(Math.floor(Number(libro.calificacion) || 0))}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, activeTag, handleTag }) {
  // Libro
  if (item.type === 'resena') {
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
    return (
      <Link href={`/resena/${item.slug}`} style={{ textDecoration:'none' }}>
        <div className="card" style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:14 }}>
          <img src={item.portada} alt={item.titulo}
            style={{ width:80, height:115, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)' }}
            onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
          <div>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 2px', color:'var(--text-dark)' }}>{item.titulo}</h3>
            {item.serie && <p style={{ fontSize:11, color:'#9b7b5e', margin:'0 0 2px', fontFamily:'sans-serif', fontStyle:'italic' }}>{item.serie}{item.numero_serie ? ` · Libro ${item.numero_serie}` : ''}</p>}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0, fontFamily:'sans-serif' }}>{item.autor}</p>
              <Pill>{item.categoria}</Pill>
            </div>
            <Stars n={item.calificacion} />
            <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'7px 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.sinopsis}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:5 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {tags.map(tag => (
                  <span key={tag} onClick={e => { e.preventDefault(); handleTag(tag) }}
                    style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', cursor:'pointer',
                      border:`1px solid var(--border)`, background: activeTag===tag ? 'var(--btn-bg)' : 'var(--bg-tag)',
                      color: activeTag===tag ? '#fff' : 'var(--text-accent)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ fontSize:12, color:'var(--text-accent)', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>Leer más →</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Viñeta
  if (item.type === 'vineta') {
    const st = statusColors[item.estado] || statusColors['En curso']
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
    return (
      <Link href={`/vineta/${item.slug}`} style={{ textDecoration:'none' }}>
        <div className="card-vineta" style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:14 }}>
          <img src={item.portada} alt={item.titulo}
            style={{ width:80, height:115, objectFit:'cover', borderRadius:6, border:'1px solid var(--v-border)' }}
            onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
          <div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              <Pill bg="#fff" color="var(--v-accent)" border="var(--v-border)">{visualTypes[item.visualtype]||item.visualtype}</Pill>
              <Pill bg={st.bg} color={st.color} border={st.border}>{item.estado}</Pill>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 2px', color:'var(--text-dark)' }}>{item.titulo}</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 5px', fontFamily:'sans-serif' }}>{item.genero} · {item.plataforma}</p>
            <Stars n={item.calificacion} />
            <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'7px 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.sinopsis}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {tags.map(tag => (
                  <span key={tag} onClick={e => { e.preventDefault(); handleTag(tag) }}
                    style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', cursor:'pointer',
                      border:`1px solid var(--v-border)`, background: activeTag===tag ? 'var(--btn-bg)' : '#fff',
                      color: activeTag===tag ? '#fff' : 'var(--v-accent)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ fontSize:12, color:'var(--v-accent)', fontFamily:'sans-serif' }}>Leer más →</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Rincón
  if (item.type === 'rincon') {
    const et = entryTypes[item.entrytype] || entryTypes.reflexion
    const rinconImg = item.imagen ? item.imagen.split('|').filter(Boolean)[0] : null
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
    return (
      <Link href={`/rincon/${item.slug}`} style={{ textDecoration:'none' }}>
        <div style={{ background:et.bg, border:`1px solid ${et.border}`, borderLeft:`4px solid ${et.color}`, borderRadius:12, padding:'1rem', cursor:'pointer',
          display:'grid', gridTemplateColumns: rinconImg ? '80px 1fr' : '1fr', gap:14, transition:'opacity 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          {rinconImg && <img src={rinconImg} alt={item.titulo} style={{ width:80, height:115, objectFit:'cover', borderRadius:6, border:`1px solid ${et.border}` }} />}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Pill bg="#fff" color={et.color} border={et.border}>{et.label}</Pill>
                <span style={{ fontSize:11, color:et.color, fontFamily:'sans-serif', opacity:0.8 }}>Desde mi rincón</span>
              </div>
              <span style={{ fontSize:11, color:et.color, fontFamily:'sans-serif', opacity:0.7 }}>{item.fecha}</span>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 6px', color:'var(--text-dark)' }}>{item.titulo}</h3>
            <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.65, margin:'0 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', fontStyle: item.entrytype==='cita' ? 'italic' : 'normal' }}>{item.preview}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {tags.map(tag => (
                  <span key={tag} onClick={e => { e.preventDefault(); handleTag(tag) }}
                    style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', cursor:'pointer',
                      border:`1px solid ${et.border}`, background: activeTag===tag ? 'var(--btn-bg)' : '#fff',
                      color: activeTag===tag ? '#fff' : et.color }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ fontSize:12, color:et.color, fontFamily:'sans-serif' }}>Leer más →</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Orden de lectura
  if (item.type === 'orden') {
    const tropes = Array.isArray(item.tropes) ? item.tropes : []
    return (
      <Link href={`/orden/${item.slug}`} style={{ textDecoration:'none' }}>
        <div className="card-orden">
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:14, padding:'1rem' }}>
            {item.portada_saga
              ? <img src={item.portada_saga} alt={item.titulo} style={{ width:80, height:115, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)' }}
                  onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
              : <div style={{ width:80, height:115, borderRadius:6, background:'var(--bg-tag)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📚</div>
            }
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                <Pill>{item.categoria}</Pill>
                <Pill bg="#fff" color="var(--text-muted)" border="var(--border)">{item.num_libros} libros</Pill>
              </div>
              <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 2px', color:'var(--text-dark)' }}>{item.titulo}</h3>
              <p style={{ fontSize:12, color:'#9b7b5e', margin:'0 0 4px', fontFamily:'sans-serif', fontStyle:'italic' }}>{item.autora}</p>
              {item.pareja && <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 6px', fontFamily:'sans-serif' }}>💕 {item.pareja}</p>}
              <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'0 0 8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.descripcion}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {tropes.slice(0,3).map(t => <Pill key={t}>{t}</Pill>)}
                </div>
                <span style={{ fontSize:12, color:'var(--text-accent)', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>Ver orden →</span>
              </div>
            </div>
          </div>
          {/* Mini portadas */}
          {item.imagenes_libros?.length > 0 && (
            <div style={{ display:'flex', gap:6, padding:'0 1rem 1rem', overflowX:'auto' }}>
              {item.imagenes_libros.slice(0,8).map((img, i) => (
                <div key={i} style={{ flexShrink:0, position:'relative' }}>
                  <img src={img} alt={item.titulos_libros?.[i] || `Libro ${i+1}`}
                    style={{ width:44, height:64, objectFit:'cover', borderRadius:4, border:'1px solid var(--border-warm)' }}
                    onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
                  <span style={{ position:'absolute', top:2, left:2, background:'var(--btn-bg)', color:'#fff', fontSize:9, fontFamily:'sans-serif', borderRadius:3, padding:'1px 4px', fontWeight:700 }}>{i+1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    )
  }

  return null
}

export async function getStaticProps() {
  const { libros, vinetas, rincon, leyendo, ordenes } = await getTodo()
  return {
    props: { libros, vinetas, rincon, leyendo, ordenes },
    revalidate: 60, // ISR: regenera cada 60 segundos
  }
}
