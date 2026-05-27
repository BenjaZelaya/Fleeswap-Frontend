import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { Search, Filter, Shield, User, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { getAdminUsers } from '../services/adminService'
import useDebounce from '../../../shared/hooks/useDebounce'
import SkeletonCard from '../../../shared/components/ui/SkeletonCard'

export default function AdminUsersTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pagination, setPagination] = useState({ paginaActual: 1, totalPaginas: 1, totalUsuarios: 0 })
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, isActive, pagination.paginaActual])

  useEffect(() => {
    setPagination(prev => ({ ...prev, paginaActual: 1 }))
  }, [debouncedSearch, role, isActive])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminUsers({
        page: pagination.paginaActual,
        limit: 20,
        search: debouncedSearch,
        role: role !== '' ? role : undefined,
        isActive: isActive !== '' ? isActive : undefined
      })
      setUsers(data.usuarios || [])
      setPagination({
        paginaActual: data.pagina,
        totalPaginas: data.totalPaginas,
        totalUsuarios: data.total
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevPage = () => {
    if (pagination.paginaActual > 1) {
      setPagination(prev => ({ ...prev, paginaActual: prev.paginaActual - 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (pagination.paginaActual < pagination.totalPaginas) {
      setPagination(prev => ({ ...prev, paginaActual: prev.paginaActual + 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const clearFilters = () => {
    setSearch('')
    setRole('')
    setIsActive('')
  }

  const roleOptions = [
    { value: '', label: 'Todos los Roles' },
    { value: 'ADMIN_ROLE', label: 'Administrador' },
    { value: 'USER_ROLE', label: 'Usuario' }
  ]

  const activeOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Suspendidos / Inactivos' }
  ]

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? 'var(--color-brand, #1e3a5f)' : '#d1d5db',
      boxShadow: 'none',
      fontSize: '0.875rem',
      '&:hover': { borderColor: '#9ca3af' },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '0.875rem',
      backgroundColor: state.isSelected
        ? 'var(--color-brand, #1e3a5f)'
        : state.isFocused
          ? '#e0e7ff'
          : 'white',
      color: state.isSelected ? 'white' : state.isFocused ? 'var(--color-brand, #1e3a5f)' : '#1e293b',
    }),
    menuList: (base) => ({ ...base, maxHeight: '220px' }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  }

  return (
    <>
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
          <div className="md:col-span-6 relative z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-brand hover:border-gray-400 transition-colors h-[38px]"
            />
          </div>

          <div className="md:col-span-3 relative z-20">
            <Select
              options={roleOptions}
              value={roleOptions.find(o => o.value === role) || roleOptions[0]}
              onChange={(opt) => setRole(opt ? opt.value : '')}
              isSearchable={false}
              classNamePrefix="rs"
              styles={customSelectStyles}
            />
          </div>

          <div className="md:col-span-3 relative z-20">
            <Select
              options={activeOptions}
              value={activeOptions.find(o => o.value === isActive) || activeOptions[0]}
              onChange={(opt) => setIsActive(opt ? opt.value : '')}
              isSearchable={false}
              classNamePrefix="rs"
              styles={customSelectStyles}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
          {loading ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin"></div> Buscando...</span>
          ) : (
            <span>Mostrando {users.length} de {pagination.totalUsuarios} usuarios</span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 mb-8 shadow-sm">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={loadUsers} className="ml-auto text-sm font-bold hover:underline">Reintentar</button>
        </div>
      )}

      {/* Listado */}
      {!loading && !error && users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">No hay resultados</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">No encontramos usuarios que coincidan con los filtros de búsqueda aplicados.</p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-sm"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5 pl-2">Usuario</div>
            <div className="col-span-3">Rol</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2 text-right pr-2">Registro</div>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-5"><SkeletonCard className="h-14 w-full" /></div>
              ))
            ) : (
              <AnimatePresence>
                {users.map((user, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user._id}
                    className="group p-5 hover:bg-slate-50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="md:col-span-5 flex items-center gap-4">
                      <Link to={`/profile/${user._id}`} className="shrink-0 hover:opacity-80 transition-opacity block">
                        {user.photo ? (
                          <img src={user.photo} alt={user.nombre} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/profile/${user._id}`} className="hover:underline focus:outline-none">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.nombre} {user.apellido}
                          </p>
                        </Link>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${user.role === 'ADMIN_ROLE' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        {user.role === 'ADMIN_ROLE' && <Shield className="w-3.5 h-3.5" />}
                        {user.role === 'ADMIN_ROLE' ? 'Administrador' : 'Usuario'}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {user.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BanIcon />}
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="md:col-span-2 text-right pr-2">
                      <p className="text-sm font-medium text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && users.length > 0 && pagination.totalPaginas > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 mt-auto">
              <button
                onClick={handlePrevPage}
                disabled={pagination.paginaActual === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm font-semibold text-slate-600">
                {pagination.paginaActual} de {pagination.totalPaginas}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pagination.paginaActual === pagination.totalPaginas}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
)
