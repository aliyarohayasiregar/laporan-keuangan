<template>
  <div class="p-4 lg:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Daftar Akun</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Manajemen daftar akun perusahaan</p>
      </div>
      <button v-if="hasPermission('nama akun', 'create')" @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Daftar Akun
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1 w-full">
        <input v-model="searchQuery" type="text" placeholder="Cari nama akun..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
      </div>
      <select v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
        <option value="">Semua Status</option>
        <option value="true">Aktif</option>
        <option value="false">Non-aktif</option>
      </select>
      <select v-model="balanceFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
        <option value="">Semua Balance</option>
        <option value="D">Debit</option>
        <option value="K">Kredit</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <div class="text-gray-500 text-lg mt-4">Memuat data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Nama Akun Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Horizontal scroll wrapper -->
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                ID</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Kode</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Nama Akun</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Kelompok Akun</th>
              <!-- <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Normal Balance</th> -->
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Deskripsi</th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="akun in paginatedNamaAkun" :key="akun.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ akun.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ akun.kode }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ akun.nama_akun }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ akun.nama_kelompok_akun }}</div>
                <div class="text-xs text-gray-500">{{ akun.kode_kelompok_akun }}</div>
              </td>
              <!-- <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  akun.normal_balance === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ akun.normal_balance === 'D' ? 'Debit' : 'Kredit' }}
                </span>
              </td> -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  akun.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ akun.is_active ? 'Aktif' : 'Non-aktif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 max-w-xs truncate" :title="akun.deskripsi">
                  {{ akun.deskripsi || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="hasPermission('nama akun', 'edit')" @click="handleEdit(akun)"
                  class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button v-if="hasPermission('nama akun', 'delete')" @click="handleDelete(akun)"
                  class="text-red-600 hover:text-red-900">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredNamaAkun.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data nama akun</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah nama akun terlebih dahulu</div>
      </div>

      <!-- Pagination -->
      <Pagination v-if="filteredNamaAkun.length > 0" :current-page="currentPage" :total-items="filteredNamaAkun.length"
        :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
    </div>

    <!-- Nama Akun Form Modal -->
    <FormNamaAkun :show-modal="showFormModal" :edit-item="editingItem" :kelompok-options="kelompokAkun"
      :form-error="formError" @close="handleCloseForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import FormNamaAkun from './FormNamaAkun.vue'
import Pagination from '../../Pagination.vue'
import api from '../../../services/api.js'

const searchQuery = ref('')
const statusFilter = ref('')
const balanceFilter = ref('')
const showFormModal = ref(false)
const editingItem = ref(null)
const namaAkun = ref([])
const kelompokAkun = ref([])
const loading = ref(false)
const error = ref(null)
const formError = ref('')

// Pagination State
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredNamaAkun = computed(() => {
  let filtered = namaAkun.value || []

  if (searchQuery.value) {
    filtered = filtered.filter(akun =>
      akun.nama_akun.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      akun.kode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      akun.nama_kelompok_akun.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value !== '') {
    const isActiveFilter = statusFilter.value === 'true'
    filtered = filtered.filter(akun => akun.is_active === isActiveFilter)
  }

  if (balanceFilter.value !== '') {
    filtered = filtered.filter(akun => akun.normal_balance === balanceFilter.value)
  }

  return filtered
})

const paginatedNamaAkun = computed(() => {
  const filtered = filteredNamaAkun.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

const loadNamaAkun = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getAllNamaAkun()
    if (response.success) {
      namaAkun.value = response.data
    } else {
      error.value = 'Gagal memuat data nama akun'
    }
  } catch (err) {
    error.value = 'Gagal memuat data nama akun'
    console.error('Error loading nama akun:', err)
  } finally {
    loading.value = false
  }
}

const loadKelompokAkun = async () => {
  try {
    const response = await api.getAllKelompokAkunAkun()
    if (response.success) {
      kelompokAkun.value = response.data
    } else {
      console.error('Failed to load kelompok akun')
    }
  } catch (err) {
    console.error('Error loading kelompok akun:', err)
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (akun) => {
  editingItem.value = akun
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.updateNamaAkun(editingItem.value.id, formData)
    } else {
      await api.createNamaAkun(formData)
    }
    await loadNamaAkun()
    handleCloseForm()
  } catch (err) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal menyimpan data nama akun'
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    // Show error as alert
    alert(errorMessage)
    console.error('Error saving nama akun:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
  formError.value = ''
}

const handleToggleStatus = async (akun) => {
  if (confirm(`Apakah Anda yakin ingin ${akun.is_active ? 'menon-aktifkan' : 'mengaktifkan'} akun "${akun.nama_akun}"?`)) {
    try {
      await api.updateNamaAkun(akun.id, {
        kode: akun.kode,
        nama_akun: akun.nama_akun,
        kelompok_akun_id: akun.kelompok_akun_id,
        normal_balance: akun.normal_balance,
        is_active: !akun.is_active,
        deskripsi: akun.deskripsi
      })
      await loadNamaAkun()
    } catch (err) {
      // Extract specific error message from API response
      let errorMessage = 'Gagal mengubah status nama akun'
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      alert(errorMessage)
      console.error('Error toggling nama akun status:', err)
    }
  }
}

const handleDelete = async (akun) => {
  if (confirm(`Apakah Anda yakin ingin menghapus akun "${akun.nama_akun}"?`)) {
    try {
      await api.deleteNamaAkun(akun.id)
      await loadNamaAkun()
    } catch (err) {
      // Extract specific error message from API response
      let errorMessage = 'Gagal menghapus data nama akun'
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      alert(errorMessage)
      console.error('Error deleting nama akun:', err)
    }
  }
}

onMounted(() => {
  loadNamaAkun()
  loadKelompokAkun()
})
</script>
