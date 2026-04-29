import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchBar from '../shared/components/SearchBar'
import FilterPanel from '../shared/components/FilterPanel'
import PublicationGrid from '../shared/components/PublicationGrid'
import { getPublications } from '../features/publications/services/publicationService'
import { PUBLICATION_CATEGORIES } from '../utils/constants'
import Seo from '../shared/components/Seo'
import { defaultSeo } from '../utils/seoConfig'
import { logError } from '../utils/logger'

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  condition: '',
  type: 'ambos',
  maxPrice: '',
  page: 1,
  limit: 9,
}

function getFiltersFromParams(searchParams) {
  const page = Number(searchParams.get('page') || DEFAULT_FILTERS.page)
  const limit = Number(searchParams.get('limit') || DEFAULT_FILTERS.limit)

  return {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    type: searchParams.get('type') || DEFAULT_FILTERS.type,
    maxPrice: searchParams.get('maxPrice') || '',
    page: Number.isNaN(page) || page < 1 ? DEFAULT_FILTERS.page : page,
    limit: Number.isNaN(limit) || limit < 1 ? DEFAULT_FILTERS.limit : limit,
  }
}

function buildSearchParams(filters) {
  const nextParams = new URLSearchParams()

  if (filters.search) nextParams.set('search', filters.search)
  if (filters.category) nextParams.set('category', filters.category)
  if (filters.condition) nextParams.set('condition', filters.condition)
  if (filters.type && filters.type !== DEFAULT_FILTERS.type) nextParams.set('type', filters.type)
  if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice)
  if (filters.page > 1) nextParams.set('page', String(filters.page))
  if (filters.limit !== DEFAULT_FILTERS.limit) nextParams.set('limit', String(filters.limit))

  return nextParams
}

function normalizeResponse(data, fallbackPage) {
  const publications = data?.publications || data?.items || data?.data || []
  const total = data?.total || data?.count || publications.length
  const totalPages = data?.totalPages || Math.max(1, Math.ceil(total / (data?.limit || DEFAULT_FILTERS.limit)))
  const page = data?.page || data?.currentPage || fallbackPage

  return {
    publications,
    total,
    totalPages,
    page,
  }
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => getFiltersFromParams(searchParams), [searchParams])
  const [searchInput, setSearchInput] = useState(filters.search)
  const [results, setResults] = useState({
    publications: [],
    total: 0,
    totalPages: 1,
    page: 1,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    let active = true

    async function fetchPublications() {
      setLoading(true)

      try {
        const params = {
          page: filters.page,
          limit: filters.limit,
          ...(filters.category && { category: filters.category }),
          ...(filters.condition && { condition: filters.condition }),
          ...(filters.search && { search: filters.search }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.type !== 'ambos' && { type: filters.type }),
        }

        const data = await getPublications(params)
        if (!active) return
        setResults(normalizeResponse(data, filters.page))
      } catch (error) {
        logError('Error cargando publicaciones para explore:', error)
        if (!active) return
        setResults({
          publications: [],
          total: 0,
          totalPages: 1,
          page: filters.page,
        })
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchPublications()

    return () => {
      active = false
    }
  }, [filters])

  function updateFilters(patch) {
    const nextFilters = {
      ...filters,
      ...patch,
    }

    if (!Object.prototype.hasOwnProperty.call(patch, 'page')) {
      nextFilters.page = 1
    }

    setSearchParams(buildSearchParams(nextFilters))
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    updateFilters({ search: searchInput.trim() })
  }

  function handleClear() {
    setSearchInput('')
    setSearchParams(buildSearchParams(DEFAULT_FILTERS))
  }

  return (
    <div className="bg-slate-50">
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
            emptyTitle="No hay resultados para esta búsqueda"
            emptyDescription="Probá cambiando categoría, condición, tipo o el texto que ingresaste."
          />
        </div>
      </section>
    </div>
  )
}
