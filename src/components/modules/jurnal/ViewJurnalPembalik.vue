<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Detail Jurnal Pembalik</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Memuat data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Jurnal Data -->
        <div v-else-if="displayJurnal" class="space-y-6">
          <!-- Main Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Kode Jurnal</p>
                <p class="text-lg font-semibold text-gray-900">{{ displayJurnal.kode }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Tanggal</p>
                <p class="text-lg font-semibold text-gray-900">{{ formatDate(displayJurnal.tanggal) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">No. Voucher</p>
                <p class="text-lg font-semibold text-gray-900">{{ displayJurnal.no_bukti }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span :class="getStatusClass(displayJurnal.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ formatStatus(displayJurnal.status) }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Pencatat</p>
                <p class="text-lg font-semibold text-gray-900">{{ displayJurnal.nama_pencatat }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Keterangan</p>
                <p class="text-lg font-semibold text-gray-900">{{ displayJurnal.keterangan }}</p>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-600">Total Debit</p>
                <p class="text-2xl font-bold text-blue-700">Rp {{ formatNumber(displayJurnal.total_debit) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Kredit</p>
                <p class="text-2xl font-bold text-green-700">Rp {{ formatNumber(displayJurnal.total_kredit) }}</p>
              </div>
            </div>
          </div>

          <!-- Details Table -->
          <div class="bg-white border border-gray-200 rounded-lg">
            <div class="px-4 py-3 border-b border-gray-200">
              <h4 class="text-sm font-medium text-gray-900">Detail Transaksi</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Akun
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun
                    </th>
                    <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan</th> -->
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit
                    </th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="!displayJurnal.details || displayJurnal.details.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      <div class="flex flex-col items-center">
                        <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                          </path>
                        </svg>
                        <p class="text-sm">Belum ada detail transaksi</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="(detail, index) in displayJurnal.details" :key="index" class="hover:bg-gray-50">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ detail.kode_akun }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ detail.nama_akun }}</td>
                    <!-- <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ detail.keterangan }}</td> -->
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      <span v-if="detail.debit > 0" class="font-medium text-blue-600">Rp {{ formatNumber(detail.debit)
                      }}</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      <span v-if="detail.kredit > 0" class="font-medium text-green-600">Rp {{
                        formatNumber(detail.kredit) }}</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p class="mt-1 text-sm text-gray-500">Data jurnal tidak tersedia.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-end">
          <button @click="handleClose"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
            Tutup
          </button>
        </div>
      </div>
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
  jurnal: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// Reactive data
const loading = ref(false)
const error = ref('')
const freshJurnalData = ref(null)

// Computed
const displayJurnal = computed(() => {
  return freshJurnalData.value || props.jurnal
})

const balance = computed(() => {
  if (!displayJurnal.value) return 0
  return displayJurnal.value.total_debit - displayJurnal.value.total_kredit
})

const balanceColor = computed(() => {
  const bal = balance.value
  if (bal > 0) return 'text-blue-600'
  if (bal < 0) return 'text-red-600'
  return 'text-green-600'
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const formatStatus = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'menunggu_approval': 'Menunggu Approval',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    'draft': 'bg-gray-100 text-gray-800',
    'menunggu_approval': 'bg-yellow-100 text-yellow-800',
    'disetujui': 'bg-green-100 text-green-800',
    'ditolak': 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const fetchFreshJurnalData = async () => {
  if (!props.jurnal?.id) return

  try {
    loading.value = true
    error.value = ''

    console.log('Fetching fresh jurnal pembalik data for ID:', props.jurnal.id)
    const response = await fetch(`https://api.coopdevs.com/api/jpb/getJurnalPembalik/${props.jurnal.id}`)
    const result = await response.json()

    if (result.success && result.data) {
      freshJurnalData.value = result.data
      console.log('Fresh jurnal data loaded:', result.data)
    } else {
      console.error('Failed to fetch fresh jurnal data:', result)
      error.value = 'Gagal memuat data jurnal: ' + (result.message || 'Unknown error')
    }
  } catch (err) {
    console.error('Error fetching fresh jurnal data:', err)
    error.value = 'Terjadi kesalahan saat memuat data jurnal'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  freshJurnalData.value = null
  error.value = ''
  emit('close')
}

// Watch for modal opening to fetch fresh data
watch(() => props.showModal, (show) => {
  if (show && props.jurnal) {
    fetchFreshJurnalData()
  }
})
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.table-header {
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
}

.summary-card {
  transition: transform 0.2s ease-in-out;
}

.summary-card:hover {
  transform: translateY(-2px);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
