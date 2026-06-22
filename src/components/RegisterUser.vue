<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Registrasi User Baru
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Buat akun baru untuk mengakses sistem
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
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

          <!-- Success Message Display -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-green-700 text-sm">{{ successMessage }}</span>
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
              <input v-model="formData.email" type="email" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com" />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div class="relative">
                <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Minimal 6 karakter" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m1.902-1.902A9.956 9.976 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.102-2.102L12 12m0 0L9 9m3 3l3 3m-3-3l-3 3" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Password minimal 6 karakter</p>
            </div>

            <!-- Konfirmasi Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password *</label>
              <div class="relative">
                <input v-model="formData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Ulangi password" />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m1.902-1.902A9.956 9.976 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.102-2.102L12 12m0 0L9 9m3 3l3 3m-3-3l-3 3" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <select v-model.number="formData.role_id" required :disabled="loadingRoles"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
                <option value="">Pilih role</option>
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">
                  {{ role.nama_role }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                <span v-if="loadingRoles">Memuat role...</span>
                <span v-else>Pilih role untuk hak akses user</span>
              </p>
            </div>

            <!-- Kode Anggota (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kode Anggota</label>
              <input v-model="formData.kode_anggota" type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opsional, bisa diisi nanti" />
              <p class="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada kode anggota</p>
            </div>
          </div>

          <div class="mt-6">
            <button type="submit" :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Sedang mendaftar...
              </span>
              <span v-else>Daftar</span>
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Sudah punya akun?
              <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
                Login di sini
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

const router = useRouter()

const formData = ref({
  nama: '',
  email: '',
  password: '',
  confirmPassword: '',
  jenis_user: '',
  kode_anggota: '',
  role_id: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const roleOptions = ref([])
const loadingRoles = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loadRoles = async () => {
  loadingRoles.value = true
  try {
    const response = await api.getAllRoles()
    if (response.success) {
      roleOptions.value = response.data
    } else {
      console.error('Failed to load roles:', response)
    }
  } catch (error) {
    console.error('Error loading roles:', error)
  } finally {
    loadingRoles.value = false
  }
}

const validateForm = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Password dan konfirmasi password tidak sama'
    return false
  }

  if (formData.value.password.length < 6) {
    errorMessage.value = 'Password minimal 6 karakter'
    return false
  }

  // Check for complex password that might cause issues
  if (formData.value.password.length > 20) {
    errorMessage.value = 'Password terlalu panjang, maksimal 20 karakter'
    return false
  }

  if (!formData.value.role_id) {
    errorMessage.value = 'Role harus dipilih'
    return false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    errorMessage.value = 'Format email tidak valid'
    return false
  }

  return true
}

const handleSubmit = async () => {
  // Clear previous messages
  errorMessage.value = ''
  successMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const submitData = {
      nama: formData.value.nama,
      email: formData.value.email,
      password: formData.value.password,
      jenis_user: formData.value.jenis_user,
      kode_anggota: formData.value.kode_anggota || '',
      role_id: formData.value.role_id
    }

    console.log('Registering user:', submitData)

    const response = await api.register(submitData)

    if (response.success) {
      successMessage.value = 'Registrasi berhasil! User telah dibuat.'

      // Reset form
      formData.value = {
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        jenis_user: '',
        kode_anggota: '',
        role_id: ''
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error) {
    console.error('Registration error:', error)

    // Extract error message from API response if available
    if (error.responseData && error.responseData.message) {
      errorMessage.value = error.responseData.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Registrasi gagal. Silakan coba lagi.'
    }
  } finally {
    loading.value = false
  }
}

// Watch role_id changes to auto-set jenis_user based on selected role
watch(() => formData.value.role_id, (newRoleId) => {
  if (newRoleId) {
    const selectedRole = roleOptions.value.find(r => r.id === newRoleId)
    if (selectedRole) {
      formData.value.jenis_user = selectedRole.nama_role
    }
  }
})

onMounted(() => {
  loadRoles()
})
</script>
