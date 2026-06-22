<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Manajemen Modul</h1>
      <p class="text-gray-600 mt-1">Kelola modul-modul dalam sistem</p>
    </div>

    <!-- Search and Add Button -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input v-model="searchQuery" type="text" placeholder="Cari modul..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button v-if="hasPermission('modul management', 'create')" @click="showAddModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Modul
        </button>
      </div>
    </div>

    <!-- Modul List -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Memuat data modul...</p>
      </div>

      <div v-else-if="filteredModuls.length === 0" class="p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Tidak ada modul ditemukan</h3>
        <p class="text-gray-600">{{ searchQuery ? 'Coba kata kunci lain' : 'Mulai dengan menambah modul pertama' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Modul
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Dibuat
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Diupdate
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="modul in filteredModuls" :key="modul.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ modul.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ modul.nama_modul }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(modul.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(modul.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="hasPermission('modul management', 'edit')" @click="editModul(modul)"
                  class="text-blue-600 hover:text-blue-900 mr-3" title="Edit">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button v-if="hasPermission('modul management', 'delete')" @click="deleteModul(modul)"
                  class="text-red-600 hover:text-red-900" title="Hapus">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showEditModal ? 'Edit Modul' : 'Tambah Modul' }}
          </h3>
        </div>
        <form @submit.prevent="handleSubmit" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Modul *
            </label>
            <input v-model="formData.nama_modul" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama modul" />
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              Batal
            </button>
            <button type="submit" :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
              {{ submitting ? 'Menyimpan...' : (showEditModal ? 'Update' : 'Simpan') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import api from '../../../services/api.js'

// State
const moduls = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingModul = ref(null)
const submitting = ref(false)

// Form data
const formData = ref({
  nama_modul: ''
})

// Computed
const filteredModuls = computed(() => {
  const modulsData = moduls.value || []
  if (!searchQuery.value) {
    return modulsData
  }
  const query = searchQuery.value.toLowerCase()
  return modulsData.filter(modul =>
    modul.nama_modul.toLowerCase().includes(query)
  )
})

// Methods
const loadModuls = async () => {
  loading.value = true
  try {
    const response = await api.getAllModuls()
    if (response.success) {
      moduls.value = response.data
    } else {
      alert('Gagal memuat data modul: ' + (response.message || 'Unknown error'))
    }
  } catch (err) {
    alert('Gagal memuat data modul: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (showEditModal.value) {
      // Edit existing modul
      const response = await api.updateModul(editingModul.value.id, formData.value)
      if (response.success) {
        alert('Modul berhasil diupdate!')
        await loadModuls()
        closeModal()
      } else {
        alert('Gagal mengupdate modul: ' + (response.message || 'Unknown error'))
      }
    } else {
      // Add new modul
      const response = await api.createModul(formData.value)
      if (response.success) {
        alert('Modul berhasil ditambahkan!')
        await loadModuls()
        closeModal()
      } else {
        alert('Gagal menambah modul: ' + (response.message || 'Unknown error'))
      }
    }
  } catch (err) {
    alert(showEditModal.value ? 'Gagal mengupdate modul: ' + err.message : 'Gagal menambah modul: ' + err.message)
  } finally {
    submitting.value = false
  }
}

const editModul = (modul) => {
  editingModul.value = modul
  formData.value.nama_modul = modul.nama_modul
  showEditModal.value = true
}

const deleteModul = async (modul) => {
  if (confirm(`Apakah Anda yakin ingin menghapus modul "${modul.nama_modul}"?`)) {
    try {
      const response = await api.deleteModul(modul.id)
      if (response.success) {
        alert('Modul berhasil dihapus!')
        await loadModuls()
      } else {
        alert('Gagal menghapus modul: ' + (response.message || 'Unknown error'))
      }
    } catch (err) {
      alert('Gagal menghapus modul: ' + err.message)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingModul.value = null
  formData.value.nama_modul = ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadModuls()
})
</script>
