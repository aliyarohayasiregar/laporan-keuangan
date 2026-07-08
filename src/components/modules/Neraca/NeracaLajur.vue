<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Lembar Kerja</h2>
        <p class="text-gray-600 mt-1">Neraca lajur untuk proses penyesuaian dan pelaporan keuangan</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportToPDF" :disabled="loading || !data"
          class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Export PDF
        </button>
        <button @click="simpanNeracaLajur" :disabled="loading || !data"
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l3-3m-3 3h12">
            </path>
          </svg>
          Simpan Neraca Lajur
        </button>
      </div>
    </div>

    <!-- Period Filter -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select v-model.number="selectedYear"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="loadData" :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Memuat...
            </span>
            <span v-else>Tampilkan Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuat data lembar kerja...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 11.414l2.293 2.293a1 1 0 001.414-1.414z"
            clip-rule="evenodd"></path>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Error memuat data</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Data Display -->
    <div v-else-if="data && data.items && data.items.length > 0" class="space-y-6">
      <!-- Summary Cards -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Periode</h3>
          <p class="text-lg font-semibold text-gray-900">{{ data.periode }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Total Akun</h3>
          <p class="text-lg font-semibold text-gray-900">{{ data.total_akun }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Total Debit</h3>
          <p class="text-lg font-semibold text-green-600">{{
            formatNumber(data.jumlah_neraca_saldo_setelah_penyesuaian.debet) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Total Kredit</h3>
          <p class="text-lg font-semibold text-red-600">{{
            formatNumber(data.jumlah_neraca_saldo_setelah_penyesuaian.kredit) }}</p>
        </div>
      </div> -->

      <!-- Neraca Lajur Table -->
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-max border-collapse" style="min-width: 1600px; border: 2px solid #374151;">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 60px; border: 1px solid #374151;">No</th>
              <th
                class="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 120px; border: 1px solid #374151;">No. Akun</th>
              <th
                class="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 250px; border: 1px solid #374151;">Nama Akun</th>
              <th
                class="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 240px; border: 1px solid #374151;">Neraca Saldo<br>Sebelum Penyesuaian</th>
              <th
                class="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 240px; border: 1px solid #374151;">Ayat Jurnal<br>Penyesuaian</th>
              <th
                class="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 240px; border: 1px solid #374151;">Neraca Saldo<br>Setelah Penyesuaian</th>
              <th
                class="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 240px; border: 1px solid #374151;">Laporan<br>Laba Rugi</th>
              <th
                class="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                style="width: 240px; border: 1px solid #374151;">Laporan<br>Posisi Keuangan</th>
            </tr>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;"></th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;"></th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;"></th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">D</span>
                  <span class="w-28 text-center text-red-600 font-bold">K</span>
                </div>
              </th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">D</span>
                  <span class="w-28 text-center text-red-600 font-bold">K</span>
                </div>
              </th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">D</span>
                  <span class="w-28 text-center text-red-600 font-bold">K</span>
                </div>
              </th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">D</span>
                  <span class="w-28 text-center text-red-600 font-bold">K</span>
                </div>
              </th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">D</span>
                  <span class="w-28 text-center text-red-600 font-bold">K</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in data.items" :key="item.no" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium"
                style="border: 1px solid #374151;">{{ item.no }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">{{
                item.no_akun }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">{{
                item.nama_akun }}</td>

              <!-- Neraca Saldo Sebelum Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600">{{
                    formatNumber(item.neraca_saldo_sebelum_penyesuaian.debet) }}</span>
                  <span class="w-28 text-center text-red-600">{{
                    formatNumber(item.neraca_saldo_sebelum_penyesuaian.kredit) }}</span>
                </div>
              </td>

              <!-- Ayat Jurnal Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600">{{ formatNumber(item.ayat_jurnal_penyesuaian.debet)
                    }}</span>
                  <span class="w-28 text-center text-red-600">{{ formatNumber(item.ayat_jurnal_penyesuaian.kredit)
                    }}</span>
                </div>
              </td>

              <!-- Neraca Saldo Setelah Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600">{{
                    formatNumber(item.neraca_saldo_setelah_penyesuaian.debet) }}</span>
                  <span class="w-28 text-center text-red-600">{{
                    formatNumber(item.neraca_saldo_setelah_penyesuaian.kredit) }}</span>
                </div>
              </td>

              <!-- Laporan Laba Rugi -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600">{{ formatNumber(item.laporan_laba_rugi.debet) }}</span>
                  <span class="w-28 text-center text-red-600">{{ formatNumber(item.laporan_laba_rugi.kredit) }}</span>
                </div>
              </td>

              <!-- Laporan Posisi Keuangan -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600">{{ formatNumber(item.laporan_posisi_keuangan?.debet ||
                    0) }}</span>
                  <span class="w-28 text-center text-red-600">{{ formatNumber(item.laporan_posisi_keuangan?.kredit || 0)
                    }}</span>
                </div>
              </td>
            </tr>



            <!-- Total Row -->
            <tr class="bg-gray-100 font-semibold">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center" colspan="3"
                style="border: 1px solid #374151;">JUMLAH</td>

              <!-- Neraca Saldo Sebelum Penyesuaian - Total -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_neraca_saldo_sebelum_penyesuaian.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_neraca_saldo_sebelum_penyesuaian.kredit) }}</span>
                </div>
              </td>

              <!-- Ayat Jurnal Penyesuaian - Total -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_ayat_jurnal_penyesuaian.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_ayat_jurnal_penyesuaian.kredit) }}</span>
                </div>
              </td>

              <!-- Neraca Saldo Setelah Penyesuaian - Total -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_neraca_saldo_setelah_penyesuaian.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_neraca_saldo_setelah_penyesuaian.kredit) }}</span>
                </div>
              </td>

              <!-- Laporan Laba Rugi - Total -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_laporan_laba_rugi.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_laporan_laba_rugi.kredit) }}</span>
                </div>
              </td>

              <!-- Laporan Posisi Keuangan - Total -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_laporan_posisi_keuangan.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_laporan_posisi_keuangan.kredit) }}</span>
                </div>
              </td>
            </tr>


            <!-- Laba Netto Row -->
            <tr class="bg-blue-50 font-semibold">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center" colspan="3"
                style="border: 1px solid #374151;">LABA NETTO</td>

              <!-- Neraca Saldo Sebelum Penyesuaian - Laba Netto -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Ayat Jurnal Penyesuaian - Laba Netto -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Neraca Saldo Setelah Penyesuaian - Laba Netto -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Laporan Laba Rugi -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(data.laba_netto) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Laporan Posisi Keuangan -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style="border: 1px solid #374151;">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.laba_neto_laporan_posisi_keuangan?.debet || 0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.laba_neto_laporan_posisi_keuangan?.kredit || 0) }}</span>
                </div>
              </td>
            </tr>

            <!-- Jumlah Akhir Row -->
            <tr class="bg-green-50 font-semibold">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center" colspan="3">JUMLAH AKHIR</td>

              <!-- Neraca Saldo Sebelum Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Ayat Jurnal Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Neraca Saldo Setelah Penyesuaian -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{ formatNumber(0) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{ formatNumber(0) }}</span>
                </div>
              </td>

              <!-- Laporan Laba Rugi -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_akhir_laporan_laba_rugi.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_akhir_laporan_laba_rugi.kredit) }}</span>
                </div>
              </td>

              <!-- Laporan Posisi Keuangan -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex justify-center items-center">
                  <span class="w-28 text-center text-green-600 font-bold">{{
                    formatNumber(data.jumlah_akhir_laporan_posisi_keuangan.debet) }}</span>
                  <span class="w-28 text-center text-red-600 font-bold">{{
                    formatNumber(data.jumlah_akhir_laporan_posisi_keuangan.kredit) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Laba Netto Info -->

    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="flex flex-col items-center">
        <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          </path>
        </svg>
        <p class="text-lg font-medium text-gray-900">Laporan neraca lajur belum tersedia untuk periode ini</p>
        <p class="text-sm text-gray-500 mt-2">Pilih periode dan klik "Tampilkan Data" untuk melihat lembar kerja</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw, computed, nextTick } from 'vue'
import api from '../../../services/api.js'

const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const error = ref(null)
const data = ref(null)

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

// Method to force display laporan posisi keuangan data
const getLaporanPosisiKeuangan = (item) => {
  try {
    const rawItem = toRaw(item)
    console.log('Raw item for laporan posisi keuangan:', rawItem)
    console.log('Laporan posisi keuangan data:', rawItem.laporan_posisi_keuangan)
    return rawItem.laporan_posisi_keuangan || { debet: 0, kredit: 0 }
  } catch (error) {
    console.error('Error getting laporan posisi keuangan:', error)
    return { debet: 0, kredit: 0 }
  }
}

const loadData = async () => {
  if (!selectedYear.value) return

  loading.value = true
  error.value = null
  try {
    console.log('Calling API Neraca Lajur:', selectedYear.value)
    const response = await api.getNeracaLajur(selectedYear.value)
    console.log('API Response Neraca Lajur:', response)
    data.value = response.data
    console.log('Data Neraca Lajur set:', data.value)

    // Debug laporan posisi keuangan data
    if (data.value && data.value.items) {
      data.value.items.forEach((item, index) => {
        console.log(`Item ${index + 1} - Laporan Posisi Keuangan:`, toRaw(item.laporan_posisi_keuangan))
      })
    }
  } catch (err) {
    error.value = 'Gagal memuat data laporan keuangan: ' + err.message
    data.value = null
    console.error('Error loading neraca lajur data:', err)
  } finally {
    loading.value = false
  }
}

const redirectToJurnalPenyesuaian = () => {
  console.log('Redirect to Jurnal Penyesuaian clicked')
  window.dispatchEvent(new CustomEvent('navigateToJurnalPenyesuaian'))
}

const getTotalDebet = (column) => {
  if (!data.value || !data.value.items) return 0
  return data.value.items.reduce((sum, item) => {
    return sum + (item[column]?.debet || 0)
  }, 0)
}

const getTotalKredit = (column) => {
  if (!data.value || !data.value.items) return 0
  return data.value.items.reduce((sum, item) => {
    return sum + (item[column]?.kredit || 0)
  }, 0)
}

const exportToPDF = () => {
  if (!data.value || !data.value.items || data.value.items.length === 0) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  // Create content for PDF
  let content = `
    <html>
      <head>
        <title>NERACA LAJUR - ${selectedYear.value}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #374151; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .d-k-container { display: flex; gap: 2px; }
          .d-k-item { flex: 1; }
          .d-k-item:first-child { border-right: 1px solid #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>NERACA LAJUR</h2>
          <h3>Tahun ${selectedYear.value}</h3>
          <p>Periode: 1 Januari - 31 Desember ${selectedYear.value}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 50px;">No</th>
              <th rowspan="2" style="width: 120px;">No Akun</th>
              <th rowspan="2" style="width: 200px;">Nama Akun</th>
              <th colspan="2" class="text-center">Neraca Saldo<br>Sebelum Penyesuaian</th>
              <th colspan="2" class="text-center">Ayat Jurnal<br>Penyesuaian</th>
              <th colspan="2" class="text-center">Neraca Saldo<br>Setelah Penyesuaian</th>
              <th colspan="2" class="text-center">Laporan<br>Laba Rugi</th>
              <th colspan="2" class="text-center">Laporan Posisi<br>Keuangan</th>
            </tr>
            <tr>
              <th class="text-center">D</th>
              <th class="text-center">K</th>
              <th class="text-center">D</th>
              <th class="text-center">K</th>
              <th class="text-center">D</th>
              <th class="text-center">K</th>
              <th class="text-center">D</th>
              <th class="text-center">K</th>
              <th class="text-center">D</th>
              <th class="text-center">K</th>
            </tr>
          </thead>
          <tbody>
            ${data.value.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.no_akun}</td>
                <td>${item.nama_akun}</td>
                <td class="text-right">${formatNumber(item.neraca_saldo_sebelum_penyesuaian.debet)}</td>
                <td class="text-right">${formatNumber(item.neraca_saldo_sebelum_penyesuaian.kredit)}</td>
                <td class="text-right">${formatNumber(item.ayat_jurnal_penyesuaian.debet)}</td>
                <td class="text-right">${formatNumber(item.ayat_jurnal_penyesuaian.kredit)}</td>
                <td class="text-right">${formatNumber(item.neraca_saldo_setelah_penyesuaian.debet)}</td>
                <td class="text-right">${formatNumber(item.neraca_saldo_setelah_penyesuaian.kredit)}</td>
                <td class="text-right">${formatNumber(item.laporan_laba_rugi.debet)}</td>
                <td class="text-right">${formatNumber(item.laporan_laba_rugi.kredit)}</td>
                <td class="text-right">${formatNumber(item.laporan_posisi_keuangan.debet)}</td>
                <td class="text-right">${formatNumber(item.laporan_posisi_keuangan.kredit)}</td>
              </tr>
            `).join('')}
            <tr class="bold">
              <td colspan="3" class="text-center">JUMLAH</td>
              <td class="text-right">${formatNumber(getTotalDebet('neraca_saldo_sebelum_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalKredit('neraca_saldo_sebelum_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalDebet('ayat_jurnal_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalKredit('ayat_jurnal_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalDebet('neraca_saldo_setelah_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalKredit('neraca_saldo_setelah_penyesuaian'))}</td>
              <td class="text-right">${formatNumber(getTotalDebet('laporan_laba_rugi'))}</td>
              <td class="text-right">${formatNumber(getTotalKredit('laporan_laba_rugi'))}</td>
              <td class="text-right">${formatNumber(getTotalDebet('laporan_posisi_keuangan'))}</td>
              <td class="text-right">${formatNumber(getTotalKredit('laporan_posisi_keuangan'))}</td>
            </tr>
            <tr class="bold">
              <td colspan="3" class="text-center">LABA NETTO</td>
              <td colspan="6" class="text-center"></td>
              <td class="text-right">${formatNumber(data.value.laba_neto_laporan_laba_rugi?.debet || 0)}</td>
              <td class="text-right">${formatNumber(data.value.laba_neto_laporan_laba_rugi?.kredit || 0)}</td>
              <td class="text-right">${formatNumber(data.value.laba_neto_laporan_posisi_keuangan?.debet || 0)}</td>
              <td class="text-right">${formatNumber(data.value.laba_neto_laporan_posisi_keuangan?.kredit || 0)}</td>
            </tr>
            <tr class="bold">
              <td colspan="3" class="text-center">JUMLAH AKHIR</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(0)}</td>
              <td class="text-right">${formatNumber(data.value.jumlah_akhir_laporan_laba_rugi?.debet || 0)}</td>
              <td class="text-right">${formatNumber(data.value.jumlah_akhir_laporan_laba_rugi?.kredit || 0)}</td>
              <td class="text-right">${formatNumber(data.value.jumlah_akhir_laporan_posisi_keuangan?.debet || 0)}</td>
              <td class="text-right">${formatNumber(data.value.jumlah_akhir_laporan_posisi_keuangan?.kredit || 0)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="info" style="margin-top: 30px;">
          <p><strong>Dibuat pada:</strong> ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
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

const simpanNeracaLajur = async () => {
  if (!data.value || !data.value.items || data.value.items.length === 0) {
    alert('Tidak ada data untuk disimpan')
    return
  }

  // Confirmation dialog to verify worksheet correctness
  const confirmationMessage = `Apakah Anda yakin lembar kerja Neraca Lajur untuk tahun ${selectedYear.value} sudah benar dan sesuai?\n\nPastikan:\n• Semua akun sudah dicatat dengan benar\n• Jumlah Debet dan Kredit sudah seimbang\n• Laba/Rugi sudah dihitung dengan tepat\n• Penyesuaian sudah dilakukan sesuai kebijakan\n\nData yang akan disimpan tidak dapat diubah kembali.\n\nLanjutkan menyimpan?`

  if (!confirm(confirmationMessage)) {
    return
  }

  try {
    console.log('Saving Neraca Lajur for year:', selectedYear.value)

    const response = await fetch(`https://api.coopdevs.com/api/ap/simpanNeracaLajur?tahun=${selectedYear.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()
    console.log('Save API Response:', result)

    if (result.success) {
      alert(result.message || 'Neraca lajur berhasil disimpan')
      console.log('Neraca Lajur saved successfully')
    } else {
      alert(result.message || 'Gagal menyimpan neraca lajur')
      console.log('Save failed:', result.message)
    }
  } catch (error) {
    console.error('Error saving neraca lajur:', error)
    alert('Terjadi kesalahan saat menyimpan neraca lajur: ' + (error.message || error))
  }
}

onMounted(() => {
  loadData()
})
</script>
