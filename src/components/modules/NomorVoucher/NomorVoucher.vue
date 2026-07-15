<template>
  <div class="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
    <!-- Beautiful Header -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div class="flex-1">
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Nomor Voucher</h1>
            <p class="text-purple-100 text-lg">Kelola nomor bukti voucher</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="p-6 sm:p-8">
        <!-- Search and Filter -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Cari Kode
            </label>
            <input v-model="searchQuery" type="text" placeholder="Masukkan kode voucher..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Filter Status
            </label>
            <select v-model="filterStatus"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div v-if="hasPermission('nomor voucher', 'create')" class="flex items-end">
            <button @click="handleAdd"
              class="w-full inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Tambah Nomor Voucher
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <div class="text-gray-500 text-lg mt-4">Memuat data nomor voucher...</div>
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
          <button @click="fetchData"
            class="mt-3 text-red-600 text-sm font-medium hover:text-red-800 transition-colors duration-200">
            Coba Lagi →
          </button>
        </div>

        <!-- Data Table -->
        <div v-else-if="filteredData.length > 0"
          class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Daftar Nomor Voucher</h3>
              <span class="text-sm text-gray-500">({{ filteredData.length }} data)</span>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode Voucher</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tahun</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode akun</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th v-if="hasPermission('nomor voucher', 'edit')"
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, index) in paginatedData" :key="item.id"
                  class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button @click="handleView(item)" class="text-purple-600 hover:text-purple-900 hover:underline">
                      {{ item.kode }}
                    </button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.tahun }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.akun_kode }}</td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-3 py-1 text-xs rounded-full font-medium',
                      item.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td v-if="hasPermission('nomor voucher', 'edit')"
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button @click="handleEdit(item)"
                        class="text-emerald-600 hover:text-emerald-900 transition-colors duration-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-1v1.5a.5.5 0 01-.5.5z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.5 10.5H19v8.5a1 1 0 001 1h-5.5a1 1 0 01-1-1V10.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <!-- Pagination -->
<Pagination v-if="filteredData.length > 0" :current-page="currentPage" :total-items="filteredData.length"
  :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada data nomor voucher</h3>
            <p class="text-gray-500 mb-6">Belum ada nomor voucher yang terdaftar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <FormNomorVoucher :showModal="showFormModal" :editItem="selectedItem" @close="closeFormModal" @save="handleSave" />

    <!-- View Modal -->
    <ViewNomorVoucher :showModal="showViewModal" :nomorVoucher="selectedItem" @close="closeViewModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import nomorVoucherService from '../../../services/nomorVoucherService.js'
import FormNomorVoucher from './FormNomorVoucher.vue'
import ViewNomorVoucher from './ViewNomorVoucher.vue'
import Pagination from '../../Pagination.vue'


const hasPermission = inject('hasPermission', () => true)

const loading = ref(false)
const error = ref(null)
const nomorVouchers = ref([])
const searchQuery = ref('')
const filterTahun = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showFormModal = ref(false)
const showViewModal = ref(false)
const selectedItem = ref(null)

// Computed properties
const filteredData = computed(() => {
  let filtered = nomorVouchers.value || []

  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.kode.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterTahun.value) {
    filtered = filtered.filter(item => item.tahun.toString() === filterTahun.value)
  }

  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  return filtered
})

const paginatedData = computed(() => {
  const filtered = filteredData.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  const filtered = filteredData.value || []
  return Math.ceil(filtered.length / itemsPerPage.value)
})

const availableYears = computed(() => {
  const vouchers = nomorVouchers.value || []
  const years = [...new Set(vouchers.map(item => item.tahun))]
  return years.sort((a, b) => b - a)
})

const extractFriendlyErrorMessage = (err) => {
  // Kalau error sudah berupa objek response dengan data.message (axios-style)
  if (err.response?.data?.message) {
    return err.response.data.message
  }

  const raw = err.responseData?.message || err.message || ''

  // Coba cari & parse JSON yang nyelip di dalam string error (mis. "HTTP error! status: 500 - {...}")
  const jsonMatch = raw.match(/\{.*\}/s)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.message) return parsed.message
    } catch (e) {
      // bukan JSON valid, lanjut ke fallback di bawah
    }
  }

  // Deteksi status code buat pesan yang lebih manusiawi
  if (/status:\s*500/.test(raw)) {
    return 'Terjadi gangguan pada server. Silakan coba lagi beberapa saat lagi.'
  }
  if (/status:\s*404/.test(raw)) {
    return 'Data tidak ditemukan.'
  }
  if (/status:\s*401|status:\s*403/.test(raw)) {
    return 'Anda tidak memiliki akses untuk melihat data ini.'
  }
  if (/Failed to fetch|NetworkError/i.test(raw)) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  }

  // Fallback terakhir: generic, tidak nampilin raw string apapun
  return 'Terjadi kesalahan saat memuat data nomor voucher. Silakan coba lagi.'
}

// Methods
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await nomorVoucherService.getAllNoBukti()
    if (response.success) {
      nomorVouchers.value = response.data
    } else {
      error.value = response.message || 'Gagal memuat data nomor voucher'
    }
  } catch (err) {
    console.error('Error fetching nomor vouchers:', err)
    error.value = extractFriendlyErrorMessage(err)

    // Fallback data for demonstration
    nomorVouchers.value = [
      { id: 1, kode: 'JV001', tahun: 2026, status: 'aktif', created_at: '2026-01-01T00:00:00Z' },
      { id: 2, kode: 'JV002', tahun: 2026, status: 'aktif', created_at: '2026-01-02T00:00:00Z' },
      { id: 3, kode: 'JV003', tahun: 2025, status: 'nonaktif', created_at: '2025-12-31T00:00:00Z' }
    ]
  } finally {
    loading.value = false
  }
}
const handleAdd = () => {
  selectedItem.value = null
  showFormModal.value = true
}

const handleEdit = (item) => {
  selectedItem.value = item
  showFormModal.value = true
}

const handleView = (item) => {
  selectedItem.value = item
  showViewModal.value = true
}

// Fitur hapus dinonaktifkan sementara — API delete nomor voucher belum tersedia dari backend.

const handleSave = async () => {
  await fetchData()
  closeFormModal()
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedItem.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedItem.value = null
}

const resetPagination = () => {
  currentPage.value = 1
}

watch([searchQuery, filterTahun, filterStatus], () => {
  resetPagination()
})

onMounted(() => {
  fetchData()
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