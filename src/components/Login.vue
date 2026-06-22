<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Login ke Sistem
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Masuk untuk mengakses dashboard
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

          <div class="space-y-4">
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
                  placeholder="Masukkan password" />
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
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
              <input v-model="formData.rememberMe" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
              <label class="ml-2 text-sm text-gray-600">Ingat saya</label>
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
                Sedang login...
              </span>
              <span v-else>Login</span>
            </button>
          </div>

          <div class="mt-6 flex justify-between text-sm">
            <div>
              <router-link to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                Lupa password?
              </router-link>
            </div>
            <div>
              <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                Belum punya akun? Daftar di sini
              </router-link>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

const router = useRouter()

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const validateForm = () => {
  if (!formData.value.email) {
    errorMessage.value = 'Email harus diisi'
    return false
  }

  if (!formData.value.password) {
    errorMessage.value = 'Password harus diisi'
    return false
  }

  return true
}

const handleSubmit = async () => {
  // Clear previous error
  errorMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const credentials = {
      email: formData.value.email,
      password: formData.value.password
    }

    console.log('Logging in with:', credentials)

    const response = await api.login(credentials)

    if (response && response.success) {
      // Parse JWT token to extract user ID
      let userId = null
      if (response.data?.token) {
        try {
          const tokenParts = response.data.token.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            userId = payload.sub
          }
        } catch (e) {
          console.warn('Failed to parse JWT token:', e)
        }
      }

      // Store authentication data - token is in response.data.token based on API response
      const authData = {
        token: response.data?.token,
        user: {
          id: userId,
          ...response.data?.user
        },
        role: {
          id: response.data?.role_id,
          name: response.data?.role_name
        }
      }

      console.log('Login successful, storing auth data:', authData)

      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify(authData))

      // Store remember me preference
      if (formData.value.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('email', formData.value.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('email')
      }

      console.log('Redirecting to dashboard...')
      // Redirect to main page (since we don't have separate dashboard)
      router.push('/')
    } else {
      console.log('Login response:', response)
      errorMessage.value = 'Login gagal. Periksa email dan password Anda.'
    }
  } catch (error) {
    console.error('Login error:', error)

    // Extract error message from API response if available
    if (error.responseData && error.responseData.message) {
      errorMessage.value = error.responseData.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Login gagal. Periksa email dan password Anda.'
    }
  } finally {
    loading.value = false
  }
}

// Check for remembered email on mount
const checkRememberedEmail = () => {
  const rememberedEmail = localStorage.getItem('email')
  const rememberMe = localStorage.getItem('rememberMe')

  if (rememberedEmail && rememberMe === 'true') {
    formData.value.email = rememberedEmail
    formData.value.rememberMe = true
  }
}

checkRememberedEmail()
</script>
