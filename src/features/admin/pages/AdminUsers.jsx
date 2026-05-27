import AdminLayout from '../components/AdminLayout'
import AdminUsersTable from '../components/AdminUsersTable'

export default function AdminUsers() {
  return (
    <AdminLayout title="Panel de Administración" subtitle="Gestión de métricas, moderación y usuarios.">
      <AdminUsersTable />
    </AdminLayout>
  )
}
