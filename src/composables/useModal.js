import { ref, reactive } from 'vue'
import { getErrorMessage } from '@/utils/errorHandler.js'

const visible = ref(false)
const state = reactive({
  type: 'info',
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Batal',
  showCancel: false,
  resolve: null,
})

/**
 * Tampilkan modal dan tunggu jawaban user.
 * Selalu return Promise<boolean> — true kalau confirm, false kalau cancel/tutup.
 *
 * Contoh penggunaan:
 *   const ok = await showAlert({ type: 'success', title: 'Berhasil', message: 'Data tersimpan.' })
 *   const ok = await showConfirm({ title: 'Hapus?', message: 'Data akan dihapus permanen.' })
 */
const openModal = (options) => {
  return new Promise((resolve) => {
    Object.assign(state, {
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      confirmLabel: options.confirmLabel || 'OK',
      cancelLabel: options.cancelLabel || 'Batal',
      showCancel: options.showCancel || false,
      resolve,
    })
    visible.value = true
  })
}

const onConfirm = () => {
  visible.value = false
  state.resolve?.(true)
}

const onCancel = () => {
  visible.value = false
  state.resolve?.(false)
}

// ─── Helper shortcuts ────────────────────────────────────────────────────────

/** Pengganti alert() biasa */
export const showAlert = (options) =>
  openModal({ ...options, showCancel: false })

/** Pengganti confirm() — return true/false */
export const showConfirm = (options) =>
  openModal({ ...options, showCancel: true })

/** Shortcut sukses */
export const showSuccess = (message, title = 'Berhasil') =>
  showAlert({ type: 'success', title, message })

/**
 * Shortcut error.
 * Terima STRING biasa ATAU objek Error — keduanya SELALU diparse lewat getErrorMessage
 * supaya raw JSON/HTTP status/prefix "Error: " tidak pernah tampil mentah ke user.
 */
export const showError = (errOrMessage, title = 'Terjadi Kesalahan') => {
  const message = getErrorMessage(errOrMessage, 'Terjadi kesalahan. Silakan coba lagi.')
  return showAlert({ type: 'danger', title, message })
}

/** Shortcut warning */
export const showWarning = (message, title = 'Peringatan') =>
  showAlert({ type: 'warning', title, message })

// ─── Untuk AppModal.vue ──────────────────────────────────────────────────────
export const useModal = () => ({
  visible,
  state,
  onConfirm,
  onCancel,
})