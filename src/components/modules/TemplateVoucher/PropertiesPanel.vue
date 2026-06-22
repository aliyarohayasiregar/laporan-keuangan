<template>
  <div class="bg-white border-l border-gray-200 w-80 p-4 flex flex-col">
    <h3 class="font-semibold text-gray-800 mb-4">Properti</h3>
    
    <div v-if="!selectedElement" class="text-center py-12 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
      <p class="text-sm">Pilih elemen di kanvas untuk mengedit properti</p>
    </div>

    <div v-else class="flex-1 overflow-y-auto space-y-4">
      <div class="bg-gray-50 p-3 rounded-lg">
        <p class="text-xs font-medium text-gray-600 uppercase">Jenis Elemen</p>
        <p class="font-medium text-gray-800 capitalize">{{ selectedElement.type }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500">X (%)</label>
          <input v-model.number="selectedElement.x" type="number" class="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Y (%)</label>
          <input v-model.number="selectedElement.y" type="number" class="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Lebar (%)</label>
          <input v-model.number="selectedElement.width" type="number" class="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Tinggi (%)</label>
          <input v-model.number="selectedElement.height" type="number" class="w-full px-2 py-1 border rounded" />
        </div>
      </div>

      <div v-if="hasTextProps">
        <label class="text-xs text-gray-500">Teks</label>
        <input v-model="selectedElement.properties.text" type="text" class="w-full px-2 py-1 border rounded" />
      </div>

      <div v-if="selectedElement.type === 'field'">
        <label class="text-xs text-gray-500">Label</label>
        <input v-model="selectedElement.properties.label" type="text"
          class="w-full px-2 py-1 border rounded mb-2" />
        <label class="text-xs text-gray-500">Field Key</label>
        <select v-model="selectedElement.properties.fieldKey" class="w-full px-2 py-1 border rounded">
          <option value="no_voucher">no_voucher</option>
          <option value="tanggal">tanggal</option>
          <option value="company_name">company_name</option>
        </select>
      </div>

      <div v-if="hasTextProps">
        <label class="text-xs text-gray-500">Ukuran Font</label>
        <input v-model.number="selectedElement.properties.fontSize" type="number" min="8" max="36"
          class="w-full px-2 py-1 border rounded" />
        <label class="text-xs text-gray-500 mt-2 block">Alignment</label>
        <select v-model="selectedElement.properties.align" class="w-full px-2 py-1 border rounded">
          <option value="left">Kiri</option>
          <option value="center">Tengah</option>
          <option value="right">Kanan</option>
        </select>
      </div>

      <div v-if="selectedElement.type === 'signature'">
        <label class="text-xs text-gray-500">Label / Jabatan</label>
        <input v-model="selectedElement.properties.label" type="text" class="w-full px-2 py-1 border rounded"
          placeholder="Contoh: Disetujui Oleh" />
      </div>

      <div class="border-t pt-4 mt-4">
        <button
          @click="deleteSelected"
          class="w-full p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus Elemen
        </button>
      </div>
    </div>

    <div class="border-t pt-4 mt-4">
      <p class="text-xs text-gray-500 mb-2">
        Tips:
      </p>
      <ul class="text-xs text-gray-400 space-y-1">
        <li>• Drag komponen dari panel kiri</li>
        <li>• Pindah posisi elemen di kanvas</li>
        <li>• Klik elemen untuk mengedit</li>
        <li>• Drag tanda tangan satu per satu (2, 3, atau 4 sesuai kebutuhan)</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedElement: { type: Object, default: null },
  hasTextProps: { type: Boolean, default: false },
  deleteSelected: { type: Function, required: true }
})
</script>
