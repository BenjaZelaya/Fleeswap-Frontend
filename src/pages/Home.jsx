import { AnimatePresence } from 'framer-motion'

import { useHome } from '../features/home/hooks/useHome'
import Seo from '../shared/components/Seo'
import ModalIntercambio from '../features/solicitudes/components/ModalIntercambio'

import ProfileBanner    from '../features/home/components/ProfileBanner'
import HeroSection      from '../features/home/components/HeroSection'
import HowItWorksSection from '../features/home/components/HowItWorksSection'
import CarouselSection  from '../features/home/components/CarouselSection'
import CategoriesSection from '../features/home/components/CategoriesSection'
import ModalitiesSection from '../features/home/components/ModalitiesSection'
import CtaSection       from '../features/home/components/CtaSection'

export default function Home() {
  const {
    token, user,
    bannerDismissed, handleDismissBanner,
    searchValue, setSearchValue, handleSearchSubmit,
    publications, loadingPubs,
    carouselRef, atStart, atEnd, updateArrows, scrollPrev, scrollNext,
    modalPub, setModalPub, buyingPubId, handleIntercambiar, handleComprar,
  } = useHome()

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
