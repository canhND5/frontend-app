import type { AuthSession } from "@/lib/auth"

/** Extend Astro locals with the auth session injected by middleware. */
declare namespace App {
	interface Locals {
		session?: AuthSession
		user?: {
			name: string
			ts: number
		}
	}
}
