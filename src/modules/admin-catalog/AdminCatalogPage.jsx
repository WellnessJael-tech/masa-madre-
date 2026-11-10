import { useAdminAuth } from './useAdminAuth.js'
import { AdminAuthGate } from './AdminAuthGate.jsx'
import { AdminCatalogManager } from './AdminCatalogManager.jsx'

export function AdminCatalogPage({ password }) {
  const { authenticated, attempt } = useAdminAuth(password)
  if (!authenticated) return <AdminAuthGate onSubmit={attempt} />
  return <AdminCatalogManager />
}

export default AdminCatalogPage
