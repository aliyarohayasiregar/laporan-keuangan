<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Kelompok Akun' : 'Tambah Kelompok Akun' }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi kelompok akun' : 'Masukkan informasi kelompok akun baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode *</label>
            <input :value="formData.kode" @input="handleKodeInput" type="text" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Contoh: 1 11 11 1111" maxlength="12" />
            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">Kode tidak dapat diubah saat edit</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Kelompok Akun *</label>
            <input v-model="formData.nama_kelompok_akun" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Aset Lancar" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <input v-model.number="formData.level" type="number" required min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 1" />
            <p class="text-xs text-gray-500 mt-1">Level hierarki akun (0 untuk parent tertinggi)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Parent ID</label>
            <select v-model.number="formData.parent_id" :disabled="loadingParentOptions"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option :value="null">Tidak ada (Akun Utama)</option>
              <option v-for="parent in filteredParentOptions" :key="parent?.id || Math.random()" :value="parent?.id">
                {{ (parent?.kode || '') }} - {{ (parent?.nama_kelompok_akun || '') }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ loadingParentOptions ? 'Memuat data parent...' : 'Pilih parent akun jika ini adalah sub-akun' }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Batal
          </button>
          <button type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            {{ isEdit ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showAlert } from '@/composables/useModal.js'
import api from '../../../services/api.js'

const props = defineProps({
  showModal: { type: Boolean, required: true },
  editItem: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)

const parentOptions = ref([])
const loadingParentOptions = ref(false)

const filteredParentOptions = computed(() => {
  if (!parentOptions.value || !Array.isArray(parentOptions.value)) return []

  let filtered = [...parentOptions.value].filter(p => p && typeof p === 'object' && p.kode)

  if (props.editItem) {
    filtered = filtered.filter(p => p.id !== props.editItem.id)
  }

  const currentKode = (formData.value.kode || '').trim()
  const currentLevel = formData.value.level

  if (currentLevel <= 0) return []

  filtered = filtered.filter(p => p.level === currentLevel - 1)

  if (currentKode) {
    const kodeGroup = currentKode.charAt(0)
    filtered = filtered.filter(p => p.kode_group === kodeGroup)
  }

  return filtered.sort((a, b) => a.kode.localeCompare(b.kode))
})

const formData = ref({
  kode: '',
  nama_kelompok_akun: '',
  level: 0,
  parent_id: null,
  saldo_normal: 'D'
})

const loadParentOptions = async () => {
  try {
    loadingParentOptions.value = true
    const response = await api.getParentKelompokAkun()
    parentOptions.value = response.data || []
  } catch (error) {
    console.error('Error loading parent kelompok akun:', error)
    parentOptions.value = []
  } finally {
    loadingParentOptions.value = false
  }
}

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      kode: newItem.kode,
      nama_kelompok_akun: newItem.nama_kelompok_akun,
      level: newItem.level,
      parent_id: newItem.parent_id,
    }
  }
})

watch(() => props.showModal, (show) => {
  if (show) {
    loadParentOptions()
  } else {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    kode: '',
    nama_kelompok_akun: '',
    level: 0,
    parent_id: null
  }
}

const handleKodeInput = (e) => {
  let val = (e.target.value || '').replace(/\s/g, '').replace(/\D/g, '')
  val = val.substring(0, 9)
  let formatted = ''

  if (val.length > 0) {
    formatted += val.substring(0, 1)
    if (val.length > 1) formatted += ' ' + val.substring(1, 3)
    if (val.length > 3) formatted += ' ' + val.substring(3, 5)
    if (val.length > 5) formatted += ' ' + val.substring(5, 9)
  }

  formData.value.kode = formatted
}

const handleSubmit = async () => {
  if (!(formData.value.kode || '').trim() || !(formData.value.nama_kelompok_akun || '').trim()) {
    await showAlert({
      type: 'warning',
      title: 'Field Wajib Diisi',
      message: 'Mohon lengkapi semua field yang wajib diisi.',
      confirmLabel: 'OK',
    })
    return
  }

  if (isEdit.value) {
    const submitData = {
      nama_kelompok_akun: (formData.value.nama_kelompok_akun || '').trim(),
      saldo_normal: formData.value.saldo_normal
    }
    console.log('Edit data:', submitData)
    emit('save', submitData)
  } else {
    const submitData = {
      kode: (formData.value.kode || '').trim(),
      nama_kelompok_akun: (formData.value.nama_kelompok_akun || '').trim(),
      level: formData.value.level,
      parent_id: formData.value.parent_id,
    }
    console.log('Create data:', submitData)
    emit('save', submitData)
  }
}
</script>