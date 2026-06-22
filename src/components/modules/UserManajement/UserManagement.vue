<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Manajemen User</h1>
        <p class="mt-2 text-sm text-gray-700">
          Kelola user yang terdaftar dalam sistem
        </p>
      </div>
      <div v-if="hasPermission('user management', 'create')" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="handleAddNew" type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah User
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input v-model="searchQuery" type="text" placeholder="Cari user berdasarkan nama atau email..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div class="sm:w-48">
        <select v-model="filterRole"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Semua Role</option>
          <option v-for="role in roleOptions" :key="role.id" :value="role.id">
            {{ role.nama_role }}
          </option>
        </select>
      </div>
      <div class="sm:w-48">
        <select v-model="filterStatus"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Non-aktif</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                    Daftar</th>
                  <!-- <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> -->
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="7" class="px-6 py-4 text-center">
                    <div class="flex justify-center">
                      <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="filteredUsers.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                        </path>
                      </svg>
                      <p>Tidak ada user yang ditemukan</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-blue-600 font-medium text-sm">
                            {{ user.nama ? user.nama.charAt(0).toUpperCase() : 'U' }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ user.nama || 'N/A' }}</div>
                        <div class="text-sm text-gray-500">{{ user.kode_anggota || 'No Code' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getJenisUserClass(user.jenis_user)">
                      {{ user.jenis_user }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getRoleName(user.role_id) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                      {{ user.is_active ? 'Aktif' : 'Non-aktif' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button v-if="hasPermission('user management', 'edit')" @click="handleEdit(user)" class="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button v-if="hasPermission('user management', 'edit')" @click="handleToggleStatus(user)"
                        :class="user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'">
                        {{ user.is_active ? 'Non-aktif' : 'Aktif' }}
                      </button>
                      <button v-if="hasPermission('user management', 'delete')" @click="handleDelete(user)" class="text-red-600 hover:text-red-900">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <UserForm v-if="showFormModal" :show-modal="showFormModal" :edit-item="editingItem" :role-options="roleOptions"
      @close="closeForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import * as api from '../../../services/api.js'
import { showError } from '../../../utils/errorHandler.js'
import UserForm from './UserForm.vue'

const users = ref([])
const roleOptions = ref([])
const loading = ref(false)
const showFormModal = ref(false)
const editingItem = ref(null)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.nama?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (filterRole.value) {
    filtered = filtered.filter(user => user.role_id === filterRole.value)
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(user => {
      if (filterStatus.value === 'active') return user.is_active
      if (filterStatus.value === 'inactive') return !user.is_active
      return true
    })
  }

  return filtered
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.getAllUsers()
    users.value = response.data
  } catch (error) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal memuat data user'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    alert(errorMessage)
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await api.getAllRoles()
    roleOptions.value = response.data
  } catch (error) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal memuat data role'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    alert(errorMessage)
    console.error('Error loading roles:', error)
  }
}

const getRoleName = (roleId) => {
  const role = roleOptions.value.find(r => r.id === roleId)
  return role ? role.nama_role : 'N/A'
}

const getJenisUserClass = (jenisUser) => {
  const classes = {
    'admin': 'bg-purple-100 text-purple-800',
    'staff': 'bg-blue-100 text-blue-800',
    'bendahara': 'bg-green-100 text-green-800',
    'manager': 'bg-orange-100 text-orange-800'
  }
  return classes[jenisUser] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (user) => {
  editingItem.value = user
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    if (editingItem.value) {
      await api.updateUser(editingItem.value.id, formData)
    } else {
      await api.register(formData)
    }
    await loadUsers()
    closeForm()
  } catch (error) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal menyimpan data user'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    alert(errorMessage)
    console.error('Error saving user:', error)
  }
}

const handleToggleStatus = async (user) => {
  try {
    const updatedData = {
      is_active: !user.is_active
    }
    await api.updateUser(user.id, updatedData)
    await loadUsers()
  } catch (error) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal mengubah status user'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    alert(errorMessage)
    console.error('Error toggling user status:', error)
  }
}

const handleDelete = async (user) => {
  if (confirm(`Apakah Anda yakin ingin menghapus user "${user.nama || user.email}"?`)) {
    try {
      await api.deleteUser(user.id)
      await loadUsers()
    } catch (error) {
      // Extract specific error message from API response
      let errorMessage = 'Gagal menghapus data user'
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      alert(errorMessage)
      console.error('Error deleting user:', error)
    }
  }
}

const closeForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>
