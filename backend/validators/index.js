/**
 * @param {Error} e
 * @returns {string[]}
 */
export function getDetails (e) {
  return Array.isArray(e) ? e.errors.map(error => error.message) : [e.message]
}
