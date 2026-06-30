<template>
  <div v-if="template" class="p-4">
    <!-- Preview Canvas -->
    <div id="voucher-print-area" ref="previewContainer" :style="containerStyle"
      class="relative bg-white shadow-lg mx-auto border border-gray-300">
      <div v-for="el in template.components" :key="el.id" :style="elementStyle(el)" class="absolute">
        <!-- Logo -->
        <div v-if="el.type === 'logo'" class="w-full h-full flex items-center justify-center">
          <img v-if="template.logo_url" :src="template.logo_url" class="max-w-full max-h-full object-contain"
            alt="Logo">
        </div>

        <!-- Company Name & Title -->
        <div v-else-if="['company_name', 'title', 'text'].includes(el.type)" :style="textStyle(el.properties)"
          class="w-full h-full flex items-center overflow-hidden">
          <span v-if="el.type === 'company_name'">{{ template.company_name }}</span>
          <span v-else-if="el.type === 'title'">{{ voucherData.jenis_jurnal_label || el.properties.text }}</span>
          <span v-else>{{ el.properties.text }}</span>
        </div>

        <!-- Dynamic Fields -->
        <div v-else-if="el.type === 'field'" class="w-full h-full flex flex-col justify-start pt-1">
          <span :style="textStyle({ fontSize: el.properties.fontSize, fontWeight: 'bold' })"
            class="text-sm text-gray-700 mb-1">{{ el.properties.label }}:</span>
          <span :style="textStyle({ fontSize: el.properties.fontSize || 14 })" class="text-gray-900 font-medium">{{
            voucherData[el.properties.fieldKey] }}</span>
        </div>

        <!-- Line -->
        <div v-else-if="el.type === 'line'" class="w-full h-full bg-black my-auto"></div>

        <!-- Table -->
        <div v-else-if="el.type === 'table'" class="w-full h-full overflow-hidden border border-black">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b-2 border-black">
              <tr>
                <th v-for="col in (el.properties.columns || [])" :key="col.key" :style="{ width: `${col.width}%` }"
                  class="border border-gray-400 px-2 py-1 text-center font-semibold">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in voucherData.rows" :key="idx" class="border-b border-gray-300">
                <td v-for="col in (el.properties.columns || [])" :key="col.key" :style="{ width: `${col.width}%` }"
                  class="border border-gray-400 px-2 py-1 text-center">
                  {{ col.key === 'jumlah' ? formatNumber(row[col.key]) : row[col.key] }}
                </td>
              </tr>
              <tr v-if="el.properties.showTotals === true || el.properties.showTotals === 'true'"
                class="bg-gray-100 font-semibold border-t-2 border-black">
                <td :colspan="(el.properties.columns?.length || 2) - 1"
                  class="border border-black px-2 py-1 text-right pr-4">TOTAL</td>
                <td class="border border-black px-2 py-1 text-right">{{ formatNumber(voucherData.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signature -->
        <div v-else-if="el.type === 'signature'"
          class="w-full h-full text-center text-xs flex flex-col justify-between py-1">
          <p class="font-medium truncate">{{ el.properties.label }}</p>
          <div class="h-6 border-b border-black mx-3 my-1"></div>
          <p>(........................)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  template: Object,
  voucherData: Object
})

const previewContainer = ref(null)

// Calculate paper dimensions based on template
const containerStyle = computed(() => {
  const sizes = { A4: { width: 210, height: 297 }, Letter: { width: 216, height: 279 } }
  const size = sizes[props.template?.paper_size] || sizes.A4
  const finalSize = props.template?.orientation === 'landscape'
    ? { width: size.height, height: size.width }
    : size
  const scale = 2.0
  return {
    width: `${finalSize.width * scale}px`,
    height: `${finalSize.height * scale}px`,
    minWidth: `${finalSize.width * scale}px`
  }
})

const elementStyle = (el) => ({
  left: `${el.x}%`,
  top: `${el.y}%`,
  width: `${el.width}%`,
  height: `${el.height}%`
})

const textStyle = (props = {}) => ({
  fontSize: `${props.fontSize || 14}px`,
  fontWeight: props.fontWeight || 'normal',
  textAlign: props.align || 'left'
})

const formatNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toLocaleString('id-ID')
}
</script>
