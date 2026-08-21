# ADR 001: Proxy API host must not be exposed to client-side JS

**Date:** 2026-04-06  
**Status:** Accepted

## Context

The app calls a private data-source proxy worker (`data-source-api.workerproxy.workers.dev`) that sits between the frontend and the upstream content sources. A core design requirement is that backend data sources and the proxy host are never visible in the browser.

Astro exposes any environment variable prefixed with `PUBLIC_` to client-side JavaScript bundles. The original code referenced `PUBLIC_PROXY_API_BASE`, which would leak the proxy host to anyone with DevTools open.

## Decision

Use the Worker runtime `PROXY_API_BASE` variable (no `PUBLIC_` prefix) for the proxy API base URL. This variable is only readable in server-side code (Astro frontmatter, API routes). It is never bundled into client JS.

The bearer token is stored in a cookie with `httpOnly: true` (enforced via `AUTH_COOKIE_OPTIONS` in `src/lib/auth.ts`) so client-side JS cannot read it via `document.cookie`.

## Consequences

- `PROXY_API_BASE` can be set in `.dev.vars` locally and as a Cloudflare Worker runtime variable in production; it is no longer needed during `astro build`.
- Components and pages must never import `proxy-api.ts` or `proxy-utils.ts` inside a `<script>` tag — only in the `---` frontmatter block.
- Any new environment variable that references a backend host or secret must not use the `PUBLIC_` prefix.
