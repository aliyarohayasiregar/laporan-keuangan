<template>
  <div class="register-wrap">
    <div class="register-card">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div>
          <div class="brand-name">General Ledger</div>
          <div class="brand-sub">Sistem Manajemen Akuntansi</div>
        </div>
      </div>

      <h1 class="heading">Daftar Akun</h1>
      <p class="subheading">Buat akun baru untuk mengakses sistem.</p>

      <!-- Error -->
      <transition name="fade">
        <div v-if="errorMessage" class="alert-box error-box">
          <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Success -->
      <transition name="fade">
        <div v-if="successMessage" class="alert-box success-box">
          <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </transition>

      <form @submit.prevent="handleSubmit" class="form">

        <!-- 2 column grid: Nama + Email -->
        <div class="grid-2">
          <div class="field">
            <label>Nama Lengkap</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input v-model="formData.nama" type="text" required placeholder="Nama lengkap" />
            </div>
          </div>

          <div class="field">
            <label>Email</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input v-model="formData.email" type="email" required placeholder="email@example.com" />
            </div>
          </div>
        </div>

        <!-- 2 column grid: Password + Konfirmasi -->
        <div class="grid-2">
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" required placeholder="Min. 6 karakter" />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                <svg v-if="showPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m5.858-3.772A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18" />
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="field">
            <label>Konfirmasi Password</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <input v-model="formData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required placeholder="Ulangi password" />
              <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
                <svg v-if="showConfirmPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m5.858-3.772A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18" />
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 2 column grid: Role + Kode Anggota -->
        <div class="grid-2">
          <div class="field">
            <label>Role</label>
            <div class="input-wrap select-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select v-model.number="formData.role_id" required :disabled="loadingRoles">
                <option value="">{{ loadingRoles ? 'Memuat...' : 'Pilih role' }}</option>
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">
                  {{ role.nama_role }}
                </option>
              </select>
              <svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div class="field">
            <label>Kode Anggota <span class="optional">(opsional)</span></label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.294M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <input v-model="formData.kode_anggota" type="text" placeholder="Kosongkan jika tidak ada" />
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading" class="btn-register">
          <span v-if="loading" class="loading-inner">
            <svg class="spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
              <path fill="currentColor" class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Memproses...
          </span>
          <span v-else>Daftar</span>
        </button>

      </form>

      <div class="login-row">
        Sudah punya akun?
        <router-link to="/login" class="login-link">Login di sini</router-link>
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
    if (response.success) roleOptions.value = response.data
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
  if (formData.value.password.length > 20) {
    errorMessage.value = 'Password maksimal 20 karakter'
    return false
  }
  if (!formData.value.role_id) {
    errorMessage.value = 'Role harus dipilih'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    errorMessage.value = 'Format email tidak valid'
    return false
  }
  return true
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!validateForm()) return

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
    const response = await api.register(submitData)
    if (response.success) {
      successMessage.value = 'Registrasi berhasil! Mengalihkan ke halaman login...'
      formData.value = { nama: '', email: '', password: '', confirmPassword: '', jenis_user: '', kode_anggota: '', role_id: '' }
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch (error) {
    if (error.responseData?.message) errorMessage.value = error.responseData.message
    else if (error.message) errorMessage.value = error.message
    else errorMessage.value = 'Registrasi gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

watch(() => formData.value.role_id, (newRoleId) => {
  if (newRoleId) {
    const selectedRole = roleOptions.value.find(r => r.id === newRoleId)
    if (selectedRole) formData.value.jenis_user = selectedRole.nama_role
  }
})

onMounted(() => loadRoles())
</script>

<style scoped>
.register-wrap {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.register-card {
  width: 100%;
  max-width: 640px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.75rem 2.5rem;
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

.alert-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 13px;
}

.error-box {
  background: #fef2f2;
  border: 0.5px solid #fca5a5;
  color: #b91c1c;
}

.success-box {
  background: #f0fdf4;
  border: 0.5px solid #86efac;
  color: #15803d;
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 5px;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 12px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrap input,
.input-wrap select {
  width: 100%;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  background: #f9fafb;
  color: #111827;
  transition: border-color 0.15s, background 0.15s;
  appearance: none;
}

.input-wrap input:focus,
.input-wrap select:focus {
  border-color: #93c5fd;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
}

.input-wrap input::placeholder {
  color: #d1d5db;
}

.input-wrap select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-wrap .chevron-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #9ca3af;
  pointer-events: none;
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

.eye-btn:hover { color: #6b7280; }

.btn-register {
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
  margin-top: 0.5rem;
  margin-bottom: 1.25rem;
  transition: background 0.15s;
}

.btn-register:hover:not(:disabled) { background: #1d4ed8; }
.btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spin { animation: spin 0.8s linear infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-row {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
}

.login-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.login-link:hover { text-decoration: underline; }

.fade-enter-active, .fade-leave-active { transition: all 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>