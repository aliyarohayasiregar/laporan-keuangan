<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <!-- Beautiful Header -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 via-bule-600 to-blue-400 p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div class="text-white">
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Posting Entry
              </h2>
            </div>

            <!-- Filter Controls -->
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-5 border border-white/20 w-full lg:w-auto">
              <div class="space-y-4">
                <!-- Row 1: Filter Bulan & Tahun -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-green-100 text-xs font-medium mb-1">Bulan</label>
                    <select v-model="selectedMonth"
                      class="w-full px-9 py-2 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm">
                      <option v-for="(bulan, index) in bulanOptions" :key="index" :value="index + 1">
                        {{ bulan }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-green-100 text-xs font-medium mb-1">Tahun</label>
                    <select v-model="selectedYear"
                      class="w-full px-3 py-2 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm">
                      <option v-for="year in yearOptions" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Row 2: Action Buttons -->
                <div class="flex flex-wrap gap-2 sm:gap-10">
                  <button v-if="hasPermission('posting entry', 'create')" @click="handlePosting"
                    :disabled="loading || !selectedMonth"
                    class="flex-1 min-w-[140px] bg-white text-green-600 hover:bg-green-50 disabled:bg-white/50 disabled:text-green-300 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                    <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                      </path>
                    </svg>
                    {{ loading ? 'Memproses...' : 'Posting Entry' }}
                  </button>
                  <!-- <button v-if="hasPermission('posting entry', 'delete')" @click="handleCancelPosting"
                    :disabled="loading || !selectedMonth"
                    class="flex-1 min-w-[140px] bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                      </path>
                    </svg>
                    Batal Posting
                  </button> -->
                  <button v-if="hasPermission('posting entry', 'edit')" @click="handlePostingFinal"
                    :disabled="loading || isFinalPosted"
                    class="flex-1 min-w-[140px] bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Posting Final
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar Posting Section -->
      <div v-if="hasPermission('posting entry', 'view')"
        class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Status Posting Bulanan</h3>
          <p class="text-sm text-gray-600">Status posting untuk setiap bulan pada tahun {{ selectedYear }}</p>
        </div>

        <!-- Loading State for Daftar Posting -->
        <div v-if="loadingDaftarPosting" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-600">Memuat daftar posting...</p>
        </div>

        <!-- Error State for Daftar Posting -->
        <div v-else-if="errorDaftarPosting" class="text-center py-8">
          <div class="text-red-600 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-red-600 text-sm">{{ errorDaftarPosting }}</p>
          <button @click="loadDaftarPosting" class="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">
            Coba Lagi
          </button>
        </div>

        <!-- Daftar Posting Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                  Posting</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in daftarPosting" :key="item.bulan" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getMonthName(item.bulan) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    item.status === 'posted'
                      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                  ]">
                    <span class="w-2 h-2 mr-1.5 rounded-full"
                      :class="item.status === 'posted' ? 'bg-green-400' : 'bg-gray-400'"></span>
                    {{ item.status === 'posted' ? 'Posted' : 'Not Posted' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.tanggal_posting ? formatDate(item.tanggal_posting) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="!loadingDaftarPosting && !errorDaftarPosting && (!daftarPosting || daftarPosting.length === 0)"
            class="text-center py-8">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            <p class="mt-2 text-sm text-gray-600">Belum ada data posting untuk tahun {{ selectedYear }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import api from '../../../services/api.js'
import { showSuccess, showError, showConfirm, showWarning } from '@/composables/useModal.js'

// Inject hasPermission from Dashboard
const hasPermission = inject('hasPermission', () => true)

// Reactive data
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const loadingDaftarPosting = ref(false)
const errorDaftarPosting = ref(null)
const daftarPosting = ref([])
const isFinalPosted = ref(false)

// Options
const bulanOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

// Load daftar posting
const loadDaftarPosting = async () => {
  try {
    loadingDaftarPosting.value = true
    errorDaftarPosting.value = null

    console.log('Fetching daftar posting for year:', selectedYear.value)
    const result = await api.getDaftarPostingByTahunBB(selectedYear.value)
    console.log('Daftar Posting API Response:', result)

    if (result.success) {
      daftarPosting.value = result.data || []
      isFinalPosted.value = result.is_final_posted || false
      console.log('Daftar posting loaded:', daftarPosting.value)
    } else {
      errorDaftarPosting.value = result.message || 'Gagal memuat daftar posting'
      daftarPosting.value = []
    }
  } catch (err) {
    console.error('Error loading daftar posting:', err)
    errorDaftarPosting.value = 'Terjadi kesalahan saat memuat daftar posting: ' + err.message
    daftarPosting.value = []
  } finally {
    loadingDaftarPosting.value = false
  }
}

const getMonthName = (month) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[month - 1] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Handle posting
const handlePosting = async () => {
  const ok = await showConfirm({
    type: 'info',
    title: 'Konfirmasi Posting Entry',
    message: `Apakah Anda yakin ingin melakukan posting entry untuk periode ${bulanOptions[selectedMonth.value - 1]} ${selectedYear.value}?`,
    confirmLabel: 'Ya, Posting',
    cancelLabel: 'Batal',
  })
  if (!ok) return

  loading.value = true
  try {
    const postingDataRequest = {
      bulan: selectedMonth.value,
      tahun: selectedYear.value
    }
    console.log('Request payload:', postingDataRequest)
    const res = await api.request('/postingJurnal', {
      method: 'POST',
      body: JSON.stringify(postingDataRequest)
    }, 'ap')
    console.log('Response:', res)

    if (res.success) {
      await showSuccess(res.message || 'Posting entry berhasil dilakukan.')
      loadDaftarPosting()
    } else {
      await showError(res.message || 'Gagal melakukan posting entry.')
    }
  } catch (err) {
    console.error('Error posting:', err)
    await showError(err || 'Terjadi kesalahan sistem.')
  } finally {
    loading.value = false
  }
}

const handleCancelPosting = async () => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Batalkan Posting Entry',
    message: `Apakah Anda yakin ingin membatalkan posting entry untuk periode ${bulanOptions[selectedMonth.value - 1]} ${selectedYear.value}? Semua data yang sudah diposting akan dikembalikan.`,
    confirmLabel: 'Ya, Batalkan',
    cancelLabel: 'Tidak',
  })
  if (!ok) return

  loading.value = true
  try {
    const cancelDataRequest = {
      bulan: selectedMonth.value,
      tahun: selectedYear.value
    }
    const res = await api.request('/batalPostingJurnal', {
      method: 'POST',
      body: JSON.stringify(cancelDataRequest)
    }, 'ap')

    if (res.success) {
      await showSuccess(res.message || 'Posting entry berhasil dibatalkan.')
      loadDaftarPosting()
    } else {
      await showError(res.message || 'Gagal membatalkan posting entry.')
    }
  } catch (err) {
    console.error('Error cancelling posting:', err)
    await showError(err || 'Terjadi kesalahan sistem.')
  } finally {
    loading.value = false
  }
}

// Handle posting final
const handlePostingFinal = async () => {
  if (isFinalPosted.value) {
    await showWarning(
      'Posting final sudah dilakukan untuk tahun ini. Tidak dapat melakukan posting ulang.',
      'Posting Final Sudah Dilakukan'
    )
    return
  }

  const ok = await showConfirm({
    type: 'warning',
    title: 'Konfirmasi Posting Final',
    message: `Apakah Anda yakin ingin melakukan posting final untuk tahun ${selectedYear.value}?Setelah posting final, tidak dapat melakukan posting atau revisi lagi untuk tahun ini.`,
    confirmLabel: 'Ya, Posting Final',
    cancelLabel: 'Batal',
  })
  if (!ok) return

  loading.value = true
  try {
    const res = await api.request(`/postingFinalJurnal?tahun=${selectedYear.value}`, {
      method: 'POST'
    }, 'ap')

    if (res.success) {
      await showSuccess('Posting final berhasil! Tidak dapat melakukan posting atau revisi lagi untuk tahun ini.', 'Posting Final Berhasil')
      isFinalPosted.value = true
      await loadDaftarPosting()
    } else {
      await showError(res.message || 'Gagal melakukan posting final.')
    }
  } catch (err) {
    console.error('Error posting final:', err)
    await showError(err || 'Terjadi kesalahan sistem.')
  } finally {
    loading.value = false
  }
}

// Watch for year changes
watch(selectedYear, () => {
  loadDaftarPosting()
})

onMounted(() => {
  loadDaftarPosting()
})
</script>