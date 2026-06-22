<template>
  <div class="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
      <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{{ item.nama_barang }}</h3>
      <span :class="[
        'px-2 py-1 rounded-full text-xs font-medium inline-block w-fit',
        item.sisa_stok <= 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      ]">
        {{ item.sisa_stok <= 50 ? 'Stok Rendah' : 'Tersedia' }} </span>
    </div>

    <div class="space-y-1 sm:space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-xs sm:text-sm text-gray-600">Kode:</span>
        <span class="text-xs sm:text-sm font-medium text-gray-900">{{ item.kode_barang }}</span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-xs sm:text-sm text-gray-600">Total Masuk:</span>
        <span class="text-xs sm:text-sm font-medium text-green-600">{{ item.total_masuk }}</span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-xs sm:text-sm text-gray-600">Total Keluar:</span>
        <span class="text-xs sm:text-sm font-medium text-red-600">{{ item.total_keluar }}</span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-xs sm:text-sm text-gray-600">Sisa Stok:</span>
        <span class="text-xs sm:text-sm font-medium text-gray-900">{{ item.sisa_stok }}</span>
      </div>

      <!-- <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Nilai Persediaan:</span>
        <span class="text-sm font-medium text-gray-900">Rp {{ formatHarga(item.nilai_persediaan_akhir) }}</span>
      </div> -->
    </div>

    <div class="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
      <button @click="$emit('detail', item)"
        class="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors duration-200">
        <span class="hidden sm:inline">Lihat Detail</span>
        <span class="sm:hidden">Detail</span>
      </button>
      <button v-if="hasPermission('kartu stok', 'edit')" @click="$emit('edit', item)"
        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors duration-200">
        Edit
      </button>
      <button v-if="hasPermission('kartu stok', 'delete')" @click="$emit('delete', item)"
        class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors duration-200">
        Hapus
      </button>
    </div>
  </div>
</template>
<script setup>
import { inject } from 'vue'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

const hasPermission = inject('hasPermission', () => true)

defineEmits(['edit', 'delete', 'detail'])

const formatHarga = (harga) => {
  return harga.toLocaleString('id-ID')
}
</script>
