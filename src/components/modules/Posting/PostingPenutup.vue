<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Posting Penutup</h2>
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
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
        <button @click="exportToExcel"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m3-2h6" />
          </svg>
          Export Excel
        </button>
      </div>

      <!-- Account Tables -->
      <div class="space-y-8">
        <div v-for="akun in postingData.akun" :key="akun.akun_id" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Account Header -->
          <div class="bg-gray-50 px-6 py-4 border-b">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ akun.nama_akun }}</h3>
                <p class="text-sm text-gray-600">{{ akun.kode_akun }}</p>
              </div>
              <div class="flex gap-6 text-sm">
                <div>
                  <span class="text-gray-600">Total Mutasi Debet:</span>
                  <span class="font-bold text-blue-600 ml-2">{{ formatNumber(akun.total_mutasi_debit) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Total Mutasi Kredit:</span>
                  <span class="font-bold text-green-600 ml-2">{{ formatNumber(akun.total_mutasi_kredit) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Saldo Akhir:</span>
                  <span class="font-bold ml-2" :class="akun.saldo_akhir_debit > 0 ? 'text-blue-600' : 'text-green-600'">
                    {{ formatNumber(akun.saldo_akhir_debit || akun.saldo_akhir_kredit) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reff</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mutasi
                    Debet</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mutasi
                    Kredit</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo
                    Debet</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo
                    Kredit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(trans, index) in akun.tabel" :key="index"
                  class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(trans.tanggal) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trans.keterangan }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trans.reff }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    <span class="font-medium text-blue-600">{{ formatNumber(trans.mutasi_debit) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    <span class="font-medium text-green-600">{{ formatNumber(trans.mutasi_kredit) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    <span class="font-medium text-blue-600">{{ formatNumber(trans.saldo_debit) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    <span class="font-medium text-green-600">{{ formatNumber(trans.saldo_kredit) }}</span>
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
          d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m3-2h6" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
      <p class="mt-1 text-sm text-gray-500">Belum ada data posting penutup untuk periode ini.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../services/api.js'

// Reactive data
const loading = ref(false)
const error = ref('')
const postingData = ref(null)

// Methods
const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    const currentYear = new Date().getFullYear()
    const response = await api.getDataPostingPenutup(currentYear)

    if (response.success && response.data) {
      postingData.value = response.data
    } else {
      error.value = 'Gagal memuat data posting penutup'
    }
  } catch (err) {
    console.error('Error loading posting penutup:', err)
    error.value = 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
}

const exportToPDF = () => {
  if (!postingData.value) return

  // Create print-friendly HTML
  let printContent = `
    <html>
      <head>
        <title>Posting Penutup</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 10px; }
          .subtitle { text-align: center; margin-bottom: 30px; color: #666; }
          .summary { margin-bottom: 30px; display: flex; justify-content: space-around; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .summary-value { font-size: 18px; font-weight: bold; }
          .account-section { margin-bottom: 40px; page-break-inside: avoid; }
          .account-header { background-color: #f2f2f2; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
          .account-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .account-subtitle { font-size: 12px; color: #666; }
          .account-summary { display: flex; gap: 20px; font-size: 12px; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .text-right { text-align: right; }
          .text-blue { color: #0066cc; }
          .text-green { color: #009933; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <h1>POSTING PENUTUP</h1>
        <div class="subtitle">Periode: ${postingData.value.tahun}</div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Akun</div>
            <div class="summary-value">${postingData.value.total_akun}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tahun</div>
            <div class="summary-value">${postingData.value.tahun}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Bulan</div>
            <div class="summary-value">${postingData.value.bulan || 0}</div>
          </div>
        </div>
  `

  // Add account tables
  postingData.value.akun.forEach(akun => {
    printContent += `
      <div class="account-section">
        <div class="account-header">
          <div class="account-title">${akun.nama_akun}</div>
          <div class="account-subtitle">${akun.kode_akun}</div>
          <div class="account-summary">
            <span>Total Mutasi Debet: <span class="text-blue">${formatNumber(akun.total_mutasi_debit)}</span></span>
            <span>Total Mutasi Kredit: <span class="text-green">${formatNumber(akun.total_mutasi_kredit)}</span></span>
            <span>Saldo Akhir: <span class="text-blue">${formatNumber(akun.saldo_akhir_debit || akun.saldo_akhir_kredit)}</span></span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Reff</th>
              <th class="text-right">Mutasi Debet</th>
              <th class="text-right">Mutasi Kredit</th>
              <th class="text-right">Saldo Debet</th>
              <th class="text-right">Saldo Kredit</th>
            </tr>
          </thead>
          <tbody>
            ${akun.tabel.map(trans => `
              <tr>
                <td>${formatDate(trans.tanggal)}</td>
                <td>${trans.keterangan}</td>
                <td>${trans.reff}</td>
                <td class="text-right text-blue">${formatNumber(trans.mutasi_debit)}</td>
                <td class="text-right text-green">${formatNumber(trans.mutasi_kredit)}</td>
                <td class="text-right text-blue">${formatNumber(trans.saldo_debit)}</td>
                <td class="text-right text-green">${formatNumber(trans.saldo_kredit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  })

  printContent += `
      </body>
    </html>
  `

  // Open print window
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.print()
}

const exportToExcel = () => {
  if (!postingData.value) return

  let csvContent = 'Posting Penutup - Periode ' + postingData.value.tahun + '\n\n'

  postingData.value.akun.forEach((akun, index) => {
    if (index > 0) csvContent += '\n\n' // Add spacing between accounts

    csvContent += `${akun.nama_akun} (${akun.kode_akun})\n`
    csvContent += `Total Mutasi Debet,${akun.total_mutasi_debit}\n`
    csvContent += `Total Mutasi Kredit,${akun.total_mutasi_kredit}\n`
    csvContent += `Saldo Akhir,${akun.saldo_akhir_debit || akun.saldo_akhir_kredit}\n\n`

    csvContent += 'Tanggal,Keterangan,Reff,Mutasi Debet,Mutasi Kredit,Saldo Debet,Saldo Kredit\n'

    akun.tabel.forEach(trans => {
      csvContent += `"${formatDate(trans.tanggal)}","${trans.keterangan}","${trans.reff}","${trans.mutasi_debit}","${trans.mutasi_kredit}","${trans.saldo_debit}","${trans.saldo_kredit}"\n`
    })
  })

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `posting_penutup_${postingData.value.tahun}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.account-section {
  transition: transform 0.2s ease-in-out;
}

.account-section:hover {
  transform: translateY(-2px);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
