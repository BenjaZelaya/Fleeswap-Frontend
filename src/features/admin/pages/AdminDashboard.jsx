import { useState, useEffect } from 'react'
import { Users, Package, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getAdminStats } from '../services/adminService'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import AdminPublicationsTable from '../components/AdminPublicationsTable'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch {
      toast.error('Error al cargar métricas')
    } finally {
      setLoadingStats(false)
    }
  }

  return (
    <AdminLayout title="Panel de Administración" subtitle="Gestión de métricas y moderación de contenido.">
      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Usuarios Activos"
          value={stats?.usuariosActivos}
          loading={loadingStats}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Publicaciones Activas"
          value={stats?.publicacionesActivas}
          loading={loadingStats}
          icon={<Package className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Intercambios en Curso"
          value={stats?.intercambiosActivos}
          loading={loadingStats}
          icon={<RefreshCw className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Reportes Pendientes"
          value={stats?.reportesPendientes}
          loading={loadingStats}
          icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
          bgColor="bg-rose-50"
        />
      </div>

      {/* Moderación de Publicaciones */}
      <AdminPublicationsTable />
    </AdminLayout>
  )
}
