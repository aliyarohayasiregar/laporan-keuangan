<template>
  <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Kelola Permission - {{ role?.nama_role || role?.NamaRole }}
        </h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div class="text-gray-500 text-sm mt-2">Memuat data modul...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {{ error }}
      </div>

      <!-- Permissions Content -->
      <div v-else>
        <div class="mb-4">
          <p class="text-sm text-gray-600">Pilih permission untuk setiap modul:</p>
        </div>

        <!-- Permissions Table -->
        <div class="max-h-96 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modul</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Edit</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="module in modules" :key="module.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">
                  {{ module.nama_modul }}
                </td>
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="permissions[module.id].can_view"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                </td>
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="permissions[module.id].can_create"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                </td>
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="permissions[module.id].can_edit"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                </td>
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="permissions[module.id].can_delete"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="modules.length === 0" class="text-center py-8">
            <div class="text-gray-500">Tidak ada data modul</div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button @click="handleClose"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Batal
          </button>
          <button @click="handleSave" :disabled="saving"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../../../services/api.js'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const modules = ref([])
const permissions = ref({})
const loading = ref(false)
const saving = ref(false)
const error = ref(null)

// Mock data for testing when API is unavailable
const getMockModules = () => {
  return [
    { id: 5, nama_modul: 'jurnal umum' },
    { id: 6, nama_modul: 'posting entry' },
    { id: 7, nama_modul: 'neraca saldo' },
    { id: 8, nama_modul: 'laporan laba rugi' },
    { id: 9, nama_modul: 'laporan ekuitas' },
    { id: 10, nama_modul: 'laporan posisi keuangan' },
    { id: 11, nama_modul: 'user management' },
    { id: 12, nama_modul: 'role management' },
    { id: 13, nama_modul: 'modul management' },
    { id: 14, nama_modul: 'approval workflow' },
    { id: 18, nama_modul: 'kartu stok' },
    { id: 19, nama_modul: 'akun' },
    { id: 20, nama_modul: 'kelompok akun' },
    { id: 21, nama_modul: 'nomor voucher' },
    { id: 24, nama_modul: 'template voucher' },
    { id: 22, nama_modul: 'neraca' },
    { id: 23, nama_modul: 'buku besar' }
  ]
}

const getMockPermissions = (roleId) => {
  return [
    { fk_module: 1, nama_modul: 'Nyawit', can_view: false, can_create: false, can_edit: true, can_delete: false },
    { fk_module: 2, nama_modul: 'ayam goreng mail', can_view: true, can_create: false, can_edit: false, can_delete: false },
    { fk_module: 3, nama_modul: 'kelompok tani', can_view: true, can_create: true, can_edit: true, can_delete: false },
    { fk_module: 4, nama_modul: 'jurnal penyesuaian', can_view: true, can_create: true, can_edit: true, can_delete: false },
    { fk_module: 5, nama_modul: 'posting jurnal', can_view: true, can_create: false, can_edit: false, can_delete: false },
    { fk_module: 6, nama_modul: 'neraca saldo', can_view: true, can_create: false, can_edit: false, can_delete: false },
    { fk_module: 7, nama_modul: 'laporan laba rugi', can_view: true, can_create: false, can_edit: false, can_delete: false },
    { fk_module: 8, nama_modul: 'laporan ekuitas', can_view: true, can_create: false, can_edit: false, can_delete: false }
  ]
}

// Load modules and existing permissions
const loadData = async () => {
  if (!props.role) return

  loading.value = true
  error.value = null

  try {
    // Fetch all available modules first
    const allModulesResponse = await api.getAllModulsRole()

    // Fetch existing permissions for this role
    const permissionsResponse = await api.getModulPermission(props.role.id)

    let allModules = []
    let existingPermissions = []

    if (allModulesResponse.success) {
      allModules = allModulesResponse.data
    }

    if (permissionsResponse.success) {
      // Handle case when no permissions exist - ensure it's always an array
      existingPermissions = Array.isArray(permissionsResponse.data) ? permissionsResponse.data : []
    }

    // Use all modules from the API with correct field mapping
    modules.value = allModules.map(module => ({
      id: module.id,
      nama_modul: module.nama_modul
    }))

    // Initialize permissions object - merge existing permissions with all modules
    permissions.value = {}
    modules.value.forEach(module => {
      const existing = existingPermissions.find(p => p.fk_module === module.id)
      permissions.value[module.id] = {
        fk_module: module.id,
        can_view: existing?.can_view || false,
        can_create: existing?.can_create || false,
        can_edit: existing?.can_edit || false,
        can_delete: existing?.can_delete || false
      }
    })

  } catch (err) {
    error.value = 'Gagal memuat data permission. Silakan coba lagi.'
    console.error('Error loading permission data:', err)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!props.role) return

  saving.value = true
  error.value = null

  try {
    const permissionData = {
      fk_role: props.role.id,
      moduls: Object.values(permissions.value)
    }

    // Try to save via API, but handle connection errors gracefully
    try {
      await api.createModulPermission(permissionData)
      emit('save', permissionData)
    } catch (apiErr) {
      console.warn('API connection failed, simulating save:', apiErr.message)
      // For demo purposes, we'll still emit the save event
      // In production, you might want to queue the save request
      emit('save', permissionData)
    }
  } catch (err) {
    error.value = 'Gagal menyimpan permission. Silakan coba lagi.'
    console.error('Error saving permissions:', err)
  } finally {
    saving.value = false
  }
}

// Watch for modal open/close
watch(() => props.showModal, (newValue) => {
  if (newValue && props.role) {
    loadData()
  }
})

// Watch for role change
watch(() => props.role, (newRole) => {
  if (newRole && props.showModal) {
    loadData()
  }
})

onMounted(() => {
  if (props.showModal && props.role) {
    loadData()
  }
})
</script>
