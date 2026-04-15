import { Helmet } from 'react-helmet-async'
import { seoConfig, defaultSeo, organizationSchema } from '../utils/seoConfig'

/**
 * Hook para manejar SEO en las páginas
 * @param {string} page - Clave de la página en seoConfig
 * @param {object} customData - Datos personalizados para sobrescribir
 */
export const useSeo = (page, customData = {}) => {
  const pageConfig = seoConfig[page] || seoConfig.home
  const config = { ...pageConfig, ...customData }

  return {
    title: config.title || defaultSeo.siteName,
    description: config.description || '',
    keywords: config.keywords || '',
    image: config.image || defaultSeo.image,
    url: config.url || defaultSeo.siteUrl
  }
}

/**
 * Componente SEO para inyectar en las páginas
 * Uso: <Seo page="home" title="Custom Title" />
 */
export const Seo = ({ 
  page = 'home', 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  includeSchema = true
}) => {
  const seo = useSeo(page, { title, description, keywords, image, url })

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={defaultSeo.siteName} />
      <meta property="og:locale" content={defaultSeo.locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Canonical */}
      <link rel="canonical" href={seo.url} />
      
      {/* Structured Data */}
      {includeSchema && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(organizationSchema)}
          </script>
        </>
      )}
    </Helmet>
  )
}

export default Seo
