import { defineMiddleware } from "astro:middleware"
import { AUTH_SESSION_COOKIE, decodeAuthSession } from "@/lib/auth"

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https: https://www.google-analytics.com https://analytics.google.com",
    "frame-src https://www.googletagmanager.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (ctx, next) => {
  const session = decodeAuthSession(ctx.cookies.get(AUTH_SESSION_COOKIE)?.value)

  if (session) {
    ctx.locals.session = session
    ctx.locals.user = {
      name: session.name,
      ts: session.ts,
    }
  } else {
    ctx.cookies.delete(AUTH_SESSION_COOKIE, { path: "/" })
  }

  const response = await next()

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
})
