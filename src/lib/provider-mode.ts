import { getProviderMode, type AuthSession } from "@/lib/auth"

/** Result of trying the real provider before falling back. */
export interface ProviderResult<T> {
	data: T
	error: Error | null
	mode: "real" | "fallback"
	requestedMode: "real" | "fallback"
}

/**
 * Load data from the authenticated provider when a token is available.
 * Falls back automatically when no token exists or the real loader fails.
 */
export async function loadWithFallback<T>(
	session: AuthSession | undefined,
	realLoader: (token: string) => Promise<T>,
	fallbackLoader: () => Promise<T>,
): Promise<ProviderResult<T>> {
	const requestedMode = getProviderMode(session)

	if (requestedMode === "fallback" || !session?.token) {
		return {
			data: await fallbackLoader(),
			error: null,
			mode: "fallback",
			requestedMode,
		}
	}

	try {
		return {
			data: await realLoader(session.token),
			error: null,
			mode: "real",
			requestedMode,
		}
	} catch (error) {
		return {
			data: await fallbackLoader(),
			error: error instanceof Error ? error : new Error("Unknown provider failure"),
			mode: "fallback",
			requestedMode,
		}
	}
}
