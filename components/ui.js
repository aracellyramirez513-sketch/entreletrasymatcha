import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// ─── Stars ───────────────────────────────────────────────────────────────────
export function Stars({ n, size = 13 }) {
  const num = Number(n) || 0
  const full = Math.floor(num)
  const half = num % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="stars" style={{ fontSize: size }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
    </span>
  )
}

// ─── Pill ────────────────────────────────────────────────────────────────────
export function Pill({ children, bg, color, border }) {
  return (
    <span style={{
      background: bg || 'var(--bg-tag)',
      color: color || 'var(--text-accent)',
      border: `1px solid ${border || 'var(--border)'}`,
      fontSize: 11, padding: '2px 10px',
      borderRadius: 20, fontFamily: 'sans-serif',
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

// ─── Social Button ───────────────────────────────────────────────────────────
const igSvg = <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x={2} y={2} width={20} height={20} rx={5}/><circle cx={12} cy={12} r={5}/><circle cx={17.5} cy={6.5} r={1} fill="currentColor" stroke="none"/></svg>
const ttSvg = <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
const piSvg = <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .89-.57 2.23-.86 3.47-.25 1.04.51 1.88 1.53 1.88 1.83 0 3.24-1.93 3.24-4.72 0-2.47-1.77-4.19-4.31-4.19-2.93 0-4.65 2.2-4.65 4.47 0 .88.34 1.83.76 2.35.08.1.09.19.07.29-.08.32-.25 1.04-.28 1.18-.04.19-.14.23-.32.14-1.19-.55-1.93-2.3-1.93-3.7 0-3.01 2.19-5.78 6.31-5.78 3.31 0 5.88 2.36 5.88 5.51 0 3.29-2.07 5.93-4.95 5.93-.97 0-1.87-.5-2.18-1.09l-.59 2.21c-.21.82-.79 1.84-1.18 2.46.89.27 1.83.42 2.81.42 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
const grSvg = <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.44 14.77c-2.07 0-3.5-1.06-3.6-2.93h1.18c.13 1.09 1.06 1.87 2.43 1.87 1.6 0 2.55-1 2.55-2.77V11.8h-.04a3.07 3.07 0 0 1-2.77 1.55c-2.28 0-3.73-1.76-3.73-4.08 0-2.4 1.5-4.2 3.76-4.2 1.17 0 2.2.57 2.77 1.57h.03V5.25h1.12v7.62c0 2.35-1.3 3.9-3.7 3.9zm.1-5.38c1.73 0 2.62-1.38 2.62-2.97 0-1.65-.9-3.07-2.62-3.07-1.66 0-2.57 1.4-2.57 3.08 0 1.62.9 2.96 2.57 2.96z"/></svg>
const amSvg = <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.076-1.048-.872-1.236-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.642-4.731-4.928 0-2.567 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.384-2.295-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.566-.549.58l-3.076-.333c-.259-.056-.545-.266-.47-.66C5.96 1.848 8.807.785 11.354.785c1.303 0 3.004.346 4.031 1.332C16.618 3.23 16.5 5.103 16.5 7.139v4.806c0 1.445.599 2.08 1.163 2.86.197.277.239.606-.01.81l-2.509 2.18zm3.606 2.325c-3.601 2.668-8.83 4.085-13.322 4.085-6.305 0-11.979-2.33-16.271-6.207-.337-.305-.036-.721.369-.485 4.632 2.694 10.357 4.317 16.273 4.317 3.989 0 8.375-.826 12.409-2.538.609-.259 1.12.401.542.828z"/></svg>

const socialLinks = [
  { label:'Instagram', url:'https://www.instagram.com/entreletrasymatcha/', svg: igSvg },
  { label:'TikTok',    url:'https://www.tiktok.com/@entreletrasymatcha',    svg: ttSvg },
  { label:'Pinterest', url:'https://cl.pinterest.com/entreletrasymatcha/',  svg: piSvg },
  { label:'Goodreads', url:'https://www.goodreads.com/aracellyramirez',     svg: grSvg },
  { label:'Amazon',    url:'https://www.amazon.com/gp/profile/amzn1.account.AF45XGBVNW75DS3DJIVHUIHJF67Q', svg: amSvg },
]

export function SocialBtn({ label, url, svg }) {
  const [hover, setHover] = useState(false)
  return (
    <a href={url} title={label} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        width:36, height:36, borderRadius:8,
        border:`1px solid ${hover ? 'var(--btn-bg)' : 'var(--border)'}`,
        background: hover ? 'var(--btn-bg)' : 'var(--bg-tag)',
        color: hover ? '#fff' : 'var(--text-accent)',
        textDecoration:'none', transition:'all 0.15s',
      }}>
      {svg}
    </a>
  )
}

// ─── Header del sitio ────────────────────────────────────────────────────────
export function SiteHeader() {
  return (
    <div style={{ textAlign:'center', padding:'3rem 1rem 2rem', borderBottom:'1px solid var(--border)' }}>
      <p style={{ fontSize:12, letterSpacing:'0.14em', color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif', textTransform:'uppercase' }}>
        Lecturas · Matcha · Recomendaciones
      </p>
      <Link href="/">
        <h1 style={{ fontSize:'clamp(32px,6vw,48px)', fontWeight:700, margin:'0 0 1rem', lineHeight:1.2, color:'var(--text-dark)', whiteSpace:'nowrap', cursor:'pointer' }}>
          Entre letras <span style={{ color:'var(--text-accent)' }}>y matcha</span>
        </h1>
      </Link>
      <p style={{ fontSize:17, color:'var(--text-body)', maxWidth:480, margin:'0 auto 1.5rem', lineHeight:1.75, fontStyle:'italic' }}>
        Un espacio personal donde comparto lo que me gusta, lo que me mueve y lo que recomendaría sin dudarlo.
      </p>
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        {['Entre libros','Entre viñetas','Desde mi rincón','Órdenes de lectura'].map(t => (
          <span key={t} style={{ background:'var(--bg-tag)', color:'var(--text-accent)', fontSize:12, padding:'4px 14px', borderRadius:20, fontFamily:'sans-serif', border:'1px solid var(--border)' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Perfil de Ari ───────────────────────────────────────────────────────────
export function Perfil() {
  return (
    <div className="perfil-grid">
      <div style={{ width:120, height:120, borderRadius:'50%', border:'2px solid var(--border)', overflow:'hidden', flexShrink:0 }}>
        <img src="https://i.ibb.co/ZRRXh2xZ/Imagen.jpg" alt="Ari" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 0.5rem', color:'var(--text-dark)' }}>Hola, soy Ari</h2>
        <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.75, margin:'0 0 1rem' }}>
          Leo en los bordes del día, antes del trabajo, en viajes, a veces hasta tarde. Me interesan las historias que me hagan latir el corazón, que me hacen pensar distinto. Aquí escribo sobre lo que leo con honestidad: lo que me encantó, lo que me costó y lo que relearía de nuevo. Siempre con un matcha cerca.
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {socialLinks.map(s => <SocialBtn key={s.label} {...s} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({ leyendo, search, setSearch, activeTag, allTags, handleTag }) {
  return (
    <div style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', position:'sticky', top:16 }}>

      {/* 🌌 Universos literarios — siempre arriba */}
      <div style={{ marginBottom:'1.25rem' }}>
        <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>🌌 Universos literarios</p>
        <Link href="/universos-literarios" style={{ textDecoration:'none' }}>
          <div style={{
            background:'#EEEDFE',
            border:'1px solid #AFA9EC',
            borderRadius:10,
            padding:'0.75rem',
            cursor:'pointer',
            transition:'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 3px 10px rgba(60, 52, 137, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
            <p style={{ fontSize:12, color:'#26215C', lineHeight:1.5, margin:'0 0 8px' }}>
              Explora los mundos donde las series se conectan entre sí.
            </p>
            <span style={{ fontSize:11, color:'#3C3489', fontFamily:'sans-serif', fontWeight:600 }}>
              Ver todos →
            </span>
          </div>
        </Link>
        <div style={{ borderTop:'1px solid var(--border)', margin:'1rem 0 0.75rem' }} />
      </div>

      {leyendo?.length > 0 && (
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>Actualmente leyendo</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {leyendo.map((libro, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'center' }}>
                <img src={libro.portada} alt={libro.titulo}
                  style={{ width:44, height:62, objectFit:'cover', borderRadius:4, border:'1px solid var(--border-warm)', flexShrink:0 }}
                  onError={e => { e.target.style.background='var(--bg-tag)'; e.target.src='' }} />
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'var(--text-dark)', margin:'0 0 2px', lineHeight:1.3, fontFamily:'Georgia,serif' }}>{libro.titulo}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', margin:0, fontFamily:'sans-serif' }}>{libro.autor}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', margin:'1rem 0 0.75rem' }} />
        </div>
      )}

      <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 0.5rem', fontFamily:'sans-serif' }}>Buscar</p>
      <input type="text" placeholder="Título, autor o tag..." value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', background:'#fff', color:'var(--text-dark)', fontSize:13, fontFamily:'sans-serif', marginBottom:'1rem' }} />

      <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>Explorar por tag</p>
      {allTags.length === 0
        ? <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>Los tags aparecerán aquí.</p>
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => handleTag(tag)}
                style={{ textAlign:'left', padding:'6px 10px', borderRadius:8, fontSize:13,
                  border:`1px solid ${activeTag===tag ? 'var(--btn-bg)' : 'var(--border)'}`,
                  background: activeTag===tag ? 'var(--btn-bg)' : 'transparent',
                  color: activeTag===tag ? '#fff' : 'var(--text-body)', cursor:'pointer', fontFamily:'sans-serif' }}>
                {tag}
              </button>
            ))}
          </div>
        )
      }
      {(activeTag || search) && (
        <button onClick={() => { handleTag(null); setSearch(''); }}
          style={{ marginTop:12, width:'100%', padding:5, fontSize:11, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontFamily:'sans-serif' }}>
          Limpiar filtros ✕
        </button>
      )}
    </div>
  )
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
const BREVO = 'https://90ac04de.sibforms.com/serve/MUIFAI7JPKfQQU8QtNL05H3JwEA5OyuKG_q3b3pW2TDsu7Gcs42lUJUrPMZolc0jhHfyKDNWyjrAqn0OEhWa3Gg4NEcZH_bxS8iyl_rCbYcycZd9Jixbn5orl24T9nNiyaD_8ade2otkhkGqaFNUEXmbo4w4VjRjoNy7ZI8taNnJMRMj27JMBR1lmy00knG_JmClIgQVFVZDwSDNww=='

export function Newsletter() {
  return (
    <div className="newsletter">
      <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 0.5rem', color:'var(--text-light)' }}>¿Te interesa lo que leo?</h2>
      <p style={{ fontSize:14, color:'var(--text-lighter)', margin:'0 0 1.25rem', lineHeight:1.6 }}>
        Suscríbete y te aviso cuando publique una reseña nueva. Sin spam, solo letras y matcha.
      </p>
      <form action={BREVO} method="POST" target="_blank" style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        <input type="email" name="EMAIL" placeholder="tu@correo.com" required
          style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #3d5038', background:'#333d30', color:'var(--text-light)', fontSize:14, width:220, fontFamily:'sans-serif' }} />
        <input type="text" name="email_address_check" defaultValue="" style={{ display:'none' }} />
        <input type="hidden" name="locale" value="es" />
        <input type="hidden" name="html_type" value="simple" />
        <button type="submit"
          style={{ padding:'10px 20px', borderRadius:8, background:'var(--btn-bg)', border:'none', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'sans-serif', fontWeight:500 }}>
          Suscribirme
        </button>
      </form>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:'2rem', fontFamily:'sans-serif' }}>
      Entre letras y matcha · Hecho con amor por Ari
    </p>
  )
}
