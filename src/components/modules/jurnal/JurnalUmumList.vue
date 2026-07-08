<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Jurnal Umum</h2>
        <p class="text-gray-600 mt-1">Manajemen jurnal umum perusahaan</p>
        <!-- Filter Indicator -->
        <div v-if="refFilter"
          class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
            </path>
          </svg>
          Filtered by Voucher: {{ refFilter }}
          <button @click="clearRefFilter" class="ml-2 text-blue-600 hover:text-blue-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

<!-- Selection Section -->
<div v-if="hasPermission('jurnal umum ', 'create')" class="bg-white rounded-lg shadow">
  <!-- Toggle Header -->
  <button @click="showJenisJurnalSection = !showJenisJurnalSection"
    class="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold text-gray-600 uppercase tracking-wide hover:bg-gray-50 transition-colors duration-200 rounded-lg">
    Pilih Jenis Jurnal
    <svg :class="['w-4 h-4 transition-transform duration-200', showJenisJurnalSection ? 'rotate-180' : '']"
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </button>

  <!-- Jenis Jurnal Cards -->
  <div v-show="showJenisJurnalSection" class="px-4 pb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="jenis in jenisJurnalOptions" :key="jenis.value" @click="handleSelectJenisJurnal(jenis)"
        class="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all duration-300 relative group">
        <div class="flex flex-col h-full">
          <div class="flex justify-between items-start mb-2">
            <h4 class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{{ jenis.label }}</h4>
            <span class="text-3xl font-black text-blue-100 group-hover:text-blue-500 transition-colors">{{ jenis.value }}</span>
          </div>
          <p class="text-sm text-gray-500 mb-6 flex-grow">{{ jenis.description }}</p>
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-[0.98]">
            Tambah {{ jenis.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- Jurnal Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-900">Daftar Jurnal Sebelum Penyesuaian</h3>
        <p class="text-sm text-gray-600 mt-1">
          Total {{ filteredJurnals?.length || 0 }} jurnal umum
          <span v-if="refFilter" class="text-blue-600 font-medium">
            (filtered by voucher: {{ refFilter }})
          </span>
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-max divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Kode</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Voucher</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Keterangan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Dibuat Oleh</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Debit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Kredit</th>
              <th v-if="hasPermission('jurnal umum ', 'edit') || hasPermission('jurnal umum ', 'delete')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!paginatedJurnals || paginatedJurnals.length === 0">
              <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 00-2-2h2a2 2 0 002-2v10a2 2 0 002 2z">
                    </path>
                  </svg>
                  <p class="text-lg font-medium">Tidak ada jurnal umum</p>
                  <p class="text-sm text-gray-400">Debug: paginatedJurnals.length = {{ paginatedJurnals?.length || 0 }}</p>
                  <p class="text-sm text-gray-400">Debug: jurnals.length = {{ jurnals?.length || 0 }}</p>
                </div>
              </td>
            </tr>
            <tr v-for="(jurnal, index) in paginatedJurnals" :key="jurnal.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <button @click="handleView(jurnal)" class="text-blue-600 hover:text-blue-900 hover:underline">
                  {{ jurnal.kode }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(jurnal.tanggal) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ jurnal.no_bukti }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <button @click="handleKeterangan(jurnal)"
                  class="text-blue-600 hover:text-blue-900 hover:underline text-left">
                  {{ truncateText(jurnal.keterangan, 30) }}
                  <span v-if="jurnal.keterangan && jurnal.keterangan.length > 30" class="text-gray-400">...</span>
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  jurnal.status === 'menunggu_approval'
                    ? 'bg-yellow-100 text-yellow-800'
                    : jurnal.status === 'disetujui'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                ]">
                  {{ formatStatus(jurnal.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ jurnal.nama_pencatat }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatNumber(jurnal.total_debit) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatNumber(jurnal.total_kredit) }}
              </td>
              <td v-if="hasPermission('jurnal umum', 'edit') || hasPermission('jurnal umum', 'delete')"
                class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button @click="handleView(jurnal)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                      </path>
                    </svg>
                  </button>
                  <button v-if="hasPermission('jurnal umum', 'edit')" @click="handleEdit(jurnal)"
                    class="text-green-600 hover:text-green-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-1v1.5a.5.5 0 01-.5.5z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.5 10.5H19v8.5a1 1 0 001 1h-5.5a1 1 0 01-1-1V10.5z"></path>
                    </svg>
                  </button>
                  <button v-if="hasPermission('jurnal umum', 'delete')" @click="handleDelete(jurnal)"
                    class="text-red-600 hover:text-red-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination v-if="filteredJurnals && filteredJurnals.length > 0" :current-page="currentPage"
        :total-items="filteredJurnals.length" :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
    </div>
  </div>

  <!-- Form Modal -->
  <FormJurnalUmum :show-modal="showFormModal" :edit-item="editingItem" :nama-akun-options="namaAkunOptions"
    :preselected-data="preselectedData" @close="closeForm" @save="handleSaveForm" />

  <!-- View Details Modal -->
  <ViewJurnalUmum v-if="showViewModal" :show-modal="showViewModal" :jurnal="viewingItem" @close="handleViewClose" />

  <!-- View Keterangan Modal -->
  <ViewKeteranganJurnal v-if="showKeteranganModal" :show-modal="showKeteranganModal" :jurnal="viewingItem"
    @close="handleKeteranganClose" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../../services/api.js'
import jurnalUmumService from '../../../services/jurnalUmumService.js'
import { showConfirm, showError } from '@/composables/useModal.js'
import Pagination from '../../Pagination.vue'
import FormJurnalUmum from './FormJurnalUmum.vue'
import ViewJurnalUmum from './ViewJurnalUmum.vue'
import ViewKeteranganJurnal from './ViewKeteranganJurnal.vue'

const hasPermission = inject('hasPermission', () => true)

const showJenisJurnalSection = ref(false)

const jurnals = ref([])
const namaAkunOptions = ref([])
const loading = ref(false)
const error = ref(null)
const showFormModal = ref(false)
const editingItem = ref(null)
const showViewModal = ref(false)
const showKeteranganModal = ref(false)
const viewingItem = ref(null)

// Pagination State
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filters
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedMonth = ref('')
const refFilter = ref('')

// Get route and router instances for URL parameters
const route = useRoute()
const router = useRouter()

// State untuk dropdown nomor voucher dan jenis jurnal
const nomorBuktiList = ref([])
const selectedNoBukti = ref('')
const selectedJenisJurnal = ref('')
const akunDefault = ref(null)
const isLoadingNomorBukti = ref(false)
const isLoadingAkunDefault = ref(false)
const preselectedData = ref(null)

// Jenis jurnal options
const jenisJurnalOptions = computed(() => {
  return jurnalUmumService.getJenisJurnalOptions()
})

const filteredJurnals = computed(() => {
  let filtered = jurnals.value || []

  if (refFilter.value && Array.isArray(filtered)) {
    filtered = filtered.filter(jurnal => jurnal.no_bukti === refFilter.value)
  }

  if (searchQuery.value && Array.isArray(filtered)) {
    filtered = filtered.filter(jurnal =>
      jurnal.kode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      jurnal.keterangan.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      jurnal.no_bukti.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value && Array.isArray(filtered)) {
    filtered = filtered.filter(jurnal => jurnal.status === selectedStatus.value)
  }

  return Array.isArray(filtered) ? filtered : []
})

const paginatedJurnals = computed(() => {
  const filtered = filteredJurnals.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  console.log('Debug - jurnals.value:', jurnals.value)
  console.log('Debug - filteredJurnals.value:', filteredJurnals.value)
  console.log('Debug - filtered:', filtered)
  console.log('Debug - start:', start, 'end:', end)

  const result = filtered.slice(start, end)
  console.log('Debug - paginatedJurnals result:', result)
  return result
})

const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatStatus = (status) => {
  const statusMap = {
    'menunggu_approval': 'Menunggu Approval',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak'
  }
  return statusMap[status] || status
}

const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}

const fetchNomorBuktiList = async () => {
  try {
    isLoadingNomorBukti.value = true
    const response = await jurnalUmumService.getAllNoBuktiJU()
    if (response.success) {
      nomorBuktiList.value = response.data
    }
  } catch (err) {
    console.error('Error fetching nomor bukti:', err)
  } finally {
    isLoadingNomorBukti.value = false
  }
}

const handleNoBuktiChange = () => {
  selectedJenisJurnal.value = ''
  akunDefault.value = null
}

const handleSelectJenisJurnal = async (jenis) => {
  try {
    editingItem.value = null
    preselectedData.value = { jenis_jurnal: jenis.value }
    showFormModal.value = true
  } catch (err) {
    console.error('Error selecting jenis jurnal:', err)
    await showError('Terjadi kesalahan saat memilih jenis jurnal.')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    console.log('Loading jurnal umum (sebelum penyesuaian)...')
    const response = await api.getAllJurnalUmum()
    console.log('Jurnal umum response:', response)

    if (response.success) {
      jurnals.value = response.data || []
      console.log('Jurnal umum loaded:', response.data)
    } else {
      console.error('API returned error:', response)
      error.value = response.message || 'Gagal memuat data jurnal umum'
    }
  } catch (err) {
    console.error('Error loading jurnal umum:', err)
    error.value = 'Gagal memuat data jurnal umum: ' + err.message
  } finally {
    loading.value = false
  }
}

const loadNamaAkunOptions = async () => {
  try {
    const response = await api.getAllNamaAkunJU()
    if (response.success) {
      namaAkunOptions.value = response.data
    }
  } catch (err) {
    console.error('Error loading nama akun options:', err)
  }
}

const handleView = async (jurnal) => {
  console.log('Button View clicked! Jurnal:', jurnal)
  try {
    const result = await api.getJurnalUmumById(jurnal.id)
    console.log('View Jurnal Umum API Response:', result)
    viewingItem.value = result.success && result.data ? result.data : jurnal
  } catch (err) {
    console.error('Error fetching complete jurnal data:', err)
    viewingItem.value = jurnal
  }
  showViewModal.value = true
}

const handleKeterangan = (jurnal) => {
  viewingItem.value = jurnal
  showKeteranganModal.value = true
}

const handleViewClose = () => {
  showViewModal.value = false
  viewingItem.value = null
}

const handleKeteranganClose = () => {
  showKeteranganModal.value = false
  viewingItem.value = null
}

const handleEdit = (jurnal) => {
  editingItem.value = jurnal
  showFormModal.value = true
}

const handleDelete = async (jurnal) => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Jurnal Umum',
    message: `Apakah Anda yakin ingin menghapus jurnal umum <strong>${jurnal.kode}</strong>? Data yang dihapus tidak dapat dikembalikan.`,
    confirmLabel: 'Ya, Hapus',
    cancelLabel: 'Batal',
  })
  if (!ok) return

  try {
    console.log('Deleting jurnal umum ID:', jurnal.id)
    const result = await api.deleteJurnalUmum(jurnal.id)
    console.log('Delete API Response:', result)

    if (result.success) {
      console.log('Jurnal umum deleted successfully')
      await loadData()
    } else {
      console.error('Failed to delete jurnal umum:', result.message)
      await showError(result.message || 'Gagal menghapus jurnal umum.')
    }
  } catch (err) {
    console.error('Error deleting jurnal umum:', err)
    await showError(err.message || 'Terjadi kesalahan saat menghapus jurnal umum.')
  }
}

const closeForm = () => {
  showFormModal.value = false
  editingItem.value = null
  preselectedData.value = null
}

const handleSaveForm = () => {
  closeForm()
  loadData()
}

const handleOpenForm = () => {
  console.log('Opening jurnal umum form')
  showFormModal.value = true
  editingItem.value = null
}

const clearRefFilter = () => {
  refFilter.value = ''
  router.push({ path: '/jurnal-umum' })
}

onMounted(() => {
  if (route.query.ref) {
    refFilter.value = route.query.ref
    console.log('Ref filter detected:', refFilter.value)
  }

  loadData()
  loadNamaAkunOptions()
  fetchNomorBuktiList()

  window.addEventListener('openJurnalUmumForm', handleOpenForm)
})

watch(() => route.query.ref, (newRef) => {
  refFilter.value = newRef || ''
  if (newRef) {
    console.log('Ref filter updated:', newRef)
  }
})

onUnmounted(() => {
  window.removeEventListener('openJurnalUmumForm', handleOpenForm)
})
</script>