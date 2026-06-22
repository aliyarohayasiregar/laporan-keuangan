<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Nama Akun' : 'Tambah Nama Akun' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi nama akun' : 'Masukkan informasi nama akun baru' }}
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode *</label>
            <input :value="formData.kode" @input="handleKodeInput" type="text" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Contoh: 1 11 11 1111" maxlength="12" />
            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">Kode tidak dapat diubah saat edit</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Akun *</label>
            <input v-model="formData.nama_akun" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Bank Mandiri" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kelompok Akun *</label>
            <select v-model.number="formData.kelompok_akun_id" required :disabled="loadingKelompokOptions"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
              <option value="">Pilih Kelompok Akun</option>
              <option v-for="kelompok in filteredKelompokOptions" :key="kelompok?.id || kelompok?.ID || Math.random()"
                :value="kelompok?.id">
                {{ (kelompok?.kode || '') }} - {{ (kelompok?.nama_kelompok_akun || '') }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ loadingKelompokOptions ? 'Memuat kelompok akun...' : ((formData.kode || '').trim() ? 'Kelompok akun yang sesuai dengan kode Anda' : 'Pilih kelompok akun untuk akun ini') }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea v-model="formData.deskripsi" rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan deskripsi akun (opsional)"></textarea>
            <p class="text-xs text-gray-500 mt-1">Deskripsi atau keterangan tambahan</p>
          </div>

          <div>
            <label class="flex items-center">
              <input v-model="formData.is_active" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">Centang jika akun ini aktif digunakan</p>
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
import api from '../../../services/api.js'

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  editItem: {
    type: Object,
    default: null
  },
  formError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)
const loading = ref(false)
const errorMessage = ref('')
const kelompokOptions = ref([])
const loadingKelompokOptions = ref(false)

const formData = ref({
  kode: '',
  nama_akun: '',
  kelompok_akun_id: '',
  deskripsi: '',
  is_active: true
})

const loadKelompokOptions = async () => {
  try {
    loadingKelompokOptions.value = true
    const response = await api.getAllKelompokAkunAkun()
    kelompokOptions.value = response.data || []
  } catch (error) {
    console.error('Error loading kelompok akun:', error)
    kelompokOptions.value = []
  } finally {
    loadingKelompokOptions.value = false
  }
}

const filteredKelompokOptions = computed(() => {
  if (!kelompokOptions.value || !Array.isArray(kelompokOptions.value)) return []

  let filtered = [...kelompokOptions.value].filter(k => k && typeof k === 'object' && k.kode)
  const currentKode = (formData.value.kode || '').trim()

  if (currentKode) {
    // Ambil bagian prefix dari input (tanpa segmen terakhir)
    // Contoh: "1 10 10 0001" → prefix = "1 10 10"
    // Contoh: "1 10" → prefix = "1 10"
    const segments = currentKode.split(' ').filter(s => s !== '')
    
    filtered = filtered.filter(k => {
      const kelompokSegments = k.kode.split(' ').filter(s => s !== '')
      // Cocokkan sejumlah segmen yang ada di input (max 3 segmen pertama)
      const matchCount = Math.min(segments.length, kelompokSegments.length - 1)
      for (let i = 0; i < matchCount; i++) {
        if (segments[i] !== kelompokSegments[i]) return false
      }
      return true
    })
  }

  return filtered.sort((a, b) => a.kode.localeCompare(b.kode))
})


watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      kode: newItem.Kode || newItem.kode || '',
      nama_akun: newItem.NamaAkun || newItem.nama_akun || '',
      kelompok_akun_id: newItem.KelompokAkunID || newItem.kelompok_akun_id || '',
      deskripsi: newItem.Deskripsi || newItem.deskripsi || '',
      is_active: newItem.IsActive !== undefined ? newItem.IsActive : (newItem.is_active !== undefined ? newItem.is_active : true)
    }
  } else {
    resetForm()
  }
})

// Watch for formError from parent
watch(() => props.formError, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})

watch(() => props.showModal, (show) => {
  if (show) {
    loadKelompokOptions()
  } else {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    kode: '',
    nama_akun: '',
    kelompok_akun_id: '',
    deskripsi: '',
    is_active: true
  }
}

const handleKodeInput = (e) => {
  let val = (e.target.value || '').replace(/\s/g, '').replace(/\D/g, '') // Remove spaces and non-digits
  val = val.substring(0, 9) // Batasi total maks 9 digit (1+2+2+4)
  let formatted = ''

  if (val.length > 0) {
    // Kelompok pertama: max 1 digit
    formatted += val.substring(0, 1)

    // Kelompok kedua: max 2 digit
    if (val.length > 1) {
      formatted += ' ' + val.substring(1, 3)
    }

    // Kelompok ketiga: max 2 digit
    if (val.length > 3) {
      formatted += ' ' + val.substring(3, 5)
    }

    // Kelompok keempat: max 4 digit
    if (val.length > 5) {
      formatted += ' ' + val.substring(5, 9)
    }
  }

  formData.value.kode = formatted
}

const handleSubmit = () => {
  // Clear previous error
  errorMessage.value = ''

  // Validation for create mode
  if (!isEdit.value) {
    if (!formData.value.kelompok_akun_id || formData.value.kelompok_akun_id === '') {
      errorMessage.value = 'Kelompok Akun harus dipilih'
      return
    }
  }

  // Send different data based on create vs edit mode
  if (isEdit.value) {
    // Edit mode - send all fields except kode
    const submitData = {
      nama_akun: formData.value.nama_akun,
      deskripsi: formData.value.deskripsi,
      is_active: formData.value.is_active
    }
    console.log('Edit mode submit data:', submitData)
    emit('save', submitData)
  } else {
    // Create mode - send only required fields (no is_active)
    const submitData = {
      kode: formData.value.kode,
      nama_akun: formData.value.nama_akun,
      kelompok_akun_id: parseInt(formData.value.kelompok_akun_id),
      deskripsi: formData.value.deskripsi
    }
    console.log('Create mode submit data:', submitData)
    emit('save', submitData)
  }
}
</script>
