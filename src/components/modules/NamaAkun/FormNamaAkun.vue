<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Nama Akun' : 'Tambah Nama Akun' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ isEdit ? 'Perbarui informasi nama akun' : 'Masukkan informasi nama akun baru' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Error Message Display -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-700 text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode *</label>

            <!-- Pilihan format HANYA muncul kalau belum ada data kelompok akun sama sekali & mode create -->
            <div v-if="!isEdit && !detectedFormat && !loadingKelompokOptions" class="mb-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Format Kode (belum ada data acuan)</label>
              <select v-model="selectedPresetLabel" @change="handlePresetChange"
                class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs">
                <option value="">Pilih format kode akun</option>
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
              <p class="text-[11px] text-gray-400 mt-1">Format ini akan jadi acuan untuk kode akun berikutnya.</p>
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Akun *</label>
            <input v-model="formData.nama_akun" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Bank Mandiri" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kelompok Akun *</label>
            <select v-model.number="formData.kelompok_akun_id" required :disabled="loadingKelompokOptions"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
              <option value="">Pilih Kelompok Akun</option>
              <option v-for="kelompok in filteredKelompokOptions" :key="kelompok?.id || kelompok?.ID || Math.random()"
                :value="kelompok?.id">
                {{ (kelompok?.kode || '') }} - {{ (kelompok?.nama_kelompok_akun || '') }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ loadingKelompokOptions ? 'Memuat kelompok akun...' : ((formData.kode || '').trim() ? 'Kelompok akun yang sesuai dengan kode Anda' : 'Pilih kelompok akun untuk akun ini') }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea v-model="formData.deskripsi" rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan deskripsi akun (opsional)"></textarea>
            <p class="text-xs text-gray-500 mt-1">Deskripsi atau keterangan tambahan</p>
          </div>

          <div>
            <label class="flex items-center">
              <input v-model="formData.is_active" type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">Centang jika akun ini aktif digunakan</p>
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
import api from '../../../services/api.js'

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  editItem: {
    type: Object,
    default: null
  },
  formError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)
const loading = ref(false)
const errorMessage = ref('')
const kelompokOptions = ref([])
const loadingKelompokOptions = ref(false)

const formData = ref({
  kode: '',
  nama_akun: '',
  kelompok_akun_id: '',
  deskripsi: '',
  is_active: true
})


const loadKelompokOptions = async () => {
  try {
    loadingKelompokOptions.value = true
    const response = await api.getAllKelompokAkunAkun()
    kelompokOptions.value = response.data || []

    // Deteksi pola dari data yang ada
    const detected = detectKodeFormat(kelompokOptions.value)
    if (detected) {
      detectedFormat.value = detected
      // simpan sebagai default company untuk kondisi belum ada data lain kali
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(detected))
    } else {
      detectedFormat.value = null
      // belum ada data sama sekali → coba pakai format tersimpan sebelumnya
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          selectedPresetLabel.value = kodeFormatPresets.find(
            p => JSON.stringify(p.value) === JSON.stringify(parsed)
          )?.label || ''
          if (!selectedPresetLabel.value) {
            isCustomFormat.value = true
            customSegments.value = parsed
          }
        } catch (e) { /* ignore */ }
      }
    }
  } catch (error) {
    console.error('Error loading kelompok akun:', error)
    kelompokOptions.value = []
  } finally {
    loadingKelompokOptions.value = false
  }
}

const filteredKelompokOptions = computed(() => {
  if (!kelompokOptions.value || !Array.isArray(kelompokOptions.value)) return []

  let filtered = [...kelompokOptions.value].filter(k => k && typeof k === 'object' && k.kode)
  const currentKode = (formData.value.kode || '').trim()

  if (currentKode) {
    // Ambil bagian prefix dari input (tanpa segmen terakhir)
    // Contoh: "1 10 10 0001" → prefix = "1 10 10"
    // Contoh: "1 10" → prefix = "1 10"
    const segments = currentKode.split(' ').filter(s => s !== '')

    filtered = filtered.filter(k => {
      const kelompokSegments = k.kode.split(' ').filter(s => s !== '')
      // Cocokkan sejumlah segmen yang ada di input (max 3 segmen pertama)
      const matchCount = Math.min(segments.length, kelompokSegments.length - 1)
      for (let i = 0; i < matchCount; i++) {
        if (segments[i] !== kelompokSegments[i]) return false
      }
      return true
    })
  }

  return filtered.sort((a, b) => a.kode.localeCompare(b.kode))
})


watch(() => props.editItem, (newItem) => {
  if (newItem) {
    formData.value = {
      kode: newItem.Kode || newItem.kode || '',
      nama_akun: newItem.NamaAkun || newItem.nama_akun || '',
      kelompok_akun_id: newItem.KelompokAkunID || newItem.kelompok_akun_id || '',
      deskripsi: newItem.Deskripsi || newItem.deskripsi || '',
      is_active: newItem.IsActive !== undefined ? newItem.IsActive : (newItem.is_active !== undefined ? newItem.is_active : true)
    }
  } else {
    resetForm()
  }
})

// Watch for formError from parent
watch(() => props.formError, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})

watch(() => props.showModal, (show) => {
  if (show) {
    loadKelompokOptions()
  } else {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    kode: '',
    nama_akun: '',
    kelompok_akun_id: '',
    deskripsi: '',
    is_active: true
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

const handlePresetChange = () => {
  isCustomFormat.value = selectedPresetLabel.value === 'custom'
  formData.value.kode = '' // reset input saat ganti format
}

const handleSubmit = () => {
  // Clear previous error
  errorMessage.value = ''

  // Validation for create mode
  if (!isEdit.value) {
    if (!formData.value.kelompok_akun_id || formData.value.kelompok_akun_id === '') {
      errorMessage.value = 'Kelompok Akun harus dipilih'
      return
    }
  }

  // Send different data based on create vs edit mode
  if (isEdit.value) {
    // Edit mode - send all fields except kode
    const submitData = {
      nama_akun: formData.value.nama_akun,
      deskripsi: formData.value.deskripsi,
      is_active: formData.value.is_active
    }
    console.log('Edit mode submit data:', submitData)
    emit('save', submitData)
  } else {
    // Create mode - send only required fields (no is_active)
    const submitData = {
      kode: formData.value.kode,
      nama_akun: formData.value.nama_akun,
      kelompok_akun_id: parseInt(formData.value.kelompok_akun_id),
      deskripsi: formData.value.deskripsi
    }
    console.log('Create mode submit data:', submitData)
    emit('save', submitData)
  }
}



// ===== KODE FORMAT (dinamis, tidak hardcode) =====
const kodeFormatPresets = [
  // { label: '1-2-2-4 (9 digit)', value: [1, 2, 2, 4] },
  { label: '2-2-3-5 (12 digit)', value: [2, 2, 3, 5] },
  // { label: '1-1-2-4 (8 digit)', value: [1, 1, 2, 4] },
  // { label: '2-1-3-4 (10 digit)', value: [2, 1, 3, 4] },
  // { label: '1-2-3-4 (10 digit)', value: [1, 2, 3, 4] },
]

const detectedFormat = ref(null)      // hasil deteksi otomatis dari API
const selectedPresetLabel = ref('')   // dipakai kalau harus pilih manual (belum ada data)
const customSegments = ref([1, 2, 2, 4]) // dipakai kalau user pilih "Custom"
const isCustomFormat = ref(false)

const LOCAL_STORAGE_KEY = 'coa_kode_format'

// Deteksi pola paling dominan & paling detail dari kode-kode yang sudah ada
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

  // Prioritas: pola dengan total digit terbanyak (paling lengkap/detail),
  // kalau seri baru dibandingkan berdasarkan frekuensi kemunculan
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

// Pola aktif yang dipakai untuk format input Kode
const kodeFormat = computed(() => {
  if (detectedFormat.value) return detectedFormat.value
  if (isCustomFormat.value) return customSegments.value
  const preset = kodeFormatPresets.find(p => p.label === selectedPresetLabel.value)
  return preset ? preset.value : [1, 2, 2, 4] // fallback terakhir
})

const totalKodeDigits = computed(() => kodeFormat.value.reduce((a, b) => a + b, 0))
const kodeMaxLength = computed(() => totalKodeDigits.value + (kodeFormat.value.length - 1)) // + spasi
const kodeFormatExample = computed(() => kodeFormat.value.map(len => '1'.repeat(len)).join(' '))
</script>
