/**
 * Utility function to extract specific error message from API response
 * @param {Error|string} err - The error object or string
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} - The error message to display to user
 */
export const getErrorMessage = (err, defaultMessage = 'Terjadi kesalahan') => {
  if (err?.response?.data?.message) {
    return err.response.data.message
  }

  let raw = err?.responseData?.message || err?.message || (typeof err === 'string' ? err : '')
  if (!raw) return defaultMessage

  // Bersihkan prefix umum yang suka ditempel manual di kode (mis. `Error: ${err.message}`)
  raw = raw.replace(/^\s*Error:\s*/i, '')

  // Cari JSON yang nyelip di dalam string, mis: "HTTP error! status: 422 - {...}"
  const jsonMatch = raw.match(/\{.*\}/s)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.message) return parsed.message
    } catch (e) {
      // bukan JSON valid, lanjut ke fallback di bawah
    }
  }

  if (/status:\s*500/.test(raw)) return 'Terjadi gangguan pada server. Silakan coba lagi beberapa saat lagi.'
  if (/status:\s*404/.test(raw)) return 'Data tidak ditemukan.'
  if (/status:\s*401|status:\s*403/.test(raw)) return 'Anda tidak memiliki akses untuk aksi ini.'
  if (/Failed to fetch|NetworkError/i.test(raw)) return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'

  // Kalau masih ada pola "HTTP error!" tersisa (JSON gagal diparse & tidak match status manapun),
  // JANGAN tampilkan mentah — kasih fallback generik
  if (/HTTP error!/i.test(raw)) return defaultMessage

  return raw
}

/**
 * Show error message to user (either via alert or setting error state)
 */
export const showError = (err, setError = null, defaultMessage = 'Terjadi kesalahan') => {
  const errorMessage = getErrorMessage(err, defaultMessage)

  if (setError && typeof setError === 'function') {
    setError(errorMessage)
  } else {
    alert(errorMessage)
  }

  console.error('Error occurred:', err)
}