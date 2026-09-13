import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
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

// 🌌 Paleta lavanda para órdenes (conecta visualmente con los universos)
const ordenColors = {
  bg:     '#F0EDF5',
  border: '#C4BBD0',
  accent: '#6B5B8C',
  accentDark: '#4A3F6B',
  pillBg: '#fff',
  tagBg:  '#E8E2F0',
}

// 🎨 Configuración de pills de filtro con emoji + color personalizado
const catConfig = [
  { key: 'todo',   label: 'Todo',                 emoji: '✨', bg: '#e8ede3', border: '#b0c8a0', color: '#5a7a50', activeBg: '#5a7a50' },
  { key: 'resena', label: 'Libros',               emoji: '📖', bg: '#e8ede3', border: '#b0c8a0', color: '#5a7a50', activeBg: '#5a7a50' },
  { key: 'vineta', label: 'Viñetas',              emoji: '🎨', bg: '#e4f0f5', border: '#aacfda', color: '#3a6a7a', activeBg: '#3a6a7a' },
  { key: 'rincon', label: 'Desde mi rincón',      emoji: '🌿', bg: '#f5ede4', border: '#d4bfaa', color: '#7a6a50', activeBg: '#7a6a50' },
  { key: 'orden',  label: 'Órdenes de lectura',   emoji: '📚', bg: '#eaeef5', border: '#a8b6d1', color: '#3f4d73', activeBg: '#3f4d73' },
]

// 🏷️ Colores por subgénero para la fila de filtros de categoría
// (mismos tonos que usan los pills de categoría en las tarjetas)
const catFilterColors = {
  'dark romance':          { bg: '#e7d0d6', color: '#67323f' },
  'romantasy':             { bg: '#e0d0e7', color: '#573267' },
  'mafia romance':         { bg: '#e7d9d0', color: '#674832' },
  'mafia':                 { bg: '#e7d9d0', color: '#674832' },
  'romance contemporáneo': { bg: '#d0e7d3', color: '#326739' },
  'romance contemporaneo': { bg: '#d0e7d3', color: '#326739' },
  'monstruos':             { bg: '#d0e2e7', color: '#325b67' },
  'aliens':                { bg: '#d0e2e7', color: '#325b67' },
}
const catFilterFallback = { bg: '#eae4d8', color: '#6b5b45' }

// 🎨 Colores por tipo de viñeta, en la familia azul de la sección
const visualFilterColors = {
  'manga':  { bg: '#d8e8f0', color: '#2f5a70' },
  'manhwa': { bg: '#dfe1f0', color: '#3a4070' },
  'manhua': { bg: '#f0dde8', color: '#70365a' },
  'cómic':  { bg: '#f0e4d6', color: '#70563a' },
  'comic':  { bg: '#f0e4d6', color: '#70563a' },
}
const visualFilterFallback = { bg: '#e4f0f5', color: '#3a6a7a' }

// 🌿 Colores por estado de viñeta y por tipo de entrada del rincón,
// derivados de los mismos mapas que usan las tarjetas
const estadoFilterColors = {
  'en curso': { bg: '#e8ede3', color: '#5a7a50' },
  'completo': { bg: '#e4f0f5', color: '#3a6a7a' },
}
const estadoFilterFallback = { bg: '#eae4d8', color: '#6b5b45' }

const rinconFilterColors = {
  'reflexion':   { bg: '#f5ede4', color: '#7a6a50' },
  'reflexión':   { bg: '#f5ede4', color: '#7a6a50' },
  'noticia':     { bg: '#e4f0f5', color: '#3a6a7a' },
  'lista':       { bg: '#e8ede3', color: '#5a7a50' },
  'cita':        { bg: '#f0e8f5', color: '#7a5080' },
}
const rinconFilterFallback = { bg: '#f5ede4', color: '#7a6a50' }

// 🔎 Qué campo alimenta la segunda fila de filtros en cada pestaña.
// "todo" no aparece acá a propósito: mezclar categorías de romance con
// tipos de manhwa no filtra nada útil.
const subFiltros = {
  resena: { campo: 'categoria',  todos: 'Todas', colores: catFilterColors,    fallback: catFilterFallback,    etiqueta: v => v },
  orden:  { campo: 'categoria',  todos: 'Todas', colores: catFilterColors,    fallback: catFilterFallback,    etiqueta: v => v },
  vineta: { campo: 'visualtype', todos: 'Todos', colores: visualFilterColors, fallback: visualFilterFallback, etiqueta: v => visualTypes[String(v).toLowerCase()] || v },
  rincon: { campo: 'entrytype',  todos: 'Todas', colores: rinconFilterColors, fallback: rinconFilterFallback, etiqueta: v => (entryTypes[String(v).toLowerCase()] || {}).label || v },
}

// Una fila de filtro solo aparece si hay al menos esta cantidad de opciones.
// Con 1 sola opción el filtro no filtra nada, por eso el mínimo es 2.
// Si prefieres que se vea siempre, cambia este número a 1.
const MIN_OPCIONES_FILTRO = 2

// 📄 Cuántas entradas se muestran por página
const PER_PAGE = 10

// Junta los valores distintos de un campo, conservando cómo vienen escritos
function opcionesDe(items, campo) {
  const map = new Map()
  items.forEach(item => {
    const v = String(item[campo] ?? '').trim()
    if (v) {
      const key = v.toLowerCase()
      if (!map.has(key)) map.set(key, v)
    }
  })
  return Array.from(map.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export default function Home({ libros, vinetas, rincon, leyendo, ordenes }) {
  const [activeCat, setActiveCat] = useState('todo')
  const [activeSub, setActiveSub] = useState(null)
  const [activeEstado, setActiveEstado] = useState(null)
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)

  const libroDestacado = useMemo(() => libros.find(l => l.destacado) || null, [libros])
  const librosFavoritos = useMemo(() => libros.filter(l => l.favorito).slice(0, 20), [libros])

  const allItems = useMemo(() => { const items = [...libros, ...vinetas, ...rincon, ...ordenes]; return items.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")); }, [libros, vinetas, rincon, ordenes])

  const allTags = useMemo(() => {
    const set = new Set()
    allItems.forEach(item => {
      const tags = Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean)
      tags.forEach(t => set.add(t))
    })
    return Array.from(set).sort()
  }, [allItems])

  const catActiva = useMemo(() => catConfig.find(c => c.key === activeCat) || catConfig[0], [activeCat])

  // Entradas de la pestaña activa, antes de aplicar subfiltro, tag o búsqueda
  const itemsDeTab = useMemo(
    () => activeCat === 'todo' ? allItems : allItems.filter(i => i.type === activeCat),
    [allItems, activeCat]
  )

  const subActivo = subFiltros[activeCat] || null

  // 🏷️ Opciones de la segunda fila, generadas desde las entradas que existen
  const opcionesSub = useMemo(
    () => subActivo ? opcionesDe(itemsDeTab, subActivo.campo) : [],
    [itemsDeTab, subActivo]
  )

  // 🎨 Solo en Viñetas: fila extra por estado de publicación
  const opcionesEstado = useMemo(
    () => activeCat === 'vineta' ? opcionesDe(itemsDeTab, 'estado') : [],
    [itemsDeTab, activeCat]
  )

  const muestraSub = opcionesSub.length >= MIN_OPCIONES_FILTRO
  const muestraEstado = opcionesEstado.length >= MIN_OPCIONES_FILTRO

  const filtered = useMemo(() => {
    let items = itemsDeTab
    if (subActivo && activeSub) {
      items = items.filter(i => String(i[subActivo.campo] ?? '').trim().toLowerCase() === activeSub)
    }
    if (activeCat === 'vineta' && activeEstado) {
      items = items.filter(i => String(i.estado ?? '').trim().toLowerCase() === activeEstado)
    }
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
  }, [itemsDeTab, subActivo, activeCat, activeSub, activeEstado, activeTag, search])

  const isFiltered = activeCat !== 'todo' || activeSub || activeEstado || activeTag || search

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  // Al cambiar de pestaña se limpian los subfiltros, porque los campos son distintos
  useEffect(() => { setActiveSub(null); setActiveEstado(null) }, [activeCat])
  // Si cambian los filtros, volvemos a la página 1
  useEffect(() => { setPage(1) }, [activeCat, activeSub, activeEstado, activeTag, search])
  // Si la página actual queda fuera de rango, la corregimos
  useEffect(() => { if (page > totalPages) setPage(1) }, [page, totalPages])

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  )

  function goToPage(p) {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
    if (typeof window !== 'undefined') {
      const anchor = document.getElementById('listado')
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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
          <div className="solo-movil">
            <DestacadoCard libro={libroDestacado} />
          </div>
        )}

        {!isFiltered && librosFavoritos.length > 0 && (
          <FavoritosRow libros={librosFavoritos} />
        )}

        <div style={{ padding:'1.5rem 0 1rem' }}>
          {/* Filtros de tipo con emojis y colores propios */}
          <div style={{ display:'flex', gap:9, flexWrap:'wrap', marginBottom:'0.75rem' }}>
            {catConfig.map(cat => {
              const isActive = activeCat === cat.key
              return (
                <button key={cat.key}
                  onClick={() => setActiveCat(cat.key)}
                  style={{
                    display:'inline-flex',
                    alignItems:'center',
                    gap:7,
                    padding:'8px 17px',
                    borderRadius:22,
                    fontSize:14,
                    fontFamily:'sans-serif',
                    fontWeight:500,
                    border: `1px solid ${cat.border}`,
                    background: isActive ? cat.activeBg : cat.bg,
                    color: isActive ? '#fff' : cat.color,
                    cursor:'pointer',
                    transition:'all 0.15s'
                  }}>
                  <span style={{ fontSize:15 }}>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* 🏷️ Filtros de la pestaña activa (se suman a los de arriba) */}
          {(muestraSub || muestraEstado) && (
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.5rem' }}>
              {muestraSub && (
                <FilaFiltro
                  opciones={opcionesSub}
                  valor={activeSub}
                  setValor={setActiveSub}
                  colores={subActivo.colores}
                  fallback={subActivo.fallback}
                  etiqueta={subActivo.etiqueta}
                  todos={subActivo.todos}
                  accent={catActiva.activeBg}
                  borde={catActiva.border}
                />
              )}
              {muestraEstado && (
                <FilaFiltro
                  opciones={opcionesEstado}
                  valor={activeEstado}
                  setValor={setActiveEstado}
                  colores={estadoFilterColors}
                  fallback={estadoFilterFallback}
                  etiqueta={v => v}
                  todos="Todos"
                  accent={catActiva.activeBg}
                  borde={catActiva.border}
                />
              )}
            </div>
          )}

          <div className="grid-sidebar" id="listado">
            {/* Lista de contenido */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {filtered.length === 0
                ? <p style={{ color:'var(--text-muted)', fontStyle:'italic', fontSize:14 }}>No hay entradas con ese filtro aún.</p>
                : pageItems.map((item, idx) => <ItemCard key={item.id||idx} item={item} activeTag={activeTag} handleTag={handleTag} />)
              }

              {/* 📄 Paginador */}
              {totalPages > 1 && (
                <Paginador page={page} totalPages={totalPages} total={filtered.length} goToPage={goToPage} />
              )}
            </div>

            {/* Sidebar sticky (ahora incluye el widget de Universos literarios adentro) */}
            <div className="sidebar-sticky">
              {!isFiltered && libroDestacado && (
                <div className="solo-escritorio" style={{ marginBottom:12 }}>
                  <DestacadoMini libro={libroDestacado} />
                </div>
              )}
              <Sidebar leyendo={leyendo} search={search} setSearch={setSearch}
                activeTag={activeTag} allTags={allTags} handleTag={handleTag} />
            </div>
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

// 🏷️ Una fila de pills de filtro. El botón "Todas/Todos" toma el color
// de la pestaña activa para que la fila se sienta parte de la sección.
function FilaFiltro({ opciones, valor, setValor, colores, fallback, etiqueta, todos, accent, borde }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      <button
        onClick={() => setValor(null)}
        style={{
          padding:'6px 14px',
          borderRadius:20,
          fontSize:13,
          fontFamily:'sans-serif',
          fontWeight:500,
          border:`1px solid ${valor === null ? accent : borde}`,
          background: valor === null ? accent : '#f0ece3',
          color: valor === null ? '#fff' : '#7a6a50',
          cursor:'pointer',
          transition:'all 0.15s'
        }}>
        {todos}
      </button>
      {opciones.map(o => {
        const col = colores[o.key] || fallback
        const isActive = valor === o.key
        return (
          <button key={o.key}
            onClick={() => setValor(prev => prev === o.key ? null : o.key)}
            style={{
              padding:'6px 14px',
              borderRadius:20,
              fontSize:13,
              fontFamily:'sans-serif',
              fontWeight:500,
              border: `1px solid ${isActive ? col.color : 'transparent'}`,
              background: isActive ? col.color : col.bg,
              color: isActive ? '#fff' : col.color,
              cursor:'pointer',
              transition:'all 0.15s'
            }}>
            {etiqueta(o.label)}
          </button>
        )
      })}
    </div>
  )
}

function DestacadoCard({ libro }) {
  return (
    <Link href={`/resena/${libro.slug}`} style={{ textDecoration:'none' }}>
      <div className="destacado-compacto" style={{ margin:'1.5rem 0 1rem', background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'grid', gridTemplateColumns:'90px 1fr', gap:14, cursor:'pointer', transition:'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.92'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        <img src={libro.portada} alt={libro.titulo}
          style={{ width:90, height:135, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)' }}
          onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
        <div>
          <span style={{ display:'inline-block', background:'var(--btn-bg)', color:'#fff', fontSize:9, padding:'3px 10px', borderRadius:20, fontFamily:'sans-serif', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>★ Destacado del mes</span>
          <h2 style={{ fontSize:19, fontWeight:700, margin:'0 0 3px', color:'var(--text-dark)', lineHeight:1.2 }}>{libro.titulo}</h2>
          {libro.serie && <p style={{ fontSize:12, color:'#9b7b5e', margin:'0 0 3px', fontFamily:'sans-serif', fontStyle:'italic' }}>{libro.serie}{libro.numero_serie ? ` · Libro ${libro.numero_serie}` : ''}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
            <p style={{ fontSize:13, color:'var(--text-author)', margin:0, fontFamily:'sans-serif', fontWeight:500 }}>{libro.autor}</p>
            <Pill cat>{libro.categoria}</Pill>
          </div>
          <Stars n={libro.calificacion} size={14} />
          <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'8px 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{libro.sinopsis}</p>
          <span style={{ fontSize:12, color:'var(--text-accent)', fontFamily:'sans-serif', fontWeight:500 }}>Leer la reseña completa →</span>
        </div>
      </div>
    </Link>
  )
}

function DestacadoMini({ libro }) {
  return (
    <Link href={`/resena/${libro.slug}`} style={{ textDecoration:'none' }}>
      <div style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'0.9rem', cursor:'pointer', transition:'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.92'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        <span style={{ display:'inline-block', background:'var(--btn-bg)', color:'#fff', fontSize:9, padding:'3px 9px', borderRadius:20, fontFamily:'sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>★ Destacado del mes</span>
        <div style={{ display:'flex', gap:10 }}>
          <img src={libro.portada} alt={libro.titulo}
            style={{ width:54, height:81, objectFit:'cover', borderRadius:5, border:'1px solid var(--border-warm)', flexShrink:0 }}
            onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-dark)', margin:'0 0 3px', lineHeight:1.25, fontFamily:'Georgia,serif', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{libro.titulo}</p>
            <p style={{ fontSize:11, color:'var(--text-author)', margin:'0 0 4px', fontFamily:'sans-serif' }}>{libro.autor}</p>
            <Stars n={libro.calificacion} size={12} />
          </div>
        </div>
        <p style={{ fontSize:11, color:'var(--text-accent)', margin:'10px 0 0', fontFamily:'sans-serif', fontWeight:500 }}>Leer la reseña →</p>
      </div>
    </Link>
  )
}

function FavoritosRow({ libros }) {
  const Cover = ({ libro, dup }) => (
    <Link key={(dup ? 'd-' : '') + libro.id} href={`/resena/${libro.slug}`} className="fav-cover" style={{ textDecoration:'none' }} tabIndex={dup ? -1 : 0}>
      <img src={libro.portada} alt={dup ? '' : libro.titulo}
        style={{ width:'100%', aspectRatio:'2/3', objectFit:'cover', borderRadius:6, border:'1px solid var(--border-warm)', display:'block' }}
        onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
      <p style={{ fontSize:11, fontWeight:700, color:'var(--text-dark)', margin:'6px 0 2px', lineHeight:1.25, fontFamily:'Georgia,serif', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{libro.titulo}</p>
      <p style={{ fontSize:10, color:'var(--text-accent)', margin:0, fontFamily:'sans-serif' }}>{'★'.repeat(Math.floor(Number(libro.calificacion) || 0))}</p>
    </Link>
  )
  return (
    <div style={{ margin:'1.5rem 0' }}>
      <p style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 12px', fontFamily:'sans-serif' }}>★ Mis favoritos</p>
      <div className="fav-marquee">
        <div className="fav-track">
          <div className="fav-group">
            {libros.map(libro => <Cover key={libro.id} libro={libro} />)}
          </div>
          <div className="fav-group fav-dup" aria-hidden="true">
            {libros.map(libro => <Cover key={'dup-' + libro.id} libro={libro} dup />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item, activeTag, handleTag }) {
  // Libro
  if (item.type === 'resena') {
    const cat = String(item.categoria || '').trim().toLowerCase()
    const tags = (Array.isArray(item.tags) ? item.tags : (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean))
      .filter(t => t.trim().toLowerCase() !== cat)
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
              <p style={{ fontSize:12, color:'var(--text-author)', margin:0, fontFamily:'sans-serif', fontWeight:500 }}>{item.autor}</p>
              <Pill cat>{item.categoria}</Pill>
            </div>
            <Stars n={item.calificacion} />
            <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'7px 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.sinopsis}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:5 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {tags.map(tag => (
                  <span key={tag} onClick={e => { e.preventDefault(); handleTag(tag) }}
                    style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', cursor:'pointer',
                      border:`1px solid ${activeTag===tag ? 'var(--btn-bg)' : 'var(--border-tag)'}`,
                      background: activeTag===tag ? 'var(--btn-bg)' : 'transparent',
                      color: activeTag===tag ? '#fff' : 'var(--text-tag)' }}>
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

  // Orden de lectura — 🌌 estilo lavanda
  if (item.type === 'orden') {
    const tropes = Array.isArray(item.tropes) ? item.tropes : []
    return (
      <Link href={`/orden/${item.slug}`} style={{ textDecoration:'none' }}>
        <div style={{
          background: ordenColors.bg,
          border: `1px solid ${ordenColors.border}`,
          borderLeft: `4px solid ${ordenColors.accent}`,
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'opacity 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:14, padding:'1rem' }}>
            {item.portada_saga
              ? <img src={item.portada_saga} alt={item.titulo} style={{ width:80, height:115, objectFit:'cover', borderRadius:6, border:`1px solid ${ordenColors.border}` }}
                  onError={e => { e.target.style.background=ordenColors.tagBg; e.target.src='' }} />
              : <div style={{ width:80, height:115, borderRadius:6, background:ordenColors.tagBg, border:`1px solid ${ordenColors.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📚</div>
            }
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                {item.categoria && (
                  <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', background:ordenColors.pillBg, color:ordenColors.accent, border:`1px solid ${ordenColors.border}` }}>
                    {item.categoria}
                  </span>
                )}
                <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', background:ordenColors.pillBg, color:ordenColors.accent, border:`1px solid ${ordenColors.border}` }}>
                  {item.num_libros} libros
                </span>
              </div>
              <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 2px', color:ordenColors.accentDark }}>{item.titulo}</h3>
              <p style={{ fontSize:12, color:ordenColors.accent, margin:'0 0 4px', fontFamily:'sans-serif', fontStyle:'italic' }}>{item.autora || item.autor}</p>
              {item.pareja && <p style={{ fontSize:12, color:ordenColors.accent, margin:'0 0 6px', fontFamily:'sans-serif', opacity:0.85 }}>💕 {item.pareja}</p>}
              <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.6, margin:'0 0 8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.descripcion}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {tropes.slice(0,3).map(t => (
                    <span key={t} style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontFamily:'sans-serif', background:ordenColors.tagBg, color:ordenColors.accent, border:`1px solid ${ordenColors.border}` }}>
                      {t}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize:12, color:ordenColors.accent, fontFamily:'sans-serif', whiteSpace:'nowrap', fontWeight:500 }}>Ver orden →</span>
              </div>
            </div>
          </div>
          {item.imagenes_libros?.length > 0 && (
            <div style={{ display:'flex', gap:6, padding:'0 1rem 1rem', overflowX:'auto' }}>
              {item.imagenes_libros.slice(0,8).map((img, i) => (
                <div key={i} style={{ flexShrink:0, position:'relative' }}>
                  <img src={img} alt={item.titulos_libros?.[i] || `Libro ${i+1}`}
                    style={{ width:44, height:64, objectFit:'cover', borderRadius:4, border:`1px solid ${ordenColors.border}` }}
                    onError={e => { e.target.style.background=ordenColors.tagBg; e.target.src='' }} />
                  <span style={{ position:'absolute', top:2, left:2, background:ordenColors.accent, color:'#fff', fontSize:9, fontFamily:'sans-serif', borderRadius:3, padding:'1px 4px', fontWeight:700 }}>{i+1}</span>
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

// 📄 Paginador — botones ‹ 1 2 3 … ›
function Paginador({ page, totalPages, total, goToPage }) {
  const pages = useMemo(() => {
    const out = []
    const push = p => { if (!out.includes(p)) out.push(p) }
    push(1)
    for (let p = page - 1; p <= page + 1; p++) if (p > 1 && p < totalPages) push(p)
    push(totalPages)
    out.sort((a, b) => a - b)
    // Insertamos "…" donde hay saltos
    const withGaps = []
    out.forEach((p, i) => {
      if (i > 0 && p - out[i - 1] > 1) withGaps.push('…')
      withGaps.push(p)
    })
    return withGaps
  }, [page, totalPages])

  const baseBtn = {
    minWidth: 34,
    height: 34,
    padding: '0 10px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'sans-serif',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-body)',
    cursor: 'pointer',
    transition: 'all 0.15s'
  }

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        <button onClick={() => goToPage(page - 1)} disabled={page === 1}
          style={{ ...baseBtn, opacity: page === 1 ? 0.35 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>
          ‹ Anterior
        </button>

        {pages.map((p, i) =>
          p === '…'
            ? <span key={`gap-${i}`} style={{ color:'var(--text-muted)', fontSize:13, padding:'0 4px', fontFamily:'sans-serif' }}>…</span>
            : (
              <button key={p} onClick={() => goToPage(p)}
                style={{
                  ...baseBtn,
                  fontWeight: p === page ? 700 : 400,
                  background: p === page ? 'var(--btn-bg)' : 'transparent',
                  color: p === page ? '#fff' : 'var(--text-body)',
                  borderColor: p === page ? 'var(--btn-bg)' : 'var(--border)'
                }}>
                {p}
              </button>
            )
        )}

        <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
          style={{ ...baseBtn, opacity: page === totalPages ? 0.35 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>
          Siguiente ›
        </button>
      </div>

      <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', fontFamily:'sans-serif', margin:'10px 0 0' }}>
        Página {page} de {totalPages} · {total} {total === 1 ? 'entrada' : 'entradas'} en total
      </p>
    </div>
  )
}

export async function getStaticProps() {
  const { libros, vinetas, rincon, leyendo, ordenes } = await getTodo()
  return {
    props: { libros, vinetas, rincon, leyendo, ordenes },
    revalidate: 60,
  }
}
