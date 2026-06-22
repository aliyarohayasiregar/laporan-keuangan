<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Posting Pembalik</h2>
      <p class="text-gray-600 mt-2">Periode: {{ postingData?.tahun || '-' }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Data Display -->
    <div v-else-if="postingData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg shadow-sm border">
          <p class="text-sm text-gray-600">Total Akun</p>
          <p class="text-2xl font-bold text-gray-800">{{ postingData.total_akun }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border">
          <p class="text-sm text-gray-600">Tahun</p>
          <p class="text-2xl font-bold text-blue-600">{{ postingData.tahun }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border">
          <p class="text-sm text-gray-600">Bulan</p>
          <p class="text-2xl font-bold text-green-600">{{ postingData.bulan || 0 }}</p>
        </div>
      </div>

      <!-- Export Buttons -->
      <div class="flex gap-4">
        <button @click="exportToPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Export PDF
        </button>
        <button @click="exportToExcel"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Export Excel
        </button>
      </div>

      <!-- Account Tables -->
      <div class="space-y-6">
        <div v-for="akun in postingData.akun" :key="akun.akun_id" class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">{{ akun.nama_akun }}</h3>
                <p class="text-sm text-gray-600">{{ akun.kode_akun }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">Saldo Akhir</div>
                <div class="text-lg font-bold">
                  <span v-if="akun.saldo_akhir_debit > 0" class="text-green-600">
                    {{ formatNumber(akun.saldo_akhir_debit) }}
                  </span>
                  <span v-else-if="akun.saldo_akhir_kredit > 0" class="text-red-600">
                    {{ formatNumber(akun.saldo_akhir_kredit) }}
                  </span>
                  <span v-else class="text-gray-600">0</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reff</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                  </th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(trans, index) in akun.tabel" :key="index">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ formatDate(trans.tanggal) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-900">{{ trans.keterangan }}</td>
                  <td class="px-4 py-2 text-sm text-gray-900">{{ trans.reff }}</td>
                  <td class="px-4 py-2 text-sm text-right text-gray-900">
                    {{ trans.mutasi_debit > 0 ? formatNumber(trans.mutasi_debit) : '-' }}
                  </td>
                  <td class="px-4 py-2 text-sm text-right text-gray-900">
                    {{ trans.mutasi_kredit > 0 ? formatNumber(trans.mutasi_kredit) : '-' }}
                  </td>
                  <td class="px-4 py-2 text-sm text-right font-medium">
                    <span v-if="trans.saldo_debit > 0" class="text-green-600">
                      {{ formatNumber(trans.saldo_debit) }}
                    </span>
                    <span v-else-if="trans.saldo_kredit > 0" class="text-red-600">
                      {{ formatNumber(trans.saldo_kredit) }}
                    </span>
                    <span v-else class="text-gray-600">0</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 0h6m2 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 00-2-2h2a2 2 0 002-2v10a2 2 0 002 2z">
        </path>
      </svg>
      <p class="mt-2 text-gray-600">Belum ada data posting pembalik</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const loading = ref(false)
const error = ref(null)
const postingData = ref(null)

// Methods
const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    // Get current year
    const currentYear = new Date().getFullYear()
    const response = await api.getDataPostingPembalik(currentYear)

    if (response.success) {
      postingData.value = response.data
    } else {
      error.value = 'Gagal memuat data posting pembalik'
    }
  } catch (err) {
    console.error('Error loading posting pembalik data:', err)
    error.value = 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
}

const exportToPDF = () => {
  // TODO: Implement PDF export
  console.log('Export to PDF - Posting Pembalik')
  window.print()
}

const exportToExcel = () => {
  // TODO: Implement Excel export
  console.log('Export to Excel - Posting Pembalik')
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Print styles */
@media print {
  .flex.gap-4 {
    display: none;
  }

  .bg-white.rounded-lg.shadow-sm.border {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .overflow-x-auto {
    overflow-x: visible;
  }
}
</style>
