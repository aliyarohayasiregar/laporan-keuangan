<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Role</h1>
        <p class="text-gray-600 mt-1">Kelola role dan hak akses pengguna</p>
      </div>
      <button v-if="hasPermission('role management', 'create')" @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Role
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input v-model="searchQuery" type="text" placeholder="Cari role..."
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

    <!-- Roles Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th> -->
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ role.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ role.nama_role || role.NamaRole }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ role.Deskripsi || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                (role.IsActive !== undefined ? role.IsActive : (role.is_active !== undefined ? role.is_active : true))
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              ]">
                {{ (role.IsActive !== undefined ? role.IsActive : (role.is_active !== undefined ? role.is_active :
                  true)) ? 'Aktif' : 'Non-aktif' }}
              </span>
            </td>
            <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(role.CreatedAt) }}
            </td> -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button v-if="hasPermission('role management', 'edit')" @click="handleEdit(role)"
                class="text-blue-600 hover:text-blue-900 mr-3">
                Edit
              </button>
              <button v-if="hasPermission('role management', 'edit')" @click="handlePermissions(role)"
                class="text-purple-600 hover:text-purple-900 mr-3">
                Permission
              </button>
              <!-- <button v-if="hasPermission('role management', 'edit')" @click="handleToggleStatus(role)" :class="[
                (role.IsActive !== undefined ? role.IsActive : (role.is_active !== undefined ? role.is_active : true))
                  ? 'text-yellow-600 hover:text-yellow-900'
                  : 'text-green-600 hover:text-green-900'
              ]">
                {{ (role.IsActive !== undefined ? role.IsActive : (role.is_active !== undefined ? role.is_active :
                  true)) ? 'Non-aktifkan' : 'Aktifkan' }}
              </button> -->
              <button v-if="hasPermission('role management', 'delete')" @click="handleDelete(role)"
                class="text-red-600 hover:text-red-900 ml-3">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredRoles.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">Tidak ada data role</div>
        <div class="text-gray-400 text-sm mt-2">Silakan tambah role terlebih dahulu</div>
      </div>
    </div>

    <!-- Role Form Modal -->
    <RoleForm :show-modal="showFormModal" :edit-item="editingItem" @close="handleCloseForm" @save="handleSaveForm" />

    <!-- Role Permission Modal -->
    <RolePermissionModal :show-modal="showPermissionModal" :role="selectedRole" @close="handleClosePermissionModal"
      @save="handleSavePermissions" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { showSuccess, showError, showConfirm, showWarning } from '@/composables/useModal.js'
const hasPermission = inject('hasPermission', () => true)
import RoleForm from './RoleForm.vue'
import RolePermissionModal from './RolePermissionModal.vue'
import api from '../../../services/api.js'

const searchQuery = ref('')
const statusFilter = ref('')
const showFormModal = ref(false)
const showPermissionModal = ref(false)
const editingItem = ref(null)
const selectedRole = ref(null)
const roles = ref([])
const loading = ref(false)
const error = ref(null)

const filteredRoles = computed(() => {
  let filtered = roles.value || []

  if (searchQuery.value) {
    filtered = filtered.filter(role =>
      (role.nama_role || role.NamaRole || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (role.Deskripsi || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value !== '') {
    const isActiveFilter = statusFilter.value === 'true'
    filtered = filtered.filter(role => {
      const isActive = role.IsActive !== undefined ? role.IsActive : role.is_active !== false
      return isActive === isActiveFilter
    })
  }

  return filtered
})

const loadRoles = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getAllRolesRole()
    if (response.success) {
      roles.value = response.data
    } else {
      await showError('Gagal memuat data role')
        }
  } catch (err) {
    await showError('Gagal memuat data role')
        console.error('Error loading roles:', err)
  } finally {
    loading.value = false
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (role) => {
  editingItem.value = role
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.updateRole(editingItem.value.id, formData)

      await showSuccess('Role berhasil diperbarui')
    } else {
      await api.createRole(formData)

      await showSuccess('Role berhasil ditambahkan')
    }

    await loadRoles()
    handleCloseForm()
  } catch (err) {
    await showError('Gagal menyimpan data role')
    console.error('Error saving role:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleToggleStatus = async (role) => {
  const currentStatus =
    role.IsActive !== undefined
      ? role.IsActive
      : role.is_active !== false

  const ok = await showConfirm({
    type: 'warning',
    title: currentStatus ? 'Nonaktifkan Role' : 'Aktifkan Role',
    message: `Apakah Anda yakin ingin ${
      currentStatus ? 'menonaktifkan' : 'mengaktifkan'
    } role <strong>${role.nama_role || role.NamaRole}</strong>?`,
    confirmLabel: 'Ya',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    await api.updateRole(role.id, {
      nama_role: role.nama_role || role.NamaRole,
      is_active: !currentStatus
    })

    await showSuccess(
      `Role berhasil ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`
    )

    await loadRoles()
  } catch (err) {
    await showError('Gagal mengubah status role')
    console.error('Error toggling role status:', err)
  }
}

const handleDelete = async (role) => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Role',
    message: `Apakah Anda yakin ingin menghapus role <strong>${role.nama_role || role.NamaRole}</strong>?`,
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  try {
    await api.deleteRole(role.id)

    await showSuccess('Role berhasil dihapus')

    await loadRoles()
  } catch (err) {
    await showError('Gagal menghapus data role')
    console.error('Error deleting role:', err)
  }
}

const handlePermissions = (role) => {
  selectedRole.value = role
  showPermissionModal.value = true
}

const handleClosePermissionModal = () => {
  showPermissionModal.value = false
  selectedRole.value = null
}

const handleSavePermissions = async (permissionData) => {
  try {
    await api.createModulPermission(permissionData)
    showPermissionModal.value = false
    selectedRole.value = null
    // Optional: Show success message
    await showSuccess('Permission berhasil disimpan')
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
      // Handle connection error gracefully
      console.warn('API connection failed, but permission modal will close for demo')
      showPermissionModal.value = false
      selectedRole.value = null
      await showError('Gagal menyimpan permission')
    } else {
      error.value = 'Gagal menyimpan permission'
      console.error('Error saving permissions:', err)
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
  loadRoles()
})
</script>
