import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import useAuthStore from '../../../store/authStore'
import { getPublicationById } from '../services/publicationService'
import ReportModal from '../components/ReportModal'
import { PUBLICATION_TYPES, PUBLICATION_CONDITIONS, PUBLICATION_CATEGORIES } from '../../../utils/constants'
import Seo from '../../../shared/components/Seo'
import PageSpinner from '../../../shared/components/ui/PageSpinner'
import { defaultSeo } from '../../../utils/seoConfig'
import { logError } from '../../../utils/logger'
import ModalIntercambio from '../../solicitudes/components/ModalIntercambio'

function LoadingSpinner() {
  return <PageSpinner label="Cargando publicación" />
}

export default function PublicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser, token } = useAuthStore()

  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ── Guards de autenticación ────────────────────────────────────────────
  function handleIntercambiar() {
    if (!token) {
      navigate('/login',
        {
          state: { toast: 'Iniciá sesión para enviar una propuesta de intercambio' }
        })
      return
    }
    setIsModalOpen(true)
  }

  function handleComprar() {
    if (!token) {
      navigate('/login',
        {
          state: { toast: 'Iniciá sesión para realizar una compra' }
        })
      return
    }
    // TODO: lógica de compra
    toast.info('La función de compra estará disponible próximamente.')
  }

  useEffect(() => {
    async function fetchPublication() {
      setLoading(true)
      setNotFound(false)
      setAlreadyReported(false)
      setShowReportModal(false)
      try {
        const data = await getPublicationById(id)
        setPublication(data)
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
        else {
          logError('Error fetching publication:', err)
          toast.error('Error al cargar la publicación')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPublication()
  }, [id])

  const getTypeLabel = (type) => {
    const typeObj = PUBLICATION_TYPES.find((t) => t.value === type)
    return typeObj?.label || type
  }

  const getConditionLabel = (condition) => {
    const condObj = PUBLICATION_CONDITIONS.find((c) => c.value === condition)
    return condObj?.label || condition
  }

  const getCategoryLabel = (category) => {
    const catObj = PUBLICATION_CATEGORIES.find((c) => c.value === category)
    return catObj?.label || category
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) return <LoadingSpinner />

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Publicación no encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Esta publicación ya no está disponible.</p>
        </div>
        <Link to="/" className="text-sm text-brand-accent font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  if (!publication || !publication.owner) return null

  const owner = publication.owner
  const ownerFullName = [owner.nombre, owner.apellido].filter(Boolean).join(' ')
  const ownerInitial = owner.nombre?.[0]?.toUpperCase() ?? '?'
  const isOwner = authUser && String(authUser.id) === String(owner._id)
  const mainPhoto = publication.photos?.[0]
  const canonicalUrl = `${defaultSeo.siteUrl}/publications/${publication._id}`
  const image = publication.photos?.[selectedPhotoIndex] || mainPhoto || defaultSeo.image
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: publication.title,
    description: publication.description,
    image: publication.photos?.length ? publication.photos : [defaultSeo.image],
    url: canonicalUrl,
    itemCondition: getConditionLabel(publication.condition),
    offers: publication.price
      ? {
        '@type': 'Offer',
        price: publication.price,
        priceCurrency: 'ARS',
        availability: publication.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      }
      : undefined,
  }

  return (
    <>
      <Seo
        title={`${publication.title} - Fleeswap`}
        description={publication.description}
        image={image}
        url={canonicalUrl}
        type="product"
        schema={schema}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-brand-accent transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={`/explore?category=${publication.category}`} className="hover:text-brand-accent transition-colors">{getCategoryLabel(publication.category)}</Link>
          <span>/</span>
          <span className="text-gray-700">{publication.title}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Galería de fotos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Foto principal */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3]">
              {mainPhoto ? (
                <img
                  src={publication.photos[selectedPhotoIndex]}
                  alt={publication.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {publication.photos && publication.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {publication.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedPhotoIndex === idx
                      ? 'border-brand'
                      : 'border-gray-200 hover:border-brand/50'
                      }`}
                  >
                    <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Detalles Técnicos */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles Técnicos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Categoría */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</p>
                  <p className="text-gray-900 font-semibold mt-1">{getCategoryLabel(publication.category)}</p>
                </div>

                {/* Estado */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</p>
                  <p className="text-gray-900 font-semibold mt-1">{getConditionLabel(publication.condition)}</p>
                </div>

                {/* Tipo */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</p>
                  <p className="text-gray-900 font-semibold mt-1">{getTypeLabel(publication.type)}</p>
                </div>

                {/* Publicado */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Publicado</p>
                  <p className="text-gray-900 font-semibold mt-1">{formatDate(publication.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info y acciones */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${publication.status === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {publication.status === 'available' ? 'ACTIVO' : 'NO DISPONIBLE'}
              </span>
            </div>

            {/* Título y Precio */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{publication.title}</h1>
              {publication.price ? (
                <p className="text-3xl font-bold text-brand">${publication.price.toLocaleString('es-AR')}</p>
              ) : (
                <p className="text-lg font-semibold text-brand-accent">Solo intercambio</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{publication.description}</p>
            </div>

            {/* Historia del Objeto */}
            {publication.history && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Historia del Objeto</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{publication.history}</p>
              </div>
            )}

            {/* Ubicación */}
            {publication.location && (
              <div className="flex items-start gap-2 pt-4 border-t border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-600">{publication.location}</span>
              </div>
            )}

            {/* Botones de Acción */}
            {!isOwner && (
              <div className="space-y-3 pt-4">
                {/* Botón Comprar */}
                {(publication.type === 'venta' || publication.type === 'ambos') && (
                  <button
                    onClick={handleComprar}
                    className="w-full py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Comprar ahora
                  </button>
                )}

                {/* Botón Intercambio — H3.1 */}
                {(publication.type === 'trueque' || publication.type === 'ambos') && (
                  <button
                    id="btn-enviar-solicitud"
                    onClick={handleIntercambiar}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Me interesa (intercambio)
                  </button>
                )}

                {/* Si es solo intercambio, no hay precio */}
                {publication.type === 'trueque' && (
                  <p className="text-xs text-center text-gray-400">
                    Esta publicación es solo para intercambio — sin precio de venta.
                  </p>
                )}
              </div>
            )}

            {isOwner && (
              <div className="pt-4 bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 font-medium">Esta es tu publicación</p>
                <p className="text-xs text-blue-500 mt-1">No podés enviar una solicitud sobre tu propio artículo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección del Vendedor */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Vendedor</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              {/* Avatar */}
              <div className="shrink-0">
                {owner.photo ? (
                  <img
                    src={owner.photo}
                    alt={ownerFullName}
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-accent flex items-center justify-center text-2xl font-bold text-white">
                    {ownerInitial}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <Link
                    to={`/profile/${owner._id}`}
                    className="text-lg font-bold text-slate-900 tracking-tight hover:text-brand-accent transition-colors"
                  >
                    {ownerFullName}
                  </Link>
                  {owner.isVerified && (
                    <div className="flex items-center gap-1.5 mt-1 justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-600">Verificado</span>
                    </div>
                  )}
                </div>

                {owner.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-center sm:justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {owner.location}
                  </p>
                )}

                {owner.bio && (
                  <p className="text-sm text-gray-600 italic">{owner.bio}</p>
                )}
              </div>

              {/* Botón Perfil */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Link
                  to={`/profile/${owner._id}`}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg transition-colors"
                >
                  Ver perfil
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Modal: Solicitud de Intercambio ── */}
      {publication && (
        <ModalIntercambio
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          publicacionDestino={publication}
        />
      )}
    </>
  )
}
