import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

import { useExplore } from '../features/publications/hooks/useExplore'
import { PUBLICATION_CATEGORIES } from '../shared/utils/constants'
import { defaultSeo } from '../shared/utils/seoConfig'
import SearchBar from '../shared/components/SearchBar'
import FilterPanel from '../shared/components/FilterPanel'
import PublicationGrid from '../shared/components/PublicationGrid'
import Seo from '../shared/components/Seo'

function CategoryShortcut({ category }) {
  return (
    <Link
      to={`/explore?category=${category.value}`}
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand-accent"
    >
      {category.label}
    </Link>
  )
}

export default function Explore() {
  const {
    filters,
    searchParams,
    searchInput,
    setSearchInput,
    results,
    loading,
    updateFilters,
    handleSearchSubmit,
    handleClear,
  } = useExplore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50"
    >
      <Seo
        page="explore"
        url={`${defaultSeo.siteUrl}/explore${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-slate-500">
                Explorar Fleeswap
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Encontrá publicaciones que sí te sirven.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Buscá por texto, categoría, condición o modalidad. Los filtros quedan en la URL para que puedas compartirlos o retomarlos después.
              </p>
            </div>

            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearchSubmit}
              placeholder="Buscar por título, descripción o palabra clave"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <FilterPanel
            filters={filters}
            onChange={(name, value) => updateFilters({ [name]: value })}
            onClear={handleClear}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Categorías rápidas</p>
            <div className="mt-4 grid gap-2">
              {PUBLICATION_CATEGORIES.slice(0, 6).map((category) => (
                <CategoryShortcut key={category.value} category={category} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {loading ? 'Buscando publicaciones...' : `${results.total} resultados`}
              </p>
              <p className="text-xs text-slate-500">
                {filters.category
                  ? 'Mostrando resultados filtrados por categoría y preferencias.'
                  : 'Explorá lo publicado por la comunidad en este momento.'}
              </p>
            </div>

            <Link
              to="/"
              className="text-sm font-semibold text-brand-accent transition-colors hover:text-brand"
            >
              Volver al inicio
            </Link>
          </div>

          <PublicationGrid
            publications={results.publications}
            loading={loading}
            page={results.page}
            totalPages={results.totalPages}
            onPageChange={(page) => updateFilters({ page })}
            emptyTitle="No encontramos publicaciones"
            emptyDescription="Probá cambiando los filtros o revisá de nuevo más tarde."
          />
        </div>
      </section>
    </motion.div>
  )
}
