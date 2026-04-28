import type { Metadata, Viewport } from 'next'
import { Inter, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from './providers'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

const BASE_URL = 'https://mavieautomations.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | Mavie Automations',
    default: 'Mavie Automations | Radar BOE y Automatización Empresarial B2B',
  },
  description: 'Sistemas de detección automática de oportunidades públicas, scraping B2B y automatización de procesos para consultoras, despachos y empresas tecnológicas.',
  keywords: ['automatización empresarial', 'radar BOE', 'scraping B2B', 'licitaciones automáticas', 'inteligencia de datos', 'Mavie Automations'],
  authors: [{ name: 'Mavie Automations', url: BASE_URL }],
  creator: 'Mavie Automations',
  publisher: 'Mavie Automations',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'Mavie Automations',
    title: 'Mavie Automations | Automatización Empresarial B2B',
    description: 'Transformamos procesos manuales ineficientes en ecosistemas digitales autónomos 24/7.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mavie Automations — Radar BOE y automatización B2B',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mavie Automations | Automatización Empresarial',
    description: 'Sistemas de detección automática y automatización tecnológica B2B.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mavie Automations',
  url: BASE_URL,
}

// Schema Organization JSON-LD para SEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mavie Automations',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  description: 'Ingeniería de automatización y datos B2B. Sistemas de detección de oportunidades públicas y automatización de procesos empresariales.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valencia',
    addressCountry: 'ES',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34-633-448-806',
    contactType: 'customer service',
    email: 'contacto@mavieautomations.com',
    availableLanguage: 'Spanish',
  },
  sameAs: [
    'https://www.linkedin.com/company/mavie-automations',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
