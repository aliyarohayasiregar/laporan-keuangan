<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Step Approval</h1>
        <p class="text-gray-600 mt-1">Kelola step approval untuk setiap proses</p>
      </div>
      <button @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Step
      </button>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input v-model="searchQuery" type="text" placeholder="Cari step approval..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <select v-model="processFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Semua Proses</option>
        <option v-for="process in approvalProcesses" :key="process.id" :value="process.id">
          {{ process.nama_proses || process.NamaProses }}
        </option>
      </select>
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

    <!-- Approval Steps Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proses</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Step</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="step in filteredSteps" :key="step.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ step.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ step.nama_proses }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Step {{ step.urutan }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ step.nama_step }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ step.nama_role }}</div>
              <div class="text-xs text-gray-500">ID: {{ step.role_id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                step.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              ]">
                {{ step.is_active ? 'Aktif' : 'Non-aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleEdit(step)" class="text-blue-600 hover:text-blue-900 mr-3">
                Edit
              </button>
              <button @click="handleToggleStatus(step)" :class="[
                step.is_active
                  ? 'text-yellow-600 hover:text-yellow-900'
                  : 'text-green-600 hover:text-green-900'
              ]">
                {{ step.is_active ? 'Non-aktifkan' : 'Aktifkan' }}
              </button>
              <button @click="handleDelete(step)" class="text-red-600 hover:text-red-900 ml-3">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredSteps.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data step approval</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah step approval terlebih dahulu</div>
      </div>
    </div>

    <!-- Approval Step Form Modal -->
    <ApprovalStepForm :show-modal="showFormModal" :edit-item="editingItem" :approval-processes="approvalProcesses"
      :roles="roles" @close="handleCloseForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApprovalStepForm from './ApprovalStepForm.vue'
import api from '../../../services/api.js'

const searchQuery = ref('')
const processFilter = ref('')
const statusFilter = ref('')
const showFormModal = ref(false)
const editingItem = ref(null)
const steps = ref([])
const approvalProcesses = ref([])
const roles = ref([])
const loading = ref(false)
const error = ref(null)

const filteredSteps = computed(() => {
  let filtered = steps.value

  if (searchQuery.value) {
    filtered = filtered.filter(step =>
      step.nama_step.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      step.nama_proses.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      step.nama_role.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (processFilter.value) {
    filtered = filtered.filter(step => step.approval_proses_id === parseInt(processFilter.value))
  }

  if (statusFilter.value !== '') {
    const isActiveFilter = statusFilter.value === 'true'
    filtered = filtered.filter(step => step.is_active === isActiveFilter)
  }

  return filtered
})

const loadSteps = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getAllApprovalSteps()
    if (response.success) {
      steps.value = response.data
    } else {
      error.value = 'Gagal memuat data step approval'
    }
  } catch (err) {
    error.value = 'Gagal memuat data step approval'
    console.error('Error loading approval steps:', err)
  } finally {
    loading.value = false
  }
}

const loadApprovalProcesses = async () => {
  try {
    const response = await api.getAllApprovalProcesses()
    if (response.success) {
      approvalProcesses.value = response.data
    }
  } catch (err) {
    console.error('Error loading approval processes:', err)
  }
}

const loadRoles = async () => {
  try {
    const response = await api.getAllRoles()
    if (response.success) {
      roles.value = response.data
    }
  } catch (err) {
    console.error('Error loading roles:', err)
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (step) => {
  editingItem.value = step
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.updateApprovalStep(editingItem.value.id, formData)
    } else {
      await api.createApprovalStep(formData)
    }
    await loadSteps()
    handleCloseForm()
  } catch (err) {
    error.value = 'Gagal menyimpan data step approval'
    console.error('Error saving approval step:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleToggleStatus = async (step) => {
  if (confirm(`Apakah Anda yakin ingin ${step.is_active ? 'menon-aktifkan' : 'mengaktifkan'} step "${step.nama_step}"?`)) {
    try {
      await api.updateApprovalStep(step.id, {
        approval_proses_id: step.approval_proses_id,
        nama_step: step.nama_step,
        role_id: step.role_id,
        is_active: !step.is_active
      })
      await loadSteps()
    } catch (err) {
      error.value = 'Gagal mengubah status step approval'
      console.error('Error toggling approval step status:', err)
    }
  }
}

const handleDelete = async (step) => {
  if (confirm(`Apakah Anda yakin ingin menghapus step "${step.nama_step}"?`)) {
    try {
      await api.deleteApprovalStep(step.id)
      await loadSteps()
    } catch (err) {
      error.value = 'Gagal menghapus data step approval'
      console.error('Error deleting approval step:', err)
    }
  }
}

onMounted(() => {
  loadSteps()
  loadApprovalProcesses()
  loadRoles()
})
</script>
