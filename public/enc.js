// Shared client-side decrypt for GFW-obfuscated content.
// Used by both AppLayout (article/list pages) and the /book/ reverse proxy.
// Finds [data-enc] / [data-enc-html] elements, fetches the AES key from
// /api/client-key, and restores plaintext. Dispatches `enc:done` when finished.
(function () {
  async function deriveKey(rawKey) {
    const keyBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawKey))
    return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  }
  async function decryptField(encoded, key) {
    const bytes = Uint8Array.from(atob(encoded.trim()), c => c.charCodeAt(0))
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12))
    return new TextDecoder().decode(plain)
  }
  async function run() {
    const els = document.querySelectorAll('[data-enc]')
    const htmlEls = document.querySelectorAll('[data-enc-html]')
    const titleEl = document.querySelector('[data-enc-title]')
    const docEl = document.querySelector('[data-enc-doc]')
    if (!els.length && !htmlEls.length && !titleEl && !docEl) return
    let rawKey
    try {
      const res = await fetch('/api/client-key')
      if (!res.ok) return
      rawKey = (await res.json()).key
    } catch { return }
    if (!rawKey) return
    const key = await deriveKey(rawKey)
    // Fallback: whole-document ciphertext restored via document.write
    if (docEl) {
      try {
        const plain = await decryptField(docEl.getAttribute('data-enc-doc'), key)
        document.open(); document.write(plain); document.close()
      } catch {}
      return
    }
    await Promise.all(Array.from(els).map(async el => {
      try { el.textContent = await decryptField(el.textContent, key) } catch {}
    }))
    await Promise.all(Array.from(htmlEls).map(async el => {
      try {
        const cipher = el.getAttribute('data-enc-html')
        if (!cipher) return
        el.innerHTML = await decryptField(cipher, key)
        el.removeAttribute('data-enc-html')
        el.querySelectorAll('img').forEach(img => {
          const lazySrc = img.dataset.src || img.dataset.lazySrc || img.dataset.original || img.dataset.lazy
          if (lazySrc && !img.src) img.src = lazySrc
        })
      } catch {}
    }))
    if (titleEl) {
      try {
        document.title = await decryptField(titleEl.getAttribute('data-enc-title'), key)
        titleEl.removeAttribute('data-enc-title')
      } catch {}
    }
    document.dispatchEvent(new Event('enc:done'))
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run()
})()
