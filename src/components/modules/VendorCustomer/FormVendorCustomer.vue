<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit ' + getJenisLabel(formData.jenis) : 'Tambah Vendor/Customer' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi ' + getJenisLabel(formData.jenis) : 'Masukkan informasi vendor/customer baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Error Message Display -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 90 0 11-18 0 9 90 0 118 0z"></path>
            </svg>
            <span class="text-red-700 text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis *</label>
            <select v-model="formData.jenis" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
              <option value="">Pilih Jenis</option>
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama *</label>
            <input v-model="formData.nama" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: PT. Maju Bersama" />
          </div>

          <div>
            <label class="flex items-center">
              <input v-model="formData.status" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">Centang jika vendor/customer ini aktif</p>
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
const errorMessage = ref('')

const formData = ref({
  nama: '',
  jenis: '',
  status: true
})

const getJenisLabel = (jenis) => {
  return jenis === 'vendor' ? 'Vendor' : 'Customer'
}

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    // Determine jenis from where?
    formData.value = {
      nama: newItem.nama || newItem.Nama || '',
      jenis: newItem.jenis || (props.editItem.jenis ? props.editItem.jenis : ''),
      status: newItem.status !== undefined ? newItem.status : true
    }
  } else {
    resetForm()
  }
})

watch(() => props.formError, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})

watch(() => props.showModal, (show) => {
  if (!show) {
    resetForm()
    errorMessage.value = ''
  }
})

const resetForm = () => {
  formData.value = {
    nama: '',
    jenis: '',
    status: true
  }
}

const handleSubmit = () => {
  errorMessage.value = ''

  if (!formData.value.jenis) {
    errorMessage.value = 'Jenis harus dipilih'
    return
  }

  if (!formData.value.nama) {
    errorMessage.value = 'Nama harus diisi'
    return
  }

const submitData = {
  nama: formData.value.nama,
  jenis: formData.value.jenis,
  status: formData.value.status ? 'aktif' : 'tidak aktif'
}

emit('save', submitData)
}
</script>

