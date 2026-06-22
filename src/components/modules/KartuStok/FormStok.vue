<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">
          {{ isEdit ? 'Edit Barang' : 'Tambah Barang Baru' }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi barang stok' : 'Masukkan informasi barang baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode Barang *</label>
            <input v-model="formData.kode_barang" type="text" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Contoh: BRG001" />
            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">Kode barang tidak dapat diubah saat edit</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Barang *</label>
            <input v-model="formData.nama_barang" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Laptop ASUS ROG" />
          </div>
        </div>

        <div class="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto">
            Batal
          </button>
          <button type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto">
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
    default: false
  },
  editItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)

const formData = ref({
  kode_barang: '',
  nama_barang: '',
  harga_barang: 0,
  stok_awal: 0
})

const totalNilai = computed(() => {
  return (formData.value.stok * formData.value.harga).toLocaleString('id-ID')
})

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = { ...newItem }
  } else {
    resetForm()
  }
})

watch(() => props.showModal, (show) => {
  if (!show) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    kode_barang: '',
    nama_barang: ''
  }
}

const handleSubmit = () => {
  // Send only kode_barang and nama_barang for both create and edit
  const submitData = {
    kode_barang: formData.value.kode_barang,
    nama_barang: formData.value.nama_barang
  }
  emit('save', submitData)
}
</script>
