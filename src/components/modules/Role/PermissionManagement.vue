<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Manajemen Permission Modul</h3>
      <p class="text-sm text-gray-600 mt-1">Atur permission akses untuk role: {{ role?.nama_role || 'Unknown' }}</p>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Memuat data permission...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Permission Table -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modul
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Create
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edit
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="modul in modules" :key="modul.ID">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ modul.NamaModul }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    v-model="permissions[modul.ID]?.can_view"
                    :disabled="submitting"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    v-model="permissions[modul.ID]?.can_create"
                    :disabled="submitting"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    v-model="permissions[modul.ID]?.can_edit"
                    :disabled="submitting"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    v-model="permissions[modul.ID]?.can_delete"
                    :disabled="submitting"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="resetPermissions"
            :disabled="submitting"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            @click="savePermissions"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Permission' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../../services/api.js'

const props = defineProps({
  role: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['permission-updated'])

// State
const modules = ref([])
const permissions = ref({})
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const originalPermissions = ref({})

// Methods
const loadModules = async () => {
  try {
    const response = await api.getAllModulsRole()
    if (response.success) {
      modules.value = response.data
    }
  } catch (err) {
    console.error('Failed to load modules:', err)
    error.value = 'Gagal memuat data modul'
  }
}

const loadPermissions = async () => {
  if (!props.role?.ID) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.getModulPermission(props.role.ID)
    if (response.success) {
      const permissionsData = {}
      
      // Initialize all modules with default permissions
      modules.value.forEach(modul => {
        permissionsData[modul.ID] = {
          fk_module: modul.ID,
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false
        }
      })
      
      // Override with existing permissions
      response.data.forEach(perm => {
        if (permissionsData[perm.fk_module]) {
          permissionsData[perm.fk_module] = {
            fk_module: perm.fk_module,
            can_view: perm.can_view,
            can_create: perm.can_create,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete
          }
        }
      })
      
      permissions.value = permissionsData
      originalPermissions.value = JSON.parse(JSON.stringify(permissionsData))
    }
  } catch (err) {
    console.error('Failed to load permissions:', err)
    error.value = 'Gagal memuat data permission'
  } finally {
    loading.value = false
  }
}

const savePermissions = async () => {
  if (!props.role?.ID) return
  
  submitting.value = true
  error.value = ''
  
  try {
    const permissionData = {
      fk_role: props.role.ID,
      moduls: Object.values(permissions.value)
    }
    
    const response = await api.createModulPermission(permissionData)
    
    if (response.success) {
      // Clear permissions cache to force reload
      const { clearPermissionsCache } = await import('../../../utils/permissions.js')
      clearPermissionsCache()
      
      emit('permission-updated')
      alert('Permission berhasil disimpan!')
    } else {
      error.value = 'Gagal menyimpan permission: ' + (response.message || 'Unknown error')
    }
  } catch (err) {
    console.error('Failed to save permissions:', err)
    error.value = 'Gagal menyimpan permission: ' + err.message
  } finally {
    submitting.value = false
  }
}

const resetPermissions = () => {
  permissions.value = JSON.parse(JSON.stringify(originalPermissions.value))
}

// Watch for role changes
watch(() => props.role?.ID, (newRoleId) => {
  if (newRoleId) {
    loadPermissions()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadModules()
})
</script>
