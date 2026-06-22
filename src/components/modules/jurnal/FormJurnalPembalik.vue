<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Jurnal Pembalik' : 'Tambah Jurnal Pembalik' }}
        </h3>
        <p class="text-sm text-gray-600 mt-1" v-if="isEdit">Kode: {{ formData.kode }}</p>
      </div>

      <div class="p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Main Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
              <input v-model="formData.tanggal" type="date" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">No. Voucher *</label>
              <input v-model="formData.no_bukti" type="text" required placeholder="Masukkan nomor bukti"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan *</label>
              <input v-model="formData.keterangan" type="text" required placeholder="Masukkan keterangan"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select v-model="formData.status" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih Status</option>
                <option value="draft">Draft</option>
                <option value="menunggu_approval">Menunggu Approval</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <!-- Details Section -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-medium text-gray-900">Detail Transaksi</h4>
              <button type="button" @click="addDetail"
                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200">
                + Tambah Detail
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun</th>
                    <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan</th> -->
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                    </th>
                    <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                    </th> -->
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="formData.details.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      <div class="flex flex-col items-center">
                        <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                          </path>
                        </svg>
                        <p class="text-sm">Belum ada detail transaksi</p>
                      </div>
                    </td>
                  </tr>
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
                          <div v-if="filteredAkunOptions(index).length === 0" class="px-2 py-1 text-gray-500 text-sm">
                            Tidak ada akun ditemukan
                          </div>
                          <div v-for="akun in filteredAkunOptions(index)" :key="akun.id"
                            @mousedown="selectAkun(index, akun)"
                            class="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm">
                            {{ akun.kode_akun }} - {{ akun.nama_akun }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <!-- <td class="px-4 py-2">
                      <input v-model="detail.keterangan" type="text" required placeholder="Keterangan"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
                    </td> -->
                    <td class="px-4 py-2">
                      <input :value="formatNumberInput(detail.debit)"
                        @input="(e) => { detail.debit = parseNumberInput(e.target.value); }" type="text" min="0"
                        required
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                        placeholder="0" />
                    </td>
                    <td class="px-4 py-2">
                      <input :value="formatNumberInput(detail.kredit)"
                        @input="(e) => { detail.kredit = parseNumberInput(e.target.value); }" type="text" min="0"
                        required
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                        placeholder="0" />
                    </td>
                    <td class="px-4 py-2">
                      <button type="button" @click="removeDetail(index)"
                        class="text-red-600 hover:text-red-900 transition-colors duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                          </path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <div class="flex justify-between">
                  <span>Total Debit: </span>
                  <span class="font-bold text-blue-600">Rp {{ formatNumber(totalDebit) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Kredit: </span>
                  <span class="font-bold text-green-600">Rp {{ formatNumber(totalKredit) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="handleClose"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Batal
            </button>
            <button type="submit" :disabled="loading || balance !== 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
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
  return {
    top: rect.bottom + window.scrollY - 150,
    left: rect.left + window.scrollX,
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

const loading = ref(false)
const isEdit = computed(() => !!props.editItem)

const formData = ref({
  id: null,
  kode: '',
  tanggal: new Date().toISOString().split('T')[0],
  no_bukti: '',
  keterangan: '',
  status: 'draft',
  nama_pencatat: '',
  dibuat_oleh: 1,
  details: []
})

// Computed
const totalDebit = computed(() => {
  return formData.value.details.reduce((sum, detail) => sum + (Number(detail.debit) || 0), 0)
})

const totalKredit = computed(() => {
  return formData.value.details.reduce((sum, detail) => sum + (Number(detail.kredit) || 0), 0)
})

const balance = computed(() => {
  return totalDebit.value - totalKredit.value
})

const balanceColor = computed(() => {
  return balance.value >= 0 ? 'text-green-600' : 'text-red-600'
})

// Methods
const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}


const addDetail = () => {
  const newIndex = formData.value.details.length
  formData.value.details.push({
    akun_id: null,
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
}

const resetForm = () => {
  formData.value = {
    id: null,
    kode: '',
    tanggal: new Date().toISOString().split('T')[0],
    no_bukti: '',
    keterangan: '',
    status: 'draft',
    nama_pencatat: '',
    dibuat_oleh: 1,
    details: []
  }
  // Reset search queries and dropdown states
  searchQueries.value = {}
  showDropdown.value = {}
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (balance.value !== 0) {
    alert('Total debit dan kredit harus sama!')
    return
  }

  // Check if any detail has null akun_id
  const nullAkunIds = formData.value.details.filter(detail => detail.akun_id === null)
  if (nullAkunIds.length > 0) {
    console.error('Cannot submit: Some details have null akun_id:', nullAkunIds)
    alert('Tidak dapat menyimpan: Beberapa detail memiliki akun yang tidak valid. Silakan pilih akun yang benar untuk semua detail.')
    return
  }

  loading.value = true
  try {
    const submitData = {
      tanggal: formData.value.tanggal,
      no_bukti: formData.value.no_bukti,
      keterangan: formData.value.keterangan,
      dibuat_oleh: formData.value.dibuat_oleh,
      details: formData.value.details.filter(detail => detail.akun_id).map(detail => ({
        akun_id: detail.akun_id,
        keterangan: detail.keterangan || '',
        debit: Number(detail.debit) || 0,
        kredit: Number(detail.kredit) || 0
      }))
    }

    console.log('Submitting jurnal pembalik data:', submitData)

    let result
    if (isEdit.value) {
      result = await api.request(`/editJurnalPembalik/${formData.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(submitData)
      }, 'jpb')
    } else {
      result = await api.request('/createJurnalPembalik', {
        method: 'POST',
        body: JSON.stringify(submitData)
      }, 'jpb')
    }

    console.log('Jurnal Pembalik API Response:', result)

    if (result.success) {
      emit('save')
      handleClose()
    } else {
      console.error('API returned error:', result)
      alert('Gagal menyimpan jurnal pembalik: ' + (result.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error saving jurnal pembalik:', error)
    alert('Gagal menyimpan jurnal pembalik: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Watch for edit item changes
watch(() => props.editItem, (newItem) => {
  console.log('Edit item changed:', newItem)
  if (newItem) {
    // If we have complete data, use it
    if (newItem.details) {
      console.log('Using complete data from edit item')
      // Map API response to form structure
      console.log('Available akunOptions:', props.akunOptions)
      console.log('API details to map:', newItem.details)

      const mappedDetails = (newItem.details || []).map(detail => {
        // Try multiple matching strategies
        let akunOption = null

        // Strategy 1: Exact match on kode_akun
        akunOption = props.akunOptions.find(akun => akun.kode_akun === detail.kode_akun)

        // Strategy 2: Match on kode field if kode_akun fails
        if (!akunOption) {
          akunOption = props.akunOptions.find(akun => akun.kode === detail.kode_akun)
        }

        // Strategy 3: Match on nama_akun as fallback
        if (!akunOption) {
          akunOption = props.akunOptions.find(akun => akun.nama_akun === detail.nama_akun)
        }

        const mappedId = akunOption ? akunOption.id : null
        console.log(`Mapping detail ${detail.kode_akun} - ${detail.nama_akun} to akun_id:`, mappedId, 'found option:', akunOption)

        return {
          akun_id: mappedId,
          keterangan: detail.keterangan || '',
          debit: detail.debit || 0,
          kredit: detail.kredit || 0,
          // Keep original data for reference
          kode_akun: detail.kode_akun,
          nama_akun: detail.nama_akun
        }
      })
      console.log('Mapped details:', mappedDetails)

      // Check if any akun_id is null
      const nullAkunIds = mappedDetails.filter(d => d.akun_id === null)
      if (nullAkunIds.length > 0) {
        console.warn('Warning: Some details have null akun_id:', nullAkunIds)
      }

      formData.value = {
        id: newItem.id,
        kode: newItem.kode || '',
        tanggal: newItem.tanggal,
        no_bukti: newItem.no_bukti,
        keterangan: newItem.keterangan,
        status: newItem.status || 'draft',
        nama_pencatat: newItem.nama_pencatat || '',
        dibuat_oleh: newItem.dibuat_oleh || 1,
        details: mappedDetails
      }

      // Initialize search queries for existing details
      searchQueries.value = {}
      showDropdown.value = {}
      newItem.details.forEach((detail, index) => {
        searchQueries.value[index] = `${detail.kode_akun} - ${detail.nama_akun}`
        showDropdown.value[index] = false
      })

      console.log('Form data set from edit item:', formData.value)
      console.log('Search queries initialized:', searchQueries.value)
    } else {
      // If we only have basic data, fetch complete data
      console.log('Fetching complete data for ID:', newItem.id)
      fetchJurnalData(newItem.id)
    }
  } else {
    console.log('Edit item is null, resetting form')
    resetForm()
  }
}, { immediate: true })

// Function to fetch complete jurnal data from API
const fetchJurnalData = async (id) => {
  try {
    console.log(`Fetching jurnal pembalik data for ID: ${id}`)
    const result = await api.request(`/getJurnalPembalik/${id}`, {}, 'jpb')
    console.log('API Response:', result)

    if (result.success && result.data) {
      // Map API response to form structure
      console.log('Available akunOptions:', props.akunOptions)
      console.log('API details to map:', result.data.details)

      const mappedDetails = (result.data.details || []).map(detail => {
        // Try multiple matching strategies
        let akunOption = null

        // Strategy 1: Exact match on kode_akun
        akunOption = props.akunOptions.find(akun => akun.kode_akun === detail.kode_akun)

        // Strategy 2: Match on kode field if kode_akun fails
        if (!akunOption) {
          akunOption = props.akunOptions.find(akun => akun.kode === detail.kode_akun)
        }

        // Strategy 3: Match on nama_akun as fallback
        if (!akunOption) {
          akunOption = props.akunOptions.find(akun => akun.nama_akun === detail.nama_akun)
        }

        const mappedId = akunOption ? akunOption.id : null
        console.log(`Mapping detail ${detail.kode_akun} - ${detail.nama_akun} to akun_id:`, mappedId, 'found option:', akunOption)

        return {
          akun_id: mappedId,
          keterangan: detail.keterangan || '',
          debit: detail.debit || 0,
          kredit: detail.kredit || 0,
          // Keep original data for reference
          kode_akun: detail.kode_akun,
          nama_akun: detail.nama_akun
        }
      })
      console.log('Mapped details:', mappedDetails)

      // Check if any akun_id is null
      const nullAkunIds = mappedDetails.filter(d => d.akun_id === null)
      if (nullAkunIds.length > 0) {
        console.warn('Warning: Some details have null akun_id:', nullAkunIds)
      }

      formData.value = {
        id: result.data.id,
        kode: result.data.kode || '',
        tanggal: result.data.tanggal,
        no_bukti: result.data.no_bukti,
        keterangan: result.data.keterangan,
        status: result.data.status || 'draft',
        nama_pencatat: result.data.nama_pencatat || '',
        dibuat_oleh: result.data.dibuat_oleh || 1,
        details: mappedDetails
      }

      // Initialize search queries for existing details
      searchQueries.value = {}
      showDropdown.value = {}
      result.data.details.forEach((detail, index) => {
        searchQueries.value[index] = `${detail.kode_akun} - ${detail.nama_akun}`
        showDropdown.value[index] = false
      })

      console.log('Form data populated:', formData.value)
      console.log('Search queries initialized:', searchQueries.value)
    } else {
      console.error('Failed to fetch jurnal data:', result.message)
    }
  } catch (error) {
    console.error('Error fetching jurnal data:', error)
  }
}

// Initialize with one empty detail if creating new
watch(() => props.showModal, (show) => {
  if (show && !isEdit.value && formData.value.details.length === 0) {
    addDetail()
  }
})
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.table-header {
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
}

.summary-card {
  transition: transform 0.2s ease-in-out;
}

.summary-card:hover {
  transform: translateY(-2px);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
