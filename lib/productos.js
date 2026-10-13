// ─── Productos de la Tienda ──────────────────────────────────────────────────
// Para agregar un producto nuevo, copia un bloque completo y cambia los datos.
// estado: 'disponible' muestra el botón de compra, 'proximamente' lo muestra
// como adelanto sin botón.
// La promo se oculta sola después de la fecha "hasta" (formato AAAA-MM-DD).

export const TIENDA_COLORES = {
  fondo:      '#FBEAF0',
  fondoSuave: '#FEF5F8',
  borde:      '#E3A3BA',
  pillFondo:  '#F6D5E1',
  pillTexto:  '#7A2446',
  acento:     '#9C2F55',
  boton:      '#A8325E',
  sombra:     'rgba(156, 47, 85, 0.18)',
}

// Código de lanzamiento compartido por ambos diarios (US$3 de descuento, cupos limitados)
export const PROMO = {
  codigo: 'LAN92',
  descuento: 'US$3',
  hasta: '2026-10-31',
}

export const productos = [
  {
    slug: 'diario-lector-romance',
    estado: 'disponible',
    tipo: 'Plantilla de Notion',
    etiquetas: ['Plan gratis de Notion', 'Computador, celular o tablet'],
    nombre: 'Diario Lector de Romance para Notion',
    nombreCorto: 'Diario para Notion',
    descripcionCorta: 'Tu biblioteca, sagas y reto lector en Notion.',
    descripcion: 'Tu biblioteca, tus sagas con el orden de lectura, el reto del año, tus tropes favoritos y el salón de los book boyfriends, todo en un solo lugar. Lo creé a partir del sistema que uso para mis reseñas, lo duplicas en tu Notion y queda tuyo para siempre.',
    precio: 12.99,
    precioPromo: 9.99,
    imagen: 'https://public-files.gumroad.com/wfhftq77cf6a89ed6dv3k84gua18',
    url: 'https://entreletrasymatcha.gumroad.com/l/diario-lector-romance',
    incluye: [
      { titulo: 'Biblioteca', texto: 'Estado, calificación con decimales, nivel de spice, tropes, formato y fechas. Con estantería de portadas, tablero y calendario.' },
      { titulo: 'Ficha de cada libro', texto: 'Protagonistas, advertencias de contenido, tu reseña con zona de spoilers y tus frases favoritas.' },
      { titulo: 'Sagas y órdenes de lectura', texto: 'Registra cada saga y su tipo de orden, con tu progreso automático libro a libro.' },
      { titulo: 'Reto lector', texto: 'Barra de avance, calificación promedio y spice promedio del año.' },
      { titulo: 'Mis tropes', texto: 'Descubre qué tropes lees más y cuáles calificas mejor.' },
      { titulo: 'Salón de los book boyfriends', texto: 'Tu galería de favoritos, sin juicios, más la guía Empieza aquí para dejarlo listo en diez minutos.' },
    ],
    paraQuien: 'Ideal si te gusta tener todo ordenado y automático, y revisar tus lecturas desde cualquier dispositivo.',
    entrega: 'Después de pagar te llega un correo con el link. Lo abres, haces clic en Duplicar y la plantilla queda en tu Notion.',
  },
  {
    slug: 'diario-lector-goodnotes',
    estado: 'disponible',
    tipo: 'Plantilla para GoodNotes',
    etiquetas: ['5 colores', 'Stickers incluidos', 'iPad'],
    nombre: 'Diario Lector de Romance para GoodNotes',
    nombreCorto: 'Diario para GoodNotes',
    descripcionCorta: 'Para escribir a mano en tu iPad, con stickers.',
    descripcion: 'La versión para escribir a mano en tu iPad, con pestañas y enlaces para moverte por todo el diario con un toque. Trae 100 fichas de libro, sagas, reto lector, calendario y un pack de stickers, en cinco colores para elegir el que más te guste.',
    precio: 9.99,
    precioPromo: 6.99,
    imagen: 'https://public-files.gumroad.com/cqut7gz0veu0mjhxkox3bxq5rwrf',
    url: 'https://entreletrasymatcha.gumroad.com/l/diario-lector-goodnotes',
    incluye: [
      { titulo: 'Biblioteca con 100 libros', texto: 'Toca el número de cualquiera y saltas directo a su ficha.' },
      { titulo: '100 fichas de libro', texto: 'Portada, calificación con media estrella, spice, tropes, protagonistas, advertencias, tu reseña, frases favoritas y zona de spoilers.' },
      { titulo: 'Sagas y series', texto: 'Cinco plantillas según el largo de la saga (5, 10, 15, 20 y 30 libros), para duplicar las que necesites.' },
      { titulo: 'Reto lector y calendario', texto: 'Una estantería de 52 lomos para pintar y 12 meses sin fechas para pegar las portadas de lo que leíste.' },
      { titulo: 'Mis tropes y book boyfriends', texto: 'Un conteo visual de tus tropes favoritos y tu galería de book boyfriends.' },
      { titulo: '5 colores y 32 stickers por color', texto: 'Matcha, Lavanda, Terracota, Rosa frambuesa y Azul noche, con cintas, estrellas, chiles, corazones y etiquetas como DNF o Me destruyó.' },
    ],
    paraQuien: 'Ideal si amas escribir a mano, decorar con stickers y tener tu diario siempre en el iPad.',
    entrega: 'Después de pagar te llega un correo para descargar los PDF y los packs de stickers. Abres el PDF en GoodNotes y listo.',
  },
]

export const preguntasTienda = [
  { pregunta: '¿Cuál me conviene, Notion o GoodNotes?', respuesta: 'Si te gusta que todo se calcule solo y revisar tus lecturas desde el celular o el computador, el de Notion. Si disfrutas escribir a mano, decorar y usas iPad, el de GoodNotes.' },
  { pregunta: '¿Necesito Notion pagado?', respuesta: 'No, el diario de Notion funciona perfecto en el plan gratis, desde computador, celular o tablet.' },
  { pregunta: '¿El de GoodNotes funciona en otras apps?', respuesta: 'Está pensado para GoodNotes en iPad, pero es un PDF con enlaces, así que también se puede usar en otras apps de notas que abran PDF, como Notability o Noteshelf.' },
  { pregunta: '¿Cómo los recibo?', respuesta: 'Apenas termina el pago te llega un correo de Gumroad con el link de acceso o descarga. Queda tuyo para siempre.' },
  { pregunta: '¿En qué moneda se paga?', respuesta: 'En dólares, con tarjeta, a través de Gumroad. Tu banco hace la conversión a tu moneda.' },
]

// Devuelve true si la promo sigue vigente en la fecha dada (hora de Chile).
export function promoVigente(fecha = new Date()) {
  if (!PROMO || !PROMO.hasta) return false
  const fin = new Date(`${PROMO.hasta}T23:59:59-03:00`)
  return fecha <= fin
}

// Link de compra: con la promo vigente, el link ya trae el código aplicado.
export function urlCompra(producto, conPromo) {
  return conPromo ? `${producto.url}/${PROMO.codigo}` : producto.url
}

export function formatoPrecio(n) {
  return `US$${Number(n).toFixed(2).replace('.', ',')}`
}

export function productosDisponibles() {
  return productos.filter(p => p.estado === 'disponible')
}
