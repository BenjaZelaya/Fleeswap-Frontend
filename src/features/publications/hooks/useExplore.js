import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublications } from '../../publications/services/publicationService'
import { logError } from '../../../shared/utils/logger'

export const DEFAULT_FILTERS = {
  search: '',
  category: '',
  condition: '',
  type: 'ambos',
  maxPrice: '',
  page: 1,
  limit: 9,
}

export function getFiltersFromParams(searchParams) {
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

export function buildSearchParams(filters) {
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
  const pagination = data?.pagination || {}

  const total = pagination.total ?? data?.total ?? data?.count ?? publications.length
  const page = pagination.page ?? data?.page ?? data?.currentPage ?? fallbackPage
  const totalPages =
    pagination.totalPages ??
    data?.totalPages ??
    Math.max(1, Math.ceil(total / (pagination.limit || data?.limit || DEFAULT_FILTERS.limit)))

  return { publications, total, totalPages, page }
}

/**
 * useExplore — encapsula toda la lógica de filtros, URL params y fetching
 * de publicaciones de la página Explore. La página solo compone el JSX.
 */
export function useExplore() {
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

  // Sincronizar el input con el parámetro de búsqueda de la URL
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  // Fetch de publicaciones con los filtros actuales
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
        setResults({ publications: [], total: 0, totalPages: 1, page: filters.page })
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchPublications()
    return () => { active = false }
  }, [filters])

  function updateFilters(patch) {
    const nextFilters = { ...filters, ...patch }
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

  return {
    filters,
    searchParams,
    searchInput,
    setSearchInput,
    results,
    loading,
    updateFilters,
    handleSearchSubmit,
    handleClear,
  }
}
