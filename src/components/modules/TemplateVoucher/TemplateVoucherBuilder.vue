<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Template Builder Voucher</h1>
          <p class="text-indigo-100 mt-1">Desain layout laporan bukti voucher dengan drag & drop</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button @click="showPreview = true"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors">
            Preview
          </button>
          <button @click="handleDownloadPDF"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors">
            Download PDF
          </button>
          <button @click="handleDelete" :disabled="saving || !template.id"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {{ saving ? 'Menghapus...' : 'Hapus Template' }}
          </button>
          <button @click="handleSave" :disabled="saving"
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {{ saving ? 'Menyimpan...' : 'Simpan Template' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-3 items-end shadow-sm">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Pilih Template</label>
        <div class="flex gap-2">
          <select v-model="selectedTemplateId" @change="loadSelectedTemplate"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 min-w-48">
            <option value="">Buat Template Baru</option>
            <option v-for="t in allTemplates" :key="t.id" :value="t.id">
              {{ t.template_name }} ({{ t.category }})
            </option>
          </select>
          <button @click="handleLoadAllTemplates" :disabled="loadingTemplates"
            class="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 disabled:opacity-50">
            🔄
          </button>
        </div>
      </div>
      <div class="h-8 border-l border-gray-300 mx-2"></div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Nama Template</label>
        <input v-model="template.template_name" type="text"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Ukuran Kertas</label>
        <select v-model="template.paper_size"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option v-for="(size, key) in PAPER_SIZES" :key="key" :value="key">{{ size.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Kategori Jurnal</label>
        <select v-model="template.category"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="umum">Jurnal Umum (Biasa)</option>
          <option value="adjustment">Jurnal Adjustment / Penyesuaian</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Orientasi</label>
        <select v-model="template.orientation"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Nama Perusahaan</label>
        <input v-model="template.company_name" type="text" placeholder="NAMA PT..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Logo</label>
        <div class="flex items-center gap-2">
          <label
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
            Upload Logo
            <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
          </label>
          <button v-if="template.logo_url" @click="template.logo_url = null"
            class="text-xs text-red-600 hover:text-red-800">Hapus</button>
        </div>
      </div>
      <button @click="resetToDefault"
        class="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
        Reset ke Default
      </button>
      <div v-if="saveMessage" class="text-sm text-emerald-600 font-medium self-center">{{ saveMessage }}</div>
    </div>

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar Komponen -->
      <div class="bg-white border-r border-gray-200 w-52 p-3 flex flex-col">
        <h3 class="font-semibold text-gray-800 mb-2 text-sm">Komponen</h3>
        <p class="text-xs text-gray-500 mb-3">Drag ke kanvas</p>
        <div class="space-y-2 flex-1">
          <div v-for="item in ELEMENT_TYPES" :key="item.type" draggable="true"
            @mousedown="(e) => onDragStart(e, item.type)" @dragstart="(e) => onDragStart(e, item.type)" :class="[
              'w-full p-2.5 rounded-lg text-left text-xs flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all',
              dragType === item.type ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
            ]">
            <span v-html="item.icon" class="w-5 h-5"></span>
            {{ item.label }}
          </div>
        </div>
        <div v-if="dragType" class="p-2 text-xs text-blue-600 text-center bg-blue-50 rounded-lg mt-2">
          Klik kanvas untuk meletakkan komponen!
        </div>
      </div>

      <!-- Canvas -->
      <div class="flex-1 bg-gray-100 p-4 overflow-auto flex justify-center items-start">
        <div ref="canvasRef" :style="canvasStyle" class="relative bg-white shadow-lg cursor-crosshair select-none"
          @drop="onCanvasDrop" @dragover.prevent @click="handleCanvasClick">
          <div v-for="el in template.components" :key="el.id" :style="elementStyle(el)" :class="[
            'absolute cursor-move transition-all duration-75',
            selectedId === el.id ? 'ring-2 ring-blue-500 z-20' : 'z-10 hover:ring-1 hover:ring-blue-300'
          ]" @mousedown.stop="onElementMouseDown($event, el.id)" @click.stop>
            <!-- Logo -->
            <div v-if="el.type === 'logo'"
              class="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
              <svg v-if="!template.logo_url" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
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
              class="w-full h-full text-center text-xs flex flex-col justify-between py-1">
              <p class="font-medium text-xs truncate">{{ el.properties.label || 'Tanda Tangan' }}</p>
              <div class="h-6 border-b border-black mx-3 my-1"></div>
              <p class="text-xs">(........................)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Properties Panel -->
      <div class="bg-white border-l border-gray-200 w-60 p-3 flex flex-col">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm">Properti</h3>

        <div v-if="!selectedElement" class="text-center py-8 text-gray-400">
          <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p class="text-xs">Pilih elemen di kanvas untuk mengedit properti</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto space-y-3">
          <div class="bg-gray-50 p-2.5 rounded-lg">
            <p class="text-xs font-medium text-gray-600 uppercase">Jenis Elemen</p>
            <p class="font-medium text-gray-800 capitalize text-sm">{{ selectedElement.type }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">X (%)</label>
              <input v-model.number="selectedElement.x" type="number" class="w-full px-2 py-1 border rounded text-xs" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Y (%)</label>
              <input v-model.number="selectedElement.y" type="number" class="w-full px-2 py-1 border rounded text-xs" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Lebar (%)</label>
              <input v-model.number="selectedElement.width" type="number"
                class="w-full px-2 py-1 border rounded text-xs" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Tinggi (%)</label>
              <input v-model.number="selectedElement.height" type="number"
                class="w-full px-2 py-1 border rounded text-xs" />
            </div>
          </div>

          <div v-if="hasTextProps">
            <label class="text-xs text-gray-500">Teks</label>
            <input v-model="selectedElement.properties.text" type="text"
              class="w-full px-2 py-1 border rounded text-xs" />
          </div>

          <div v-if="selectedElement.type === 'field'">
            <label class="text-xs text-gray-500">Label</label>
            <input v-model="selectedElement.properties.label" type="text"
              class="w-full px-2 py-1 border rounded mb-2 text-xs" />
            <label class="text-xs text-gray-500">Field Key</label>
            <select v-model="selectedElement.properties.fieldKey" class="w-full px-2 py-1 border rounded text-xs">
              <option value="no_voucher">no_voucher</option>
              <option value="tanggal">tanggal</option>
              <option value="company_name">company_name</option>
            </select>
          </div>

          <div v-if="hasTextProps">
            <label class="text-xs text-gray-500">Ukuran Font</label>
            <input v-model.number="selectedElement.properties.fontSize" type="number" min="8" max="36"
              class="w-full px-2 py-1 border rounded text-xs" />
            <label class="text-xs text-gray-500 mt-2 block">Alignment</label>
            <select v-model="selectedElement.properties.align" class="w-full px-2 py-1 border rounded text-xs">
              <option value="left">Kiri</option>
              <option value="center">Tengah</option>
              <option value="right">Kanan</option>
            </select>
          </div>

          <div v-if="selectedElement.type === 'signature'">
            <label class="text-xs text-gray-500">Label / Jabatan</label>
            <input v-model="selectedElement.properties.label" type="text"
              class="w-full px-2 py-1 border rounded text-xs" placeholder="Contoh: Disetujui Oleh" />
          </div>

          <div class="border-t pt-3 mt-3">
            <button @click="deleteSelected"
              class="w-full p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Elemen
            </button>
          </div>
        </div>

        <div class="border-t pt-3 mt-3">
          <p class="text-xs text-gray-500 mb-1">Tips:</p>
          <ul class="text-xs text-gray-400 space-y-0.5">
            <li>• Drag komponen dari panel kiri</li>
            <li>• Pindah posisi elemen di kanvas</li>
            <li>• Klik elemen untuk mengedit</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div id="preview-modal" v-if="showPreview"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showPreview = false">
      <div id="preview-modal-container"
        class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div id="preview-modal-header" class="flex justify-between items-center p-4 border-b">
          <h3 class="font-semibold text-gray-900">Preview Voucher (Data Contoh)</h3>
          <div class="flex gap-2">
            <button @click="handleDownloadPDF"
              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              Download PDF
            </button>
            <button @click="showPreview = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
        </div>
        <div id="preview-modal-content" class="p-6 flex justify-center bg-gray-100 overflow-auto flex-1">
          <div id="print-area" :style="canvasStyle" class="relative bg-white shadow-lg">
            <div v-for="el in template.components" :key="el.id" :style="elementStyle(el)"
              class="absolute overflow-hidden">
              <!-- Logo -->
              <div v-if="el.type === 'logo'" class="w-full h-full flex items-center justify-center">
                <img v-if="template.logo_url" :src="template.logo_url" class="max-w-full max-h-full object-contain"
                  alt="Logo" />
              </div>

              <!-- Company Name & Title -->
              <div v-else-if="['company_name', 'title', 'text'].includes(el.type)" :style="textStyle(el.properties)"
                class="w-full h-full flex items-center overflow-hidden">
                <span v-if="el.type === 'company_name'">{{ template.company_name || 'NAMA PERUSAHAAN' }}</span>
                <span v-else>{{ el.properties.text || 'Teks' }}</span>
              </div>

              <!-- Field -->
              <div v-else-if="el.type === 'field'" class="w-full h-full flex flex-col justify-center">
                <span :style="textStyle({ fontSize: el.properties.fontSize, fontWeight: 'bold' })"
                  class="text-xs text-gray-600">{{ el.properties.label }}:</span>
                <span :style="textStyle({ fontSize: el.properties.fontSize || 12 })" class="">{{
                  sampleData[el.properties.fieldKey] || '...' }}</span>
              </div>

              <!-- Line -->
              <div v-else-if="el.type === 'line'" class="w-full h-full bg-black my-auto"></div>

              <!-- Table -->
              <div v-else-if="el.type === 'table'" class="w-full h-full overflow-hidden border border-black">
                <table class="w-full text-xs">
                  <thead class="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }"
                        class="border border-gray-600 px-1 py-0.5 text-center font-semibold">
                        {{ col.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in sampleData.rows" :key="i" class="border-b border-gray-300">
                      <td v-for="col in el.properties.columns" :key="col.key" :style="{ width: `${col.width}%` }"
                        class="border border-gray-400 px-1 text-center">
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
              <div v-else-if="el.type === 'signature'"
                class="w-full h-full text-center text-xs flex flex-col justify-between">
                <p class="font-medium">{{ el.properties.label || 'Tanda Tangan' }}</p>
                <div class="h-8 border-b border-black mx-2 my-2"></div>
                <p>(........................)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, nextTick } from 'vue'
import { showSuccess, showError, showConfirm, showWarning } from '@/composables/useModal.js'
import { useRouter } from 'vue-router'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import voucherTemplateService, {
  PAPER_SIZES,
  ELEMENT_TYPES,
  createDefaultTemplate,
  getSampleVoucherData
} from '../../../services/voucherTemplateService.js'

const router = useRouter()
const hasPermission = inject('hasPermission', () => true)

// State
const template = ref(createDefaultTemplate())
const selectedId = ref(null)
const saving = ref(false)
const saveMessage = ref('')
const showPreview = ref(false)
const previewData = ref(null)
const canvasRef = ref(null)
const dragging = ref(null)
const dragType = ref(null)
const sampleData = getSampleVoucherData()
const allTemplates = ref([])
const selectedTemplateId = ref(null)
const loadingTemplates = ref(false)
const logoFile = ref(null)

// Computed
const selectedElement = computed(() => template.value.components.find(el => el.id === selectedId.value))
const hasTextProps = computed(() => selectedElement.value && ['title', 'text', 'company_name', 'field'].includes(selectedElement.value.type))

const paperDimensions = computed(() => {
  const sizes = { A4: { width: 210, height: 297 }, Letter: { width: 216, height: 279 }, Legal: { width: 216, height: 356 } }
  const size = sizes[template.value.paper_size] || sizes.A4
  return template.value.orientation === 'landscape' ? { width: size.height, height: size.width } : size
})

const canvasStyle = computed(() => {
  const scale = 1.7
  return {
    width: `${paperDimensions.value.width * scale}px`,
    height: `${paperDimensions.value.height * scale}px`,
    minWidth: `${paperDimensions.value.width * scale}px`
  }
})

const displayRows = computed(() => previewData.value?.rows || [
  { no: 1, deskripsi: '...', reff: 'COA Lawan', debit: 'xxx', kredit: '' },
  { no: 2, deskripsi: '...', reff: 'COA Lawan', debit: '', kredit: 'xxx' }
])

const displayTotals = computed(() => ({
  debit: previewData.value?.total_debit || 'xxx',
  kredit: previewData.value?.total_kredit || 'xxx'
}))

// Helper Methods
const generateElementId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const fieldKeyToLabel = (key) => {
  const labels = { 'no_voucher': 'JV-000001', 'tanggal': '01/01/2024', 'company_name': 'PT. Contoh' }
  return labels[key] || key
}

const formatNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toLocaleString('id-ID')
}

const createElement = (type) => {
  const defaults = {
    logo: { x: 5, y: 5, width: 12, height: 10, properties: {} },
    company_name: { x: 20, y: 5, width: 50, height: 6, properties: { fontSize: 14, fontWeight: 'bold' } },
    title: { x: 25, y: 15, width: 50, height: 6, properties: { text: 'VOUCHER', fontSize: 16, fontWeight: 'bold', align: 'center' } },
    field: { x: 5, y: 25, width: 40, height: 4, properties: { label: 'NO VOUCHER', fieldKey: 'no_voucher', fontSize: 12 } },
    table: { x: 5, y: 35, width: 90, height: 30, properties: { columns: [{ key: 'no', label: 'NO', width: 8 }, { key: 'deskripsi', label: 'DESKRIPSI', width: 35 }, { key: 'reff', label: 'REFF', width: 25 }, { key: 'debit', label: 'D', width: 16 }, { key: 'kredit', label: 'K', width: 16 }], showTotals: true } },
    signature: { x: 5, y: 70, width: 20, height: 18, properties: { label: 'Dibuat Oleh' } },
    text: { x: 5, y: 50, width: 50, height: 4, properties: { text: 'Catatan...', fontSize: 12 } },
    line: { x: 5, y: 55, width: 90, height: 0.3, properties: {} }
  }
  return { id: generateElementId(), type, ...defaults[type] }
}

const elementStyle = (el) => ({
  left: `${el.x}%`,
  top: `${el.y}%`,
  width: `${el.width}%`,
  height: `${el.height}%`
})

const textStyle = (props = {}) => ({
  fontSize: `${props.fontSize || 12}px`,
  fontWeight: props.fontWeight || 'normal',
  textAlign: props.align || 'left'
})

// Main Methods
const resetToDefault = async () => {
  const ok = await showConfirm({
    type: 'warning',
    title: 'Reset Template',
    message: 'Apakah Anda yakin ingin mengembalikan template ke layout default?',
    confirmLabel: 'Ya',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  const saved = { ...template.value }
  template.value = {
    ...createDefaultTemplate(),
    id: saved.id,
    template_name: saved.template_name
  }

  await showSuccess('Template berhasil direset')
}

const handleLoadAllTemplates = async () => {
  loadingTemplates.value = true
  try {
    const result = await voucherTemplateService.getAllTemplates()
    if (result.success) {
      allTemplates.value = result.data
    }
  } catch (err) {
    console.error('Error loading templates:', err)
    await showError('Gagal membaca file logo!')
  } finally {
    loadingTemplates.value = false
  }
}

const loadSelectedTemplate = () => {
  if (!selectedTemplateId.value) {
    template.value = createDefaultTemplate()
    return
  }
  const found = allTemplates.value.find(t => t.id === selectedTemplateId.value)
  if (found) {
    template.value = JSON.parse(JSON.stringify(found))
  }
}

const deleteSelected = async () => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Elemen',
    message: 'Apakah Anda yakin ingin menghapus elemen ini?',
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  template.value.components =
    template.value.components.filter(el => el.id !== selectedId.value)

  selectedId.value = null

  await showSuccess('Elemen berhasil dihapus')
}
const handleLogoUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  logoFile.value = file
  console.log('File dipilih:', file.name, file.type)
  // Create a local preview for the canvas
  const reader = new FileReader()
  reader.onload = (e) => {
    console.log('File reader selesai, DataURL:', e.target.result?.substring(0, 100), '...')
    template.value.logo_url = e.target.result
    saveMessage.value = 'Logo berhasil dipilih! Silakan simpan template.'
    setTimeout(() => saveMessage.value = '', 3000)
  }
  reader.onerror = async(e) => {
    console.error('Gagal baca file:', e)
    await showError('Gagal membaca file logo!')
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const handleSave = async () => {
  saving.value = true
  saveMessage.value = ''
  try {
    const payload = { ...template.value }
    let response
    if (payload.id) {
      response = await voucherTemplateService.updateTemplate(payload.id, payload, logoFile.value)
    } else {
      response = await voucherTemplateService.createTemplate(payload, logoFile.value)
      template.value.id = response.data.id
    }
    // Clear the file after saving
    logoFile.value = null
    // Refresh the templates list
    await handleLoadAllTemplates()
    saveMessage.value = response.message || 'Template berhasil disimpan'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch (err) {
    saveMessage.value = 'Gagal menyimpan template'
    await showError(err.message || 'Gagal menyimpan template')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!template.value.id) {
    await showWarning(
      'Tidak ada template yang dipilih untuk dihapus!',
      'Peringatan'
    )
    return
  }

  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Template',
    message: `Apakah Anda yakin ingin menghapus template <strong>${template.value.template_name}</strong>?`,
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
  })

  if (!ok) return

  saving.value = true
  try {
    await voucherTemplateService.deleteTemplate(template.value.id)
    // Reset to default template
    template.value = createDefaultTemplate()
    selectedTemplateId.value = null
    // Refresh the templates list
    await handleLoadAllTemplates()
    saveMessage.value = 'Template berhasil dihapus'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch (err) {
    saveMessage.value = 'Gagal menghapus template'
    await showError(err.message || 'Gagal menyimpan template')
  } finally {
    saving.value = false
  }
}

const loadTemplate = async () => {
  const id = window.location.hash.split('/').pop()
  if (!id || id === 'template-voucher') return
  try {
    const response = await voucherTemplateService.getTemplate(id)
    if (response.success && response.data) {
      template.value = response.data
    }
  } catch {
    // keep default template
  }
}

const handleDownloadPDF = async () => {
  // Tampilkan modal preview terlebih dahulu
  showPreview.value = true

  // Tunggu Vue merender modal
  await nextTick()

  // Tunggu sedikit lagi agar elemen terload sempurna
  setTimeout(async () => {
    try {
      // Dapatkan elemen print area
      const element = document.getElementById('print-area')
      if (!element) {
        await showError('Tidak dapat menemukan area voucher untuk di-download')
        showPreview.value = false
        return
      }

      // Capture elemen menjadi gambar dengan html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Kualitas tinggi
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      // Konversi canvas ke gambar
      const imgData = canvas.toDataURL('image/png')

      // Buat PDF
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Hitung ukuran PDF sesuai ukuran kertas template
      let pdfWidth, pdfHeight
      const paperSize = template.value.paper_size
      const isLandscape = template.value.orientation === 'landscape'

      if (paperSize === 'A4') {
        pdfWidth = isLandscape ? 297 : 210
        pdfHeight = isLandscape ? 210 : 297
      } else if (paperSize === 'Letter') {
        pdfWidth = isLandscape ? 279 : 216
        pdfHeight = isLandscape ? 216 : 279
      } else if (paperSize === 'Legal') {
        pdfWidth = isLandscape ? 356 : 216
        pdfHeight = isLandscape ? 216 : 356
      } else {
        pdfWidth = isLandscape ? 297 : 210
        pdfHeight = isLandscape ? 210 : 297
      }

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      })

      // Hitung posisi agar gambar berada di tengah
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgScaledWidth = imgWidth * ratio
      const imgScaledHeight = imgHeight * ratio
      const x = (pdfWidth - imgScaledWidth) / 2
      const y = (pdfHeight - imgScaledHeight) / 2

      // Tambahkan gambar ke PDF
      pdf.addImage(imgData, 'PNG', x, y, imgScaledWidth, imgScaledHeight)

      // Download PDF
      pdf.save(`voucher-template-${template.value.template_name || 'default'}.pdf`)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      await showError(
        'Gagal mendownload PDF, silakan coba lagi'
      )
    } finally {
      // Tutup modal preview
      showPreview.value = false
    }
  }, 500)
}

// Drag & Drop Logic
const onDragStart = (e, type) => {
  e.preventDefault()
  dragType.value = type
}

// Handler untuk klik di kanvas: bisa untuk menaruh komponen baru atau batal pilih
const handleCanvasClick = (e) => {
  console.log('Klik kanvas, dragType:', dragType.value) // Debug

  // Jika ada komponen yang aktif (dragType), taruh komponen baru di posisi klik
  if (dragType.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newEl = createElement(dragType.value)
    newEl.x = Math.max(0, Math.min(95, x - newEl.width / 2))
    newEl.y = Math.max(0, Math.min(95, y - newEl.height / 2))

    template.value.components.push(newEl)
    selectedId.value = newEl.id // Pilih komponen baru tersebut otomatis
    dragType.value = null
  } else {
    // Tidak ada dragType: batal pilih elemen
    selectedId.value = null
  }
}

// Tetap support drop untuk user yang suka drag n drop
const onCanvasDrop = (e) => {
  handleCanvasClick(e)
}

const onElementMouseDown = (e, id) => {
  console.log('Klik elemen:', id) // Debug
  if (e.button !== 0) return
  e.stopPropagation()
  selectedId.value = id
  const el = template.value.components.find(c => c.id === id)
  if (!el) return

  dragging.value = {
    id,
    startX: e.clientX,
    startY: e.clientY,
    elX: el.x,
    elY: el.y
  }
  console.log('selectedId sekarang:', selectedId.value) // Debug
}

const onMouseMove = (e) => {
  if (!dragging.value || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const dx = (e.clientX - dragging.value.startX) / rect.width * 100
  const dy = (e.clientY - dragging.value.startY) / rect.height * 100
  const el = template.value.components.find(c => c.id === dragging.value.id)
  if (el) {
    el.x = Math.max(0, Math.min(100 - el.width, dragging.value.elX + dx))
    el.y = Math.max(0, Math.min(100 - el.height, dragging.value.elY + dy))
  }
}

const onMouseUp = () => {
  dragging.value = null
}

// Permission Check
const checkPermissions = async () => {
  if (!hasPermission('template voucher')) {
    await showWarning(
      'Anda tidak memiliki izin untuk mengakses halaman ini.',
      'Akses Ditolak'
    )
    router.push('/dashboard')
    return false
  }
  return true
}

// Lifecycle
onMounted(async () => {
  const allowed = await checkPermissions()
  if (!allowed) return

  handleLoadAllTemplates()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<style>
/* Pastikan elemen bisa diklik */
.absolute.cursor-move {
  pointer-events: auto;
  user-select: none;
}

.absolute.cursor-move * {
  pointer-events: none;
  /* Biarkan elemen di dalamnya tidak menghalangi klik */
}

.absolute.cursor-move:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
</style>
