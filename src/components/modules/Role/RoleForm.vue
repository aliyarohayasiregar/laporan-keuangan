<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Role' : 'Tambah Role Baru' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi role' : 'Masukkan informasi role baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Error Message Display -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-700 text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Nama Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Role *</label>
            <input v-model="formData.nama_role" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama role" />
          </div>

          <!-- Deskripsi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea v-model="formData.deskripsi" rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Deskripsi role (opsional)"></textarea>
            <p class="text-xs text-gray-500 mt-1">Opsional, bisa diisi untuk keterangan tambahan</p>
          </div>

          <!-- Status (hanya untuk edit) -->
          <div v-if="isEdit">
            <label class="flex items-center">
              <input v-model="formData.is_active" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">Centang jika role aktif</p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Batal
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Menyimpan...
            </span>
            <span v-else>{{ isEdit ? 'Update' : 'Simpan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  editItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)
const loading = ref(false)
const errorMessage = ref('')

const formData = ref({
  nama_role: '',
  deskripsi: '',
  is_active: true
})

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      nama_role: newItem.nama_role || newItem.NamaRole || '',
      deskripsi: newItem.Deskripsi || '',
      is_active: newItem.IsActive !== undefined ? newItem.IsActive : (newItem.is_active !== undefined ? newItem.is_active : true)
    }
  }
})

watch(() => props.showModal, (show) => {
  if (!show) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    nama_role: '',
    deskripsi: '',
    is_active: true
  }
}

const validateForm = () => {
  // Clear previous error
  errorMessage.value = ''

  // Required field validation
  if (!formData.value.nama_role) {
    errorMessage.value = 'Nama role harus diisi'
    return false
  }

  if (formData.value.nama_role.length < 2) {
    errorMessage.value = 'Nama role minimal 2 karakter'
    return false
  }

  if (formData.value.nama_role.length > 50) {
    errorMessage.value = 'Nama role maksimal 50 karakter'
    return false
  }

  return true
}

const handleSubmit = () => {
  // Validate form
  if (!validateForm()) {
    return
  }

  // Prepare data according to mode
  let submitData
  if (isEdit.value) {
    // Edit mode - send all fields
    submitData = {
      nama_role: formData.value.nama_role,
      deskripsi: formData.value.deskripsi || '',
      is_active: formData.value.is_active
    }
  } else {
    // Create mode - send only required fields
    submitData = {
      nama_role: formData.value.nama_role
    }

    // Add deskripsi only if provided
    if (formData.value.deskripsi) {
      submitData.deskripsi = formData.value.deskripsi
    }
  }

  console.log('Submitting role data:', submitData)
  emit('save', submitData)
}
</script>
