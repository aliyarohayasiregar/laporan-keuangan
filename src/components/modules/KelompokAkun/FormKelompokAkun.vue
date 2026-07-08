<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Kelompok Akun' : 'Tambah Kelompok Akun' }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi kelompok akun' : 'Masukkan informasi kelompok akun baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode *</label>

            <div v-if="!isEdit && !detectedFormat && !loadingParentOptions" class="mb-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Format Kode (belum ada data acuan)</label>
              <select v-model="selectedPresetLabel" @change="handlePresetChange"
                class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs">
                <option value="">Pilih format kode kelompok akun</option>
                <option v-for="preset in kodeFormatPresets" :key="preset.label" :value="preset.label">
                  {{ preset.label }}
                </option>
                <!-- <option value="custom">Custom...</option> -->
              </select>

              <div v-if="isCustomFormat" class="mt-2 flex items-center gap-1 flex-wrap">
                <template v-for="(seg, i) in customSegments" :key="i">
                  <input v-model.number="customSegments[i]" type="number" min="1" max="6"
                    class="w-14 px-1 py-1 border border-gray-300 rounded text-xs text-center" />
                  <span v-if="i < customSegments.length - 1" class="text-gray-400">-</span>
                </template>
                <button type="button" @click="customSegments.push(2)"
                  class="text-xs text-blue-600 hover:underline ml-1">+
                  segmen</button>
                <button type="button" @click="customSegments.length > 1 && customSegments.pop()"
                  class="text-xs text-red-500 hover:underline">- segmen</button>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">Format ini akan jadi acuan untuk kode berikutnya (di semua form
                COA).</p>
            </div>

            <input :value="formData.kode" @input="handleKodeInput" type="text" required :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              :placeholder="`Contoh: ${kodeFormatExample}`" :maxlength="kodeMaxLength" />

            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">Kode tidak dapat diubah saat edit</p>
            <p v-else-if="detectedFormat" class="text-xs text-gray-400 mt-1">
              Format otomatis dari Kelompok Akun yang sudah ada: {{ kodeFormat.join('-') }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Kelompok Akun *</label>
            <input v-model="formData.nama_kelompok_akun" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Aset Lancar" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <input v-model.number="formData.level" type="number" required min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 1" />
            <p class="text-xs text-gray-500 mt-1">Level hierarki akun (0 untuk parent tertinggi)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Parent ID</label>
            <select v-model.number="formData.parent_id" :disabled="loadingParentOptions"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option :value="null">Tidak ada (Akun Utama)</option>
              <option v-for="parent in filteredParentOptions" :key="parent?.id || Math.random()" :value="parent?.id">
                {{ (parent?.kode || '') }} - {{ (parent?.nama_kelompok_akun || '') }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ loadingParentOptions ? 'Memuat data parent...' : 'Pilih parent akun jika ini adalah sub-akun' }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Batal
          </button>
          <button type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            {{ isEdit ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showAlert } from '@/composables/useModal.js'
import api from '../../../services/api.js'

const props = defineProps({
  showModal: { type: Boolean, required: true },
  editItem: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)

const parentOptions = ref([])
const loadingParentOptions = ref(false)

const filteredParentOptions = computed(() => {
  if (!parentOptions.value || !Array.isArray(parentOptions.value)) return []

  let filtered = [...parentOptions.value].filter(p => p && typeof p === 'object' && p.kode)

  if (props.editItem) {
    filtered = filtered.filter(p => p.id !== props.editItem.id)
  }

  const currentKode = (formData.value.kode || '').trim()
  const currentLevel = formData.value.level

  if (currentLevel <= 0) return []

  filtered = filtered.filter(p => p.level === currentLevel - 1)

  if (currentKode) {
    const kodeGroup = currentKode.split(' ')[0] || ''
    filtered = filtered.filter(p => p.kode_group === kodeGroup)
  }

  return filtered.sort((a, b) => a.kode.localeCompare(b.kode))
})

const formData = ref({
  kode: '',
  nama_kelompok_akun: '',
  level: 0,
  parent_id: null,
  saldo_normal: 'D'
})

const allKelompokAkunRaw = ref([]) // dipakai HANYA untuk deteksi format kode, bukan untuk dropdown parent
const loadAllKelompokAkunForDetection = async () => {
  try {
    const response = await api.getAllKelompokAkun() // endpoint tanpa filter
    allKelompokAkunRaw.value = response.data || []

    const detected = detectKodeFormat(allKelompokAkunRaw.value)
    if (detected) {
      detectedFormat.value = detected
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(detected))
    } else {
      detectedFormat.value = null
    }
  } catch (error) {
    console.error('Error loading semua kelompok akun untuk deteksi format:', error)
    allKelompokAkunRaw.value = []
    detectedFormat.value = null
  }
}

const loadParentOptions = async () => {
  try {
    loadingParentOptions.value = true
    const response = await api.getParentKelompokAkun()
    parentOptions.value = response.data || []
  } catch (error) {
    console.error('Error loading parent kelompok akun:', error)
    parentOptions.value = []
  } finally {
    loadingParentOptions.value = false
  }
}

watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      kode: newItem.kode,
      nama_kelompok_akun: newItem.nama_kelompok_akun,
      level: newItem.level,
      parent_id: newItem.parent_id,
    }
  }
})

watch(() => props.showModal, (show) => {
  if (show) {
    loadParentOptions()
    loadAllKelompokAkunForDetection() // <-- ini yang menentukan tampil/tidaknya pilihan format
  } else {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    kode: '',
    nama_kelompok_akun: '',
    level: 0,
    parent_id: null
  }
}

const handleKodeInput = (e) => {
  let val = (e.target.value || '').replace(/\s/g, '').replace(/\D/g, '')
  val = val.substring(0, totalKodeDigits.value)

  let formatted = ''
  let pos = 0
  kodeFormat.value.forEach((len, idx) => {
    if (val.length > pos) {
      formatted += (idx > 0 ? ' ' : '') + val.substring(pos, pos + len)
    }
    pos += len
  })

  formData.value.kode = formatted
}

const handleSubmit = async () => {
  if (!(formData.value.kode || '').trim() || !(formData.value.nama_kelompok_akun || '').trim()) {
    await showAlert({
      type: 'warning',
      title: 'Field Wajib Diisi',
      message: 'Mohon lengkapi semua field yang wajib diisi.',
      confirmLabel: 'OK',
    })
    return
  }

  if (isEdit.value) {
    const submitData = {
      nama_kelompok_akun: (formData.value.nama_kelompok_akun || '').trim(),
      saldo_normal: formData.value.saldo_normal
    }
    console.log('Edit data:', submitData)
    emit('save', submitData)
  } else {
    const submitData = {
      kode: (formData.value.kode || '').trim(),
      nama_kelompok_akun: (formData.value.nama_kelompok_akun || '').trim(),
      level: formData.value.level,
      parent_id: formData.value.parent_id,
    }
    console.log('Create data:', submitData)
    emit('save', submitData)
  }
}


// ===== KODE FORMAT (dinamis, tidak hardcode) =====
const kodeFormatPresets = [
  { label: '1-2-2-4 (9 digit)', value: [1, 2, 2, 4] },
  { label: '2-2-3-5 (12 digit)', value: [2, 2, 3, 5] },
  { label: '1-1-2-4 (8 digit)', value: [1, 1, 2, 4] },
  { label: '2-1-3-4 (10 digit)', value: [2, 1, 3, 4] },
  { label: '1-2-3-4 (10 digit)', value: [1, 2, 3, 4] },
]

const detectedFormat = ref(null)
const selectedPresetLabel = ref('')
const customSegments = ref([1, 2, 2, 4])
const isCustomFormat = ref(false)

const LOCAL_STORAGE_KEY = 'coa_kode_format'

const detectKodeFormat = (options) => {
  const kodeSamples = (options || [])
    .map(k => (k.kode || '').trim())
    .filter(k => k.length > 0)

  if (kodeSamples.length === 0) return null

  const patternCount = {}
  kodeSamples.forEach(kode => {
    const segments = kode.split(' ').filter(s => s !== '')
    if (segments.length === 0) return
    const pattern = segments.map(s => s.length).join('-')
    patternCount[pattern] = (patternCount[pattern] || 0) + 1
  })

  let bestPattern = null
  let bestScore = -1
  Object.entries(patternCount).forEach(([pattern, count]) => {
    const segments = pattern.split('-').map(Number)
    const totalDigits = segments.reduce((a, b) => a + b, 0)
    const score = totalDigits * 1000 + count
    if (score > bestScore) {
      bestScore = score
      bestPattern = segments
    }
  })

  return bestPattern
}

const kodeFormat = computed(() => {
  if (detectedFormat.value) return detectedFormat.value
  if (isCustomFormat.value) return customSegments.value
  const preset = kodeFormatPresets.find(p => p.label === selectedPresetLabel.value)
  return preset ? preset.value : [1, 2, 2, 4]
})

const totalKodeDigits = computed(() => kodeFormat.value.reduce((a, b) => a + b, 0))
const kodeMaxLength = computed(() => totalKodeDigits.value + (kodeFormat.value.length - 1))
const kodeFormatExample = computed(() => kodeFormat.value.map(len => '1'.repeat(len)).join(' '))

const handlePresetChange = () => {
  isCustomFormat.value = selectedPresetLabel.value === 'custom'
  formData.value.kode = ''
}
</script>