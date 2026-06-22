<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Neraca Saldo</h2>
        <p class="text-gray-600 mt-1">Laporan neraca saldo sebelum dan setelah penyesuaian</p>
      </div>
      <button @click="redirectToJurnalPenyesuaian"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Jurnal Penyesuaian
      </button>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button @click="activeTab = 'sebelum'" :class="[
            activeTab === 'sebelum'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]">
            Neraca Saldo Sebelum Penyesuaian
          </button>
          <button @click="activeTab = 'setelah'" :class="[
            activeTab === 'setelah'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]">
            Neraca Saldo Setelah Penyesuaian
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <!-- Sebelum Penyesuaian Tab -->
        <div v-if="activeTab === 'sebelum'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select v-model.number="selectedYear" @change="loadSebelumData"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <select v-model.number="selectedMonth" @change="loadSebelumData"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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

          <!-- Loading State -->
          <div v-if="loadingSebelum" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Memuat data neraca saldo...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="errorSebelum" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 11.414l2.293 2.293a1 1 0 001.414-1.414z"
                  clip-rule="evenodd"></path>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800">Error memuat data</h3>
                <p class="mt-1 text-sm text-red-700">{{ errorSebelum }}</p>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div v-else-if="sebelumData && sebelumData.akun && sebelumData.akun.length > 0" class="space-y-4">
            <!-- Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Ringkasan</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Periode</p>
                  <p class="text-lg font-semibold">{{ sebelumData.periode }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Akun</p>
                  <p class="text-lg font-semibold">{{ sebelumData.total_akun }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Debit</p>
                  <p class="text-lg font-semibold text-green-600">{{ formatNumber(sebelumData.total_debit) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Kredit</p>
                  <p class="text-lg font-semibold text-red-600">{{ formatNumber(sebelumData.total_kredit) }}</p>
                </div>
              </div>
            </div>

            <!-- Akun Table -->
            <div class="bg-white rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Akun
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debet
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="akun in sebelumData.akun" :key="akun.no_akun" class="hover:bg-gray-50">
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
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan neraca saldo belum tersedia untuk periode ini
            </h3>
            <p class="text-gray-500">Silakan pilih tahun dan bulan untuk melihat neraca saldo</p>
          </div>
        </div>

        <!-- Setelah Penyesuaian Tab -->
        <div v-if="activeTab === 'setelah'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select v-model.number="selectedYear" @change="loadSetelahData"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingSetelah" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Memuat data neraca saldo...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="errorSetelah" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 11.414l2.293 2.293a1 1 0 001.414-1.414z"
                  clip-rule="evenodd"></path>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800">Error memuat data</h3>
                <p class="mt-1 text-sm text-red-700">{{ errorSetelah }}</p>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div v-else-if="setelahData" class="space-y-4">
            <!-- Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Ringkasan</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Periode</p>
                  <p class="text-lg font-semibold">{{ setelahData.periode }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Debit</p>
                  <p class="text-lg font-semibold text-green-600">{{ formatNumber(setelahData.total_debit) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Kredit</p>
                  <p class="text-lg font-semibold text-red-600">{{ formatNumber(setelahData.total_kredit) }}</p>
                </div>
              </div>
            </div>

            <!-- Akun Table -->
            <div class="bg-white rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Akun
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debet
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="akun in setelahData.akun" :key="akun.no_akun" class="hover:bg-gray-50">
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
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan neraca saldo belum tersedia untuk periode ini
            </h3>
            <p class="text-gray-500">Silakan pilih tahun untuk melihat neraca saldo</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../../services/api.js'

const activeTab = ref('sebelum')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const loadingSebelum = ref(false)
const errorSebelum = ref(null)
const sebelumData = ref(null)

const loadingSetelah = ref(false)
const errorSetelah = ref(null)
const setelahData = ref(null)

const formatNumber = (num) => {
  if (!num) return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}

const loadSebelumData = async () => {
  if (!selectedYear.value || !selectedMonth.value) return

  loadingSebelum.value = true
  errorSebelum.value = null
  try {
    const response = await api.getNeracaSaldoSebelumPenyesuaian(selectedYear.value, selectedMonth.value)
    sebelumData.value = response.data
    console.log('Neraca saldo sebelum penyesuaian:', response.data)
  } catch (err) {
    errorSebelum.value = 'Gagal memuat data neraca saldo sebelum penyesuaian: ' + err.message
    sebelumData.value = null
    console.error('Error loading neraca saldo sebelum penyesuaian:', err)
  } finally {
    loadingSebelum.value = false
  }
}

const loadSetelahData = async () => {
  if (!selectedYear.value) return

  loadingSetelah.value = true
  errorSetelah.value = null
  try {
    const response = await api.getNeracaSaldoSetelahPenyesuaian(selectedYear.value)
    setelahData.value = response.data
    console.log('Neraca saldo setelah penyesuaian:', response.data)
  } catch (err) {
    errorSetelah.value = 'Gagal memuat data neraca saldo setelah penyesuaian: ' + err.message
    setelahData.value = null
    console.error('Error loading neraca saldo setelah penyesuaian:', err)
  } finally {
    loadingSetelah.value = false
  }
}

const redirectToJurnalPenyesuaian = () => {
  console.log('Redirect to Jurnal Penyesuaian clicked')
  window.dispatchEvent(new CustomEvent('navigateToJurnalPenyesuaian'))
}

onMounted(() => {
  loadSebelumData()
})
</script>
