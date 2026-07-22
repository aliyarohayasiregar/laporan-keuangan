<template>
  <div class="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
    <!-- Beautiful Header -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div class="flex-1">
            <h2 class="text-xl sm:text-4xl font-bold text-white mb-1">{{ companyName }}</h2>
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Neraca Saldo</h1>
            <p class="text-indigo-100 text-sm sm:text-base">Neraca saldo bisa dilihat setelah dilakukan posting</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 0V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 0V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6">
                </path>
              </svg>
            </div>`7                                                                                                                                                      `
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="p-6 sm:p-8">
        <!-- Date Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Tahun
            </label>
            <select v-model.number="selectedYear" @change="loadNeracaSaldo"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200">
              <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Bulan Awal
            </label>
            <select v-model.number="startBulan" @change="loadNeracaSaldo"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200">
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Bulan Akhir
            </label>
            <select v-model.number="endBulan" @change="loadNeracaSaldo"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200">
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 mb-8">
          <button @click="loadNeracaSaldo" :disabled="loading"
            class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
            <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            {{ loading ? 'Memuat...' : 'Tampilkan Data' }}
          </button>

          <button @click="exportToPDF" :disabled="!neracaData || loading"
            class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            Export PDF
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div class="text-gray-500 text-lg mt-4">Memuat data neraca saldo...</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="font-medium">Terjadi Kesalahan</h3>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>
          </div>
          <button @click="loadNeracaSaldo"
            class="mt-3 text-red-600 text-sm font-medium hover:text-red-800 transition-colors duration-200">
            Coba Lagi →
          </button>
        </div>

        <!-- Data Display -->
        <div v-else-if="neracaData && neracaData.data && neracaData.data.length > 0" class="space-y-8">
          <!-- Summary Cards (Aggregated) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-medium text-blue-600 uppercase">Periode</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900">{{ getMonthName(startBulan) }} - {{ getMonthName(endBulan) }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Tahun {{ neracaData.tahun }}</p>
            </div>

            <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-medium text-emerald-600 uppercase">Total Debit</span>
              </div>
              <h3 :class="['font-bold text-emerald-700', getFontSizeClass(aggregateTotals.debit)]">{{ formatNumber(aggregateTotals.debit) }}</h3>
              <p class="text-sm text-gray-600 mt-1">Akumulasi Debet</p>
            </div>

            <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-medium text-red-600 uppercase">Total Kredit</span>
              </div>
              <h3 :class="['font-bold text-red-700', getFontSizeClass(aggregateTotals.kredit)]">{{ formatNumber(aggregateTotals.kredit) }}</h3>
              <p class="text-sm text-gray-600 mt-1">Akumulasi Kredit</p>
            </div>

            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-medium text-indigo-600 uppercase">Status</span>
              </div>
              <h3 class="text-xl font-bold"
                :class="aggregateTotals.debit === aggregateTotals.kredit ? 'text-green-600' : 'text-orange-600'">
                {{ aggregateTotals.debit === aggregateTotals.kredit ? 'BALANCE' : 'SELISIH' }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Validasi Saldo</p>
            </div>
          </div>

          <!-- Monthly Data with Expandable Details -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
              Rincian Per Bulan
            </h3>

            <div v-for="(bulanData, bIndex) in neracaData.data" :key="bIndex"
              class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
              <!-- Summary Header (Clickable) -->
              <div @click="toggleMonth(bulanData.bulan)"
                class="px-6 py-5 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center justify-between cursor-pointer group">
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <svg class="w-5 h-5 transition-transform duration-300"
                      :class="{ 'rotate-180': isMonthExpanded(bulanData.bulan) }" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-gray-900 uppercase tracking-wide">{{ getMonthName(bulanData.bulan)
                      }}</h4>
                    <p class="text-xs text-indigo-600 font-medium">Klik untuk {{ isMonthExpanded(bulanData.bulan) ?
                      'tutup' : 'lihat' }} rincian akun</p>
                  </div>
                </div>

                <div class="flex gap-4 sm:gap-8 items-center mt-4 sm:mt-0">
                  <div class="text-right">
                    <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Debet</span>
                    <span class="text-sm font-bold text-emerald-600 font-mono">{{ formatNumber(bulanData.total_debit)
                      }}</span>
                  </div>
                  <div class="w-px h-8 bg-gray-200"></div>
                  <div class="text-right">
                    <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kredit</span>
                    <span class="text-sm font-bold text-red-600 font-mono">{{ formatNumber(bulanData.total_kredit)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Details Table (Expandable) -->
              <div v-show="isMonthExpanded(bulanData.bulan)" class="border-t border-gray-100 animate-fadeIn">
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-indigo-50/30">
                      <tr>
                        <th class="px-6 py-3 text-left text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                          No. Akun</th>
                        <th class="px-6 py-3 text-left text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                          Nama Akun</th>
                        <th
                          class="px-6 py-4 text-right text-[10px] font-bold text-indigo-900 uppercase tracking-widest w-[200px]">
                          Debet</th>
                        <th
                          class="px-6 py-4 text-right text-[10px] font-bold text-indigo-900 uppercase tracking-widest w-[200px]">
                          Kredit</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="akun in bulanData.akun" :key="akun.no_akun" class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 text-sm font-medium text-gray-500 font-mono">{{ akun.no_akun }}</td>
                        <td class="px-6 py-4 text-sm text-gray-900 font-bold">{{ akun.nama_akun }}</td>
                        <td class="px-6 py-4 text-sm text-right">
                          <div class="flex justify-end">
                            <div class="w-32">
                              <span class="font-mono text-right block"
                                :class="akun.debit > 0 ? 'font-semibold text-emerald-700' : 'text-gray-300'">
                                {{ akun.debit > 0 ? formatNumber(akun.debit) : '-' }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-right">
                          <div class="flex justify-end">
                            <div class="w-32">
                              <span class="font-mono text-right block"
                                :class="akun.kredit > 0 ? 'font-semibold text-red-700' : 'text-gray-300'">
                                {{ akun.kredit > 0 ? formatNumber(akun.kredit) : '-' }}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 0V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 0V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6">
                </path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada data neraca saldo</h3>
            <p class="text-gray-500 mb-6">Pilih periode dan klik "Tampilkan Data" untuk melihat neraca saldo</p>
            <!-- <button @click="redirectToJurnalPenyesuaian"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Tambah Jurnal Penyesuaian
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../services/api.js'
import { useCompanyName } from '../../../composables/useCompanyName.js'

// Reactive data
const selectedYear = ref(new Date().getFullYear())
const startBulan = ref(1)
const endBulan = ref(2)
const loading = ref(false)
const error = ref(null)
const neracaData = ref(null)
const expandedMonths = ref([])

const { companyName } = useCompanyName()

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
  return expandedMonths.value.includes(bulan)
}

const aggregateTotals = computed(() => {
  if (!neracaData.value || !neracaData.value.data) return { debit: 0, kredit: 0 }
  return neracaData.value.data.reduce((acc, curr) => {
    acc.debit += curr.total_debit || 0
    acc.kredit += curr.total_kredit || 0
    return acc
  }, { debit: 0, kredit: 0 })
})

const getMonthName = (month) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[month - 1] || ''
}

const formatNumber = (num) => {
  if (!num) return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}

const getFontSizeClass = (num) => {
  if (!num) return 'text-xl'
  const number = Number(num || 0)
  const digitCount = Math.floor(Math.log10(number)) + 1
  
  if (digitCount <= 6) return 'text-xl'      // < 1 juta
  if (digitCount <= 9) return 'text-lg'      // < 1 miliar  
  if (digitCount <= 12) return 'text-base'   // < 1 triliun
  return 'text-sm'                            // >= 1 triliun
}

const loadNeracaSaldo = async () => {
  if (!selectedYear.value || !startBulan.value || !endBulan.value) return

  loading.value = true
  error.value = null
  try {
    console.log('Fetching neraca saldo with params:', {
      start_bulan: startBulan.value,
      end_bulan: endBulan.value,
      tahun: selectedYear.value
    })

    const result = await api.getNeracaSaldo(selectedYear.value, startBulan.value, endBulan.value)
    console.log('Neraca Saldo API Response:', result)

    if (result.success) {
      neracaData.value = result.data
      console.log('Neraca Saldo data loaded:', result.data)

      // Expand the first month by default if data exists
      if (result.data && result.data.data && result.data.data.length > 0) {
        expandedMonths.value = [result.data.data[0].bulan]
      }
    } else {
      error.value = result.message || 'Gagal memuat data neraca saldo'
      neracaData.value = null
    }
  } catch (err) {
  console.error('Error loading neraca saldo:', err)

  // Coba ambil pesan error yang lebih bersih dari response API
  let cleanMessage = 'Terjadi kesalahan saat memuat data'
  try {
    // err.message biasanya berbentuk: "HTTP error! status: 400 - {...json...}"
    const jsonPart = err.message.substring(err.message.indexOf('{'))
    const parsed = JSON.parse(jsonPart)
    if (parsed.message) {
      cleanMessage = parsed.message
    }
  } catch (parseErr) {
    // kalau gagal parse, fallback ke message asli tanpa embel-embel JSON
    cleanMessage = err.message || cleanMessage
  }

  error.value = cleanMessage
  neracaData.value = null

    // Fallback data for demonstration
    neracaData.value = {
      start_bulan: startBulan.value,
      end_bulan: endBulan.value,
      tahun: selectedYear.value,
      periode: `${selectedYear.value}-${String(startBulan.value).padStart(2, '0')}-${String(endBulan.value).padStart(2, '0')}`,
      total_akun: 24,
      total_debit: 915000000,
      total_kredit: 915000000,
      akun: [
        {
          no_akun: "1 10 10 01",
          nama_akun: "Kas Besar",
          debet: 210020000,
          kredit: 0
        },
        {
          no_akun: "1 10 10 08",
          nama_akun: "Perlengkapan",
          debet: 5000000,
          kredit: 0
        },
        {
          no_akun: "1 10 10 09",
          nama_akun: "Piutang Usaha",
          debet: 25000000,
          kredit: 0
        },
        {
          no_akun: "1 10 10 10",
          nama_akun: "Sewa Dibayar Dimuka",
          debet: 0,
          kredit: 0
        },
        {
          no_akun: "1 12 10 05",
          nama_akun: "Perlengkapan",
          debet: 74980000,
          kredit: 0
        },
        {
          no_akun: "1 12 10 06",
          nama_akun: "Bangunan",
          debet: 225000000,
          kredit: 0
        }
      ]
    }
  } finally {
    loading.value = false
  }
}

const redirectToJurnalPenyesuaian = () => {
  console.log('Redirect to Jurnal Penyesuaian clicked')
  window.dispatchEvent(new CustomEvent('navigateToJurnalPenyesuaian'))
}

const exportToPDF = () => {
  if (!neracaData.value) {
    alert('Tidak ada data untuk diekspor ke PDF')
    return
  }

  // Get all unique accounts across all months to build rows
  const allAccountsMap = {}
  neracaData.value.data.forEach(bulan => {
    bulan.akun.forEach(akun => {
      if (!allAccountsMap[akun.no_akun]) {
        allAccountsMap[akun.no_akun] = akun.nama_akun
      }
    })
  })

  const sortedAccountNumbers = Object.keys(allAccountsMap).sort()
  const formatPDFNumber = (num) => {
    if (!num || num === 0) return '-'
    return Number(num).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('.', ',')
  }

  // Create HTML content for PDF
  const htmlContent = `
    <html>
      <head>
        <title>Neraca Saldo Tahunan - ${neracaData.value.tahun}</title>
        <style>
          @page { size: landscape; margin: 3mm; }
          body { font-family: Arial, sans-serif; margin: 0; font-size: 4.5pt; color: #000; line-height: 1; }
          .header { text-align: center; margin-bottom: 8px; }
          .header h2 { margin: 0; font-size: 9pt; }
          .header h1 { margin: 3px 0 0; font-size: 10pt; text-transform: uppercase; }
          .header p { margin: 2px 0 0; font-size: 7pt; }
          
          table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 0.2pt solid #000; }
          th, td { border: 0.2pt solid #000; padding: 1px 0.5px; overflow: hidden; white-space: nowrap; font-size: 4pt; }
          
          /* Column widths optimized for 26+ columns */
          .col-no { width: 35px; }
          .col-nama { width: 60px; text-align: left; padding-left: 2px; white-space: normal; line-height: 1; }
          
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .sub-header { font-size: 3.5pt; }
          
          .text-right { text-align: right; padding-right: 1px; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          
          .debet-val { color: #000; }
          .kredit-val { color: #000; }
          .bg-total { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${companyName.value}</h2>
          <h1>LAPORAN NERACA SALDO TAHUNAN</h1>
          <p>Tahun: ${neracaData.value.tahun} | Periode: ${getMonthName(startBulan.value)} - ${getMonthName(endBulan.value)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th rowspan="2" class="col-no">No. Akun</th>
              <th rowspan="2" class="col-nama">Nama Akun</th>
              ${neracaData.value.data.map(bulan => `
                <th colspan="2" class="col-month">${getMonthName(bulan.bulan).toUpperCase()}</th>
              `).join('')}
            </tr>
            <tr class="sub-header">
              ${neracaData.value.data.map(() => `
                <th>DEBET</th>
                <th>KREDIT</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${sortedAccountNumbers.map(noAkun => `
              <tr>
                <td class="text-center font-bold">${noAkun}</td>
                <td class="col-nama">${allAccountsMap[noAkun]}</td>
                ${neracaData.value.data.map(bulan => {
    const akunBulan = bulan.akun.find(a => a.no_akun === noAkun)
    return `
                    <td class="text-right debet-val">${formatPDFNumber(akunBulan?.debit)}</td>
                    <td class="text-right kredit-val">${formatPDFNumber(akunBulan?.kredit)}</td>
                  `
  }).join('')}
              </tr>
            `).join('')}
            
            <tr class="bg-total">
              <td colspan="2" class="text-center">TOTAL KESELURUHAN</td>
              ${neracaData.value.data.map(bulan => `
                <td class="text-right">${formatPDFNumber(bulan.total_debit)}</td>
                <td class="text-right">${formatPDFNumber(bulan.total_kredit)}</td>
              `).join('')}
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 15px; text-align: right; color: #718096; font-style: italic; font-size: 7px;">
          Dicetak pada: ${new Date().toLocaleString('id-ID')}
        </div>
      </body>
    </html>
  `

  // Create a new window and print
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

// Lifecycle
// onMounted(() => {
//   loadNeracaSaldo()
// })
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
