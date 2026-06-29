<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">{{ companyName }}</h2>
          <h1 class="text-2xl font-bold text-gray-900">LAPORAN LABA RUGI BULANAN</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Bulan:</label>
            <select v-model="selectedMonth"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Semua Bulan</option>
              <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Tahun:</label>
            <select v-model="selectedYear" @change="loadData"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <button @click="loadData" :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            <span v-if="loading">Loading...</span>
            <span v-else>Tampilkan Data</span>
          </button>
          <button @click="exportToPDF" :disabled="loading || !neracaData"
            class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            Export PDF
          </button>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        Tahun: {{ selectedYear }}
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-6 text-center py-12">
      <div class="flex flex-col items-center">
        <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ error }}</h3>
        <p class="text-gray-500">Pilih periode lain atau hubungi administrator jika masalah berlanjut</p>
      </div>
    </div>

    <!-- Akumulasi Total - Hanya tampil kalo pilih Semua Bulan -->
    <div v-if="filteredData.length > 0 && !loading && selectedMonth === 'all'" class="mb-8">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
            </path>
          </svg>
          Akumulasi Total Tahun {{ selectedYear }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <p class="text-sm text-gray-500 mb-1 font-medium">Total Pendapatan</p>
            <p
              :class="['text-2xl font-bold', cumulativeTotals.pendapatan_jasa >= 0 ? 'text-blue-600' : 'text-red-600']">
              {{ formatNumber(cumulativeTotals.pendapatan_jasa) }}
            </p>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <p class="text-sm text-gray-500 mb-1 font-medium">Total Beban</p>
            <p :class="['text-2xl font-bold', cumulativeTotals.jumlah_beban <= 0 ? 'text-blue-600' : 'text-red-600']">
              {{ formatNumber(cumulativeTotals.jumlah_beban) }}
            </p>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <p class="text-sm text-gray-500 mb-1 font-medium">Total Laba Neto</p>
            <p :class="['text-2xl font-bold', cumulativeTotals.laba_neto >= 0 ? 'text-green-600' : 'text-red-600']">
              {{ formatNumber(cumulativeTotals.laba_neto) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="filteredData.length > 0 && !loading" class="space-y-6">
      <div v-for="(bulanData, bIndex) in filteredData" :key="bIndex"
        class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- Month Header -->
        <div @click="selectedMonth === 'all' ? toggleMonth(bulanData.bulan) : null"
          class="px-6 py-5 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center justify-between group transition-all duration-200"
          :class="{ 'cursor-pointer hover:bg-gray-100': selectedMonth === 'all' }">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm transition-all duration-300"
              :class="{ 'group-hover:bg-blue-600 group-hover:text-white': selectedMonth === 'all' }">
              <svg v-if="selectedMonth === 'all'" class="w-5 h-5 transition-transform duration-300"
                :class="{ 'rotate-180': isMonthExpanded(bulanData.bulan) }" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 uppercase tracking-wide">{{ getMonthName(bulanData.bulan) }} {{
                neracaData.tahun }}</h3>
              <p class="text-xs text-blue-600 font-medium italic">
                {{ getMonthStatusText(bulanData.bulan) }}
              </p>
            </div>
          </div>

          <div class="flex gap-4 sm:gap-8 items-center mt-4 sm:mt-0">
            <div class="text-right">
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pendapatan</span>
              <span :class="['text-sm font-bold', bulanData.pendapatan_jasa >= 0 ? 'text-blue-700' : 'text-red-700']">
                {{ formatNumber(bulanData.pendapatan_jasa) }}
              </span>
            </div>
            <div class="w-px h-10 bg-gray-200"></div>
            <div class="text-right">
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Beban</span>
              <span :class="['text-sm font-bold', bulanData.jumlah_beban <= 0 ? 'text-blue-700' : 'text-red-700']">
                {{ formatNumber(bulanData.jumlah_beban) }}
              </span>
            </div>
            <div class="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div class="text-right hidden sm:block">
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Laba Neto</span>
              <span
                :class="['text-sm font-bold px-3 py-1 rounded-full', bulanData.laba_neto >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ formatNumber(bulanData.laba_neto) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Details Table -->
        <div v-show="isMonthExpanded(bulanData.bulan)" class="border-t border-gray-100 p-6 animate-fadeIn">
          <!-- Table -->
          <table class="w-full border-collapse table-fixed">
            <thead>
              <tr class="border-b-2 border-gray-300 bg-gray-50">
                <th class="py-2 px-6 text-left text-sm font-bold text-gray-800 w-40">Kode</th>
                <th class="py-2 px-6 text-left text-sm font-bold text-gray-800">Nama Perkiraan</th>
                <th class="py-2 px-6 text-right text-sm font-bold text-gray-800 w-56">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <!-- Pendapatan Section -->
              <tr class="bg-blue-50/50">
                <td colspan="3" class="py-2 text-center text-sm font-bold text-blue-800 uppercase tracking-wider">
                  PENDAPATAN</td>
              </tr>
              <tr v-for="item in getPendapatanItems(bulanData.details)" :key="item.no_akun"
                class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-2 px-6 text-sm text-gray-600 truncate">{{ item.no_akun }}</td>
                <td class="py-2 px-6 text-sm text-gray-700 font-medium truncate">{{ item.nama_akun }}</td>
                <td class="py-2 px-6 text-right text-sm text-gray-900 font-semibold">
                  {{ formatNumber(item.jumlah) }}
                </td>
              </tr>
              <tr class="bg-gray-100/80 font-bold border-t border-gray-300">
                <td colspan="2" class="py-2 px-6 text-center text-sm font-bold text-gray-800 italic uppercase">Jumlah
                  Pendapatan</td>
                <td
                  :class="['py-2 px-6 text-right text-sm font-bold', bulanData.pendapatan_jasa >= 0 ? 'text-blue-700' : 'text-red-700']">
                  {{ formatNumber(bulanData.pendapatan_jasa) }}
                </td>
              </tr>

              <!-- Beban Section -->
              <tr class="bg-blue-50/50">
                <td colspan="3" class="py-2 text-center text-sm font-bold text-blue-800 uppercase tracking-wider mt-4">
                  BEBAN</td>
              </tr>
              <tr v-for="item in getBebanItems(bulanData.details)" :key="item.no_akun"
                class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-2 px-6 text-sm text-gray-600 truncate">{{ item.no_akun }}</td>
                <td class="py-2 px-6 text-sm text-gray-700 font-medium truncate">{{ item.nama_akun }}</td>
                <td
                  :class="['py-2 px-6 text-right text-sm font-semibold', item.jumlah <= 0 ? 'text-blue-700' : 'text-red-700']">
                  {{ formatNumber(item.jumlah) }}
                </td>
              </tr>
              <!-- Jumlah Beban -->
              <tr class="bg-gray-100/80 font-bold border-t border-gray-300">
                <td colspan="2" class="py-2 px-6 text-center text-sm font-bold text-gray-800 italic uppercase">
                  Jumlah Beban
                </td>
                <td
                  :class="['py-2 px-6 text-right text-sm font-bold', bulanData.jumlah_beban <= 0 ? 'text-blue-700' : 'text-red-700']">
                  {{ formatNumber(bulanData.jumlah_beban) }}
                </td>
              </tr>

              <!-- Laba Bersih -->
              <tr class="bg-blue-600 text-white font-bold">
                <td colspan="2" class="py-3 px-6 text-center text-base uppercase tracking-widest">LABA BERSIH</td>
                <td class="py-3 px-6 text-right text-base">{{ formatNumber(bulanData.laba_neto) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredData.length === 0"
      class="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Laporan laba rugi belum tersedia untuk {{ selectedMonth === 'all' ? 'tahun ' + selectedYear :
          getMonthName(selectedMonth) + ' ' + selectedYear }}
      </h3>
      <p class="text-gray-500">Pilih tahun dan klik "Tampilkan Data" untuk memuat ulang</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../services/api.js'
import { useCompanyName } from '../../../composables/useCompanyName.js'

const selectedYear = ref('2026')
const selectedMonth = ref('all')
const neracaData = ref(null)
const loading = ref(false)
const error = ref('')
const expandedMonths = ref([])

const { companyName } = useCompanyName()

// Computed
const filteredData = computed(() => {
  if (!neracaData.value || !neracaData.value.data) return []
  if (selectedMonth.value === 'all') return neracaData.value.data
  return neracaData.value.data.filter(bulan => bulan.bulan === parseInt(selectedMonth.value))
})

const cumulativeTotals = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return { pendapatan_jasa: 0, jumlah_beban: 0, laba_neto: 0 }
  }
  return filteredData.value.reduce((acc, bulan) => ({
    pendapatan_jasa: acc.pendapatan_jasa + (bulan.pendapatan_jasa || 0),
    jumlah_beban: acc.jumlah_beban + (bulan.jumlah_beban || 0),
    laba_neto: acc.laba_neto + (bulan.laba_neto || 0)
  }), { pendapatan_jasa: 0, jumlah_beban: 0, laba_neto: 0 })
})

// Methods
const toggleMonth = (bulan) => {
  const index = expandedMonths.value.indexOf(bulan)
  if (index === -1) {
    expandedMonths.value.push(bulan)
  } else {
    expandedMonths.value.splice(index, 1)
  }
}

const isMonthExpanded = (bulan) => {
  if (selectedMonth.value !== 'all') return true
  return expandedMonths.value.includes(bulan)
}

const getMonthStatusText = (bulan) => {
  if (selectedMonth.value !== 'all') return 'Rincian laba rugi periode ini'
  return isMonthExpanded(bulan) ? 'Klik untuk menutup rincian' : 'Klik untuk melihat rincian'
}

const getMonthName = (month) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[month - 1] || ''
}

// Helpers untuk memisahkan pendapatan dan beban per bulan
const getPendapatanItems = (details) => {
  if (!details) return []
  return details.filter(item => item.no_akun.startsWith('4'))
}

const getBebanItems = (details) => {
  if (!details) return []
  return details.filter(item => item.no_akun.startsWith('5'))
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0,00'
  const numericValue = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num
  if (isNaN(numericValue)) return '0,00'

  // Format number with sign
  return numericValue.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('Loading Laporan Laba Rugi Bulanan for year:', selectedYear.value)
    const result = await api.request(`/getLaporanLabaRugiBulanan?tahun=${selectedYear.value}`, {}, 'ap')
    console.log('API Response:', result)

    if (result && result.success) {
      neracaData.value = result.data
      console.log('Data loaded successfully:', neracaData.value)
    } else {
      console.error('API returned error:', result)
      let displayMessage = result?.message || 'Gagal memuat data laporan laba rugi'
      if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
        displayMessage = 'Laporan laba rugi belum tersedia untuk periode ini'
      }
      error.value = displayMessage
      neracaData.value = null
    }

  } catch (err) {
    console.error('Error loading laporan laba rugi:', err)
    if (err.message && err.message.includes('404')) {
      neracaData.value = null
      error.value = ''
    } else {
      error.value = 'Terjadi kesalahan saat memuat data: ' + err.message
      neracaData.value = null
    }
  } finally {
    loading.value = false
  }
}

const exportToPDF = () => {
  if (!neracaData.value || !neracaData.value.data) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  let content = `
    <html>
      <head>
        <title>LAPORAN LABA RUGI BULANAN - ${selectedYear.value}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .header h2 { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .header p { font-size: 14px; color: #666; }
          .month-section { margin-bottom: 50px; page-break-inside: avoid; }
          .month-title { background-color: #f3f4f6; padding: 10px; font-size: 16px; font-weight: bold; border-left: 5px solid #2563eb; margin-bottom: 15px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px 15px; text-align: left; font-size: 12px; }
          th { background-color: #f9fafb; font-weight: bold; color: #374151; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .section-header { background-color: #eff6ff; font-weight: bold; color: #1e40af; text-transform: uppercase; }
          .total-row { background-color: #f9fafb; font-weight: bold; font-style: italic; }
          .laba-bersih { background-color: #2563eb; font-weight: bold; color: white; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${companyName.value}</h1>
          <h2>LAPORAN LABA RUGI BULANAN</h2>
          <p>Tahun: ${selectedYear.value}</p>
        </div>

        ${neracaData.value.data.map(bulan => `
          <div class="month-section">
            <div class="month-title">BULAN: ${getMonthName(bulan.bulan).toUpperCase()}</div>
            <table>
              <thead>
                <tr>
                  <th width="100">Kode</th>
                  <th>Nama Perkiraan</th>
                  <th width="150" class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr class="section-header">
                  <td colspan="3" class="text-center">PENDAPATAN</td>
                </tr>
                ${getPendapatanItems(bulan.details).map(item => `
                  <tr>
                    <td class="text-center">${item.no_akun}</td>
                    <td>${item.nama_akun}</td>
                    <td class="text-right">${formatNumber(item.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-center">Jumlah Pendapatan</td>
                  <td class="text-right">${formatNumber(bulan.pendapatan_jasa)}</td>
                </tr>
                <tr class="section-header">
                  <td colspan="3" class="text-center">BEBAN</td>
                </tr>
                ${getBebanItems(bulan.details).map(item => `
                  <tr>
                    <td class="text-center">${item.no_akun}</td>
                    <td>${item.nama_akun}</td>
                    <td class="text-right">${formatNumber(item.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-center">Jumlah Beban</td>
                  <td class="text-right">${formatNumber(bulan.jumlah_beban)}</td>
                </tr>
                <tr class="laba-bersih">
                  <td colspan="2" class="text-center">LABA BERSIH</td>
                  <td class="text-right">${formatNumber(bulan.laba_neto)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `).join('')}
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(content)
  printWindow.document.close()
  setTimeout(() => printWindow.print(), 500)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
