<template>
  <div class="p-6 bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ companyName }}</h2>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Neraca</h1>
      <p class="text-gray-600">Periode: {{ selectedYear }}</p>
    </div>

    <!-- Controls -->
    <div class="mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-4">
        <label class="text-sm font-medium text-gray-700">Tahun:</label>
        <select v-model="selectedYear"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <button @click="loadData" :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <span v-if="loading">Loading...</span>
          <span v-else>Tampilkan Data</span>
        </button>
        <button @click="exportToPDF" :disabled="loading || !data"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Export PDF
        </button>
        <!-- <button @click="deleteLaporan" :disabled="loading"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Delete Laporan
        </button> -->
      </div>
      <div class="flex gap-2">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuat data...</p>
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

    <!-- Empty State -->
    <div
      v-if="!loading && !error && (!data || (data.aset_lancar?.length === 0 && data.aset_tetap?.length === 0 && data.liabilitas_jangka_pendek?.length === 0))"
      class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
        </path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan posisi keuangan belum tersedia untuk periode ini</h3>
      <p class="text-gray-500">Pilih tahun dan klik "Tampilkan Data" untuk melihat laporan posisi keuangan</p>
    </div>

    <!-- Data Tables - 2 Column Side-by-Side Layout -->
    <div
      v-if="data && !loading && !error && (data.aset_lancar?.length > 0 || data.aset_tetap?.length > 0 || data.liabilitas_jangka_pendek?.length > 0)"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Kolom Kiri: ASET -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-100 pb-1">ASET</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 bg-gray-50">
              <th class="py-2 text-center text-[10px] font-bold text-gray-800 uppercase tracking-widest w-20">Kode</th>
              <th class="py-2 text-left text-[10px] font-bold text-gray-800 uppercase tracking-widest">Nama Perkiraan
              </th>
              <th class="py-2 text-right text-[10px] font-bold text-gray-800 uppercase tracking-widest w-28 pr-2">
                Rincian</th>
              <th class="py-2 text-right text-[10px] font-bold text-gray-800 uppercase tracking-widest w-28 pr-2">Total
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Aset Lancar -->
            <tr class="bg-blue-50/50">
              <td colspan="4" class="py-1.5 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">{{
                getAsetLancarName() }}</td>
            </tr>
            <tr v-for="item in data.aset_lancar" :key="item.no_akun" class="hover:bg-gray-50 border-b border-gray-100">
              <td class="py-1.5 text-center text-[11px] text-gray-500 font-mono">{{ item.no_akun }}</td>
              <td class="py-1.5 text-[11px] text-gray-700 font-medium pl-2">{{ item.nama_akun }}</td>
              <td class="py-1.5 text-right text-[11px] text-gray-900 font-semibold pr-2 font-mono">
                {{ getDisplayValue(item) }}
              </td>
              <td class="py-1.5 text-right text-[11px] text-gray-400 pr-2 font-mono">-</td>
            </tr>
            <tr class="bg-gray-50 font-bold border-t border-gray-300">
              <td colspan="2" class="py-2 pl-4 text-xs text-gray-800 italic">{{ getTotalAsetLancarName() }}</td>
              <td class="py-2 text-right text-xs text-gray-400 pr-2 font-mono"></td>
              <td class="py-2 text-right text-xs text-blue-700 pr-2 font-mono underline decoration-double">{{
                formatNumber(data.total_aset_lancar) }}</td>
            </tr>

            <!-- Aset Tetap -->
            <tr class="bg-blue-50/50">
              <td colspan="4" class="py-1.5 text-center text-xs font-bold text-blue-700 uppercase tracking-wider mt-4">
                {{ getAsetTetapName() }}</td>
            </tr>
            <tr v-for="item in data.aset_tetap" :key="item.no_akun" class="hover:bg-gray-50 border-b border-gray-100">
              <td class="py-1.5 text-center text-[11px] text-gray-500 font-mono">{{ item.no_akun }}</td>
              <td class="py-1.5 text-[11px] text-gray-700 font-medium pl-2">{{ item.nama_akun }}</td>
              <td class="py-1.5 text-right text-[11px] text-gray-900 font-semibold pr-2 font-mono">
                {{ getDisplayValue(item) }}
              </td>
              <td class="py-1.5 text-right text-[11px] text-gray-400 pr-2 font-mono">-</td>
            </tr>
            <tr class="bg-gray-50 font-bold border-t border-gray-300">
              <td colspan="2" class="py-2 pl-4 text-xs text-gray-800 italic">{{ getTotalAsetTetapName() }}</td>
              <td class="py-2 text-right text-xs text-gray-400 pr-2 font-mono"></td>
              <td class="py-2 text-right text-xs text-blue-700 pr-2 font-mono underline decoration-double">{{
                formatNumber(data.total_aset_tetap) }}</td>
            </tr>

            <!-- Total Aset Footer -->
            <tr class="bg-blue-600 text-white font-bold">
              <td colspan="2" class="py-3 text-center text-sm uppercase tracking-widest">{{ getTotalAsetName() }}</td>
              <td class="py-3 text-right text-sm pr-2 font-mono"></td>
              <td class="py-3 text-right text-sm pr-2 font-mono"> {{ formatNumber(data.total_aset) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Kolom Kanan: LIABILITAS & EKUITAS -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-bold text-emerald-800 mb-3 border-b-2 border-emerald-100 pb-1">LIABILITAS & EKUITAS</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 bg-gray-50">
              <th class="py-2 text-center text-[10px] font-bold text-gray-800 uppercase tracking-widest w-20">Kode</th>
              <th class="py-2 text-left text-[10px] font-bold text-gray-800 uppercase tracking-widest">Nama Perkiraan
              </th>
              <th class="py-2 text-right text-[10px] font-bold text-gray-800 uppercase tracking-widest w-28 pr-2">
                Rincian</th>
              <th class="py-2 text-right text-[10px] font-bold text-gray-800 uppercase tracking-widest w-28 pr-2">Total
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Liabilitas Jangka Pendek -->
            <tr class="bg-emerald-50/50">
              <td colspan="4" class="py-1.5 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider">{{
                getLiabilitasJangkaPendekName() }}</td>
            </tr>
            <tr v-for="item in data.liabilitas_jangka_pendek" :key="item.no_akun"
              class="hover:bg-gray-50 border-b border-gray-100">
              <td class="py-1.5 text-center text-[11px] text-gray-500 font-mono">{{ item.no_akun }}</td>
              <td class="py-1.5 text-[11px] text-gray-700 font-medium pl-2">{{ item.nama_akun }}</td>
              <td class="py-1.5 text-right text-[11px] text-gray-900 font-semibold pr-2 font-mono">
                {{ getDisplayValue(item) }}
              </td>
              <td class="py-1.5 text-right text-[11px] text-gray-400 pr-2 font-mono">-</td>
            </tr>
            <tr class="bg-gray-50 font-bold border-t border-gray-300">
              <td colspan="2" class="py-2 pl-4 text-xs text-gray-800 italic">{{ getTotalLiabilitasJangkaPendekName() }}
              </td>
              <td class="py-2 text-right text-xs text-gray-400 pr-2 font-mono"></td>
              <td class="py-2 text-right text-xs text-emerald-700 pr-2 font-mono underline decoration-double">{{
                formatNumber(data.total_liabilitas_jangka_pendek) }}</td>
            </tr>

            <!-- Ekuitas Section -->
            <tr class="bg-emerald-50/50">
              <td colspan="4"
                class="py-1.5 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider mt-4">{{
                  getEkuitasSectionName() }}</td>
            </tr>
            <tr class="hover:bg-gray-50 border-b border-gray-100">
              <td class="py-1.5 text-center text-[11px] text-gray-500 font-mono">-</td>
              <td class="py-1.5 text-[11px] text-gray-700 font-medium pl-2">{{ getEkuitasPemilikName() }}</td>
              <td class="py-1.5 text-right text-[11px] text-gray-400 pr-2 font-mono"></td>
              <td class="py-1.5 text-right text-[11px] text-gray-900 font-bold pr-2 font-mono">
                {{ formatNumber(data.ekuitas_pemilik) }}
              </td>
            </tr>
            <tr v-if="data.laba_ditahan" class="hover:bg-gray-50 border-b border-gray-100">
              <td class="py-1.5 text-center text-[11px] text-gray-500 font-mono">-</td>
              <td class="py-1.5 text-[11px] text-gray-700 font-medium pl-2">{{ getLabaDitahanName() }}</td>
              <td class="py-1.5 text-right text-[11px] text-gray-400 pr-2 font-mono"></td>
              <td class="py-1.5 text-right text-[11px] text-gray-900 font-bold pr-2 font-mono">
                {{ formatNumber(data.laba_ditahan.total_laba_ditahan_akhir) }}
              </td>
            </tr>

            <!-- Total Liabilitas dan Ekuitas Footer -->
            <tr class="bg-emerald-600 text-white font-bold">
              <td colspan="2" class="py-3 text-center text-sm uppercase tracking-widest">{{
                getTotalLiabilitasDanEkuitasPemilikName() }}</td>
              <td class="py-3 text-right text-sm pr-2 font-mono"></td>
              <td class="py-3 text-right text-sm pr-2 font-mono">{{
                formatNumber(data.total_liabilitas_dan_ekuitas_pemilik) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Balance Indicator (Proactive addition) -->
        <!-- <div class="mt-4 p-3 rounded-lg flex items-center justify-center gap-3 transition-all duration-300"
          :class="Math.abs(data.total_aset - data.total_liabilitas_dan_ekuitas_pemilik) < 0.01 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'">
          <svg v-if="Math.abs(data.total_aset - data.total_liabilitas_dan_ekuitas_pemilik) < 0.01" class="w-5 h-5"
            fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
          <span class="font-bold text-sm">
            {{ Math.abs(data.total_aset - data.total_liabilitas_dan_ekuitas_pemilik) < 0.01 ? 'STATUS: BALANCE'
              : 'STATUS: TIDAK BALANCE' }} </span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../../../services/api.js'
import { useCompanyName } from '../../../composables/useCompanyName.js'

export default {
  name: 'LaporanPosisiKeuangan',
  setup() {
    const selectedYear = ref('2026')
    const data = ref(null)
    const loading = ref(false)
    const error = ref('')
    const { companyName } = useCompanyName()

    // Format number with thousand separator and 2 decimal places, handle negative values
    const formatNumber = (num) => {
      if (num === null || num === undefined || num === '') return '0,00'

      let numericValue
      let isNegative = false

      if (typeof num === 'string') {
        // Handle (123.456) format - with safety check!
        if (num && num.startsWith('(') && num.endsWith(')')) {
          isNegative = true
          numericValue = parseFloat(num.slice(1, -1).replace(/,/g, ''))
        } else {
          numericValue = parseFloat(num.replace(/,/g, ''))
        }
      } else {
        numericValue = num
      }

      if (isNaN(numericValue)) return '0,00'
      if (numericValue < 0) isNegative = true

      const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Math.abs(numericValue)).replace('.', ',')
      return isNegative ? `(${formatted})` : formatted
    }

    // Get display value with proper formatting
    const getDisplayValue = (item) => {
      // Use jumlah_display if available, otherwise use jumlah
      const val = item.jumlah_display || item.jumlah
      return formatNumber(val)
    }

    // Dynamic field name functions for flexibility
    const getAsetSectionName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.aset_section_name || 'ASET'
    }

    const getAsetLancarName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.aset_lancar_name || 'Aset Lancar'
    }

    const getTotalAsetLancarName = () => {
      // Check if API provides dynamic total name, otherwise use default
      return data.value?.total_aset_lancar_name || 'Total Aset Lancar'
    }

    const getAsetTetapName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.aset_tetap_name || 'Aset Tetap'
    }

    const getTotalAsetTetapName = () => {
      // Check if API provides dynamic total name, otherwise use default
      return data.value?.total_aset_tetap_name || 'Total Aset Tetap'
    }

    const getTotalAsetName = () => {
      // Check if API provides dynamic total name, otherwise use default
      return data.value?.total_aset_name || 'Total Aset'
    }

    const getLiabilitasSectionName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.liabilitas_section_name || 'LIABILITAS'
    }

    const getLiabilitasJangkaPendekName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.liabilitas_jangka_pendek_name || 'Liabilitas Jangka Pendek'
    }

    const getTotalLiabilitasJangkaPendekName = () => {
      // Check if API provides dynamic total name, otherwise use default
      return data.value?.total_liabilitas_jangka_pendek_name || 'Total Liabilitas Jangka Pendek'
    }

    const getEkuitasSectionName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.ekuitas_section_name || 'EKUITAS'
    }

    const getEkuitasPemilikName = () => {
      // Check if API provides dynamic section name, otherwise use default
      return data.value?.ekuitas_pemilik_name || 'Ekuitas Pemilik'
    }

    const getLabaDitahanName = () => {
      return data.value?.laba_ditahan_name || 'Laba Ditahan'
    }

    const getTotalLiabilitasDanEkuitasPemilikName = () => {
      // Check if API provides dynamic total name, otherwise use default
      return data.value?.total_liabilitas_dan_ekuitas_pemilik_name || 'Total Liabilitas dan Ekuitas Pemilik'
    }

    // Load data from API
    const loadData = async () => {
      loading.value = true
      error.value = ''

      try {
        console.log(`Loading Laporan Posisi Keuangan for year: ${selectedYear.value}`)

        const result = await api.getLaporanPosisiKeuangan(selectedYear.value)
        console.log('Laporan Posisi Keuangan API Response:', result)

        if (result.success && result.data) {
          data.value = result.data
          console.log('Laporan Posisi Keuangan data loaded successfully:', data.value)
        } else {
          // Handle API error message
          let displayMessage = result.message || 'Failed to load laporan posisi keuangan data'
          if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
            displayMessage = 'Laporan posisi keuangan belum tersedia untuk periode ini'
          }
          console.log('API Response Error:', displayMessage)
          error.value = displayMessage
        }
      } catch (err) {
        console.error('Error loading laporan posisi keuangan:', err)
        let displayMessage = err.message || String(err)
        if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
          displayMessage = 'Laporan posisi keuangan belum tersedia untuk periode ini'
        } else {
          displayMessage = 'Terjadi kesalahan saat memuat data'
        }
        error.value = displayMessage
      } finally {
        loading.value = false
      }
    }

    // Delete laporan functionality
    const deleteLaporan = async () => {
      if (loading.value) return

      if (!confirm(`Apakah Anda yakin ingin menghapus Laporan Posisi Keuangan untuk tahun ${selectedYear.value}?`)) {
        return
      }

      loading.value = true
      error.value = ''

      try {
        console.log(`Deleting Laporan Posisi Keuangan for year: ${selectedYear.value}`)

        const response = await fetch(`https://api.coopdevs.com/api/ap/deleteLaporanPosisiKeuangan?tahun=${selectedYear.value}`, {
          method: 'DELETE'
        })

        const result = await response.json()
        console.log('Delete API Response:', result)

        if (result.success) {
          // Clear data after successful delete
          data.value = null

          // Show success message from backend
          alert(result.message || 'Laporan Posisi Keuangan berhasil dihapus')
          console.log('Laporan Posisi Keuangan deleted successfully')
        } else {
          // Show error message from backend
          alert(result.message || 'Gagal menghapus Laporan Posisi Keuangan')
          console.log('Delete failed:', result.message)
        }
      } catch (err) {
        console.error('Error deleting laporan posisi keuangan:', err)
        alert('Terjadi kesalahan saat menghapus laporan: ' + (err.message || err))
      } finally {
        loading.value = false
      }
    }

    // Export to PDF
    const exportToPDF = () => {
      if (!data.value) return

      const printWindow = window.open('', '_blank')

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Posisi Keuangan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h2 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }
            .header h1 {
              margin: 5px 0 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
              background-color: #fff;
              border: 1px solid #ddd;
              padding: 16px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 12px;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
            }
            .section-header {
              background-color: #e0e0e0;
              font-weight: bold;
              text-align: center;
            }
            .subsection-header {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .total-row {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .grand-total {
              background-color: #e8e8e8;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .pl-16 {
              padding-left: 64px;
            }
            .pr-4 {
              padding-right: 16px;
            }
            .icon {
              margin-right: 4px;
            }
            .red {
              color: #dc2626;
            }
            .green {
              color: #16a34a;
            }
            .laba-section {
              margin-top: 20px;
            }
            .laba-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            .laba-grid {
              display: flex;
              gap: 20px;
            }
            .laba-column {
              flex: 1;
            }
            @media print {
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyName.value}</h2>
            <h1>Laporan Posisi Keuangan</h1>
            <p>Periode: ${selectedYear.value}</p>
          </div>
          
          <!-- Bagian ASET -->
          <div class="section">
            <div class="section-title">ASET</div>
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Perkiraan</th>
                  <th class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr class="subsection-header">
                  <td colspan="3">Aset Lancar</td>
                </tr>
                ${data.value.aset_lancar.map(item => `
                  <tr>
                    <td class="text-center pl-16">${item.no_akun}</td>
                    <td class="pl-16">${item.nama_akun}</td>
                    <td class="text-right pr-4">${item.jumlah_display ? formatNumber(item.jumlah_display, true) : formatNumber(item.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-center">Total Aset Lancar</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.total_aset_lancar)}</td>
                </tr>
                
                <tr class="subsection-header">
                  <td colspan="3">Aset Tetap</td>
                </tr>
                ${data.value.aset_tetap.map(item => `
                  <tr>
                    <td class="text-center pl-16">${item.no_akun}</td>
                    <td class="pl-16">${item.nama_akun}</td>
                    <td class="text-right pr-4">${item.jumlah_display ? formatNumber(item.jumlah_display, true) : formatNumber(item.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-center">Total Aset Tetap</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.total_aset_tetap)}</td>
                </tr>
                
                <tr class="grand-total">
                  <td colspan="2" class="text-center">Total Aset</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.total_aset)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Bagian LIABILITAS & EKUITAS -->
          <div class="section">
            <div class="section-title">LIABILITAS & EKUITAS</div>
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Perkiraan</th>
                  <th class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr class="subsection-header">
                  <td colspan="3">Liabilitas Jangka Pendek</td>
                </tr>
                ${data.value.liabilitas_jangka_pendek.map(item => `
                  <tr>
                    <td class="text-center pl-16">${item.no_akun}</td>
                    <td class="pl-16">${item.nama_akun}</td>
                    <td class="text-right pr-4">${item.jumlah_display ? formatNumber(item.jumlah_display, true) : formatNumber(item.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-center">Total Liabilitas Jangka Pendek</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.total_liabilitas_jangka_pendek)}</td>
                </tr>
                
                <tr class="subsection-header">
                  <td colspan="3">Ekuitas</td>
                </tr>
                <tr>
                  <td colspan="2" class="text-center">Ekuitas Pemilik</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.ekuitas_pemilik)}</td>
                </tr>
                ${data.value.laba_ditahan ? `
                <tr>
                  <td colspan="2" class="text-center">${data.value.laba_ditahan_name || 'Laba Ditahan'}</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.laba_ditahan.total_laba_ditahan_akhir)}</td>
                </tr>
                ` : ''}
                
                <tr class="grand-total">
                  <td colspan="2" class="text-center">Total Liabilitas dan Ekuitas Pemilik</td>
                  <td class="text-right pr-4 pl-16">${formatNumber(data.value.total_liabilitas_dan_ekuitas_pemilik)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </p>
        </body>
        </html>
      `

      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }

    onMounted(() => {
      loadData()
    })

    return {
      selectedYear,
      data,
      loading,
      error,
      formatNumber,
      getDisplayValue,
      loadData,
      exportToPDF,
      companyName,
      // Dynamic field name functions
      getAsetSectionName,
      getAsetLancarName,
      getTotalAsetLancarName,
      getAsetTetapName,
      getTotalAsetTetapName,
      getTotalAsetName,
      getLiabilitasSectionName,
      getLiabilitasJangkaPendekName,
      getTotalLiabilitasJangkaPendekName,
      getEkuitasSectionName,
      getEkuitasPemilikName,
      getLabaDitahanName,
      getTotalLiabilitasDanEkuitasPemilikName,
      deleteLaporan
    }
  }
}
</script>
