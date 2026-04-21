import { MetadataRoute } from 'next'
import { getAllVerticalSlugs } from './radar-boe/_data/verticales'
import { getAllCiudadSlugs } from './radar-boe/_data/ciudades'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mavieautomations.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluciones`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/soluciones/boe`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/soluciones/prospeccion`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // No añadimos /dashboard ni /onboarding porque son procesos privados/técnicos
  ]

  // Hub page
  const hubPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/radar-boe`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // 12 vertical pages
  const verticalPages: MetadataRoute.Sitemap = getAllVerticalSlugs().map((slug) => ({
    url: `${baseUrl}/radar-boe/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 20 city pages
  const ciudadPages: MetadataRoute.Sitemap = getAllCiudadSlugs().map((slug) => ({
    url: `${baseUrl}/radar-boe/ciudad/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...hubPage, ...verticalPages, ...ciudadPages]
}
