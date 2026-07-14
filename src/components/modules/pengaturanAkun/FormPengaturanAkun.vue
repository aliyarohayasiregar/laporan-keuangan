<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Pengaturan Akun' : 'Tambah Pengaturan Akun' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui akun sistem' : 'Atur akun sistem untuk jenis jurnal ini' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Jurnal</label>
            <input :value="formData.nama_jenis_jurnal" type="text" readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Akun *</label>
            <select v-model.number="formData.akun_id" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option :value="null" disabled>Pilih akun</option>
              <option v-for="akun in namaAkunOptions" :key="akun.id" :value="akun.id">
                {{ akun.kode }} - {{ akun.nama_akun }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Pilih akun yang akan digunakan sebagai akun sistem untuk jenis jurnal ini
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Batal
          </button>
          <button type="submit" :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
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
  editItem: { type: Object, default: null },
  namaAkunOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem && !!props.editItem.akun_id)
const submitting = ref(false)

const formData = ref({
  no_jenis_jurnal: null,
  nama_jenis_jurnal: '',
  akun_id: null
})

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    if (props.editItem) {
      formData.value = {
        no_jenis_jurnal: props.editItem.no_jenis_jurnal,
        nama_jenis_jurnal: props.editItem.nama_jenis_jurnal,
        akun_id: props.editItem.akun_id || null
      }
    } else {
      formData.value = {
        no_jenis_jurnal: null,
        nama_jenis_jurnal: '',
        akun_id: null
      }
    }
  }
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      // Edit existing pengaturan
      const response = await api.editPengaturanAkunSistem(props.editItem.id, {
        akun_id: formData.value.akun_id
      })
      if (response.success) {
        showAlert({
          title: 'Berhasil',
          message: 'Pengaturan akun berhasil diperbarui',
          type: 'success'
        })
        emit('save')
      } else {
        showAlert({
          title: 'Gagal',
          message: response.message || 'Gagal memperbarui pengaturan akun',
          type: 'error'
        })
      }
    } else {
      // Create new pengaturan
      const response = await api.createPengaturanAkunSistem(formData.value.no_jenis_jurnal, {
        akun_id: formData.value.akun_id
      })
      if (response.success) {
        showAlert({
          title: 'Berhasil',
          message: 'Pengaturan akun berhasil ditambahkan',
          type: 'success'
        })
        emit('save')
      } else {
        showAlert({
          title: 'Gagal',
          message: response.message || 'Gagal menambahkan pengaturan akun',
          type: 'error'
        })
      }
    }
  } catch (err) {
    console.error('Error saving pengaturan akun:', err)
    showAlert({
      title: 'Gagal',
      message: err.message || 'Terjadi kesalahan saat menyimpan pengaturan akun',
      type: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>
