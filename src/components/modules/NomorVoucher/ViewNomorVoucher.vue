<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h3 class="text-lg font-semibold text-gray-900">Detail Nomor Voucher</h3>
        <p class="text-sm text-gray-600 mt-1">Informasi lengkap nomor voucher</p>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto flex-1">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <svg class="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memuat data...
        </div>

        <div v-else-if="displayData" class="space-y-4">
          <!-- Main Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informasi Nomor Voucher</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Kode Voucher:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayData.kode }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Tahun:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayData.tahun }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Status:</span>
                <span :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  displayData.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ displayData.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Timestamp Info -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informasi Waktu</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Dibuat:</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(createdAtValue) }}</span>
              </div>
              <div class="flex justify-between" v-if="updatedAtValue && updatedAtValue !== createdAtValue">
                <span class="text-sm text-gray-600">Diperbarui:</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(updatedAtValue) }}</span>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informasi Tambahan</h4>
            <div class="space-y-2">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-gray-700">
                  Nomor voucher ini {{ displayData.status === 'aktif' ? 'sedang aktif dan dapat digunakan' : 'nonaktif dan tidak dapat digunakan' }} untuk transaksi.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium">Data tidak ditemukan</p>
          <p class="text-sm text-gray-400">Terjadi kesalahan saat memuat data nomor voucher</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <button @click="handleClose"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import nomorVoucherService from '../../../services/nomorVoucherService.js'

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  nomorVoucher: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const freshData = ref(null)

// Use fresh data if available, otherwise fall back to props
const displayData = computed(() => {
  return freshData.value || props.nomorVoucher
})

// Beberapa kemungkinan nama field tanggal, tergantung bentuk response API.
// Backend nomor voucher (getNoBukti) pakai field "dibuat" — ditaruh paling depan
// supaya jadi prioritas utama, sisanya tetap dijaga sebagai fallback untuk modul lain.
const createdAtValue = computed(() => {
  const d = displayData.value || {}
  return d.dibuat || d.created_at || d.createdAt || d.tanggal_dibuat || d.CreatedAt || null
})

const updatedAtValue = computed(() => {
  const d = displayData.value || {}
  return d.diperbarui || d.updated_at || d.updatedAt || d.tanggal_diperbarui || d.UpdatedAt || null
})

// Function to fetch fresh data from API
const fetchFreshData = async (id) => {
  try {
    console.log(`Fetching fresh nomor voucher data for ID: ${id}`)
    loading.value = true
    
    const response = await nomorVoucherService.getNoBukti(id)
    console.log('Fresh API Response:', response)
    
    if (response.success && response.data) {
      freshData.value = response.data
      console.log('Fresh data loaded:', response.data)
    } else {
      console.error('Failed to fetch fresh nomor voucher data:', response.message)
      freshData.value = null
    }
  } catch (error) {
    console.error('Error fetching fresh nomor voucher data:', error)
    freshData.value = null
  } finally {
    loading.value = false
  }
}

// Watch for modal open and nomorVoucher ID changes
watch(() => props.showModal, async (show) => {
  if (show && props.nomorVoucher?.id) {
    console.log('Modal opened, fetching fresh data for nomor voucher ID:', props.nomorVoucher.id)
    await fetchFreshData(props.nomorVoucher.id)
  }
})

const handleClose = () => {
  console.log('Close button clicked in ViewNomorVoucher')
  freshData.value = null // Reset fresh data
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>