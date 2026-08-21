async function deriveKey(rawKey: string): Promise<CryptoKey> {
	const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey))
	return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	])
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = ""
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns base64(12-byte IV || ciphertext).
 */
export async function encryptText(plain: string, rawKey: string): Promise<string> {
	const key = await deriveKey(rawKey)
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const cipherBytes = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode(plain),
	)
	const combined = new Uint8Array(12 + cipherBytes.byteLength)
	combined.set(iv, 0)
	combined.set(new Uint8Array(cipherBytes), 12)
	return bytesToBase64(combined)
}

/**
 * Decrypts a base64-encoded AES-256-GCM ciphertext produced by encryptText.
 */
export async function decryptText(encoded: string, rawKey: string): Promise<string> {
	const key = await deriveKey(rawKey)
	const combined = base64ToBytes(encoded.trim())
	const plainBytes = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: combined.slice(0, 12) },
		key,
		combined.slice(12),
	)
	return new TextDecoder().decode(plainBytes)
}
