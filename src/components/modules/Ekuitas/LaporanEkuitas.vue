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
          <!-- <button @click="deleteLaporan" :disabled="loading"
            class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            Delete Laporan
          </button> -->
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

        <!-- Table -->
        <table class="w-full border-collapse table-fixed">
          <thead>
            <tr class="border-b-2 border-gray-300 bg-gray-50">
              <th class="py-2 px-6 text-left text-sm font-bold text-gray-800">Nama Perkiraan</th>
              <th class="py-2 px-6 text-right text-sm font-bold text-gray-800 w-56">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <!-- Ekuitas Section -->
            <tr class="bg-blue-50/50">
              <td colspan="2" class="py-2 text-center text-sm font-bold text-blue-800 uppercase tracking-wider">EKUITAS
              </td>
            </tr>

            <!-- Dynamic Fields -->
            <template v-for="field in getFieldConfig()" :key="field.key">
              <tr v-if="field.key !== 'ekuitas_akhir'" :class="{
                'hover:bg-gray-50 border-b border-gray-50': !field.isMainItem && !field.isTotal,
                'bg-gray-100/80 font-bold border-t border-gray-300': field.isTotal,
              }">
                <!-- Label Column -->
                <td class="py-2 px-6" :colspan="(field.isTotal || field.key === 'ekuitas_awal') ? 1 : 2">
                  <div class="relative flex items-center w-full">
                    <div class="text-sm" :class="{
                      'font-medium text-gray-700': !field.isTotal && !field.isMainItem,
                      'italic uppercase text-gray-800': field.isTotal,
                      'text-gray-800 font-bold': field.key === 'ekuitas_awal',
                      'flex-1': field.isTotal || field.key === 'ekuitas_awal'
                    }">
                      {{ field.label }}
                    </div>

                    <!-- Detail Value (Centered/Rincian) for non-total items -->
                    <div v-if="!field.isTotal && field.key !== 'ekuitas_awal'"
                      class="absolute left-1/2 -translate-x-1/2 text-sm font-mono font-bold" :class="{
                        'text-red-600': field.showMinus,
                        'text-blue-700': !field.showMinus
                      }">
                      <span v-if="field.showPlus">+ </span>
                      <span v-if="field.showMinus">- </span>
                      {{ formatNumber(field.value) }}
                    </div>
                  </div>
                </td>

                <!-- Total Value Column (For Total items and Ekuitas Awal) -->
                <td v-if="field.isTotal || field.key === 'ekuitas_awal'" class="py-2 px-6">
                  <div class="text-right text-sm font-mono font-bold" :class="{
                    'text-gray-900': field.key === 'ekuitas_awal',
                    'text-blue-700': field.key === 'total_kenaikan',
                    'text-red-600': field.key === 'kenaikan_ekuitas_pemilik'
                  }">
                    <span v-if="field.showPlus">+ </span>
                    <span v-if="field.showMinus">- </span>
                    {{ formatNumber(field.value) }}
                  </div>
                </td>
              </tr>

              <!-- Special case for Ekuitas Akhir -->
              <tr v-else class="bg-blue-600 text-white font-bold">
                <td colspan="2" class="py-3 px-6">
                  <div class="flex items-center justify-between">
                    <span class="uppercase tracking-widest text-sm flex-1 text-center">{{ field.label }}</span>
                    <div class="text-right text-base font-mono w-56">
                      {{ formatNumber(field.value) }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Keterangan -->
            <tr v-if="data.keterangan" class="hover:bg-gray-50">
              <td colspan="2" class="py-4 text-center text-xs text-gray-500 italic uppercase tracking-tighter">
                {{ data.keterangan }}
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

    // Format number with thousand separator and ,00 suffix
    const formatNumber = (num) => {
      if (num === null || num === undefined || num === '') return '0,00'
      const numericValue = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num
      if (isNaN(numericValue)) return '0,00'
      return new Intl.NumberFormat('id-ID').format(numericValue) + ',00'
    }

    // Convert field name to readable label
    const fieldToLabel = (fieldName) => {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    // Get field configuration for display
    const getFieldConfig = () => {
      if (!data.value) return []

      const fields = []
      const fieldOrder = [
        'ekuitas_awal',
        'tambahan_ekuitas_selama_tahun_berjalan',
        'laba_neto_tahun_berjalan',
        'total_kenaikan',
        'penarikan_pribadi_prive',
        'kenaikan_ekuitas_pemilik',
        'ekuitas_akhir'
      ]

      fieldOrder.forEach((fieldName, index) => {
        if (data.value[fieldName] !== undefined) {
          fields.push({
            key: fieldName,
            label: fieldToLabel(fieldName),
            value: data.value[fieldName],
            order: index + 1,
            isMainItem: fieldName === 'ekuitas_awal' || fieldName === 'ekuitas_akhir',
            isTotal: fieldName === 'total_kenaikan' || fieldName === 'kenaikan_ekuitas_pemilik',
            showPlus: fieldName === 'laba_neto_tahun_berjalan' || fieldName === 'total_kenaikan' || fieldName === 'kenaikan_ekuitas_pemilik',
            showMinus: fieldName === 'penarikan_pribadi_prive'
          })
        }
      })

      return fields
    }

    // Load data from API
    const loadData = async () => {
      loading.value = true
      error.value = ''

      try {
        console.log(`Loading Laporan Ekuitas for year: ${selectedYear.value}`)

        const result = await api.getLaporanEquitas(selectedYear.value)
        console.log('Laporan Ekuitas API Response:', result)

        if (result.success && result.data) {
          data.value = result.data
          console.log('Laporan Ekuitas data loaded successfully:', data.value)
        } else {
          // Handle API error message
          let displayMessage = result.message || 'Failed to load laporan ekuitas data'
          if (displayMessage.includes('404') || displayMessage.toLowerCase().includes('belum tersedia')) {
            displayMessage = 'Laporan ekuitas belum tersedia untuk periode ini'
          }
          console.log('API Response Error:', displayMessage)
          error.value = displayMessage
        }
      } catch (err) {
        console.error('Error loading laporan ekuitas:', err)
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

    // Delete laporan functionality
    const deleteLaporan = async () => {
      if (loading.value) return

      if (!confirm(`Apakah Anda yakin ingin menghapus Laporan Ekuitas untuk tahun ${selectedYear.value}?`)) {
        return
      }

      loading.value = true
      error.value = ''

      try {
        console.log(`Deleting Laporan Ekuitas for year: ${selectedYear.value}`)

        const response = await fetch(`http://139.162.41.197:8001/api/ap/deleteLaporanEquitas?tahun=${selectedYear.value}`, {
          method: 'DELETE'
        })

        const result = await response.json()
        console.log('Delete API Response:', result)

        if (result.success) {
          // Clear data after successful delete
          data.value = null

          // Show success message from backend
          alert(result.message || 'Laporan Ekuitas berhasil dihapus')
          console.log('Laporan Ekuitas deleted successfully')
        } else {
          // Show error message from backend
          alert(result.message || 'Gagal menghapus Laporan Ekuitas')
          console.log('Delete failed:', result.message)
        }
      } catch (err) {
        console.error('Error deleting laporan ekuitas:', err)
        alert('Terjadi kesalahan saat menghapus laporan: ' + (err.message || err))
      } finally {
        loading.value = false
      }
    }

    // Export to PDF
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

    // Generate HTML for PDF
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
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; vertical-align: middle; }
            th { background-color: #f8fafc; font-weight: bold; font-size: 13px; text-transform: uppercase; }
            .col-nama { width: 65%; }
            .col-jumlah { width: 35%; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bg-blue-light { background-color: #eff6ff; }
            .bg-gray-light { background-color: #f1f5f9; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: 'Courier New', Courier, monospace; }
            .detail-container { position: relative; width: 100%; display: flex; align-items: center; }
            .detail-label { flex: 1; }
            .detail-value { position: absolute; left: 50%; transform: translateX(-50%); font-weight: bold; }
            .ekuitas-akhir-row { background-color: #2563eb; color: white !important; }
            .ekuitas-akhir-row td { border-color: #1e40af; color: white !important; }
            .italic { font-style: italic; }
          </style>
        </head>
        <body>
          <h1>LAPORAN EKUITAS</h1>
          <p class="subtitle">Periode: ${selectedYear.value}</p>
          
          <table>
            <thead>
              <tr>
                <th class="col-nama">Nama Perkiraan</th>
                <th class="col-jumlah text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr class="bg-blue-light">
                <td colspan="2" class="text-center font-bold" style="letter-spacing: 2px;">EKUITAS</td>
              </tr>
              ${getFieldConfig().map(field => {
        const isTotal = field.isTotal || field.key === 'ekuitas_akhir' || field.key === 'ekuitas_awal';
        const isEkuitasAkhir = field.key === 'ekuitas_akhir';
        const rowClass = isEkuitasAkhir ? 'ekuitas-akhir-row' : (field.isTotal ? 'bg-gray-light font-bold' : '');

        if (isTotal) {
          return `
                    <tr class="${rowClass}">
                      <td class="${isEkuitasAkhir ? 'text-center' : ''}" style="${field.key === 'ekuitas_awal' ? 'font-bold' : ''}">
                        ${isEkuitasAkhir ? `<span style="letter-spacing: 3px; text-transform: uppercase;">${field.label}</span>` : field.label}
                      </td>
                      <td class="text-right font-mono" style="${field.key === 'ekuitas_awal' ? 'font-weight: bold; color: #000;' : ''}">
                        ${field.showPlus ? '+ ' : ''}${field.showMinus ? '- ' : ''}${formatNumber(data.value[field.key])}
                      </td>
                    </tr>
                  `;
        } else {
          return `
                    <tr class="${rowClass}">
                      <td colspan="2">
                        <div class="detail-container">
                          <span class="detail-label ${field.key === 'ekuitas_awal' ? 'font-bold' : ''}">${field.label}</span>
                          <span class="detail-value font-mono">
                            ${field.showPlus ? '+ ' : ''}${field.showMinus ? '- ' : ''}${formatNumber(data.value[field.key])}
                          </span>
                        </div>
                      </td>
                    </tr>
                  `;
        }
      }).join('')}
              ${data.value.keterangan ? `
              <tr>
                <td colspan="2" class="text-center italic" style="font-size: 11px; color: #666; padding: 15px;">${data.value.keterangan}</td>
              </tr>` : ''}
            </tbody>
          </table>
          
          <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: right;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </p>
        </body>
        </html>
      `
    }

    // Load data on component mount
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
      exportToPDF,
      deleteLaporan
    }
  }
}
</script>
