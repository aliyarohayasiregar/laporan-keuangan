<template>
  <div class="p-4 lg:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Vendor & Customer</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Kelola daftar vendor dan customer perusahaan</p>
      </div>
      <button v-if="hasPermission('manajemen vendor dan customer', 'create')" @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Vendor/Customer
      </button>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button @click="activeTab = 'vendor'" :class="[
          activeTab === 'vendor'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
        ]">
          Vendor
        </button>
        <button @click="activeTab = 'customer'" :class="[
          activeTab === 'customer'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
        ]">
          Customer
        </button>
      </nav>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input v-model="searchQuery" type="text" placeholder="Cari nama..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
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

    <!-- Data Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Horizontal scroll wrapper -->
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                No
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Nama
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Tanggal Dibuat
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in paginatedData" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ item.nama }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.tanggal_dibuat }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="hasPermission('manajemen vendor dan customer', 'edit')" @click="handleEdit(item)"
                  class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredData.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data {{ activeTab }}</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah {{ activeTab }} baru</div>
      </div>

      <!-- Pagination -->
      <Pagination v-if="filteredData.length > 0" :current-page="currentPage" :total-items="filteredData.length"
        :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
    </div>

    <!-- Form Modal -->
    <FormVendorCustomer :show-modal="showFormModal" :edit-item="editingItem" :form-error="formError" @close="handleCloseForm"
      @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { showConfirm, showError } from '@/composables/useModal.js'
import FormVendorCustomer from './FormVendorCustomer.vue'
import Pagination from '../../Pagination.vue'
import api from '../../../services/api.js'

const hasPermission = inject('hasPermission', () => true)

const activeTab = ref('vendor')
const searchQuery = ref('')
const showFormModal = ref(false)
const editingItem = ref(null)
const vendorData = ref([])
const customerData = ref([])
const loading = ref(false)
const error = ref(null)
const formError = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const currentData = computed(() => activeTab.value === 'vendor' ? vendorData.value : customerData.value)

const filteredData = computed(() => {
  let filtered = currentData.value || []
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return filtered
})

const paginatedData = computed(() => {
  const filtered = filteredData.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    if (activeTab.value === 'vendor') {
      const response = await api.getAllVendor()
      if (response.success) {
        vendorData.value = response.data || []
      }
    } else {
      const response = await api.getAllCustomer()
      if (response.success) {
        customerData.value = response.data || []
      }
    }
  } catch (err) {
    error.value = 'Gagal memuat data'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (item) => {
  editingItem.value = {
    ...item,
    jenis: activeTab.value
  }
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.editVendorCustomer(editingItem.value.id, formData.jenis, formData)
    } else {
      await api.createVendorCustomer(formData)
    }
    await loadData()
    handleCloseForm()
  } catch (err) {
    let errorMessage = 'Gagal menyimpan data'
    if (err.responseData && err.responseData.message) {
      errorMessage = err.responseData.message
    } else if (err.message) {
      errorMessage = err.message
    }
    await showError(errorMessage)
    console.error('Error saving data:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
  formError.value = ''
}

onMounted(() => {
  loadData()
})

watch(activeTab, () => {
  loadData()
})
</script>
