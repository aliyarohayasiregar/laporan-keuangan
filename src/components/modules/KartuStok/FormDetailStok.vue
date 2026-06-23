<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">
          {{ isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru' }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi transaksi' : 'Masukkan informasi transaksi baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
            <input v-model="formData.tanggal" type="date" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti *</label>
            <input v-model="formData.do_no" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: DO-001, BPB02" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Qty Masuk</label>
              <input v-model.number="formData.qty_masuk" type="number" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Qty Keluar</label>
              <input v-model.number="formData.qty_keluar" type="number" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0" />
            </div>
          </div>

          <div v-if="showHargaField">
            <label class="block text-sm font-medium text-gray-700 mb-2">Harga per Unit *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-600">Rp</span>
              <input v-model.number="formData.harga_per_unit" type="number" required min="0"
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0" />
            </div>
            <p class="text-xs text-gray-500 mt-1">Harga per unit hanya untuk barang masuk</p>
          </div>
          <div v-else>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">
                <svg class="w-4 h-4 inline mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Harga per unit tidak diperlukan untuk barang keluar
              </p>
            </div>
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
import { showError, showAlert } from '@/composables/useModal.js'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  editItem: {
    type: Object,
    default: null
  },
  kartuStokId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)

const formData = ref({
  kartu_stok_id: props.kartuStokId,
  tanggal: '',
  qty_masuk: 0,
  qty_keluar: 0,
  do_no: '',
  harga_per_unit: 0
})

const showHargaField = computed(() => {
  return formData.value.qty_masuk > 0
})

const transactionType = computed(() => {
  if (formData.value.qty_masuk > 0 && formData.value.qty_keluar === 0) {
    return 'masuk'
  } else if (formData.value.qty_keluar > 0 && formData.value.qty_masuk === 0) {
    return 'keluar'
  } else if (formData.value.qty_masuk > 0 && formData.value.qty_keluar > 0) {
    return 'invalid'
  } else {
    return 'none'
  }
})

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      kartu_stok_id: props.kartuStokId,
      tanggal: formatDateForInput(newItem.Tanggal),
      qty_masuk: newItem.penambahan_banyak || 0,
      qty_keluar: newItem.pengurangan_banyak || 0,
      do_no: newItem.nomor_bukti,
      harga_per_unit: newItem.penambahan_harga_pokok_per_unit || 0
    }
  } else {
    resetForm()
  }
})

watch(() => props.showModal, (show) => {
  if (!show) {
    resetForm()
  }
})

watch(() => formData.value.qty_masuk, (newVal) => {
  if (newVal === 0) {
    formData.value.harga_per_unit = 0
  }
})

const resetForm = () => {
  formData.value = {
    kartu_stok_id: props.kartuStokId,
    tanggal: '',
    qty_masuk: 0,
    qty_keluar: 0,
    do_no: '',
    harga_per_unit: 0
  }
}

const formatDateForInput = (dateStr) => {
  const [day, month, year] = dateStr.split('-')
  return `${year}-${month}-${day}`
}

const handleSubmit = async () => {
  // Validation based on transaction type
  if (transactionType.value === 'none') {
    await showError('Qty Masuk atau Qty Keluar harus diisi (salah satu saja)')
    return
  }

  if (transactionType.value === 'invalid') {
    await showError('Tidak bisa mengisi Qty Masuk dan Qty Keluar bersamaan. Pilih salah satu.')
    return
  }

  // Validation: if qty_masuk > 0, harga_per_unit must be > 0
  if (transactionType.value === 'masuk' && formData.value.harga_per_unit === 0) {
    await showError('Harga per Unit harus diisi untuk barang masuk')
    return
  }

  // Prepare data for API
  const submitData = {
    kartu_stok_id: formData.value.kartu_stok_id,
    tanggal: formData.value.tanggal,
    qty_masuk: formData.value.qty_masuk,
    qty_keluar: formData.value.qty_keluar,
    do_no: formData.value.do_no
  }

  // Only include harga_per_unit for barang masuk
  if (transactionType.value === 'masuk') {
    submitData.harga_per_unit = formData.value.harga_per_unit
  }

  emit('save', submitData)
  await showAlert({
    type: 'success',
    title: 'Berhasil',
    message: isEdit.value ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil ditambahkan!',
    confirmLabel: 'OK',
  })
}
</script>