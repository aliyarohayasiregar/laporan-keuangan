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
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Akun *</label>
            <select v-model.number="formData.tipe_akun_id" required :disabled="loadingTipeAkun"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option :value="null" disabled>Pilih tipe akun</option>
              <option v-for="tipe in tipeAkunOptions" :key="tipe.id" :value="tipe.id">
                {{ tipe.kode_tipe_akun }} - {{ tipe.nama_tipe_akun }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ loadingTipeAkun ? 'Memuat data tipe akun...' : 'Pilih tipe akun (Aset, Kewajiban, Ekuitas, dst)' }}
            </p>
          </div>

          <div v-if="isTipeModal">
  <label class="block text-sm font-medium text-gray-700 mb-2">Kategori Ekuitas</label>
  <select v-model="formData.kategori_ekuitas"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    <option :value="null">Pilih kategori ekuitas</option>
    <option value="Penambah">Penambah Modal (Setoran, laba Ditahan, dll)</option>
    <option value="Pengurang">Pengurang Modal (Prive, Kerugian, dll)</option>
  </select>
  <p class="text-xs text-gray-500 mt-1">
    Penambah Modal untuk setoran, laba ditahan, dll. Pengurang Modal untuk Prive, kerugian, dll.
  </p>
</div>

          <div v-if="isTipeAset">
  <label class="block text-sm font-medium text-gray-700 mb-2">Kategori Aset</label>
  <select v-model="formData.kategori_aset"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    <option :value="null">Pilih kategori aset</option>
    <option value="aset_tetap">Aset Tetap</option>
    <option value="aset_lancar">Aset Lancar</option>
  </select>
  <p class="text-xs text-gray-500 mt-1">
    Kategori aset untuk klasifikasi jenis aset (opsional)
  </p>
</div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <select v-model.number="formData.level" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option :value="null" disabled>Pilih level</option>
              <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Level hierarki kelompok akun (1 untuk parent tertinggi, maks. 3 — level 4 dipakai saat membuat Nama Akun)</p>
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

// ===== TIPE AKUN =====
const tipeAkunOptions = ref([])
const loadingTipeAkun = ref(false)

const loadTipeAkunOptions = async () => {
  try {
    loadingTipeAkun.value = true
    const response = await api.getAllTipeAkun()
    tipeAkunOptions.value = response.data || []
  } catch (error) {
    console.error('Error loading tipe akun:', error)
    tipeAkunOptions.value = []
  } finally {
    loadingTipeAkun.value = false
  }
}

// Ambil segmen-segmen kode dari sebuah string kode, mis. "10 10 100 00000" -> ["10","10","100","00000"]
const getKodeSegments = (kode) => (kode || '').trim().split(' ').filter(s => s !== '')

const filteredParentOptions = computed(() => {
  if (!parentOptions.value || !Array.isArray(parentOptions.value)) return []

  let filtered = [...parentOptions.value].filter(p => p && typeof p === 'object' && p.kode)

  if (props.editItem) {
    filtered = filtered.filter(p => p.id !== props.editItem.id)
  }

  const currentKode = (formData.value.kode || '').trim()
  const currentLevel = formData.value.level

  if (currentLevel <= 0) return []

  // Parent harus berada satu level di atas
  filtered = filtered.filter(p => p.level === currentLevel - 1)

  // Cocokkan berdasarkan segmen kode yang sudah diketik, bukan field kode_group
  // (field kode_group tidak selalu tersedia dari API, jadi kita bandingkan
  // langsung segmen kode milik parent dengan segmen kode yang sedang diketik)
  const typedSegments = getKodeSegments(currentKode)
  const relevantSegmentCount = currentLevel - 1 // jumlah segmen yang jadi identitas parent

  if (typedSegments.length > 0 && relevantSegmentCount > 0) {
    const relevantSegments = typedSegments.slice(0, relevantSegmentCount)

    // Hanya terapkan filter kalau semua segmen relevan sudah terisi penuh
    if (relevantSegments.length === relevantSegmentCount) {
      filtered = filtered.filter(p => {
        const pSegments = getKodeSegments(p.kode)
        return relevantSegments.every((seg, idx) => pSegments[idx] === seg)
      })
    }
  }

  return filtered.sort((a, b) => a.kode.localeCompare(b.kode))
})

const isTipeModal = computed(() => {
  const selected = tipeAkunOptions.value.find(t => t.id === formData.value.tipe_akun_id)
  if (!selected) return false
  return selected.kode_tipe_akun === '3' // sesuaikan sama kode ekuitas di data kamu
})

const isTipeAset = computed(() => {
  const selected = tipeAkunOptions.value.find(t => t.id === formData.value.tipe_akun_id)
  if (!selected) return false
  return selected.kode_tipe_akun === '1' // sesuaikan sama kode aset di data kamu
})


// Level kelompok akun dibatasi 1-3. Level 4 khusus dipakai saat membuat Nama Akun,
// bukan Kelompok Akun, sehingga tidak ditampilkan di sini.
const levelOptions = [1, 2, 3]

const formData = ref({
  kode: '',
  nama_kelompok_akun: '',
  level: null,
  parent_id: null,
  tipe_akun_id: null,
  saldo_normal: 'D',
  kategori_ekuitas: null,
  kategori_aset: null
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
      tipe_akun_id: newItem.tipe_akun_id ?? null,
      kategori_ekuitas: newItem.kategori_ekuitas ?? null,
      kategori_aset: newItem.kategori_aset ?? null,
    }
  }
})

watch(() => props.showModal, (show) => {
  if (show) {
    loadParentOptions()
    loadAllKelompokAkunForDetection() // <-- ini yang menentukan tampil/tidaknya pilihan format
    loadTipeAkunOptions()
  } else {
    resetForm()
  }
})

watch(() => formData.value.tipe_akun_id, () => {
  if (!isTipeModal.value) {
    formData.value.kategori_ekuitas = null
  }
  if (!isTipeAset.value) {
    formData.value.kategori_aset = null
  }
})

const resetForm = () => {
  formData.value = {
    kode: '',
    nama_kelompok_akun: '',
    level: null,
    parent_id: null,
    tipe_akun_id: null,
    kategori_ekuitas: null,
    kategori_aset: null
  }
}

const handleKodeInput = (e) => {
  // Kelompok Akun cuma sampai level 3, jadi segmen terakhir (level 4, 5 digit)
  // default-nya "00000". Tetap manual: kalau user mau, dia bisa ketik sendiri
  // digit di segmen terakhir itu, sisa yang belum diketik otomatis diisi "0".
  const editableSegments = kodeFormat.value.slice(0, -1)
  const editableDigits = editableSegments.reduce((a, b) => a + b, 0)
  const lastSegmentLen = kodeFormat.value[kodeFormat.value.length - 1]

  let val = (e.target.value || '').replace(/\s/g, '').replace(/\D/g, '')
  val = val.substring(0, totalKodeDigits.value)

  let formatted = ''
  let pos = 0
  editableSegments.forEach((len, idx) => {
    if (val.length > pos) {
      formatted += (idx > 0 ? ' ' : '') + val.substring(pos, pos + len)
    }
    pos += len
  })

  if (val.length >= editableDigits) {
    const lastSegmentTyped = val.substring(editableDigits, editableDigits + lastSegmentLen)
    const lastSegmentValue = lastSegmentTyped.padEnd(lastSegmentLen, '0')
    formatted += (formatted ? ' ' : '') + lastSegmentValue
  }

  formData.value.kode = formatted
}

const handleSubmit = async () => {
  if (
    !(formData.value.kode || '').trim() ||
    !(formData.value.nama_kelompok_akun || '').trim() ||
    !formData.value.tipe_akun_id
  ) {
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
      saldo_normal: formData.value.saldo_normal,
      tipe_akun_id: formData.value.tipe_akun_id
    }

    // tambahan: ikut kirim kategori_ekuitas kalo ada isinya
    if (formData.value.kategori_ekuitas) {
      submitData.kategori_ekuitas = formData.value.kategori_ekuitas
    }

    // tambahan: ikut kirim kategori_aset kalo ada isinya
    if (formData.value.kategori_aset) {
      submitData.kategori_aset = formData.value.kategori_aset
    }

    console.log('Edit data:', submitData)
    emit('save', submitData)
  } else {
    const submitData = {
      kode: (formData.value.kode || '').trim(),
      nama_kelompok_akun: (formData.value.nama_kelompok_akun || '').trim(),
      level: formData.value.level,
      parent_id: formData.value.parent_id,
      tipe_akun_id: formData.value.tipe_akun_id
    }

    // tambahan: ikut kirim kategori_ekuitas kalo ada isinya
    if (formData.value.kategori_ekuitas) {
      submitData.kategori_ekuitas = formData.value.kategori_ekuitas
    }

    // tambahan: ikut kirim kategori_aset kalo ada isinya
    if (formData.value.kategori_aset) {
      submitData.kategori_aset = formData.value.kategori_aset
    }

    console.log('Create data:', submitData)
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

// Contoh format kode: semua segmen pakai "1" kecuali segmen terakhir (ujungnya) pakai "0" semua,
// mis. format 2-2-3-5 -> contoh "11 11 111 00000"
const kodeFormatExample = computed(() =>
  kodeFormat.value
    .map((len, idx) => (idx === kodeFormat.value.length - 1 ? '0'.repeat(len) : '1'.repeat(len)))
    .join(' ')
)

const handlePresetChange = () => {
  isCustomFormat.value = selectedPresetLabel.value === 'custom'
  formData.value.kode = ''
}
</script>