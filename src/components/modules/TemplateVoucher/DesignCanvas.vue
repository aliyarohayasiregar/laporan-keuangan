<template>
  <div class="flex-1 bg-gray-100 p-8 overflow-auto flex justify-center items-start">
    <div ref="canvasRef" :style="canvasStyle" class="relative bg-white shadow-lg cursor-crosshair select-none"
      @drop="onCanvasDrop" @dragover.prevent>
      <div v-for="el in template.components" :key="el.id" :style="elementStyle(el)" :class="[
        'absolute cursor-move transition-all duration-75',
        selectedId === el.id ? 'ring-2 ring-blue-500 z-10' : 'hover:ring-1 hover:ring-blue-300'
      ]" @mousedown="onElementMouseDown($event, el.id)">
        <!-- Logo -->
        <div v-if="el.type === 'logo'"
          class="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
          <svg v-if="!template.logo_url" class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <img v-else :src="template.logo_url" class="max-w-full max-h-full object-contain" alt="Logo" />
        </div>

        <!-- Company Name & Title -->
        <div v-else-if="['company_name', 'title', 'text'].includes(el.type)" :style="textStyle(el.properties)"
          class="w-full h-full flex items-center overflow-hidden text-black">
          <span v-if="el.type === 'company_name'">{{ template.company_name || 'NAMA PERUSAHAAN' }}</span>
          <span v-else>{{ el.properties.text || 'Teks' }}</span>
        </div>

        <!-- Field -->
        <div v-else-if="el.type === 'field'" class="w-full h-full flex flex-col justify-center">
          <span :style="textStyle({ fontSize: el.properties.fontSize, fontWeight: 'bold' })"
            class="text-xs text-gray-600">{{ el.properties.label }}:</span>
          <span :style="textStyle({ fontSize: el.properties.fontSize || 12 })" class="text-black">{{
            fieldKeyToLabel(el.properties.fieldKey) }}</span>
        </div>

        <!-- Line -->
        <div v-else-if="el.type === 'line'" class="w-full h-full bg-gray-800 my-auto"></div>

        <!-- Table -->
        <div v-else-if="el.type === 'table'" class="w-full h-full overflow-hidden border border-gray-800">
          <table class="w-full text-xs">
            <thead class="bg-gray-200 border-b-2 border-gray-800">
              <tr>
                <th v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }"
                  class="border border-gray-400 px-1 py-0.5 text-center font-semibold text-gray-800">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in displayRows" :key="i" class="border-b border-gray-300">
                <td v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }"
                  class="border border-gray-400 px-1 text-center">
                  {{ row[col.key] }}
                </td>
              </tr>
              <tr v-if="el.properties.showTotals" class="bg-gray-100 font-semibold border-t-2 border-gray-800">
                <td :colspan="el.properties.columns.length - 2" class="border border-gray-800 px-1 text-right pr-4">
                  TOTAL
                </td>
                <td class="border border-gray-800 px-1 text-right">{{ formatNumber(displayTotals.debit) }}</td>
                <td class="border border-gray-800 px-1 text-right">{{ formatNumber(displayTotals.kredit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signature -->
        <div v-else-if="el.type === 'signature'"
          class="w-full h-full border border-gray-400 rounded p-1 text-center text-xs flex flex-col justify-between">
          <p class="font-medium">{{ el.properties.label || 'Tanda Tangan' }}</p>
          <div class="h-8 border-b border-gray-400 mx-2 my-2"></div>
          <p>TTD</p>
          <p>TGL: ....</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  template: { type: Object, required: true },
  selectedId: { type: [String, Number], default: null },
  canvasStyle: { type: Object, required: true },
  displayRows: { type: Array, default: () => [] },
  displayTotals: { type: Object, default: () => ({}) },
  elementStyle: { type: Function, required: true },
  textStyle: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  onCanvasDrop: { type: Function, required: true },
  onElementMouseDown: { type: Function, required: true }
})

const canvasRef = ref(null)

const fieldKeyToLabel = (key) => {
  const labels = {
    'no_voucher': 'JV-000001',
    'tanggal': '01/01/2024',
    'company_name': 'PT. Contoh'
  }
  return labels[key] || key
}

defineExpose({
  canvasRef
})
</script>
