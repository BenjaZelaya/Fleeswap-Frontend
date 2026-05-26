import AdminLayout from '../components/AdminLayout'
import AdminReportesTable from '../components/AdminReportesTable'

export default function AdminReportes() {
  return (
    <AdminLayout title="Panel de Administración" subtitle="Gestión de métricas y moderación de contenido.">
      <AdminReportesTable />
    </AdminLayout>
  )
}
