import { useState } from 'react'

const STORAGE_KEY = 'mm-admin-catalog-authenticated'

/**
 * Protección de acceso MUY simple: una contraseña comparada en el navegador
 * y una marca en sessionStorage (se pierde al cerrar la pestaña). NO es
 * autenticación real — ver módulo module.js y ADR-0021. Cualquiera con las
 * herramientas de desarrollador puede leer la contraseña esperada del
 * bundle o simplemente llamar al API de escritura directamente.
 *
 * @param {string} expectedPassword
 */
export function useAdminAuth(expectedPassword) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  )

  function attempt(password) {
    const ok = password === expectedPassword
    if (ok) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthenticated(true)
    }
    return ok
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
  }

  return { authenticated, attempt, logout }
}
