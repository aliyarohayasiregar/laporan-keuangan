<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editItem ? 'Edit Nomor Voucher' : 'Tambah Nomor Voucher' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ editItem ? 'Edit data nomor voucher yang ada' : 'Tambah nomor voucher baru' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kelompok Akun *</label>
            <div class="relative">
              <div @click="toggleAkunDropdown"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white flex items-center justify-between"
                :class="{ 'opacity-60 cursor-not-allowed': loadingAkun }">
                <span v-if="selectedKelompokAkun" class="text-gray-900">
                  {{ selectedKelompokAkun.kode }} - {{ selectedKelompokAkun.nama_kelompok_akun }}
                </span>
                <span v-else class="text-gray-500">
                  {{ loadingAkun ? 'Memuat kelompok akun...' : 'Pilih Kelompok Akun' }}
                </span>
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              <div v-show="showAkunDropdown"
                class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl w-full">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div class="flex items-center justify-between">
                    <h5 class="text-sm font-medium text-gray-900">Pilih Kelompok Akun</h5>
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
                  <div v-if="filteredKelompokAkunOptions.length === 0" class="px-4 py-3 text-sm text-gray-500">
                    Tidak ada kelompok akun ditemukan
                  </div>
                  <div v-for="option in filteredKelompokAkunOptions" :key="option.id"
                    @click="selectKelompokAkun(option)"
                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                    <div class="text-sm font-medium text-gray-900">{{ option.kode }}</div>
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
const kelompokAkunOptions = ref([])

const showAkunDropdown = ref(false)
const akunSearchQuery = ref('')
const selectedKelompokAkun = ref(null)

const formData = ref({
  kode: '',
  tahun: new Date().getFullYear(),
  id_akun: '',
  status: 'aktif'
})

const filteredKelompokAkunOptions = computed(() => {
  const query = akunSearchQuery.value.toLowerCase().trim()
  if (!query) return kelompokAkunOptions.value
  return kelompokAkunOptions.value.filter(opt =>
    (opt.kode || '').toLowerCase().includes(query) ||
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

const selectKelompokAkun = (option) => {
  selectedKelompokAkun.value = option
  formData.value.id_akun = option.id
  showAkunDropdown.value = false
  akunSearchQuery.value = ''
}

const fetchKelompokAkun = async () => {
  loadingAkun.value = true
  errorAkun.value = null
  try {
    const res = await api.request('/getAllKelompokAkun', { method: 'GET' }, 'pb')
    if (res.success) {
      kelompokAkunOptions.value = (res.data || []).map((item) => ({
        id: item.id,
        kode: item.kode,
        nama_kelompok_akun: item.nama_kelompok_akun
      }))
      // Kalau sedang edit dan id_akun sudah ada, cocokkan opsi terpilih setelah data termuat
      if (formData.value.id_akun) {
        const found = kelompokAkunOptions.value.find(o => o.id == formData.value.id_akun)
        if (found) selectedKelompokAkun.value = found
      }
    } else {
      errorAkun.value = res.message || 'Gagal memuat daftar kelompok akun.'
    }
  } catch (err) {
    console.error('Error fetching kelompok akun:', err)
    errorAkun.value = 'Gagal memuat daftar kelompok akun.'
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
  selectedKelompokAkun.value = null
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
    const found = kelompokAkunOptions.value.find(o => o.id == newEditItem.id_akun)
    selectedKelompokAkun.value = found || null
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
    const payload = {
      kode: formData.value.kode,
      tahun: parseInt(formData.value.tahun),
      id_akun: parseInt(formData.value.id_akun)
    }

    console.log('Sending payload to API:', payload)

    let response
    if (props.editItem) {
      response = await nomorVoucherService.updateNoBukti(props.editItem.id, payload)
    } else {
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
  fetchKelompokAkun()
})
</script>