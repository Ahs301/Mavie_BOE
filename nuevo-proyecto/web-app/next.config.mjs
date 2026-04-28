/** @type {import('next').NextConfig} */ // build: 2026-04-20

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://supabase.co').host
  } catch {
    return 'supabase.co'
  }
})()

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // hCaptcha + Next.js inline scripts require 'unsafe-inline'; consider nonces later.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com",
  "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.brevo.com https://hcaptcha.com https://*.hcaptcha.com`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ]
  },
  async redirects() {
    return [
      { source: '/es/privacidad', destination: '/privacidad', permanent: true },
      { source: '/es/terminos',   destination: '/terminos',   permanent: true },
      { source: '/es/faq',        destination: '/contacto',   permanent: true },
      { source: '/es/nosotros',   destination: '/sobre-nosotros', permanent: true },
    ]
  },
}

export default nextConfig
