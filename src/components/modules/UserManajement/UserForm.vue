<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit User' : 'Tambah User Baru' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi user' : 'Masukkan informasi user baru' }}
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
          <!-- Nama Lengkap -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
            <input v-model="formData.nama" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap" />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input v-model="formData.email" type="email" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="email@example.com" />
            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">Email tidak dapat diubah saat edit</p>
          </div>

          <!-- Password ( hanya untuk create ) -->
          <div v-if="!isEdit">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input v-model="formData.password" type="password" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimal 6 karakter" />
            <p class="text-xs text-gray-500 mt-1">Password minimal 6 karakter</p>
          </div>

          <!-- Konfirmasi Password ( hanya untuk create ) -->
          <div v-if="!isEdit">
            <label class="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password *</label>
            <input v-model="formData.confirmPassword" type="password" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ulangi password" />
          </div>

          <!-- Jenis User -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis User *</label>
            <select v-model="formData.jenis_user" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Pilih jenis user</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="bendahara">Bendahara</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select v-model.number="formData.role_id" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Pilih role</option>
              <option v-for="role in roleOptions" :key="role.id" :value="role.id">
                {{ role.nama_role }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Pilih role untuk hak akses user</p>
          </div>

          <!-- Kode Anggota -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode Anggota</label>
            <input v-model="formData.kode_anggota" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Opsional, bisa diisi nanti" />
            <p class="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada kode anggota</p>
          </div>

          <!-- Status (hanya untuk edit) -->
          <div v-if="isEdit">
            <label class="flex items-center">
              <input v-model="formData.is_active" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">Centang jika user aktif</p>
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
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
  },
  roleOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)
const loading = ref(false)
const errorMessage = ref('')

const formData = ref({
  nama: '',
  email: '',
  password: '',
  confirmPassword: '',
  jenis_user: '',
  kode_anggota: '',
  role_id: '',
  is_active: true
})

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      nama: newItem.nama || '',
      email: newItem.email || '',
      password: '',
      confirmPassword: '',
      jenis_user: newItem.jenis_user || '',
      kode_anggota: newItem.kode_angunta || '',
      role_id: newItem.role_id || '',
      is_active: newItem.is_active !== undefined ? newItem.is_active : true
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
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    jenis_user: '',
    kode_anggota: '',
    role_id: '',
    is_active: true
  }
}

const validateForm = () => {
  // Clear previous error
  errorMessage.value = ''

  // Password validation for create mode
  if (!isEdit.value) {
    if (formData.value.password !== formData.value.confirmPassword) {
      errorMessage.value = 'Password dan konfirmasi password tidak sama'
      return false
    }

    if (formData.value.password.length < 6) {
      errorMessage.value = 'Password minimal 6 karakter'
      return false
    }
  }

  // Required field validation
  if (!formData.value.nama) {
    errorMessage.value = 'Nama harus diisi'
    return false
  }

  if (!formData.value.email) {
    errorMessage.value = 'Email harus diisi'
    return false
  }

  if (!formData.value.jenis_user) {
    errorMessage.value = 'Jenis user harus dipilih'
    return false
  }

  if (!formData.value.role_id) {
    errorMessage.value = 'Role harus dipilih'
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
    // Edit mode - send all fields except password and confirmPassword
    submitData = {
      nama: formData.value.nama,
      jenis_user: formData.value.jenis_user,
      kode_anggota: formData.value.kode_anggota || '',
      role_id: formData.value.role_id,
      is_active: formData.value.is_active
    }
  } else {
    // Create mode - send all fields
    submitData = {
      nama: formData.value.nama,
      email: formData.value.email,
      password: formData.value.password,
      jenis_user: formData.value.jenis_user,
      kode_anggota: formData.value.kode_anggota || '',
      role_id: formData.value.role_id
    }
  }

  console.log('Submitting user data:', submitData)
  emit('save', submitData)
}
</script>
