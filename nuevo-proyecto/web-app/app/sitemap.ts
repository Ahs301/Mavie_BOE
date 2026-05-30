import { MetadataRoute } from 'next'
import { getAllVerticalSlugs } from './radar-boe/_data/verticales'
import { getAllCiudadSlugs } from './radar-boe/_data/ciudades'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mavieautomations.com';
  const now = new Date().toISOString();
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: lastMonth,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluciones`,
      lastModified: lastMonth,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/soluciones/boe`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: lastMonth,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: lastMonth,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/soluciones/prospeccion`,
      lastModified: lastMonth,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: lastMonth,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: lastMonth,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: lastMonth,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: lastMonth,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // No añadimos /dashboard ni /onboarding porque son procesos privados/técnicos
  ]

  // Hub page
  const hubPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/radar-boe`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // 12 vertical pages
  const verticalPages: MetadataRoute.Sitemap = getAllVerticalSlugs().map((slug) => ({
    url: `${baseUrl}/radar-boe/${slug}`,
    lastModified: lastMonth,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 20 city pages
  const ciudadPages: MetadataRoute.Sitemap = getAllCiudadSlugs().map((slug) => ({
    url: `${baseUrl}/radar-boe/ciudad/${slug}`,
    lastModified: lastMonth,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...hubPage, ...verticalPages, ...ciudadPages]
}
