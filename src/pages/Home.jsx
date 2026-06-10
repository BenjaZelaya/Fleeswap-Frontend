import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import useAuthStore from '../store/authStore'
import { getPublications } from '../features/publications/services/publicationService'
import { enviarSolicitudCompra } from '../features/solicitudes/services/solicitudService'
import Seo from '../shared/components/Seo'
import { logError } from '../utils/logger'
import ModalIntercambio from '../features/solicitudes/components/ModalIntercambio'

// Subcomponentes extraídos
import ProfileBanner from '../features/home/components/ProfileBanner'
import HeroSection from '../features/home/components/HeroSection'
import HowItWorksSection from '../features/home/components/HowItWorksSection'
import CarouselSection from '../features/home/components/CarouselSection'
import CategoriesSection from '../features/home/components/CategoriesSection'
import ModalitiesSection from '../features/home/components/ModalitiesSection'
import CtaSection from '../features/home/components/CtaSection'

const PROFILE_BANNER_KEY = 'fleeswap_profile_banner_dismissed'

export default function Home() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(PROFILE_BANNER_KEY) === '1'
  )
  const [publications, setPublications] = useState([])
  const [loadingPubs, setLoadingPubs] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  // ── Modal de intercambio y compras ─────────────────────────────
  const [modalPub, setModalPub] = useState(null)
  const [buyingPubId, setBuyingPubId] = useState(null)

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

  function handleIntercambiar(pub) {
    if (!token) {
      navigate('/login', { state: { toast: 'Iniciá sesión para enviar una propuesta de intercambio' } })
      return
    }
    setModalPub(pub)
  }

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
    async function fetchPubs() {
      try {
        const data = await getPublications({ limit: 12 })
        setPublications(data.publications || data.items || data.data || [])
      } catch (err) {
        logError('Error cargando publicaciones:', err)
      } finally {
        setLoadingPubs(false)
      }
    }
    fetchPubs()
  }, [])

  useEffect(() => {
    if (!loadingPubs && publications.length > 0) {
      requestAnimationFrame(updateArrows)
    }
  }, [loadingPubs, publications.length, updateArrows])

  function handleDismissBanner() {
    localStorage.setItem(PROFILE_BANNER_KEY, '1')
    setBannerDismissed(true)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set('search', searchValue.trim())
    navigate(`/explore${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div>
      <Seo page="home" />
      
      <AnimatePresence>
        {token && user && !bannerDismissed && (
          <ProfileBanner user={user} onDismiss={handleDismissBanner} />
        )}
      </AnimatePresence>

      <HeroSection
        token={token}
        user={user}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleSearchSubmit={handleSearchSubmit}
        publications={publications}
      />

      <HowItWorksSection />

      <CarouselSection
        loadingPubs={loadingPubs}
        publications={publications}
        token={token}
        scrollPrev={scrollPrev}
        scrollNext={scrollNext}
        atStart={atStart}
        atEnd={atEnd}
        carouselRef={carouselRef}
        updateArrows={updateArrows}
        handleIntercambiar={handleIntercambiar}
        handleComprar={handleComprar}
        buyingPubId={buyingPubId}
      />

      <CategoriesSection />

      <ModalitiesSection token={token} />

      <CtaSection token={token} />

      <ModalIntercambio
        isOpen={!!modalPub}
        onClose={() => setModalPub(null)}
        publicacionDestino={modalPub}
      />
    </div>
  )
}
