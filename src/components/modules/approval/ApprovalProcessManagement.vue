<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Proses Approval</h1>
        <p class="text-gray-600 mt-1">Kelola proses approval untuk transaksi</p>
      </div>
      <button @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Proses
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input v-model="searchQuery" type="text" placeholder="Cari proses approval..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <select v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Semua Status</option>
        <option value="true">Aktif</option>
        <option value="false">Non-aktif</option>
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

    <!-- Approval Processes Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Proses</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diupdate</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ process.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ process.nama_proses || process.NamaProses }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true))
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              ]">
                {{ (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ?
                  process.is_active : true)) ? 'Aktif' : 'Non-aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(process.CreatedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(process.UpdatedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleEdit(process)" class="text-blue-600 hover:text-blue-900 mr-3">
                Edit
              </button>
              <button @click="handleToggleStatus(process)" :class="[
                (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true))
                  ? 'text-yellow-600 hover:text-yellow-900'
                  : 'text-green-600 hover:text-green-900'
              ]">
                {{ (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ?
                  process.is_active : true)) ? 'Non-aktifkan' : 'Aktifkan' }}
              </button>
              <button @click="handleDelete(process)" class="text-red-600 hover:text-red-900 ml-3">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredProcesses.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data proses approval</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah proses approval terlebih dahulu</div>
      </div>
    </div>

    <!-- Approval Process Form Modal -->
    <ApprovalProcessForm :show-modal="showFormModal" :edit-item="editingItem" @close="handleCloseForm"
      @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApprovalProcessForm from './ApprovalProcessForm.vue'
import api from '../../../services/api.js'

const searchQuery = ref('')
const statusFilter = ref('')
const showFormModal = ref(false)
const editingItem = ref(null)
const processes = ref([])
const loading = ref(false)
const error = ref(null)

const filteredProcesses = computed(() => {
  let filtered = processes.value

  if (searchQuery.value) {
    filtered = filtered.filter(process =>
      (process.nama_proses || process.NamaProses || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value !== '') {
    const isActiveFilter = statusFilter.value === 'true'
    filtered = filtered.filter(process => {
      const isActive = process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true)
      return isActive === isActiveFilter
    })
  }

  return filtered
})

const loadProcesses = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getAllApprovalProcesses()
    if (response.success) {
      processes.value = response.data
    } else {
      error.value = 'Gagal memuat data proses approval'
    }
  } catch (err) {
    error.value = 'Gagal memuat data proses approval'
    console.error('Error loading approval processes:', err)
  } finally {
    loading.value = false
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (process) => {
  editingItem.value = process
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.updateApprovalProcess(editingItem.value.id, formData)
    } else {
      await api.createApprovalProcess(formData)
    }
    await loadProcesses()
    handleCloseForm()
  } catch (err) {
    error.value = 'Gagal menyimpan data proses approval'
    console.error('Error saving approval process:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleToggleStatus = async (process) => {
  if (confirm(`Apakah Anda yakin ingin ${process.IsActive !== undefined ? (process.IsActive ? 'menon-aktifkan' : 'mengaktifkan') : (process.is_active !== undefined ? (process.is_active ? 'menon-aktifkan' : 'mengaktifkan') : 'menon-aktifkan')} proses "${process.nama_proses || process.NamaProses}"?`)) {
    try {
      const currentStatus = process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true)
      await api.updateApprovalProcess(process.id, {
        nama_proses: process.nama_proses || process.NamaProses,
        is_active: !currentStatus
      })
      await loadProcesses()
    } catch (err) {
      error.value = 'Gagal mengubah status proses approval'
      console.error('Error toggling approval process status:', err)
    }
  }
}

const handleDelete = async (process) => {
  if (confirm(`Apakah Anda yakin ingin menghapus proses "${process.nama_proses || process.NamaProses}"?`)) {
    try {
      await api.deleteApprovalProcess(process.id)
      await loadProcesses()
    } catch (err) {
      error.value = 'Gagal menghapus data proses approval'
      console.error('Error deleting approval process:', err)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  loadProcesses()
})
</script>
