<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editItem ? 'Edit Nomor Voucher' : 'Tambah Nomor Voucher' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ editItem ? 'Untuk data yang sudah ada, hanya status yang dapat diubah' : 'Tambah nomor voucher baru' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <!-- ADD MODE: form lengkap -->
          <template v-if="!editItem">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Akun *</label>
              <div class="relative">
                <div @click="toggleAkunDropdown"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white flex items-center justify-between"
                  :class="{ 'opacity-60 cursor-not-allowed': loadingAkun }">
                  <span v-if="selectedAkun" class="text-gray-900">
                    {{ selectedAkun.kode }} - {{ selectedAkun.nama_akun }}
                  </span>
                  <span v-else class="text-gray-500">
                    {{ loadingAkun ? 'Memuat nomor akun...' : 'Pilih Nomor Akun' }}
                  </span>
                  <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>

                <div v-show="showAkunDropdown"
                  class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl w-full">
                  <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div class="flex items-center justify-between">
                      <h5 class="text-sm font-medium text-gray-900">Pilih Nomor Akun</h5>
                      <button type="button" @click="closeAkunDropdown" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                          </path>
                        </svg>
                      </button>
                    </div>
                    <div class="mt-2">
                      <input v-model="akunSearchQuery" type="text" placeholder="Cari kode atau nama akun..."
                        class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                    </div>
                  </div>
                  <div class="max-h-56 overflow-y-auto">
                    <div v-if="filteredAkunOptions.length === 0" class="px-4 py-3 text-sm text-gray-500">
                      Tidak ada nomor akun ditemukan
                    </div>
                    <div v-for="option in filteredAkunOptions" :key="option.id"
                      @click="selectAkun(option)"
                      class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                      <div class="text-sm font-medium text-gray-900">{{ option.kode }} - {{ option.nama_akun }}</div>
                      <div class="text-xs text-gray-600">{{ option.nama_kelompok_akun }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="errorAkun" class="text-xs text-red-500 mt-1">{{ errorAkun }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kode Voucher *</label>
              <input v-model="formData.kode" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: BCAI1234" />
              <p class="text-xs text-gray-500 mt-1">Format: [PREFIX][NUMBER]</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tahun *</label>
              <input v-model="formData.tahun" type="number" required min="2000" max="2100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2026" />
            </div>
          </template>

          <!-- EDIT MODE: hanya status yang bisa diubah -->
          <template v-else>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Nomor Akun</span>
                <span class="font-medium text-gray-900 text-right">{{ akunDisplayLabel }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Kode Voucher</span>
                <span class="font-medium text-gray-900">{{ formData.kode }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tahun</span>
                <span class="font-medium text-gray-900">{{ formData.tahun }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select v-model="formData.status" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </template>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="handleClose"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Batal
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ editItem ? 'Update' : 'Simpan' }}
            </span>
            <span v-else>{{ editItem ? 'Update' : 'Simpan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { showError } from '@/composables/useModal.js'
import nomorVoucherService from '../../../services/nomorVoucherService.js'
import api from '../../../services/api.js'

const props = defineProps({
  showModal: { type: Boolean, required: true },
  editItem: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isSubmitting = ref(false)

const loadingAkun = ref(false)
const errorAkun = ref(null)
const akunOptions = ref([])

const showAkunDropdown = ref(false)
const akunSearchQuery = ref('')
const selectedAkun = ref(null)

const formData = ref({
  kode: '',
  tahun: new Date().getFullYear(),
  id_akun: '',
  status: 'aktif'
})

const akunDisplayLabel = computed(() => {
  if (selectedAkun.value) {
    return `${selectedAkun.value.kode} - ${selectedAkun.value.nama_akun}`
  }
  return '-'
})

const filteredAkunOptions = computed(() => {
  const query = akunSearchQuery.value.toLowerCase().trim()
  if (!query) return akunOptions.value
  return akunOptions.value.filter(opt =>
    (opt.kode || '').toLowerCase().includes(query) ||
    (opt.nama_akun || '').toLowerCase().includes(query) ||
    (opt.nama_kelompok_akun || '').toLowerCase().includes(query)
  )
})

const toggleAkunDropdown = () => {
  if (loadingAkun.value) return
  showAkunDropdown.value = !showAkunDropdown.value
  if (showAkunDropdown.value) akunSearchQuery.value = ''
}

const closeAkunDropdown = () => {
  showAkunDropdown.value = false
}

const selectAkun = (option) => {
  selectedAkun.value = option
  formData.value.id_akun = option.id
  showAkunDropdown.value = false
  akunSearchQuery.value = ''
}

const fetchAkun = async () => {
  loadingAkun.value = true
  errorAkun.value = null
  try {
    const res = await api.request('/getAllNamaAkun', { method: 'GET' }, 'pb')
    if (res.success) {
      akunOptions.value = (res.data || []).map((item) => ({
        id: item.id,
        kode: item.kode,
        nama_akun: item.nama_akun,
        nama_kelompok_akun: item.nama_kelompok_akun,
        kode_kelompok_akun: item.kode_kelompok_akun
      }))
      // Kalau sedang edit dan id_akun sudah ada, cocokkan opsi terpilih setelah data termuat
      if (formData.value.id_akun) {
        const found = akunOptions.value.find(o => o.id == formData.value.id_akun)
        if (found) selectedAkun.value = found
      }
    } else {
      errorAkun.value = res.message || 'Gagal memuat daftar nomor akun.'
    }
  } catch (err) {
    console.error('Error fetching nomor akun:', err)
    errorAkun.value = 'Gagal memuat daftar nomor akun.'
  } finally {
    loadingAkun.value = false
  }
}

const resetForm = () => {
  formData.value = {
    kode: '',
    tahun: new Date().getFullYear(),
    id_akun: '',
    status: 'aktif'
  }
  selectedAkun.value = null
  akunSearchQuery.value = ''
  showAkunDropdown.value = false
}

watch(() => props.editItem, (newEditItem) => {
  if (newEditItem) {
    formData.value = {
      kode: newEditItem.kode || '',
      tahun: newEditItem.tahun || new Date().getFullYear(),
      id_akun: newEditItem.id_akun || '',
      status: newEditItem.status || 'aktif'
    }
    const found = akunOptions.value.find(o => o.id == newEditItem.id_akun)
    selectedAkun.value = found || null
  } else {
    resetForm()
  }
}, { immediate: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    let response

    if (props.editItem) {
      // Mode edit: hanya status yang dikirim, sesuai API editNoBukti
      const payload = { status: formData.value.status }
      console.log('Sending status update to API:', payload)
      response = await nomorVoucherService.updateNoBukti(props.editItem.id, payload)
    } else {
      const payload = {
        kode: formData.value.kode,
        tahun: parseInt(formData.value.tahun),
        id_akun: parseInt(formData.value.id_akun)
      }
      console.log('Sending payload to API:', payload)
      response = await nomorVoucherService.createNoBukti(payload)
    }

    if (response.success) {
      emit('save')
      emit('close')
      resetForm()
    } else {
      await showError(
        props.editItem ? 'Gagal mengupdate nomor voucher.' : 'Gagal menyimpan nomor voucher.'
      )
    }
  } catch (error) {
    console.error('Error saving nomor voucher:', error)
    await showError(
      props.editItem ? 'Gagal mengupdate nomor voucher.' : 'Gagal menyimpan nomor voucher.'
    )
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchAkun()
})
</script>