export const SITE_URL = "https://mavieautomations.com"

export const organizationRef = {
  "@type": "Organization",
  name: "Mavie Automations",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
} as const

interface ServiceOffer {
  name: string
  price: string
  priceCurrency?: string
  description?: string
}

interface ServiceSchemaInput {
  name: string
  description: string
  path: string
  serviceType: string
  offers?: ServiceOffer[]
  areaServed?: string | string[]
  audience?: string
}

export function serviceSchema(input: ServiceSchemaInput) {
  const {
    name,
    description,
    path,
    serviceType,
    offers = [],
    areaServed = "ES",
    audience = "Empresa B2B",
  } = input

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url: `${SITE_URL}${path}`,
    provider: organizationRef,
    areaServed,
    audience: {
      "@type": "BusinessAudience",
      audienceType: audience,
    },
  }

  if (offers.length > 0) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `Planes de ${name}`,
      itemListElement: offers.map((o) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: o.name,
          description: o.description,
        },
        price: o.price,
        priceCurrency: o.priceCurrency ?? "EUR",
      })),
    }
  }

  return schema
}

interface BreadcrumbItem {
  name: string
  path: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

interface JsonLdProps {
  data: unknown
}

export function jsonLdScript({ data }: JsonLdProps) {
  return {
    __html: JSON.stringify(data),
  }
}
