import Head from 'next/head'
import Link from 'next/link'
import { SiteHeader, Newsletter, Footer } from '../components/ui'
import {
  TIENDA_COLORES as C, PROMO, productosDisponibles, preguntasTienda,
  promoVigente, urlCompra, formatoPrecio,
} from '../lib/productos'

const TITULO = 'Tienda · Diarios lectores de romance · Entre letras y matcha'
const DESCRIPCION = 'Diarios lectores de romance para Notion y GoodNotes, creados con el mismo sistema que uso para mis reseñas. Lleva tus lecturas, sagas, tropes y book boyfriends en un solo lugar.'

export default function Tienda({ conPromo }) {
  const disponibles = productosDisponibles()

  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: disponibles.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.nombre,
        description: p.descripcion,
        image: p.imagen,
        brand: { '@type': 'Brand', name: 'Entre Letras y Matcha' },
        offers: {
          '@type': 'Offer',
          price: p.precio.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: p.url,
        },
      },
    })),
  }

  return (
    <>
      <Head>
        <title>{`${TITULO}`}</title>
        <meta name="description" content={DESCRIPCION} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITULO} />
        <meta property="og:description" content={DESCRIPCION} />
        {disponibles[0] && <meta property="og:image" content={disponibles[0].imagen} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      </Head>

      <div className="container">
        <SiteHeader />

        <div style={{ maxWidth:900, margin:'0 auto', padding:'1.5rem 0 4rem' }}>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1.5rem', color:'var(--text-accent)', fontSize:14, fontFamily:'sans-serif' }}>← Volver</Link>

          {/* Encabezado */}
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <span style={{ display:'inline-block', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:C.acento, fontFamily:'sans-serif', fontWeight:600, marginBottom:'0.75rem' }}>Hecho por Ari</span>
            <h1 style={{ fontSize:34, fontWeight:700, margin:'0 0 0.75rem', color:'var(--text-dark)', lineHeight:1.15 }}>Tienda</h1>
            <p style={{ fontSize:15, color:'var(--text-body)', lineHeight:1.7, margin:'0 auto', maxWidth:560 }}>
              Diarios lectores creados con el mismo sistema que uso para mis reseñas, para que lleves tus lecturas, sagas y book boyfriends en un solo lugar. Elige el que va con tu forma de leer.
            </p>
          </div>

          {/* Aviso de lanzamiento */}
          {conPromo && (
            <div style={{ background:C.fondoSuave, border:`1px dashed ${C.borde}`, borderRadius:12, padding:'12px 16px', margin:'0 0 1.5rem', fontSize:14, lineHeight:1.6, color:'var(--text-body)', textAlign:'center' }}>
              Lanzamiento: {PROMO.descuento} de descuento en cualquiera de los dos diarios con el código <strong style={{ color:C.acento }}>{PROMO.codigo}</strong>, hasta el 31 de octubre o hasta agotar los cupos. El botón ya lo trae aplicado.
            </div>
          )}

          {/* Productos */}
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            {disponibles.map(p => <ProductoCard key={p.slug} producto={p} conPromo={conPromo} />)}
          </div>

          {/* Preguntas frecuentes */}
          <div style={{ marginTop:'3rem' }}>
            <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 1rem', fontFamily:'sans-serif' }}>Preguntas frecuentes</p>
            <div style={{ display:'flex', flexDirection:'column' }}>
              {preguntasTienda.map((q, i) => (
                <div key={q.pregunta} style={{ padding:'14px 0', borderBottom: i < preguntasTienda.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 4px', color:'var(--text-dark)' }}>{q.pregunta}</h3>
                  <p style={{ fontSize:14, lineHeight:1.65, margin:0, color:'var(--text-body)' }}>{q.respuesta}</p>
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

function ProductoCard({ producto: p, conPromo }) {
  return (
    <article id={p.slug} style={{ border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem', background:'#fcfcfa' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:24, alignItems:'flex-start' }}>

        {/* Imagen */}
        <a href={urlCompra(p, conPromo)} target="_blank" rel="noopener noreferrer"
          style={{ flex:'1 1 300px', maxWidth:380, background:C.fondo, border:`1px solid ${C.borde}`, borderRadius:12, overflow:'hidden', display:'block', aspectRatio:'4 / 3' }}>
          <img src={p.imagen} alt={p.nombre} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
        </a>

        {/* Info */}
        <div style={{ flex:'1 1 320px', minWidth:0, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, padding:'2px 10px', borderRadius:20, fontFamily:'sans-serif', background:C.pillFondo, color:C.pillTexto }}>{p.tipo}</span>
            {p.etiquetas.map(e => (
              <span key={e} style={{ fontSize:11, padding:'2px 10px', borderRadius:20, fontFamily:'sans-serif', background:'var(--bg-tag)', color:'var(--text-accent)', border:'1px solid var(--border-tag)' }}>{e}</span>
            ))}
          </div>

          <h2 style={{ fontSize:24, fontWeight:700, margin:0, lineHeight:1.2, color:'var(--text-dark)' }}>{p.nombre}</h2>
          <p style={{ fontSize:15, lineHeight:1.7, margin:0, color:'var(--text-body)' }}>{p.descripcion}</p>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0, color:'var(--text-body)', fontStyle:'italic' }}>{p.paraQuien}</p>

          <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
            {conPromo ? (
              <>
                <span style={{ fontSize:28, fontWeight:700, color:'var(--text-dark)' }}>{formatoPrecio(p.precioPromo)}</span>
                <span style={{ fontSize:16, color:'var(--text-muted)', textDecoration:'line-through' }}>{formatoPrecio(p.precio)}</span>
                <span style={{ fontSize:12, fontFamily:'sans-serif', color:C.acento, fontWeight:600 }}>con {PROMO.codigo}</span>
              </>
            ) : (
              <span style={{ fontSize:28, fontWeight:700, color:'var(--text-dark)' }}>{formatoPrecio(p.precio)}</span>
            )}
            <span style={{ fontSize:12, fontFamily:'sans-serif', color:'var(--text-muted)' }}>pago único</span>
          </div>

          <div>
            <a href={urlCompra(p, conPromo)} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', minHeight:44, padding:'0 20px', background:C.boton, color:'#fff', borderRadius:8, fontFamily:'sans-serif', fontSize:14, fontWeight:500, textDecoration:'none' }}>
              Comprar en Gumroad →
            </a>
          </div>
          <span style={{ fontSize:12, fontFamily:'sans-serif', color:'var(--text-muted)' }}>{p.entrega}</span>
        </div>
      </div>

      {/* Qué incluye */}
      <div style={{ marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:`1px dashed ${C.borde}` }}>
        <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 0.75rem', fontFamily:'sans-serif' }}>Qué incluye</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
          {p.incluye.map(item => (
            <div key={item.titulo} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ color:C.acento, fontSize:15, lineHeight:1.5, flexShrink:0 }}>✦</span>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 2px', color:'var(--text-dark)' }}>{item.titulo}</h3>
                <p style={{ fontSize:13, lineHeight:1.6, margin:0, color:'var(--text-body)' }}>{item.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export async function getStaticProps() {
  // Se revisa cada hora, así el aviso de lanzamiento desaparece solo al terminar.
  return { props: { conPromo: promoVigente() }, revalidate: 3600 }
}
