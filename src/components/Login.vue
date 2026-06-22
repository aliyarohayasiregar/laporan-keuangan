<template>
  <div class="login-wrap">
    <div class="login-card">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div class="brand-name">General Ledger</div>
          <div class="brand-sub">Sistem Manajemen Akuntansi</div>
        </div>
      </div>

      <h1 class="heading">Selamat datang kembali</h1>
      <p class="subheading">Masukkan email dan password untuk melanjutkan.</p>

      <!-- Error -->
      <transition name="fade">
        <div v-if="errorMessage" class="error-box">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <form @submit.prevent="handleSubmit" class="form">

        <!-- Email -->
        <div class="field">
          <label for="email">Email</label>
          <div class="input-wrap">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="email@example.com"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="field">
          <label for="password">Password</label>
          <div class="input-wrap">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <svg v-if="showPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m5.858-3.772A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18" />
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Remember & Forgot -->
        <div class="row">
          <label class="remember">
            <input v-model="formData.rememberMe" type="checkbox" />
            Ingat saya
          </label>
          <router-link to="/forgot-password" class="forgot">Lupa password?</router-link>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading" class="btn-login">
          <span v-if="loading" class="loading-inner">
            <svg class="spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Memproses...
          </span>
          <span v-else>Masuk</span>
        </button>

      </form>

      <div class="register-row">
        Belum punya akun?
        <router-link to="/register" class="register-link">Daftar sekarang</router-link>
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
  errorMessage.value = ''
  if (!validateForm()) return

  loading.value = true
  try {
    const credentials = {
      email: formData.value.email,
      password: formData.value.password
    }

    const response = await api.login(credentials)

    if (response && response.success) {
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

      const authData = {
        token: response.data?.token,
        user: { id: userId, ...response.data?.user },
        role: { id: response.data?.role_id, name: response.data?.role_name }
      }

      localStorage.setItem('auth', JSON.stringify(authData))

      if (formData.value.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('email', formData.value.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('email')
      }

      router.push('/')
    } else {
      errorMessage.value = 'Login gagal. Periksa email dan password Anda.'
    }
  } catch (error) {
    if (error.responseData?.message) {
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

<style scoped>
.login-wrap {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem 2.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.25rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon .icon {
  width: 22px;
  height: 22px;
  color: #2563eb;
}

.brand-name {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  line-height: 1.3;
}

.brand-sub {
  font-size: 12px;
  color: #9ca3af;
}

.heading {
  font-size: 22px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 6px;
}

.subheading {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 0.5px solid #fca5a5;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 13px;
  color: #b91c1c;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #ef4444;
}

.form {
  display: flex;
  flex-direction: column;
}

.field {
  margin-bottom: 0.75rem;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  background: #f9fafb;
  color: #111827;
  transition: border-color 0.15s, background 0.15s;
}

.input-wrap input:focus {
  border-color: #93c5fd;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.input-wrap input::placeholder {
  color: #d1d5db;
}

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.eye-btn:hover {
  color: #6b7280;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.5rem 0 1.25rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 400;
}

.remember input[type="checkbox"] {
  accent-color: #2563eb;
}

.forgot {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 400;
}

.forgot:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 1.25rem;
  transition: background 0.15s;
}

.btn-login:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.register-row {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
}

.register-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.register-link:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>