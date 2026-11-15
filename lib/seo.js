// Recorta un texto para la meta descripción de Google (~155 caracteres).
// Prefiere terminar en una frase completa; si no se puede, corta en un
// espacio y agrega "…", para que nunca quede una palabra a la mitad.
export function recortar(texto, max = 155) {
  const limpio = String(texto || '').replace(/\s+/g, ' ').trim()
  if (limpio.length <= max) return limpio

  const tramo = limpio.slice(0, max)
  const finFrase = Math.max(tramo.lastIndexOf('. '), tramo.lastIndexOf('! '), tramo.lastIndexOf('? '))
  if (finFrase >= 80) return tramo.slice(0, finFrase + 1)

  const espacio = tramo.lastIndexOf(' ')
  const corte = espacio > 0 ? tramo.slice(0, espacio) : tramo
  return corte.replace(/[\s,;:.\-–—]+$/, '') + '…'
}
