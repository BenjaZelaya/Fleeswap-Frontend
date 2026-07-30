/**
 * Formatea un numero como precio en pesos argentinos.
 * Ejemplos:
 *   formatCurrency(15000)  => "$15.000"
 *   formatCurrency(1500.5) => "$1.500,5"
 */
export function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('es-AR')}`
}
