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

// ─── LIBROS ─────────────────────────────────────────────────────────────────

export async function getLibros() {
  const res = await notion.databases.query({
    database_id: process.env.NOTION_DB_LIBROS,
    filter: { property: 'Publicado', checkbox: { equals: true } },
    sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
  })
  return dedup(res.results.map(mapLibro))
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
  }
}

// ─── VIÑETAS ────────────────────────────────────────────────────────────────

export async function getVinetas() {
  const res = await notion.databases.query({
    database_id: process.env.NOTION_DB_VINETAS,
    filter: { property: 'Publicado', checkbox: { equals: true } },
    sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
  })
  return dedup(res.results.map(mapVineta))
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
  const res = await notion.databases.query({
    database_id: process.env.NOTION_DB_RINCON,
    filter: { property: 'Publicado', checkbox: { equals: true } },
    sorts: [{ property: 'Fecha publicación', direction: 'descending' }],
  })
  return dedup(res.results.map(mapPost))
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
  const res = await notion.databases.query({
    database_id: process.env.NOTION_DB_LEYENDO,
    filter: { property: 'Activo', checkbox: { equals: true } },
  })
  return res.results.map(page => ({
    id: page.id,
    titulo:  getProp(page, 'Título'),
    autor:   getProp(page, 'Autor'),
    portada: getProp(page, 'Portada URL'),
  }))
}

// ─── LIBROS DE SERIE ────────────────────────────────────────────────────────

export async function getLibrosSerie() {
  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DB_LIBROS_SERIE,
      filter: { property: 'Publicado', checkbox: { equals: true } },
    })
    return dedup(res.results.map(mapLibroSerie))
  } catch (e) {
    return []
  }
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
  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DB_UNIVERSOS,
      filter: { property: 'Publicado', checkbox: { equals: true } },
    })
    return dedup(res.results.map(mapUniverso))
  } catch (e) {
    return []
  }
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
  const [resOrdenes, librosSerie, universos, libros] = await Promise.all([
    notion.databases.query({
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

  return dedup(resOrdenes.results.map(page => mapOrden(page, { librosSerieById, universosById, librosById })))
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

// ─── TODO JUNTO (home) ───────────────────────────────────────────────────────

export async function getTodo() {
  const [libros, vinetas, rincon, leyendo, ordenes, universos] = await Promise.all([
    getLibros(), getVinetas(), getRincon(), getLeyendo(), getOrdenes(), getUniversos()
  ])
  return { libros, vinetas, rincon, leyendo, ordenes, universos }
}
