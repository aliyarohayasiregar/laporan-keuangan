<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Neraca Saldo Sebelum Penyesuaian</h2>
        <p class="text-gray-600 mt-1">Kalkulasi saldo dari buku besar sebelum penyesuaian</p>
      </div>
      <button @click="redirectToJurnalPenyesuaian"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Jurnal Penyesuaian
      </button>
    </div>

    <!-- Period Filter -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select v-model.number="selectedYear"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option v-for="y in [2024, 2025, 2026, 2027, 2028]" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bulan Awal</label>
          <select v-model.number="startMonth"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bulan Akhir</label>
          <select v-model.number="endMonth"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
        </div>

        <div class="flex items-end">
          <button @click="loadData" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            {{ loading ? 'Loading...' : 'Tampilkan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- Neraca Saldo Data -->
    <div v-else-if="neracaData && neracaData.data" class="space-y-6">
      <div v-for="(bulanData, bIndex) in neracaData.data" :key="bIndex"
        class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <!-- Month Header / Summary Bar -->
        <div @click="toggleMonth(bulanData.bulan)"
          class="px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
              <svg class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-180': isMonthExpanded(bulanData.bulan) }" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 uppercase tracking-wide">{{ getMonthName(bulanData.bulan) }} {{
                neracaData.tahun }}</h3>
              <p class="text-xs text-gray-500">Klik untuk {{ isMonthExpanded(bulanData.bulan) ? 'menutup' : 'melihat' }}
                detail akun</p>
            </div>
          </div>

          <div class="flex gap-8 text-sm">
            <div class="text-right">
              <p class="text-gray-500 text-xs uppercase font-semibold">Total Debet</p>
              <p class="font-bold text-blue-700">Rp {{ formatNumber(bulanData.total_debit) }}</p>
            </div>
            <div class="text-right border-l border-gray-300 pl-8">
              <p class="text-gray-500 text-xs uppercase font-semibold">Total Kredit</p>
              <p class="font-bold text-red-600">Rp {{ formatNumber(bulanData.total_kredit) }}</p>
            </div>
            <div class="text-right border-l border-gray-300 pl-8 hidden sm:block">
              <p class="text-gray-500 text-xs uppercase font-semibold">Saldo Akhir</p>
              <p :class="['font-bold', bulanData.saldo_akhir === 0 ? 'text-green-600' : 'text-orange-600']">
                Rp {{ formatNumber(bulanData.saldo_akhir) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Account Details (Expandable) -->
        <div v-show="isMonthExpanded(bulanData.bulan)" class="overflow-x-auto bg-white">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No. Akun</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Akun</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Debet</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Kredit</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Akhir
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="(akun, aIndex) in bulanData.akun" :key="aIndex" class="hover:bg-blue-50/50 transition-colors">
                <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-600">{{ akun.no_akun }}</td>
                <td class="px-6 py-3 text-sm text-gray-800 font-semibold">{{ akun.nama_akun }}</td>
                <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-medium">
                  <span v-if="akun.debit > 0" class="text-blue-600">Rp {{ formatNumber(akun.debit) }}</span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-medium">
                  <span v-if="akun.kredit > 0" class="text-red-600">Rp {{ formatNumber(akun.kredit) }}</span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-bold"
                  :class="akun.saldo_akhir >= 0 ? 'text-gray-900' : 'text-red-700'">
                  Rp {{ formatNumber(akun.saldo_akhir) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h4 class="text-sm font-semibold text-blue-900 mb-2">Catatan Penting</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Neraca saldo sebelum penyesuaian adalah kalkulasi saldo dari setiap buku besar</li>
            <li>• Data ini menampilkan saldo akun sebelum dilakukan penyesuaian</li>
            <li>• Untuk penyesuaian (misalnya: penyusutan peralatan, piutang yang dibayar, dll), gunakan tombol
              "Tambah Jurnal Penyesuaian"</li>
            <li>• Pastikan total debet sama dengan total kredit untuk validasi balance</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Display -->
  <div v-if="neracaData && neracaData.akun && neracaData.akun.length > 0" class="space-y-4">
    <!-- Summary -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Ringkasan</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-gray-600">Periode</p>
          <p class="text-lg font-semibold">{{ getMonthName(neracaData.bulan) }} {{ neracaData.tahun }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Total Akun</p>
          <p class="text-lg font-semibold">{{ neracaData.total_akun }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Total Debit</p>
          <p class="text-lg font-semibold text-green-600">{{ formatNumber(neracaData.total_debit) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Total Kredit</p>
          <p class="text-lg font-semibold text-red-600">{{ formatNumber(neracaData.total_kredit) }}</p>
        </div>
      </div>
    </div>

    <!-- Akun Table -->
    <div class="bg-white rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Akun</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debet</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="akun in neracaData.akun" :key="akun.no_akun" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ akun.no_akun }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ akun.nama_akun }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatNumber(akun.debet) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatNumber(akun.kredit) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-12">
    <div class="flex flex-col items-center">
      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
        </path>
      </svg>
      <p class="text-lg font-medium text-gray-900">Belum ada data neraca saldo</p>
      <p class="text-sm text-gray-500 mt-2">Pilih periode dan klik "Tampilkan Data" untuk melihat neraca saldo sebelum
        penyesuaian</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../services/api.js'

const router = useRouter()

const selectedYear = ref(new Date().getFullYear())
const startMonth = ref(1)
const endMonth = ref(new Date().getMonth() + 1)
const expandedMonths = ref([])
const neracaData = ref(null)
const loading = ref(false)
const error = ref(null)

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

const balanceDifference = computed(() => {
  if (!neracaData.value || !neracaData.value.data) return 0
  return neracaData.value.data.reduce((sum, item) => sum + (item.total_debit - item.total_kredit), 0)
})

const getMonthName = (month) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[month - 1] || ''
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('id-ID')
}

const loadData = async () => {
  if (!selectedYear.value || !startMonth.value || !endMonth.value) return

  loading.value = true
  error.value = null
  try {
    console.log('Calling API with params:', selectedYear.value, startMonth.value, endMonth.value)
    const response = await api.request(`/getNeracaSaldo?start_bulan=${startMonth.value}&end_bulan=${endMonth.value}&tahun=${selectedYear.value}`, {}, 'ju')
    console.log('API Response:', response)
    neracaData.value = response.data

    // Expand the first month by default if data exists
    if (neracaData.value && neracaData.value.data && neracaData.value.data.length > 0) {
      expandedMonths.value = [neracaData.value.data[0].bulan]
    }
  } catch (err) {
    error.value = 'Gagal memuat data neraca saldo: ' + err.message
    neracaData.value = null
    console.error('Error loading neraca saldo data:', err)
  } finally {
    loading.value = false
  }
}

const redirectToJurnalPenyesuaian = () => {
  console.log('Redirect to Jurnal Penyesuaian clicked')
  // Emit event to parent to change page
  window.dispatchEvent(new CustomEvent('navigateToJurnalPenyesuaian'))
}

onMounted(() => {
  loadData()
})
</script>
