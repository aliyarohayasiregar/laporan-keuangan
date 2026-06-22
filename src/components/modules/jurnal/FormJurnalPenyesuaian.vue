<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editItem ? 'Edit Jurnal Penyesuaian' : 'Tambah Jurnal Penyesuaian' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ editItem ? 'Edit data jurnal penyesuaian yang ada' : 'Tambah jurnal penyesuaian baru' }}
        </p>
      </div>

      <div class="p-6">
        <!-- Main Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Informasi Jurnal</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input v-model="formData.tanggal" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">No. Voucher</label>
                <input v-model="formData.no_bukti" type="text" required placeholder="Masukkan nomor bukti"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                <textarea v-model="formData.keterangan" rows="3" required placeholder="Masukkan keterangan jurnal"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Ringkasan</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Debit:</span>
                <span class="text-lg font-bold text-gray-900">Rp {{ formatNumberInput(totalDebit) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Kredit:</span>
                <span class="text-lg font-bold text-gray-900">Rp {{ formatNumberInput(totalKredit) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Table -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-medium text-gray-900">Detail Transaksi</h4>
            <button @click="addDetail" type="button"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              + Tambah Detail
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun</th>
                  <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan
                  </th> -->
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
                  <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                  </th> -->
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(detail, index) in formData.details" :key="index">
                  <td class="px-4 py-2">
                    <div class="relative">
                      <input v-model="searchQueries[index]" :data-dropdown-index="index"
                        @focus="() => handleInputFocus(index)" @blur="() => handleInputBlur(index)" type="text"
                        placeholder="Cari atau pilih akun..."
                        class="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
                      <svg
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
                        </path>
                      </svg>

                      <!-- Dropdown List -->
                      <div v-show="showDropdown[index]"
                        class="fixed z-50 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto"
                        :style="{
                          position: 'fixed',
                          top: getDropdownPosition(index).top + 'px',
                          left: getDropdownPosition(index).left + 'px',
                          width: getDropdownPosition(index).width + 'px',
                          minWidth: '200px'
                        }">
                        <div v-for="akun in filteredAkunOptions(index)" :key="akun.id"
                          @mousedown="selectAkun(index, akun)"
                          class="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm">
                          {{ akun.kode_akun }} - {{ akun.nama_akun }}
                        </div>
                        <div v-if="filteredAkunOptions(index).length === 0" class="px-2 py-1 text-gray-500 text-sm">
                          Tidak ada akun ditemukan
                        </div>
                      </div>
                    </div>
                  </td>
                  <!-- <td class="px-4 py-2">
                    <input v-model="detail.keterangan" type="text" required placeholder="Keterangan detail"
                      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  </td> -->
                  <td class="px-4 py-2">
                    <input :value="formatNumberInput(detail.debit)"
                      @input="(e) => { detail.debit = parseNumberInput(e.target.value); calculateTotals(); }"
                      type="text" min="0" step="0.01"
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                      placeholder="0" />
                  </td>
                  <td class="px-4 py-2">
                    <input :value="formatNumberInput(detail.kredit)"
                      @input="(e) => { detail.kredit = parseNumberInput(e.target.value); calculateTotals(); }"
                      type="text" min="0" step="0.01"
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                      placeholder="0" />
                  </td>
                  <td class="px-4 py-2">
                    <button @click="removeDetail(index)" type="button"
                      class="text-red-600 hover:text-red-900 text-sm font-medium">
                      Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200">
        <button @click="handleClose" type="button"
          class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 mr-2">
          Batal
        </button>
        <button @click="handleSave" type="button" :disabled="balance !== 0 || isSubmitting"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ editItem ? 'Update' : 'Simpan' }}
          </span>
          <span v-else>{{ editItem ? 'Update' : 'Simpan' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
  akunOptions: {
    type: Array,
    default: () => []
  }
})

// Search state for each detail row
const searchQueries = ref({})
// Dropdown visibility state
const showDropdown = ref({})

// Number formatting functions
const formatNumberInput = (value) => {
  if (!value) return ''
  const cleanValue = value.toString().replace(/\D/g, '')
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseNumberInput = (formattedValue) => {
  if (!formattedValue) return 0
  return parseFloat(formattedValue.toString().replace(/\./g, '')) || 0
}

// Filter akun options based on search
const filteredAkunOptions = (detailIndex) => {
  const query = searchQueries.value[detailIndex] || ''
  if (!query) return props.akunOptions

  return props.akunOptions.filter(akun => {
    const kodeAkun = akun.kode_akun || ''
    const namaAkun = akun.nama_akun || ''
    return kodeAkun.toLowerCase().includes(query.toLowerCase()) ||
      namaAkun.toLowerCase().includes(query.toLowerCase())
  })
}

// Get dropdown position
const getDropdownPosition = (index) => {
  const inputElement = document.querySelector(`[data-dropdown-index="${index}"]`)
  if (!inputElement) {
    return { top: 0, left: 0, width: 200 }
  }

  const rect = inputElement.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = 192 // max-h-48 = 12rem = 192px

  // Check if dropdown would go below viewport
  let topPosition
  if (rect.bottom + dropdownHeight > viewportHeight) {
    // Position dropdown above input
    topPosition = rect.top - dropdownHeight - 2
  } else {
    // Position dropdown below input
    topPosition = rect.bottom + 2
  }

  return {
    top: topPosition,
    left: rect.left,
    width: rect.width
  }
}

// Handle input focus/blur
const handleInputFocus = (index) => {
  showDropdown.value[index] = true
}

const handleInputBlur = (index) => {
  setTimeout(() => {
    showDropdown.value[index] = false
  }, 200)
}

// Select akun function
const selectAkun = (index, akun) => {
  formData.value.details[index].akun_id = akun.id
  searchQueries.value[index] = `${akun.kode_akun} - ${akun.nama_akun}`
  showDropdown.value[index] = false
}


const emit = defineEmits(['close', 'save'])

const isSubmitting = ref(false)

const formData = ref({
  tanggal: new Date().toISOString().split('T')[0],
  no_bukti: '',
  keterangan: '',
  dibuat_oleh: 1, // TODO: Get from logged in user
  details: [
    {
      akun_id: '',
      keterangan: '',
      debit: 0,
      kredit: 0
    }
  ]
})

const totalDebit = computed(() => {
  return formData.value.details.reduce((total, detail) => total + (Number(detail.debit) || 0), 0)
})

const totalKredit = computed(() => {
  return formData.value.details.reduce((total, detail) => total + (Number(detail.kredit) || 0), 0)
})

const balance = computed(() => {
  return totalDebit.value - totalKredit.value
})

const balanceColor = computed(() => {
  return balance.value >= 0 ? 'text-green-600' : 'text-red-600'
})

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const loadAkunOptions = async () => {
  try {
    const response = await api.getAllNamaAkun()
    if (response.success) {
      // akunOptions is a prop, not a ref, so we don't need to set it here
      console.log('Akun options loaded from API:', response.data.length, 'items')
    }
  } catch (err) {
    console.error('Error loading akun options:', err)
  }
}

const addDetail = () => {
  const newIndex = formData.value.details.length
  formData.value.details.push({
    akun_id: '',
    keterangan: '',
    debit: 0,
    kredit: 0
  })
  // Initialize search query and dropdown state for new detail
  searchQueries.value[newIndex] = ''
  showDropdown.value[newIndex] = false
}

const removeDetail = (index) => {
  formData.value.details.splice(index, 1)
  // Remove search query and dropdown state for removed detail
  delete searchQueries.value[index]
  delete showDropdown.value[index]
  // Reindex search queries and dropdown states
  const newSearchQueries = {}
  const newShowDropdown = {}
  Object.keys(searchQueries.value).forEach(key => {
    const numKey = parseInt(key)
    if (numKey > index) {
      newSearchQueries[numKey - 1] = searchQueries.value[key]
      newShowDropdown[numKey - 1] = showDropdown.value[key]
    } else if (numKey < index) {
      newSearchQueries[numKey] = searchQueries.value[key]
      newShowDropdown[numKey] = showDropdown.value[key]
    }
  })
  searchQueries.value = newSearchQueries
  showDropdown.value = newShowDropdown
  calculateTotals()
}

const calculateTotals = () => {
  // Totals will be calculated automatically by computed properties
}

const resetForm = () => {
  formData.value = {
    tanggal: new Date().toISOString().split('T')[0],
    no_bukti: '',
    keterangan: '',
    dibuat_oleh: 1,
    details: [
      {
        akun_id: '',
        keterangan: '',
        debit: 0,
        kredit: 0
      }
    ]
  }
  // Reset search queries and dropdown states
  searchQueries.value = {}
  showDropdown.value = {}
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (balance.value !== 0) {
    alert('Total debit harus sama dengan total kredit!')
    return
  }

  isSubmitting.value = true
  try {
    let response
    if (props.editItem) {
      // ... same logic but using api
      const editData = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        keterangan: formData.value.keterangan,
        details: formData.value.details.map(detail => ({
          akun_id: detail.akun_id,
          keterangan: detail.keterangan,
          debit: detail.debit,
          kredit: detail.kredit
        }))
      }

      console.log('Editing jurnal penyesuaian with ID:', props.editItem.id)
      response = await api.editJurnalPenyesuaian(props.editItem.id, editData)
      console.log('Edit API Response:', response)
    } else {
      // For create, send all fields
      const createData = {
        ...formData.value,
        dibuat_oleh: 1 // TODO: Get from logged in user
      }

      console.log('Creating new jurnal penyesuaian')
      response = await api.createJurnalPenyesuaian(createData)
      console.log('Create API Response:', response)
    }

    if (response.success) {
      emit('save')
      emit('close')
      resetForm()
    } else {
      alert(props.editItem ? 'Gagal mengupdate jurnal penyesuaian' : 'Gagal menyimpan jurnal penyesuaian')
    }
  } catch (err) {
    console.error('Error saving jurnal penyesuaian:', err)
    alert(props.editItem ? 'Gagal mengupdate jurnal penyesuaian' : 'Gagal menyimpan jurnal penyesuaian')
  } finally {
    isSubmitting.value = false
  }
}

// Watch for editItem changes
watch(() => props.editItem, (newEditItem) => {
  if (newEditItem) {
    // Load edit data
    api.getJurnalPenyesuaian(newEditItem.id).then(response => {
      if (response.success) {
        formData.value = {
          ...response.data,
          tanggal: response.data.tanggal.split('T')[0]
        }
      }
    })
  } else {
    resetForm()
  }
}, { immediate: true })

onMounted(() => {
  loadAkunOptions()
})
</script>
