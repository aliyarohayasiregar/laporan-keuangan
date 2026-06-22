<template>
  <div class="bg-white rounded-lg shadow-md border-2 border-blue-500">
    <div class="px-6 py-4 border-b border-gray-200 bg-blue-50">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Detail Kartu Stok</h3>
          <p class="text-sm text-gray-600 mt-1">{{ item.nama_barang }} ({{ item.kode_barang }})</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Filter Controls -->
      <div class="bg-gray-50 rounded-lg p-2 sm:p-4 mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-wrap sm:flex-row gap-2 sm:gap-4 items-end">
          <div class="w-full sm:w-auto">
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bulan</label>
            <select v-model="bulan" @change="loadDetails"
              class="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div class="w-full sm:w-auto">
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tahun</label>
            <input v-model="tahun" @change="loadDetails" type="number" min="2020" max="2030"
              class="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <div class="flex-1">
            <p class="text-sm text-gray-600">
              Menampilkan transaksi: {{ getMonthName(bulan) }} {{ tahun }}
            </p>
          </div>
        </div>
      </div>

      <!-- Summary Info -->
      <!-- <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Masuk</p>
          <p class="text-xl font-bold text-green-600">{{ formatNumber(item.total_masuk) }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Keluar</p>
          <p class="text-xl font-bold text-red-600">{{ formatNumber(item.total_keluar) }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">Sisa Stok</p>
          <p class="text-xl font-bold text-blue-600">{{ formatNumber(item.sisa_stok) }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">Nilai Persediaan</p>
          <p class="text-xl font-bold text-gray-900">Rp {{ formatNumber(item.nilai_persediaan_akhir) }}</p>
        </div>
      </div> -->

      <!-- Add New Detail Button -->
      <div class="mb-2 sm:mb-4 flex flex-col sm:flex-row gap-2">
        <button @click="showAddForm = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span class="hidden sm:inline">Tambah Transaksi</span>
          <span class="sm:hidden">Tambah</span>
        </button>
        <button @click="exportToPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <span class="hidden sm:inline">Export PDF</span>
          <span class="sm:hidden">PDF</span>
        </button>
        <button @click="exportToExcel"
          class="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <span class="hidden sm:inline">Export Excel</span>
          <span class="sm:hidden">Excel</span>
        </button>
      </div>

      <!-- Detail Table -->
      <div class="w-full overflow-x-auto max-h-96">
        <table class="w-full divide-y divide-gray-200 table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th rowspan="2"
                class="w-10 px-1 sm:px-2 py-1 sm:py-2 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                No</th>
              <th rowspan="2"
                class="w-24 sm:w-32 px-1 sm:px-2 py-1 sm:py-2 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Tanggal</th>
              <th rowspan="2"
                class="w-20 sm:w-24 px-1 sm:px-2 py-1 sm:py-2 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                No. Do</th>
              <th colspan="3"
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 text-center text-xs sm:text-xs font-medium text-green-600 uppercase tracking-wider"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">Masuk</th>
              <th colspan="3"
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 text-center text-xs sm:text-xs font-medium text-red-600 uppercase tracking-wider"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">Keluar</th>
              <th colspan="3"
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 text-center text-xs sm:text-xs font-medium text-blue-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">Saldo</th>
              <!-- <th rowspan="2" class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Aksi</th> -->
            </tr>
            <tr>
              <!-- <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Masuk</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Harga</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">
                Quantity </th> -->
              <!-- <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Keluar</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Harga</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">
                Quantity </th> -->
              <!-- <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Saldo</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Harga</th>
              <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                Quantity </th> -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="px-6 py-8" style="border: 1px solid #374151;">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p class="text-gray-500 mt-2">Memuat data...</p>
              </td>
            </tr>
            <tr v-else-if="details.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500" style="border: 1px solid #374151;">
                Belum ada transaksi
              </td>
            </tr>
            <tr v-for="detail in details" :key="detail.kartu_stok_detail_id">
              <td class="w-10 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                style="border: 1px solid #374151;">
                {{ detail.no }}
              </td>
              <td class="w-24 sm:w-32 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                style="border: 1px solid #374151;">
                {{ formatDate(detail.Tanggal) }}
              </td>
              <td class="w-20 sm:w-24 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                style="border: 1px solid #374151;">
                {{ detail.nomor_bukti }}
              </td>
              <td
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-green-600 font-medium text-center"
                style="border: 2px solid #374151; border-right: 2px solid #374151; background-color: #f0fdf4;"
                colspan="3">
                {{ detail.penambahan_banyak > 0 ? formatNumber(detail.penambahan_banyak) : (detail.penambahan_banyak ===
                  0 ? '0' : '-') }}
              </td>
              <!-- <td class="px-2 py-2 whitespace-nowrap text-sm text-green-600" style="border: 1px solid #374151;">
                {{ detail.penambahan_harga_pokok_per_unit > 0 ? formatNumber(detail.penambahan_harga_pokok_per_unit) :
                  '-' }}
              </td>
              <td class="px-2 py-2 whitespace-nowrap text-sm text-green-600 font-medium"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">
                {{ detail.penambahan_jumlah > 0 ? formatNumber(detail.penambahan_jumlah) : '-' }}
              </td> -->
              <td
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium text-center"
                style="border: 2px solid #374151; border-right: 2px solid #374151; background-color: #fef2f2;"
                colspan="3">
                {{ detail.pengurangan_banyak > 0 ? formatNumber(detail.pengurangan_banyak) : '-' }}
              </td>
              <!-- <td class="px-2 py-2 whitespace-nowrap text-sm text-red-600" style="border: 1px solid #374151;">
                {{ detail.pengurangan_harga_pokok_per_unit > 0 ? formatNumber(detail.pengurangan_harga_pokok_per_unit) :
                  '-' }}
              </td>
              <td class="px-2 py-2 whitespace-nowrap text-sm text-red-600 font-medium"
                style="border: 1px solid #374151; border-right: 2px solid #374151;">
                {{ detail.pengurangan_jumlah > 0 ? formatNumber(detail.pengurangan_jumlah) : '-' }}
              </td> -->
              <td
                class="w-1/4 px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium text-center"
                style="border: 2px solid #374151; background-color: #f8fafc;" colspan="3">
                {{ formatNumber(detail.saldo_banyak) }}
              </td>
              <!-- <td class="px-2 py-2 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                {{ formatNumber(detail.saldo_harga_pokok_per_unit) }}
              </td>
              <td class="px-2 py-2 whitespace-nowrap text-sm text-gray-900 font-medium"
                style="border: 1px solid #374151;">
                {{ formatNumber(detail.saldo_jumlah) }}
              </td> -->
              <!-- <td class="px-2 py-2 whitespace-nowrap text-sm" style="border: 1px solid #374151;">
                <button @click="editDetail(detail)" class="text-blue-600 hover:text-blue-900 mr-3">
                  Edit
                </button>
                <button @click="deleteDetail(detail)" class="text-red-600 hover:text-red-900">
                  Hapus
                </button>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Form Modal -->
    <FormDetailStok v-if="showAddForm || editingDetailItem" :show-modal="showAddForm || !!editingDetailItem"
      :edit-item="editingDetailItem" :kartu-stok-id="item.id" @close="closeDetailForm" @save="saveDetailForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import kartuStokAPI from '../../../services/api.js'
import FormDetailStok from './FormDetailStok.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const details = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const editingDetailItem = ref(null)

// Filter state
const bulan = ref('01')
const tahun = ref(new Date().getFullYear().toString())

const getMonthName = (monthNumber) => {
  const months = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember'
  }
  return months[monthNumber] || monthNumber
}

const loadDetails = async () => {
  loading.value = true
  try {
    const response = await kartuStokAPI.getAllKartuStokDetail(
      bulan.value,
      tahun.value,
      props.item.id
    )

    // Use the response data directly (API already filters by id_kartu_stok)
    details.value = response.data || []
  } catch (error) {
    console.error('Error loading details:', error)
    details.value = []
  } finally {
    loading.value = false
  }
}

const editDetail = (detail) => {
  editingDetailItem.value = detail
}

const deleteDetail = async (detail) => {
  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ini?`)) {
    try {
      await kartuStokAPI.deleteKartuStokDetail(detail.kartu_stok_detail_id)
      await loadDetails()
    } catch (error) {
      console.error('Error deleting detail:', error)
    }
  }
}

const saveDetailForm = async (formData) => {
  try {
    if (editingDetailItem.value) {
      await kartuStokAPI.editKartuStokDetail(editingDetailItem.value.kartu_stok_detail_id, formData)
    } else {
      await kartuStokAPI.createKartuStokDetail(formData)
    }
    await loadDetails()
    closeDetailForm()
  } catch (error) {
    console.error('Error saving detail:', error)
  }
}

const closeDetailForm = () => {
  showAddForm.value = false
  editingDetailItem.value = null
}

const formatNumber = (num) => {
  return num.toLocaleString('id-ID')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID')
}

const exportToPDF = () => {
  if (details.value.length === 0) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  // Create content for PDF
  let content = `
    <html>
      <head>
        <title>Kartu Stok Detail - ${props.item.nama_barang}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #374151; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .text-center { text-align: center; }
          .text-green { color: #059669; }
          .text-red { color: #dc2626; }
          .text-blue { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>KARTU STOK DETAIL</h2>
          <h3>${props.item.nama_barang}</h3>
          <p>Kode: ${props.item.kode_barang}</p>
          <p>Periode: ${getMonthName(bulan.value)} ${tahun.value}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th rowspan="2">No</th>
              <th rowspan="2">Tanggal</th>
              <th rowspan="2">No. Voucher</th>
              <th colspan="3" class="text-center text-green">Penambahan</th>
              <th colspan="3" class="text-center text-red">Pengurangan</th>
              <th colspan="3" class="text-center text-blue">Saldo</th>
            </tr>
            <tr>
              <th class="text-center">Masuk</th>
              <th class="text-center">Harga</th>
              <th class="text-center">Quantity </th>
              <th class="text-center">Keluar</th>
              <th class="text-center">Harga</th>
              <th class="text-center">Quantity </th>
              <th class="text-center">Saldo</th>
              <th class="text-center">Harga</th>
              <th class="text-center">Quantity </th>
            </tr>
          </thead>
          <tbody>
            ${details.value.map(detail => `
              <tr>
                <td>${detail.no}</td>
                <td>${formatDate(detail.Tanggal)}</td>
                <td>${detail.nomor_bukti}</td>
                <td class="text-green">${detail.penambahan_banyak > 0 ? formatNumber(detail.penambahan_banyak) : '-'}</td>
                <td class="text-green">${detail.penambahan_harga_pokok_per_unit > 0 ? formatNumber(detail.penambahan_harga_pokok_per_unit) : '-'}</td>
                <td class="text-green">${detail.penambahan_jumlah > 0 ? formatNumber(detail.penambahan_jumlah) : '-'}</td>
                <td class="text-red">${detail.pengurangan_banyak > 0 ? formatNumber(detail.pengurangan_banyak) : '-'}</td>
                <td class="text-red">${detail.pengurangan_harga_pokok_per_unit > 0 ? formatNumber(detail.pengurangan_harga_pokok_per_unit) : '-'}</td>
                <td class="text-red">${detail.pengurangan_jumlah > 0 ? formatNumber(detail.pengurangan_jumlah) : '-'}</td>
                <td class="text-blue">${formatNumber(detail.saldo_banyak)}</td>
                <td class="text-blue">${formatNumber(detail.saldo_harga_pokok_per_unit)}</td>
                <td class="text-blue">${formatNumber(detail.saldo_jumlah)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="info" style="margin-top: 30px;">
          <p><strong>Total Masuk:</strong> ${formatNumber(details.value.reduce((sum, d) => sum + (d.penambahan_banyak || 0), 0))}</p>
          <p><strong>Total Keluar:</strong> ${formatNumber(details.value.reduce((sum, d) => sum + (d.pengurangan_banyak || 0), 0))}</p>
          <p><strong>Sisa Stok:</strong> ${formatNumber(details.value[details.value.length - 1]?.saldo_banyak || 0)}</p>
        </div>
      </body>
    </html>
  `

  // Create and print the content
  const printWindow = window.open('', '_blank')
  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.print()
}

const exportToExcel = () => {
  if (details.value.length === 0) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  // Create CSV content
  const headers = [
    'No', 'Tanggal', 'No. Voucher',
    'Masuk', 'Harga Penambahan', 'Quantity  Penambahan',
    'Keluar', 'Harga Pengurangan', 'Quantity  Pengurangan',
    'Saldo', 'Harga Saldo', 'Quantity  Saldo'
  ]

  const rows = details.value.map(detail => [
    detail.no,
    formatDate(detail.Tanggal),
    detail.nomor_bukti,
    detail.penambahan_banyak > 0 ? detail.penambahan_banyak : 0,
    detail.penambahan_harga_pokok_per_unit > 0 ? detail.penambahan_harga_pokok_per_unit : 0,
    detail.penambahan_jumlah > 0 ? detail.penambahan_jumlah : 0,
    detail.pengurangan_banyak > 0 ? detail.pengurangan_banyak : 0,
    detail.pengurangan_harga_pokok_per_unit > 0 ? detail.pengurangan_harga_pokok_per_unit : 0,
    detail.pengurangan_jumlah > 0 ? detail.pengurangan_jumlah : 0,
    detail.saldo_banyak,
    detail.saldo_harga_pokok_per_unit,
    detail.saldo_jumlah
  ])

  // Add summary row
  const summaryRow = [
    'TOTAL',
    '',
    '',
    details.value.reduce((sum, d) => sum + (d.penambahan_banyak || 0), 0),
    '',
    details.value.reduce((sum, d) => sum + (d.penambahan_jumlah || 0), 0),
    details.value.reduce((sum, d) => sum + (d.pengurangan_banyak || 0), 0),
    '',
    details.value.reduce((sum, d) => sum + (d.pengurangan_jumlah || 0), 0),
    details.value[details.value.length - 1]?.saldo_banyak || 0,
    '',
    details.value[details.value.length - 1]?.saldo_jumlah || 0
  ]

  rows.push(summaryRow)

  // Convert to CSV
  const csvContent = [
    `KARTU STOK DETAIL - ${props.item.nama_barang}`,
    `Kode: ${props.item.kode_barang}`,
    `Periode: ${getMonthName(bulan.value)} ${tahun.value}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `Kartu_Stok_Detail_${props.item.nama_barang}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadDetails()
})
</script>
