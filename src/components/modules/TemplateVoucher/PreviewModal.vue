<template>
  <div v-if="showPreview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="handleClose">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="font-semibold text-gray-900">Preview Voucher (Data Contoh)</h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>
      <div class="p-6 flex justify-center bg-gray-100 overflow-auto flex-1">
        <div :style="canvasStyle" class="relative bg-white shadow-lg">
          <div v-for="el in flattenComponents(template.components)" :key="el.id" :style="elementStyle(el)" class="absolute overflow-hidden">
            <!-- Logo -->
            <div v-if="el.type === 'logo'" class="w-full h-full flex items-center justify-center">
              <img v-if="template.logo_url" :src="template.logo_url" class="max-w-full max-h-full object-contain" alt="Logo" />
            </div>

            <!-- Company Name & Title -->
            <div v-else-if="['company_name', 'title', 'text'].includes(el.type)" :style="textStyle(el.properties)" class="w-full h-full flex items-center overflow-hidden">
              <span v-if="el.type === 'company_name'">{{ template.company_name || 'NAMA PERUSAHAAN' }}</span>
              <span v-else>{{ el.properties.text || 'Teks' }}</span>
            </div>

            <!-- Field -->
            <div v-else-if="el.type === 'field'" class="w-full h-full flex flex-col justify-center">
              <span :style="textStyle({ fontSize: el.properties.fontSize, fontWeight: 'bold' })" class="text-xs text-gray-600">{{ el.properties.label }}:</span>
              <span :style="textStyle({ fontSize: el.properties.fontSize || 12 })" class="">{{ sampleData[el.properties.fieldKey] || '...' }}</span>
            </div>

            <!-- Line -->
            <div v-else-if="el.type === 'line'" class="w-full h-full bg-black my-auto"></div>

            <!-- Table -->
            <div v-else-if="el.type === 'table'" class="w-full h-full overflow-hidden border border-black">
              <table class="w-full text-xs">
                <thead class="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }" class="border border-gray-600 px-1 py-0.5 text-center font-semibold">
                      {{ col.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in sampleData.rows" :key="i" class="border-b border-gray-300">
                    <td v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }" class="border border-gray-400 px-1 text-center">
                      {{ row[col.key] }}
                    </td>
                  </tr>
                  <tr v-if="el.properties.showTotals" class="bg-gray-100 font-semibold border-t-2 border-black">
                    <td :colspan="el.properties.columns.length - 2" class="border border-black px-1 text-right pr-4">
                      TOTAL
                    </td>
                    <td class="border border-black px-1 text-right">{{ formatNumber(sampleData.total_debit) }}</td>
                    <td class="border border-black px-1 text-right">{{ formatNumber(sampleData.total_kredit) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Signature -->
            <div v-else-if="el.type === 'signature'" class="w-full h-full text-center text-xs flex flex-col justify-between">
              <p class="font-medium">{{ el.properties.label || 'Tanda Tangan' }}</p>
              <div class="h-8 border-b border-black mx-2 my-2"></div>
              <p>(........................)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showPreview: { type: Boolean, required: true },
  template: { type: Object, required: true },
  canvasStyle: { type: Object, required: true },
  sampleData: { type: Object, required: true },
  elementStyle: { type: Function, required: true },
  textStyle: { type: Function, required: true },
  formatNumber: { type: Function, required: true }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

// Helper to handle multiple signatures
const flattenComponents = (components) => {
  const result = []
  components.forEach(el => {
    if (el.type === 'signature' && !el.id.includes('_split_') && el.width > 25) {
      const count = Math.min(4, Math.floor(el.width / 22))
      const blockWidth = el.width / count
      const labels = ['Dibuat Oleh', 'Diperiksa Oleh', 'Disetujui Oleh', 'Diketahui Oleh']
      for (let i = 0; i < count; i++) {
        result.push({
          id: `${el.id}_${i}`,
          type: 'signature',
          x: el.x + blockWidth * i,
          y: el.y,
          width: blockWidth - 1,
          height: el.height,
          properties: { label: labels[i] || `Tanda Tangan ${i + 1}` }
        })
      }
    } else {
      result.push(el)
    }
  })
  return result
}
</script>
