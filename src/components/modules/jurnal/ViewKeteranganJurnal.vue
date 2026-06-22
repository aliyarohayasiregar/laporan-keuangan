<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Keterangan Jurnal</h3>
        <p class="text-sm text-gray-600 mt-1">Kode: {{ jurnal.kode }}</p>
      </div>

      <!-- Keterangan Content -->
      <div class="p-6">
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-700">Kode Jurnal:</span>
              <span class="text-sm font-medium text-gray-900">{{ jurnal.kode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-700">Tanggal:</span>
              <span class="text-sm font-medium text-gray-900">{{ formatDate(jurnal.tanggal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-700">No. Voucher:</span>
              <span class="text-sm font-medium text-gray-900">{{ jurnal.no_bukti }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span :class="[
                'px-2 py-1 text-xs rounded-full font-medium',
                jurnal.status === 'menunggu_approval'
                  ? 'bg-yellow-100 text-yellow-800'
                  : jurnal.status === 'disetujui'
                    ? 'bg-green-100 text-green-800'
                    : jurnal.status === 'ditolak'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              ]">
                {{ formatStatus(jurnal.status) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-700">Dibuat Oleh:</span>
              <span class="text-sm font-medium text-gray-900">{{ jurnal.nama_pencatat }}</span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700 block mb-2">Keterangan Lengkap:</span>
              <div class="bg-white p-4 rounded-lg border border-gray-200">
                <p class="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm">
                  {{ jurnal.keterangan }}
                </p>
              </div>
            </div>
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

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
