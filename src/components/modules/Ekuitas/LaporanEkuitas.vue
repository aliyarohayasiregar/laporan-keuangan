<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Laporan Ekuitas</h1>
      <p class="text-gray-600">Laporan perubahan ekuitas pemilik</p>
    </div>

    <!-- Controls -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select v-model="selectedYear"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button @click="loadData" :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            <span v-if="loading">Loading...</span>
            <span v-else>Tampilkan Data</span>
          </button>
          <button @click="exportToPDF" :disabled="loading || !data"
            class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            Export PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="data && !loading && getFieldConfig().length > 0" class="space-y-6">
      <!-- Main Content - Table Format -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Report Header -->
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold text-gray-800 mb-2">LAPORAN EKUITAS</h1>
          <p class="text-sm text-gray-600">Periode: {{ selectedYear }}</p>
        </div>

        <!-- Table (3 columns: label, rincian, total) -->
        <table class="w-full border-collapse">
          <colgroup>
            <col style="width: 45%">
            <col style="width: 27.5%">
            <col style="width: 27.5%">
          </colgroup>
          <tbody>

            <!-- Ekuitas Awal -->
            <tr class="border-b border-gray-100">
              <td class="py-3 px-4 font-bold text-gray-800">Ekuitas Awal</td>
              <td class="py-3 px-4 text-right"></td>
              <td class="py-3 px-4 text-right font-mono font-bold text-gray-900">
                {{ formatNumber(data.ekuitas_awal) }}
              </td>
            </tr>

            <!-- Section: Kenaikan -->
            <tr>
              <td class="py-2 px-4 font-medium text-gray-800 pt-4" colspan="3">Kenaikan :</td>
            </tr>

            <!-- Tambahan Ekuitas -->
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 pl-8 text-gray-700">Tambahan Ekuitas Selama Tahun Berjalan</td>
              <td class="py-3 px-4 text-right font-mono text-blue-700">
                {{ formatNumber(data.tambahan_ekuitas_selama_tahun_berjalan) }}
              </td>
              <td class="py-3 px-4"></td>
            </tr>

            <!-- Laba Neto -->
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 pl-8 text-gray-700">Laba Neto Tahun Berjalan</td>
              <td class="py-3 px-4 text-right font-mono text-blue-700">
                + {{ formatNumber(data.laba_neto_tahun_berjalan) }}
              </td>
              <td class="py-3 px-4"></td>
            </tr>

            <!-- Total Kenaikan - di kolom rincian, dengan garis bawah -->
            <tr class="bg-gray-100/80 border-t border-gray-300">
              <td class="py-3 px-4 pl-8 font-bold italic uppercase text-gray-800">Total Kenaikan</td>
              <td class="py-3 px-4 text-right font-mono font-bold text-blue-700" style="border-bottom: 1px solid #374151;">
                {{ formatNumber(data.total_kenaikan) }}
              </td>
              <td class="py-3 px-4"></td>
            </tr>

            <!-- Section: Penurunan -->
            <tr>
              <td class="py-2 px-4 font-medium text-gray-800 pt-4" colspan="3">Penurunan</td>
            </tr>

            <!-- Penarikan Pribadi Prive -->
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 pl-8 text-gray-700">Penarikan Pribadi Prive</td>
              <td class="py-3 px-4 text-right font-mono text-red-600">
                - {{ formatNumber(data.penarikan_pribadi_prive) }}
              </td>
              <td class="py-3 px-4"></td>
            </tr>

            <!-- Kenaikan Ekuitas Pemilik - di kolom TOTAL (kanan), dengan garis bawah -->
            <tr class="bg-gray-100/80 border-t border-gray-300">
              <td class="py-3 px-4 font-bold italic uppercase text-gray-800">Kenaikan Ekuitas Pemilik</td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4 text-right font-mono font-bold text-blue-700" style="border-bottom: 1px solid #374151;">
                + {{ formatNumber(data.kenaikan_ekuitas_pemilik) }}
              </td>
            </tr>

            <!-- Ekuitas Akhir -->
            <tr class="bg-blue-600 text-white font-bold">
              <td class="py-3 px-4 uppercase tracking-widest text-sm">Ekuitas Akhir</td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4 text-right font-mono" style="border-bottom: 3px double #fff;">
                {{ formatNumber(data.ekuitas_akhir) }}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Memuat data...</p>
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
    <div v-if="!loading && !error && (!data || getFieldConfig().length === 0)" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
        </path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan ekuitas belum tersedia untuk periode ini</h3>
      <p class="text-gray-500">Pilih tahun dan klik "Tampilkan Data" untuk melihat laporan ekuitas</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../../../services/api.js'

export default {
  name: 'LaporanEkuitas',
  setup() {
    const selectedYear = ref('2026')
    const data = ref(null)
    const loading = ref(false)
    const error = ref('')

    const formatNumber = (num) => {
      if (num === null || num === undefined || num === '') return '0,00'
      const numericValue = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num
      if (isNaN(numericValue)) return '0,00'
      return new Intl.NumberFormat('id-ID').format(numericValue) + ',00'
    }

    const fieldToLabel = (fieldName) => {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const getFieldConfig = () => {
      if (!data.value) return []
      const fieldOrder = [
        'ekuitas_awal',
        'tambahan_ekuitas_selama_tahun_berjalan',
        'laba_neto_tahun_berjalan',
        'total_kenaikan',
        'penarikan_pribadi_prive',
        'kenaikan_ekuitas_pemilik',
        'ekuitas_akhir'
      ]
      return fieldOrder.filter(f => data.value[f] !== undefined)
    }

    const loadData = async () => {
      loading.value = true
      error.value = ''
      try {
        const result = await api.getLaporanEquitas(selectedYear.value)
        if (result.success && result.data) {
          data.value = result.data
        } else {
          let displayMessage = result.message || 'Failed to load laporan ekuitas data'
          if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
            displayMessage = 'Laporan ekuitas belum tersedia untuk periode ini'
          }
          error.value = displayMessage
        }
      } catch (err) {
        let displayMessage = err.message || String(err)
        if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
          displayMessage = 'Laporan ekuitas belum tersedia untuk periode ini'
        } else {
          displayMessage = 'Terjadi kesalahan saat memuat data'
        }
        error.value = displayMessage
      } finally {
        loading.value = false
      }
    }

    const exportToPDF = () => {
      if (!data.value) return
      const printWindow = window.open('', '_blank')
      const htmlContent = generatePDFHTML()
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }

    const generatePDFHTML = () => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Ekuitas - ${selectedYear.value}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { text-align: center; margin-bottom: 5px; color: #000; }
            .subtitle { text-align: center; margin-bottom: 25px; color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            col.col-label { width: 45%; }
            col.col-rincian { width: 27.5%; }
            col.col-total { width: 27.5%; }
            td { padding: 8px 12px; vertical-align: middle; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: 'Courier New', Courier, monospace; }
            .section-header { font-weight: bold; padding-top: 14px; }
            .indent { padding-left: 24px; }
            .bg-gray { background-color: #f1f5f9; border-top: 1px solid #9ca3af; }
            .bg-blue-final { background-color: #2563eb; color: white; }
            .italic { font-style: italic; }
            .text-blue { color: #1d4ed8; }
            .text-red { color: #dc2626; }
            .border-bottom-single { border-bottom: 1px solid #374151; }
            .border-bottom-double { border-bottom: 3px double #374151; }
          </style>
        </head>
        <body>
          <h1>LAPORAN EKUITAS</h1>
          <p class="subtitle">Periode: ${selectedYear.value}</p>
          <table>
            <colgroup>
              <col class="col-label">
              <col class="col-rincian">
              <col class="col-total">
            </colgroup>
            <tbody>
              <tr>
                <td class="font-bold">Ekuitas Awal</td>
                <td></td>
                <td class="text-right font-mono font-bold">${formatNumber(data.value.ekuitas_awal)}</td>
              </tr>
              <tr>
                <td class="section-header" colspan="3">Kenaikan :</td>
              </tr>
              <tr>
                <td class="indent">Tambahan Ekuitas Selama Tahun Berjalan</td>
                <td class="text-right font-mono text-blue">${formatNumber(data.value.tambahan_ekuitas_selama_tahun_berjalan)}</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Laba Neto Tahun Berjalan</td>
                <td class="text-right font-mono text-blue">+ ${formatNumber(data.value.laba_neto_tahun_berjalan)}</td>
                <td></td>
              </tr>
              <tr class="bg-gray">
                <td class="indent italic font-bold" style="text-transform:uppercase;">Total Kenaikan</td>
                <td class="text-right font-mono font-bold text-blue border-bottom-single">${formatNumber(data.value.total_kenaikan)}</td>
                <td></td>
              </tr>
              <tr>
                <td class="section-header" colspan="3">Penurunan</td>
              </tr>
              <tr>
                <td class="indent">Penarikan Pribadi Prive</td>
                <td class="text-right font-mono text-red">- ${formatNumber(data.value.penarikan_pribadi_prive)}</td>
                <td></td>
              </tr>
              <tr class="bg-gray">
                <td class="italic font-bold" style="text-transform:uppercase;">Kenaikan Ekuitas Pemilik</td>
                <td></td>
                <td class="text-right font-mono font-bold text-blue border-bottom-single">+ ${formatNumber(data.value.kenaikan_ekuitas_pemilik)}</td>
              </tr>
              <tr class="bg-blue-final">
                <td style="text-transform:uppercase; letter-spacing:0.05em; font-size:13px; font-weight:bold;">Ekuitas Akhir</td>
                <td></td>
                <td class="text-right font-mono font-bold border-bottom-double" style="color:white; border-bottom-color:white;">${formatNumber(data.value.ekuitas_akhir)}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: right;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </p>
        </body>
        </html>
      `
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
      fieldToLabel,
      getFieldConfig,
      loadData,
      exportToPDF
    }
  }
}
</script>