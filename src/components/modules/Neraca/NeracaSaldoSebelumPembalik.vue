<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Neraca Saldo Sebelum Pembalik</h2>
      <p class="text-gray-600 mt-2">Periode: {{ neracaSaldo?.periode || '-' }}</p>
    </div>

    <!-- Year Selection -->
    <div class="mb-6">
      <div class="flex gap-4 items-end">
        <div class="flex-1 max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select v-model.number="selectedYear" @change="loadData"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
            <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
            <option :value="new Date().getFullYear() + 1">{{ new Date().getFullYear() + 1 }}</option>
          </select>
        </div>
        <button @click="loadData"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
            </path>
          </svg>
          Tampilkan Data
        </button>
      </div>
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

    <!-- Data Table -->
    <div v-else-if="neracaSaldo" class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Akun</p>
          <p class="text-2xl font-bold text-gray-800">{{ neracaSaldo.total_akun }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Debet</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatNumber(neracaSaldo.total_debit) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Kredit</p>
          <p class="text-2xl font-bold text-green-600">{{ formatNumber(neracaSaldo.total_kredit) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Balance</p>
          <p class="text-2xl font-bold" :class="balanceColor">
            {{ formatNumber(balance) }}
          </p>
        </div>
      </div>

      <!-- Export Buttons -->
      <div class="flex gap-4 p-6 border-b">
        <button @click="exportToPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2 2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Export PDF
        </button>
        <button @click="exportToExcel"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2 2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Export Excel
        </button>
      </div>

      <!-- Account Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Akun</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debet</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(akun, index) in neracaSaldo.akun" :key="index"
              :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'">
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ akun.no_akun }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ akun.nama_akun }}</td>
              <td class="px-6 py-4 text-sm text-right text-gray-900">
                <span v-if="akun.debet > 0" class="text-blue-600 font-medium">
                  {{ formatNumber(akun.debet) }}
                </span>
                <span v-else class="text-gray-600">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-right text-gray-900">
                <span v-if="akun.kredit > 0" class="text-green-600 font-medium">
                  {{ formatNumber(akun.kredit) }}
                </span>
                <span v-else class="text-gray-600">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 0h6m2 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 00-2-2h2a2 2 0 002-2v10a2 2 0 002 2z">
        </path>
      </svg>
      <p class="mt-2 text-gray-600">Belum ada data neraca saldo sebelum pembalik</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const loading = ref(false)
const error = ref(null)
const neracaSaldo = ref(null)
const selectedYear = ref(new Date().getFullYear())

// Computed
const balance = computed(() => {
  if (!neracaSaldo.value) return 0
  return neracaSaldo.value.total_debit - neracaSaldo.value.total_kredit
})

const balanceColor = computed(() => {
  return balance.value >= 0 ? 'text-green-600' : 'text-red-600'
})

// Methods
const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    // Use selected year
    const response = await api.getNeracaSaldoSebelumPembalik(selectedYear.value)

    if (response.success) {
      neracaSaldo.value = response.data
    } else {
      error.value = 'Gagal memuat data neraca saldo sebelum pembalik'
    }
  } catch (err) {
    console.error('Error loading neraca saldo sebelum pembalik data:', err)
    error.value = 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
}

const exportToPDF = () => {
  // TODO: Implement PDF export
  console.log('Export to PDF - Neraca Saldo Sebelum Pembalik')
  window.print()
}

const exportToExcel = () => {
  // TODO: Implement Excel export
  console.log('Export to Excel - Neraca Saldo Sebelum Pembalik')
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

  .bg-white.rounded-lg.shadow.overflow-hidden {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .overflow-x-auto {
    overflow-x: visible;
  }
}
</style>
