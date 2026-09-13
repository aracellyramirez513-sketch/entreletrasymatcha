import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function dedup(items) {
  const seen = new Set()
  return items.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getProp(page, name) {
  const prop = page.properties[name]
  if (!prop) return ''
  switch (prop.type) {
    case 'title':        return prop.title.map(t => t.plain_text).join('')
    case 'rich_text':   return prop.rich_text.map(t => t.plain_text).join('')
    case 'number':      return prop.number ?? ''
    case 'select':      return prop.select?.name ?? ''
    case 'multi_select':return prop.multi_select.map(s => s.name)
    case 'checkbox':    return prop.checkbox
    case 'url':         return prop.url ?? ''
    case 'date':        return prop.date?.start ?? ''
    case 'created_time':return prop.created_time
    case 'last_edited_time': return prop.last_edited_time
    case 'relation':    return prop.relation.map(r => r.id)
    default:            return ''
  }
}

// Notion nunca devuelve más de 100 filas por llamada. Si hay más, manda
// has_more y un cursor. Esto sigue pidiendo hasta traerlas todas.
async function queryAll(params) {
  const paginas = []
  let cursor = undefined
  let vueltas = 0

  do {
    const res = await notion.databases.query({
      ...params,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    })
    paginas.push(...res.results)
    cursor = res.has_more ? res.next_cursor : null
    vueltas++
  } while (cursor && vueltas < 50)

  return paginas
}

// Caché en memoria del mismo largo que el revalidate de las páginas.
// Evita que una sola build dispare la misma consulta decenas de veces.
const CACHE_TTL = 60 * 1000
const cache = new Map()

async function cacheado(clave, fn) {
  const guardado = cache.get(clave)
  if (guardado && Date.now() - guardado.t < CACHE_TTL) return guardado.v
  const v = await fn()
  cache.set(clave, { t: Date.now(), v })
  return v
}

// ─── LIBROS ─────────────────────────────────────────────────────────────────

export async function getLibros() {
  return cacheado('libros', async () => {
    const paginas = await queryAll({
      database_id: process.env.NOTION_DB_LIBROS,
      filter: { property: 'Publicado', checkbox: { equals: true } },
      sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
    })
    return dedup(paginas.map(mapLibro))
  })
}

export async function getLibro(slug) {
  const libros = await getLibros()
  return libros.find(l => l.slug === slug) || null
}

function mapLibro(page) {
  const titulo = getProp(page, 'Título')
  return {
    id: page.id,
    type: 'resena',
    titulo,
    autor:            getProp(page, 'Autor'),
    categoria:        getProp(page, 'Categoría'),
    serie:            getProp(page, 'Serie'),
    numero_serie:     getProp(page, 'Número en serie'),
    calificacion:     getProp(page, 'Calificación numérica'),
    portada:          getProp(page, 'Portada URL'),
    sinopsis:         getProp(page, 'Sinopsis'),
    resena:           getProp(page, 'Reseña'),
    tropes:           getProp(page, 'Tropes'),
    para_quien:       getProp(page, 'Para quién es'),
    tags:             getProp(page, 'Tags'),
    destacado:        getProp(page, 'Destacado'),
    favorito:         getProp(page, 'Favorito'),
    protagonista1_nombre:     getProp(page, 'Protagonista 1 nombre'),
    protagonista1_rol:        getProp(page, 'Protagonista 1 rol'),
    protagonista1_descripcion:getProp(page, 'Protagonista 1 descripción'),
    protagonista1_tags:       getProp(page, 'Protagonista 1 tags'),
    protagonista2_nombre:     getProp(page, 'Protagonista 2 nombre'),
    protagonista2_rol:        getProp(page, 'Protagonista 2 rol'),
    protagonista2_descripcion:getProp(page, 'Protagonista 2 descripción'),
    protagonista2_tags:       getProp(page, 'Protagonista 2 tags'),
    protagonista3_nombre:     getProp(page, 'Protagonista 3 nombre'),
    protagonista3_rol:        getProp(page, 'Protagonista 3 rol'),
    protagonista3_descripcion:getProp(page, 'Protagonista 3 descripción'),
    protagonista3_tags:       getProp(page, 'Protagonista 3 tags'),
    link_amazon:      getProp(page, 'Link Amazon'),
    link_buscalibre:  getProp(page, 'Link Buscalibre'),
    link_mercadolibre:getProp(page, 'Link Mercado Libre'),
    fecha:            getProp(page, 'Fecha publicación'),
    slug:             getProp(page, 'Slug') || slugify(titulo),
    libro_serie_ids:  getProp(page, 'Libro de serie'),
  }
}

// ─── VIÑETAS ────────────────────────────────────────────────────────────────

export async function getVinetas() {
  return cacheado('vinetas', async () => {
    const paginas = await queryAll({
      database_id: process.env.NOTION_DB_VINETAS,
      filter: { property: 'Publicado', checkbox: { equals: true } },
      sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
    })
    return dedup(paginas.map(mapVineta))
  })
}

export async function getVineta(slug) {
  const items = await getVinetas()
  return items.find(v => v.slug === slug) || null
}

function mapVineta(page) {
  const titulo = getProp(page, 'Título')
  return {
    id: page.id,
    type: 'vineta',
    titulo,
    visualtype:   getProp(page, 'Tipo')?.toLowerCase(),
    autor:        getProp(page, 'Autor'),
    genero:       getProp(page, 'Género'),
    plataforma:   getProp(page, 'Plataforma'),
    estado:       getProp(page, 'Estado'),
    calificacion: getProp(page, 'Calificación numérica'),
    portada:      getProp(page, 'Portada URL'),
    sinopsis:     getProp(page, 'Sinopsis'),
    resena:       getProp(page, 'Reseña'),
    tags:         getProp(page, 'Tags'),
    link_compra:  getProp(page, 'Link compra'),
    fecha:        getProp(page, 'Fecha publicación'),
    slug:         getProp(page, 'Slug') || slugify(titulo),
  }
}

// ─── RINCÓN ─────────────────────────────────────────────────────────────────

export async function getRincon() {
  return cacheado('rincon', async () => {
    const paginas = await queryAll({
      database_id: process.env.NOTION_DB_RINCON,
      filter: { property: 'Publicado', checkbox: { equals: true } },
      sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
    })
    return dedup(paginas.map(mapPost))
  })
}

export async function getPost(slug) {
  const items = await getRincon()
  return items.find(p => p.slug === slug) || null
}

function mapPost(page) {
  const titulo = getProp(page, 'Título')
  return {
    id: page.id,
    type: 'rincon',
    titulo,
    entrytype:  getProp(page, 'Tipo de entrada')?.toLowerCase().replace('ó','o').replace('ó','o') || 'reflexion',
    preview:    getProp(page, 'Preview'),
    contenido:  getProp(page, 'Contenido completo'),
    imagen:     getProp(page, 'Imagen URL'),
    tags:       getProp(page, 'Tags'),
    fecha:      getProp(page, 'Fecha publicación'),
    slug:       getProp(page, 'Slug') || slugify(titulo),
  }
}

// ─── LEYENDO AHORA ──────────────────────────────────────────────────────────

export async function getLeyendo() {
  return cacheado('leyendo', async () => {
    const paginas = await queryAll({
      database_id: process.env.NOTION_DB_LEYENDO,
      filter: { property: 'Activo', checkbox: { equals: true } },
    })
    return paginas.map(page => ({
      id: page.id,
      titulo:  getProp(page, 'Título'),
      autor:   getProp(page, 'Autor'),
      portada: getProp(page, 'Portada URL'),
    }))
  })
}

// ─── LIBROS DE SERIE ────────────────────────────────────────────────────────

export async function getLibrosSerie() {
  return cacheado('libros-serie', async () => {
    try {
      const paginas = await queryAll({
        database_id: process.env.NOTION_DB_LIBROS_SERIE,
        filter: { property: 'Publicado', checkbox: { equals: true } },
      })
      return dedup(paginas.map(mapLibroSerie))
    } catch (e) {
      return []
    }
  })
}

function mapLibroSerie(page) {
  const titulo = getProp(page, 'Título')
  return {
    id: page.id,
    titulo,
    nombre_serie:    getProp(page, 'Nombre de serie'),
    numero:          getProp(page, 'Número libro'),
    autor:           getProp(page, 'Autor'),
    portada:         getProp(page, 'Portada URL'),
    sinopsis:        getProp(page, 'Sinopsis corta'),
    protagonistas:   getProp(page, 'Protagonistas'),
    tropes:          getProp(page, 'Tropes del libro'),
    standalone:      getProp(page, 'Standalone'),
    advertencias:    getProp(page, 'Advertencias de contenido'),
    calificacion:    getProp(page, 'Calificación'),
    link_amazon:     getProp(page, 'Link Amazon'),
    link_buscalibre: getProp(page, 'Link Buscalibre'),
    resena_ids:      getProp(page, 'Reseña completa'),
  }
}

// ─── UNIVERSOS ──────────────────────────────────────────────────────────────

export async function getUniversos() {
  return cacheado('universos', async () => {
    try {
      const paginas = await queryAll({
        database_id: process.env.NOTION_DB_UNIVERSOS,
        filter: { property: 'Publicado', checkbox: { equals: true } },
      })
      return dedup(paginas.map(mapUniverso))
    } catch (e) {
      return []
    }
  })
}

export async function getUniverso(slug) {
  const items = await getUniversos()
  return items.find(u => u.slug === slug) || null
}

function mapUniverso(page) {
  const nombre = getProp(page, 'Nombre')
  return {
    id: page.id,
    nombre,
    autor:              getProp(page, 'Autor'),
    imagen_autor:       getProp(page, 'Imagen del autor'),
    tropes_principales: getProp(page, 'Tropes principales'),
    descripcion:        getProp(page, 'Descripción corta'),
    slug:               getProp(page, 'Slug') || slugify(nombre),
  }
}

// ─── ÓRDENES DE LECTURA ──────────────────────────────────────────────────────

export async function getOrdenes() {
  return cacheado('ordenes', () => construirOrdenes())
}

async function construirOrdenes() {
  const [paginasOrdenes, librosSerie, universos, libros] = await Promise.all([
    queryAll({
      database_id: process.env.NOTION_DB_ORDENES,
      filter: { property: 'Publicado', checkbox: { equals: true } },
      sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
    }),
    getLibrosSerie(),
    getUniversos(),
    getLibros(),
  ])

  const librosSerieById = Object.fromEntries(librosSerie.map(l => [l.id, l]))
  const universosById   = Object.fromEntries(universos.map(u => [u.id, u]))
  const librosById      = Object.fromEntries(libros.map(l => [l.id, l]))

  return dedup(paginasOrdenes.map(page => mapOrden(page, { librosSerieById, universosById, librosById })))
}

export async function getOrden(slug) {
  const items = await getOrdenes()
  return items.find(o => o.slug === slug) || null
}

function mapOrden(page, { librosSerieById, universosById, librosById }) {
  const titulo = getProp(page, 'Título de la saga')
  const universoIds     = getProp(page, 'Universo') || []
  const librosSerieIds  = getProp(page, 'Libros de serie') || []

  // Resolver universo (puede haber 0 o 1)
  const universo = universoIds.length > 0 ? universosById[universoIds[0]] || null : null

  // Resolver los libros de la serie y conectarles su reseña si existe
  const libros_serie = librosSerieIds
    .map(id => librosSerieById[id])
    .filter(Boolean)
    .map(l => {
      const resenaId = Array.isArray(l.resena_ids) && l.resena_ids.length > 0 ? l.resena_ids[0] : null
      const resena = resenaId ? librosById[resenaId] : null
      return {
        ...l,
        resena_slug: resena ? resena.slug : null,
      }
    })
    .sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0))

  return {
    id: page.id,
    type: 'orden',
    titulo,
    autor:            getProp(page, 'Autor'),
    categoria:        getProp(page, 'Categoría'),
    descripcion:      getProp(page, 'Descripción corta'),
    tropes:           getProp(page, 'Tropes'),
    pareja:           getProp(page, 'Pareja principal'),
    portada_saga:     getProp(page, 'Imagen portada saga'),
    tipo_orden:       getProp(page, 'Tipo de orden'),
    estado:           getProp(page, 'Estado de serie'),
    notas_orden:      getProp(page, 'Notas del orden'),
    num_libros:       getProp(page, 'Número de libros') || libros_serie.length,
    tags:             getProp(page, 'Tags'),
    fecha:            getProp(page, 'Fecha publicación'),
    slug:             getProp(page, 'Slug') || slugify(titulo),
    universo,
    libros_serie,
  }
}

// ─── CONTEXTO DE SERIE ───────────────────────────────────────────────────────
// Conecta una reseña con las demás reseñas de su misma serie y con la orden
// de lectura correspondiente, si es que está publicada.

// Number('') da 0, así que un número de libro vacío se confundía con el libro 0.
function aNumero(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function claveSerie(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^\s*orden\s+(para\s+leer|de\s+lectura)\s*[-–—:]?\s*/, ' ')
    .replace(/^\s*reading\s+order\s*[-–—:]?\s*/, ' ')
    .replace(/\b(the|los|las|el|la)\b/g, ' ')
    .replace(/\b(saga|serie|series|trilogia|trilogy|duologia|duology)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
}

// El título guardado es "Orden para leer - Nombre de la saga".
// En la cinta de la reseña se muestra solo el nombre de la saga.
function tituloSaga(str) {
  const limpio = String(str || '')
    .replace(/^\s*Orden\s+(para\s+leer|de\s+lectura)\s*[-–—:]\s*/i, '')
    .trim()
  return limpio || String(str || '')
}

const CONTEXTO_VACIO = {
  orden: null,
  libros: [],
  posicion: null,
  total: 0,
  anterior: null,
  siguiente: null,
}

export async function getContextoSerie(libro) {
  if (!libro) return CONTEXTO_VACIO

  const clave = claveSerie(libro.serie)
  const relIds = Array.isArray(libro.libro_serie_ids) ? libro.libro_serie_ids : []
  if (!clave && relIds.length === 0) return CONTEXTO_VACIO

  let ordenes = []
  let todos = []
  try {
    ;[ordenes, todos] = await Promise.all([getOrdenes(), getLibros()])
  } catch (e) {
    return CONTEXTO_VACIO
  }

  // 1. Buscar la orden de lectura de esta serie.
  // Primero por la relación "Libro de serie", que es un enlace duro y no
  // depende de cómo esté escrito el nombre. El texto es solo el plan B.
  let orden = null

  if (relIds.length > 0) {
    orden = ordenes.find(o => (o.libros_serie || []).some(l => relIds.includes(l.id))) || null
  }

  if (!orden && clave) {
    orden = ordenes.find(o =>
      claveSerie(o.titulo) === clave ||
      (o.libros_serie || []).some(l => claveSerie(l.nombre_serie) === clave)
    ) || null
  }

  // 2. Armar la lista de libros de la serie
  let libros = []

  if (orden && Array.isArray(orden.libros_serie) && orden.libros_serie.length > 0) {
    const porSlug = Object.fromEntries(todos.map(l => [l.slug, l]))
    libros = orden.libros_serie.map(l => {
      const resena = l.resena_slug ? porSlug[l.resena_slug] || null : null
      return {
        id:      l.id,
        numero:  aNumero(l.numero),
        titulo:  (resena && resena.titulo) || l.titulo || '',
        portada: (resena && resena.portada) || l.portada || '',
        slug:    resena ? resena.slug : null,
      }
    })
  } else {
    libros = todos
      .filter(l => claveSerie(l.serie) === clave)
      .sort((a, b) => (Number(a.numero_serie) || 0) - (Number(b.numero_serie) || 0))
      .map(l => ({
        id:      null,
        numero:  aNumero(l.numero_serie),
        titulo:  l.titulo || '',
        portada: l.portada || '',
        slug:    l.slug,
      }))
  }

  // 3. Ubicar el libro actual dentro de la lista
  let idx = relIds.length > 0
    ? libros.findIndex(l => l.id && relIds.includes(l.id))
    : -1

  if (idx === -1) {
    idx = libros.findIndex(l => l.slug && l.slug === libro.slug)
  }
  if (idx === -1 && aNumero(libro.numero_serie) !== null) {
    idx = libros.findIndex(l => l.numero === aNumero(libro.numero_serie))
  }
  if (idx === -1) {
    idx = libros.findIndex(l => claveSerie(l.titulo) === claveSerie(libro.titulo))
  }

  // Si la orden todavía no lista este libro, lo insertamos en su posición
  if (idx === -1) {
    const propio = {
      id:      relIds.length > 0 ? relIds[0] : null,
      numero:  aNumero(libro.numero_serie),
      titulo:  libro.titulo || '',
      portada: libro.portada || '',
      slug:    libro.slug,
    }
    if (propio.numero !== null) {
      const pos = libros.findIndex(l => l.numero !== null && l.numero > propio.numero)
      idx = pos === -1 ? libros.length : pos
      libros.splice(idx, 0, propio)
    } else {
      idx = libros.length
      libros.push(propio)
    }
  } else {
    // El libro actual siempre lleva su slug y su portada de la reseña
    libros[idx] = {
      ...libros[idx],
      slug:    libro.slug,
      portada: libro.portada || libros[idx].portada,
    }
  }

  // Con un solo libro no hay nada que enlazar
  if (libros.length < 2 && !orden) return CONTEXTO_VACIO

  // 4. Anterior y siguiente: la reseña existente más cercana en cada dirección
  let anterior = null
  for (let i = idx - 1; i >= 0; i--) {
    if (libros[i].slug) { anterior = libros[i]; break }
  }

  let siguiente = null
  for (let i = idx + 1; i < libros.length; i++) {
    if (libros[i].slug) { siguiente = libros[i]; break }
  }

  const numeroActual = idx >= 0 ? libros[idx].numero : null
  const posicion = numeroActual !== null ? numeroActual : idx + 1
  const total = Math.max(libros.length, posicion, Number(orden?.num_libros) || 0)

  return {
    orden: orden ? { titulo: tituloSaga(orden.titulo), slug: orden.slug } : null,
    libros: libros.map((l, i) => ({ ...l, actual: i === idx })),
    posicion,
    total,
    anterior,
    siguiente,
  }
}

// ─── TODO JUNTO (home) ───────────────────────────────────────────────────────

export async function getTodo() {
  const [libros, vinetas, rincon, leyendo, ordenes, universos] = await Promise.all([
    getLibros(), getVinetas(), getRincon(), getLeyendo(), getOrdenes(), getUniversos()
  ])
  return { libros, vinetas, rincon, leyendo, ordenes, universos }
}
