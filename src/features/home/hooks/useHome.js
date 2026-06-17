import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import useAuthStore from '../../../store/authStore'
import { getPublications } from '../../publications/services/publicationService'
import { enviarSolicitudCompra } from '../../solicitudes/services/solicitudService'
import { logError } from '../../../shared/utils/logger'

const PROFILE_BANNER_KEY = 'fleeswap_profile_banner_dismissed'

/**
 * useHome — encapsula toda la lógica de datos y acciones del landing page.
 * La página Home.jsx solo se encarga de componer el JSX.
 */
export function useHome() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()

  // ── Banner de perfil incompleto ───────────────────────────────────────────
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(PROFILE_BANNER_KEY) === '1'
  )
  function handleDismissBanner() {
    localStorage.setItem(PROFILE_BANNER_KEY, '1')
    setBannerDismissed(true)
  }

  // ── Búsqueda rápida ───────────────────────────────────────────────────────
  const [searchValue, setSearchValue] = useState('')
  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set('search', searchValue.trim())
    navigate(`/explore${params.toString() ? `?${params.toString()}` : ''}`)
  }

  // ── Publicaciones del carousel ────────────────────────────────────────────
  const [publications, setPublications] = useState([])
  const [loadingPubs, setLoadingPubs] = useState(true)

  useEffect(() => {
    async function fetchPubs() {
      try {
        const data = await getPublications({ limit: 12 })
        setPublications(data.publications || data.items || data.data || [])
      } catch (err) {
        logError('Error cargando publicaciones del home:', err)
      } finally {
        setLoadingPubs(false)
      }
    }
    fetchPubs()
  }, [])

  // ── Carousel (scroll arrows) ──────────────────────────────────────────────
  const carouselRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateArrows = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 0)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }, [])

  const getScrollAmount = useCallback(() => {
    const el = carouselRef.current
    if (!el) return 0
    const firstChild = el.firstElementChild
    return firstChild ? firstChild.clientWidth + 20 : el.clientWidth
  }, [])

  const scrollPrev = useCallback(() => {
    carouselRef.current?.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' })
  }, [getScrollAmount])

  const scrollNext = useCallback(() => {
    carouselRef.current?.scrollBy({ left: getScrollAmount(), behavior: 'smooth' })
  }, [getScrollAmount])

  useEffect(() => {
    if (!loadingPubs && publications.length > 0) {
      requestAnimationFrame(updateArrows)
    }
  }, [loadingPubs, publications.length, updateArrows])

  // ── Acciones: Intercambiar / Comprar ──────────────────────────────────────
  const [modalPub, setModalPub] = useState(null)
  const [buyingPubId, setBuyingPubId] = useState(null)

  function handleIntercambiar(pub) {
    if (!token) {
      navigate('/login', { state: { toast: 'Iniciá sesión para enviar una propuesta de intercambio' } })
      return
    }
    setModalPub(pub)
  }

  async function handleComprar(pub) {
    if (!token) {
      navigate('/login', { state: { toast: 'Iniciá sesión para realizar una compra' } })
      return
    }
    setBuyingPubId(pub._id)
    try {
      const exchange = await enviarSolicitudCompra(pub._id)
      const exchangeId = exchange._id || exchange.id
      toast.success('¡Propuesta enviada! Te llevamos al chat para coordinar.')
      navigate(`/intercambios/${exchangeId}/chat`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la solicitud de compra'
      if (err.response?.status === 409) {
        toast.info('Ya tenés una solicitud activa para esta publicación')
      } else {
        toast.error(msg)
      }
    } finally {
      setBuyingPubId(null)
    }
  }

  return {
    // Auth
    token,
    user,
    // Banner
    bannerDismissed,
    handleDismissBanner,
    // Search
    searchValue,
    setSearchValue,
    handleSearchSubmit,
    // Publications
    publications,
    loadingPubs,
    // Carousel
    carouselRef,
    atStart,
    atEnd,
    updateArrows,
    scrollPrev,
    scrollNext,
    // Actions
    modalPub,
    setModalPub,
    buyingPubId,
    handleIntercambiar,
    handleComprar,
  }
}
