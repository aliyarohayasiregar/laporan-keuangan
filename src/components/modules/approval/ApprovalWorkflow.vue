<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Workflow Approval</h1>
        <p class="text-gray-600 mt-1">Kelola proses dan step approval dalam satu view</p>
      </div>
      <div v-if="hasPermission('approval workflow', 'create') || hasPermission('approval workflow', 'edit')"
        class="flex gap-3">
        <button v-if="hasPermission('approval workflow', 'create')" @click="showProcessForm = true"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          Tambah Proses
        </button>
        <button v-if="hasPermission('approval workflow', 'create')" @click="showStepForm = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Tambah Step
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input v-model="searchQuery" type="text" placeholder="Cari proses atau step approval..."
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

    <!-- Tree View -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="divide-y divide-gray-200">
        <template v-for="process in filteredProcesses" :key="process.id">
          <!-- Process Header -->
          <div class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button @click="toggleProcess(process.id)" class="text-gray-400 hover:text-gray-600">
                  <svg :class="['w-5 h-5 transition-transform', expandedProcesses.has(process.id) ? 'rotate-90' : '']"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-semibold text-gray-900">{{ process.nama_proses || process.NamaProses }}</h3>
                    <span :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true))
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]">
                      {{ (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ?
                        process.is_active : true)) ? 'Aktif' : 'Non-aktif' }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{ getProcessSteps(process.id).length }} step &bull;
                    <!-- Dibuat {{ formatDate(process.CreatedAt) }} -->
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button v-if="hasPermission('approval workflow', 'edit')" @click="editProcess(process)"
                  class="text-blue-600 hover:text-blue-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
                <button v-if="hasPermission('approval workflow', 'edit')" @click="toggleProcessStatus(process)" :class="[
                  (process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true))
                    ? 'text-yellow-600 hover:text-yellow-900'
                    : 'text-green-600 hover:text-green-900'
                ]">
                  <!-- <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg> -->
                </button>
                <button v-if="hasPermission('approval workflow', 'delete')" @click="deleteProcess(process)"
                  class="text-red-600 hover:text-red-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Steps (Expanded) -->
          <div v-if="expandedProcesses.has(process.id)" class="bg-gray-50 border-t border-gray-200">
            <div class="px-4 py-3">
              <div v-if="hasPermission('approval workflow', 'create') || hasPermission('approval workflow', 'edit')"
                class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-700">Approval Steps</h4>
                <button v-if="hasPermission('approval workflow', 'create')" @click="addStepToProcess(process)"
                  class="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Tambah Step
                </button>
              </div>

              <div v-if="getProcessSteps(process.id).length === 0" class="text-center py-8 text-gray-500">
                <div class="text-sm">Belum ada step untuk proses ini</div>
                <button @click="addStepToProcess(process)" class="text-blue-600 hover:text-blue-900 text-sm mt-2">
                  Tambah step pertama
                </button>
              </div>

              <div v-else>
                <!-- Progressive tree structure -->
                <div v-for="(step, index) in getSortedProcessSteps(process.id)" :key="step.id" class="relative">

                  <!-- Tree container with progressive indentation -->
                  <div class="relative" :style="{ marginLeft: (index * 24) + 'px' }">

                    <!-- Tree lines for hierarchy -->
                    <div v-if="index > 0" class="absolute -left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                    <div class="absolute -left-6 top-3 w-6 h-0.5 bg-gray-300"></div>

                    <!-- Step content -->
                    <div class="flex items-start gap-2 py-2">
                      <!-- Tree node indicator -->
                      <div class="relative z-10 flex items-center">
                        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>

                      <!-- Step card -->
                      <div
                        class="flex-1 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <!-- Step info -->
                            <div class="flex items-center gap-2">
                              <!-- Step badge -->
                              <span
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Step {{ step.urutan }}
                              </span>

                              <!-- Step details -->
                              <div>
                                <div class="font-medium text-gray-900 text-sm">{{ step.nama_step }}</div>
                                <div class="text-xs text-gray-500">{{ step.nama_role }}</div>
                              </div>
                            </div>
                          </div>

                          <!-- Actions -->
                          <div class="flex items-center gap-1">
                            <!-- Status badge -->
                            <span :class="[
                              'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                              step.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            ]">
                              {{ step.is_active ? 'Aktif' : 'Non-aktif' }}
                            </span>

                            <!-- Action buttons -->
                            <button v-if="hasPermission('approval workflow', 'edit')" @click="editStep(step)"
                              class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                </path>
                              </svg>
                            </button>

                            <button v-if="hasPermission('approval workflow', 'edit')" @click="toggleStepStatus(step)"
                              :class="[
                                'p-1 rounded hover:bg-opacity-10',
                                step.is_active ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              ]">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                            </button>

                            <button v-if="hasPermission('approval workflow', 'delete')" @click="deleteStep(step)"
                              class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProcesses.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data workflow approval</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah proses approval terlebih dahulu</div>
        <button @click="showProcessForm = true"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
          Tambah Proses Pertama
        </button>
      </div>
    </div>

    <!-- Process Form Modal -->
    <ApprovalProcessForm :show-modal="showProcessForm" :edit-item="editingProcess"
      @close="showProcessForm = false; editingProcess = null" @save="handleSaveProcess" />

    <!-- Step Form Modal -->
    <ApprovalStepForm :show-modal="showStepForm" :edit-item="editingStep" :approval-processes="approvalProcesses"
      :roles="roles" @close="showStepForm = false; editingStep = null" @save="handleSaveStep" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import ApprovalProcessForm from './ApprovalProcessForm.vue'
import ApprovalStepForm from './ApprovalStepForm.vue'
import api from '../../../services/api.js'
import { showSuccess, showError, showConfirm, showWarning } from '@/composables/useModal.js'

const searchQuery = ref('')
const statusFilter = ref('')
const showProcessForm = ref(false)
const showStepForm = ref(false)
const editingProcess = ref(null)
const editingStep = ref(null)
const approvalProcesses = ref([])
const approvalSteps = ref([])
const roles = ref([])
const loading = ref(false)
const error = ref(null)
const expandedProcesses = ref(new Set())

const filteredProcesses = computed(() => {
  let filtered = approvalProcesses.value

  if (searchQuery.value) {
    filtered = filtered.filter(process => {
      const processMatch = (process.nama_proses || process.NamaProses || '').toLowerCase().includes(searchQuery.value.toLowerCase())
      const stepsMatch = getProcessSteps(process.id).some(step =>
        step.nama_step.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        step.nama_role.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      return processMatch || stepsMatch
    })
  }

  if (statusFilter.value !== '') {
    const isActiveFilter = statusFilter.value === 'true'
    filtered = filtered.filter(process => {
      const processActive = process.IsActive !== undefined ? process.IsActive : (process.is_active !== undefined ? process.is_active : true)
      if (processActive === isActiveFilter) return true

      // Check if any step matches the filter
      return getProcessSteps(process.id).some(step => step.is_active === isActiveFilter)
    })
  }

  return filtered
})

const getProcessSteps = (processId) => {
  return approvalSteps.value.filter(step => step.approval_proses_id === processId)
}

const getSortedProcessSteps = (processId) => {
  return getProcessSteps(processId).sort((a, b) => a.urutan - b.urutan)
}

const toggleProcess = (processId) => {
  if (expandedProcesses.value.has(processId)) {
    expandedProcesses.value.delete(processId)
  } else {
    expandedProcesses.value.add(processId)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [processResponse, stepResponse, roleResponse] = await Promise.all([
      api.getAllApprovalProcesses(),
      api.getAllApprovalSteps(),
      api.getAllRoles()
    ])

    if (processResponse.success && stepResponse.success && roleResponse.success) {
      approvalProcesses.value = processResponse.data
      approvalSteps.value = stepResponse.data
      roles.value = roleResponse.data
    }
  } catch (err) {
    await showError('Gagal memuat data workflow approval')
    console.error('Error loading workflow data:', err)
  } finally {
    loading.value = false
  }
}

const editProcess = (process) => {
  editingProcess.value = process
  showProcessForm.value = true
}

const editStep = (step) => {
  editingStep.value = step
  showStepForm.value = true
}

const addStepToProcess = (process) => {
  editingStep.value = { approval_proses_id: process.id }
  showStepForm.value = true
}

const handleSaveProcess = async (formData) => {
  try {
    if (editingProcess.value) {
      await api.updateApprovalProcess(
        editingProcess.value.id,
        formData
      )

      await showSuccess(
        'Proses approval berhasil diperbarui'
      )
    } else {
      await api.createApprovalProcess(formData)

      await showSuccess(
        'Proses approval berhasil ditambahkan'
      )
    }

    await loadData()

    showProcessForm.value = false
    editingProcess.value = null
  } catch (err) {
    await showError(
      'Gagal menyimpan data proses approval'
    )

    console.error('Error saving approval process:', err)
  }
}

const handleSaveStep = async (formData) => {
  try {
    if (editingStep.value && editingStep.value.id) {
      await api.updateApprovalStep(
        editingStep.value.id,
        formData
      )

      await showSuccess(
        'Step approval berhasil diperbarui'
      )
    } else {
      await api.createApprovalStep(formData)

      await showSuccess(
        'Step approval berhasil ditambahkan'
      )
    }

    await loadData()

    showStepForm.value = false
    editingStep.value = null
  } catch (err) {
    await showError(
      'Gagal menyimpan data step approval'
    )

    console.error('Error saving approval step:', err)
  }
}

const toggleProcessStatus = async (process) => {
  const currentStatus =
    process.IsActive !== undefined
      ? process.IsActive
      : (
        process.is_active !== undefined
          ? process.is_active
          : true
      )

  const ok = await showConfirm({
    type: 'warning',
    title: currentStatus
      ? 'Nonaktifkan Proses'
      : 'Aktifkan Proses',
    message: `Apakah Anda yakin ingin ${
      currentStatus
        ? 'menonaktifkan'
        : 'mengaktifkan'
    } proses ${
      process.nama_proses || process.NamaProses
    }?`,
    confirmLabel: 'Ya',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    await api.updateApprovalProcess(process.id, {
      nama_proses:
        process.nama_proses ||
        process.NamaProses,
      is_active: !currentStatus
    })

    await showSuccess(
      `Proses berhasil ${
        currentStatus
          ? 'dinonaktifkan'
          : 'diaktifkan'
      }`
    )

    await loadData()
  } catch (err) {
    await showError(
      'Gagal mengubah status proses approval'
    )

    console.error(
      'Error toggling process status:',
      err
    )
  }
}

const toggleStepStatus = async (step) => {
  const ok = await showConfirm({
    type: 'warning',
    title: step.is_active
      ? 'Nonaktifkan Step'
      : 'Aktifkan Step',
    message: `Apakah Anda yakin ingin ${
      step.is_active
        ? 'menonaktifkan'
        : 'mengaktifkan'
    } step ${step.nama_step}?`,
    confirmLabel: 'Ya',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    await api.updateApprovalStep(step.id, {
      approval_proses_id:
        step.approval_proses_id,
      nama_step: step.nama_step,
      role_id: step.role_id,
      is_active: !step.is_active
    })

    await showSuccess(
      `Step berhasil ${
        step.is_active
          ? 'dinonaktifkan'
          : 'diaktifkan'
      }`
    )

    await loadData()
  } catch (err) {
    await showError(
      'Gagal mengubah status step approval'
    )

    console.error(
      'Error toggling step status:',
      err
    )
  }
}

const deleteProcess = async (process) => {
  const processName =
    process.nama_proses ||
    process.NamaProses

  const steps =
    getProcessSteps(process.id)

  const stepCount = steps.length

  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Proses Approval',
    message:
      stepCount > 0
        ? `Proses ${processName} memiliki ${stepCount} step yang akan ikut terhapus. Lanjutkan?`
        : `Apakah Anda yakin ingin menghapus proses ${processName}?`,
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    if (stepCount > 0) {
      for (const step of steps) {
        await api.deleteApprovalStep(step.id)
      }
    }

    await api.deleteApprovalProcess(
      process.id
    )

    await showSuccess(
      'Proses approval berhasil dihapus'
    )

    await loadData()
  } catch (err) {
    if (
      err.message &&
      err.message.includes('400')
    ) {
      await showWarning(
        `Tidak dapat menghapus proses "${processName}" karena masih memiliki step terkait.`,
        'Peringatan'
      )
    } else {
      await showError(
        'Gagal menghapus data proses approval'
      )
    }

    console.error(
      'Error deleting approval process:',
      err
    )
  }
}

const deleteStep = async (step) => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Step Approval',
    message: `Apakah Anda yakin ingin menghapus step ${step.nama_step}?`,
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    await api.deleteApprovalStep(step.id)

    await showSuccess(
      'Step approval berhasil dihapus'
    )

    await loadData()
  } catch (err) {
    await showError(
      'Gagal menghapus data step approval'
    )

    console.error(
      'Error deleting approval step:',
      err
    )
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
  loadData()
})
</script>
