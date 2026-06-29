<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="$router.push('/kartu-stok')"
              class="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
                </path>
              </svg>
              Kembali
            </button>
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-1">{{ companyName }}</h2>
              <h1 class="text-3xl font-bold text-gray-900">Laporan Stok</h1>
              <p class="mt-2 text-sm text-gray-600">Laporan kartu stok per periode</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {{ laporanData.length }} Transaksi
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Filter Periode</h2>
          <button v-if="hasFiltered" @click="resetFilter"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Reset
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <select v-model="filter.bulan"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
              <option value="">Pilih Bulan</option>
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <input v-model="filter.tahun" type="number" placeholder="2024" min="2020" max="2030"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" />
          </div>

          <div class="md:col-span-2 flex items-end">
            <button @click="loadLaporanStok" :disabled="!filter.bulan || !filter.tahun || loading"
              class="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? 'Memuat...' : 'Tampilkan Laporan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Memuat Data</h3>
        <p class="text-gray-500">Sedang mengambil data laporan stok...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="flex flex-col items-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ error }}</h3>
          <p class="text-gray-500">Pilih periode lain atau hubungi administrator jika masalah berlanjut</p>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else-if="!hasFiltered && !loading"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Pilih Periode Laporan</h3>
        <p class="text-gray-500 mb-4">Silakan pilih bulan dan tahun untuk melihat laporan stok</p>
        <div class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Pilih periode dan klik "Tampilkan Laporan"
        </div>
      </div>

      <!-- Laporan Stok Table -->
      <div v-else-if="laporanData.length > 0"
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Laporan Stok - {{ getBulanNama(filter.bulan) }} {{ filter.tahun }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Total {{ laporanData.length }} transaksi</p>
            </div>
            <div class="flex space-x-2">
              <button
                class="px-3 py-1 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Barang
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Bukti
                </th>
                <th colspan="2"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Masuk
                </th>
                <th colspan="2"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Keluar
                </th>
                <th colspan="2"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
              <tr>
                <th class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                <th class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                <th class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                <th class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                <th class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Harga</th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Harga</th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Harga</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in laporanData" :key="item.kartu_stok_detail_id"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="hover:bg-blue-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.no }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{{ item.kode_barang
                    }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ item.nama_barang }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.Tanggal }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{{ item.nomor_bukti
                    }}</span>
                </td>

                <!-- Penambahan Qty -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span v-if="item.penambahan_banyak > 0" class="text-green-600 font-medium">{{ item.penambahan_banyak
                    }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>

                <!-- Penambahan Harga -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span v-if="item.penambahan_banyak > 0" class="text-green-600">Rp {{
                    formatCurrency(item.penambahan_jumlah) }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>

                <!-- Pengurangan Qty -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span v-if="item.pengurangan_banyak > 0" class="text-red-600 font-medium">{{ item.pengurangan_banyak
                    }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>

                <!-- Pengurangan Harga -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span v-if="item.pengurangan_banyak > 0" class="text-red-600">Rp {{
                    formatCurrency(item.pengurangan_jumlah) }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>

                <!-- Saldo Qty -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span class="text-blue-600 font-bold">{{ item.saldo_banyak }}</span>
                </td>

                <!-- Saldo Harga -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span class="text-blue-600 font-bold">Rp {{ formatCurrency(item.saldo_jumlah) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Menampilkan <span class="font-medium">{{ laporanData.length }}</span> transaksi
            </div>
            <div class="text-sm text-gray-500">
              Periode: {{ getBulanNama(filter.bulan) }} {{ filter.tahun }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Data State -->
      <div v-else-if="hasFiltered && laporanData.length === 0"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan stok belum tersedia untuk periode ini</h3>
        <p class="text-gray-500">Tidak ada transaksi stok untuk periode {{ getBulanNama(filter.bulan) }} {{ filter.tahun
          }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../../../services/api.js'
import { useCompanyName } from '../../../composables/useCompanyName.js'

const filter = ref({
  bulan: '',
  tahun: new Date().getFullYear().toString()
})

const laporanData = ref([])
const loading = ref(false)
const error = ref(null)
const hasFiltered = ref(false)

const { companyName } = useCompanyName()

const getBulanNama = (bulan) => {
  const bulanNames = {
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
  return bulanNames[bulan] || bulan
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
}

const loadLaporanStok = async () => {
  if (!filter.value.bulan || !filter.value.tahun) {
    error.value = 'Silakan pilih bulan dan tahun terlebih dahulu'
    return
  }

  loading.value = true
  error.value = null
  hasFiltered.value = true

  try {
    const response = await api.getLaporanStokByPeriode(filter.value.bulan, filter.value.tahun)

    if (response.success) {
      laporanData.value = response.data
    } else {
      error.value = 'Gagal memuat data laporan stok'
    }
  } catch (err) {
    error.value = 'Gagal memuat data laporan stok'
    console.error('Error loading laporan stok:', err)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value.bulan = ''
  filter.value.tahun = new Date().getFullYear().toString()
  laporanData.value = []
  error.value = null
  hasFiltered.value = false
}
</script>
