<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Detail Jurnal Umum</h3>
        <p class="text-sm text-gray-600 mt-1">Kode: {{ displayJurnal.kode }}</p>
      </div>

      <div class="p-6">
        <!-- Main Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Informasi Jurnal</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Kode:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayJurnal.kode }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Tanggal:</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(displayJurnal.tanggal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">No. Voucher:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayJurnal.no_bukti }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Keterangan:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayJurnal.keterangan }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Status:</span>
                <span :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  displayJurnal.status === 'menunggu_approval'
                    ? 'bg-yellow-100 text-yellow-800'
                    : displayJurnal.status === 'disetujui'
                      ? 'bg-green-100 text-green-800'
                      : displayJurnal.status === 'ditolak'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                ]">
                  {{ formatStatus(displayJurnal.status) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Dibuat Oleh:</span>
                <span class="text-sm font-medium text-gray-900">{{ displayJurnal.nama_pencatat }}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Ringkasan Jurnal</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Debit:</span>
                <span class="text-lg font-bold text-gray-900">{{ formatNumber(displayJurnal.total_debit) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Kredit:</span>
                <span class="text-lg font-bold text-gray-900">{{ formatNumber(displayJurnal.total_kredit) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Table -->
        <div v-if="displayJurnal.details && displayJurnal.details.length > 0" class="bg-gray-50 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 mb-4">Detail Transaksi</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun</th>
                  <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan
                  </th> -->
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Debug: Show details count -->
                <tr v-if="!displayJurnal.details || displayJurnal.details.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 00-2-2h2a2 2 0 002-2v10a2 2 0 002 2z">
                        </path>
                      </svg>
                      <p class="text-lg font-medium">Tidak ada detail transaksi</p>
                      <p class="text-sm text-gray-400">Data detail tidak tersedia</p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="(detail, index) in displayJurnal.details" :key="detail.id">
                  <td class="px-4 py-2 text-sm text-gray-600">{{ index + 1 }}</td>
                  <td class="px-4 py-2 text-sm text-gray-900">
                    <div>
                      <span class="font-medium">{{ detail.kode_akun }}</span>
                      <span class="text-gray-600 ml-2">- {{ detail.nama_akun }}</span>
                    </div>
                  </td>
                  <!-- <td class="px-4 py-2 text-sm text-gray-600">{{ detail.keterangan || '-' }}</td> -->
                  <td class="px-4 py-2 text-sm text-right font-medium text-gray-900">
                    {{ formatNumber(detail.debit) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-right font-medium text-gray-900">
                    {{ formatNumber(detail.kredit) }}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200">
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

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  jurnal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// Local state for fresh data from API
const freshJurnalData = ref(null)
const loading = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatStatus = (status) => {
  const statusMap = {
    'menunggu_approval': 'Menunggu Approval',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak',
    'draft': 'Draft'
  }
  return statusMap[status] || status
}

const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}

const balance = computed(() => {
  return displayJurnal.value.total_debit - displayJurnal.value.total_kredit
})

const balanceColor = computed(() => {
  return balance.value >= 0 ? 'text-green-600' : 'text-red-600'
})

// Function to fetch fresh jurnal data from API
const fetchFreshJurnalData = async (id) => {
  try {
    console.log(`Fetching fresh jurnal data for ID: ${id}`)
    loading.value = true

    const response = await fetch(`http://139.162.41.197:8001/api/ju/getJurnalUmum/${id}`)
    const result = await response.json()
    console.log('Fresh API Response:', result)

    if (result.success && result.data) {
      freshJurnalData.value = result.data
      console.log('Fresh data loaded:', result.data)
    } else {
      console.error('Failed to fetch fresh jurnal data:', result.message)
      freshJurnalData.value = null
    }
  } catch (error) {
    console.error('Error fetching fresh jurnal data:', error)
    freshJurnalData.value = null
  } finally {
    loading.value = false
  }
}

// Watch for modal open and jurnal ID changes
watch(() => props.showModal, async (show) => {
  if (show && props.jurnal?.id) {
    console.log('Modal opened, fetching fresh data for jurnal ID:', props.jurnal.id)
    await fetchFreshJurnalData(props.jurnal.id)
  }
})

// Use fresh data if available, otherwise fall back to props
const displayJurnal = computed(() => {
  return freshJurnalData.value || props.jurnal
})

const handleClose = () => {
  console.log('Close button clicked in ViewJurnalUmum')
  freshJurnalData.value = null // Reset fresh data
  emit('close')
}
</script>
