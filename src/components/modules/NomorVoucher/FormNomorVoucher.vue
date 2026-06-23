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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kelompok Jurnal *</label>
            <select v-model="formData.kelompok_jurnal" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Pilih Kelompok Jurnal</option>
              <option v-for="option in jenisJurnalOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
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
import { ref, watch } from 'vue'
import { showError } from '@/composables/useModal.js'
import nomorVoucherService from '../../../services/nomorVoucherService.js'

const props = defineProps({
  showModal: { type: Boolean, required: true },
  editItem: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isSubmitting = ref(false)

const formData = ref({
  kode: '',
  tahun: new Date().getFullYear(),
  kelompok_jurnal: '',
  status: 'aktif'
})

const jenisJurnalOptions = [
  { value: 1, label: 'Kas Masuk' },
  { value: 2, label: 'Kas Keluar' },
  { value: 3, label: 'Bank Masuk' },
  { value: 4, label: 'Bank Keluar' },
  { value: 5, label: 'Adjustment/Pembalik' },
  { value: 6, label: 'Ayat Silang' }
]

const resetForm = () => {
  formData.value = {
    kode: '',
    tahun: new Date().getFullYear(),
    kelompok_jurnal: '',
    status: 'aktif'
  }
}

watch(() => props.editItem, (newEditItem) => {
  if (newEditItem) {
    formData.value = {
      kode: newEditItem.kode || '',
      tahun: newEditItem.tahun || new Date().getFullYear(),
      kelompok_jurnal: newEditItem.kelompok_jurnal || '',
      status: newEditItem.status || 'aktif'
    }
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
      kelompok_jurnal: String(formData.value.kelompok_jurnal)
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
</script>