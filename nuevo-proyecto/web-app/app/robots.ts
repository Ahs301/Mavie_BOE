import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mavieautomations.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/panel',
          '/panel/',
          '/login',
          '/login/',
          '/acceso',
          '/acceso/',
          '/api/',
          '/onboarding',
          '/onboarding/',
          '/gracias',
          '/gracias/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
