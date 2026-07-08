<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input v-model="searchQuery" type="text" placeholder="Cari jurnal penutup..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Semua Status</option>
            <option value="menunggu_approval">Menunggu Approval</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Periode</label>
          <select v-model="selectedMonth" @change="loadData"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Semua Periode</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Jurnal Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Daftar Jurnal Penutup</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Voucher
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pencatat</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Debit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Kredit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!filteredJurnals || filteredJurnals.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                    </path>
                  </svg>
                  <p class="text-lg font-medium">Tidak ada jurnal penutup</p>
                  <p class="text-sm text-gray-400">Belum ada data jurnal penutup yang tersedia</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="jurnal in filteredJurnals" :key="jurnal.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <button @click="handleView(jurnal)" class="text-blue-600 hover:text-blue-900 hover:underline">
                  {{ jurnal.kode }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatDate(jurnal.tanggal) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ jurnal.no_bukti }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ jurnal.keterangan }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ jurnal.nama_pencatat }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">Rp {{
                formatNumber(jurnal.total_debit) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">Rp {{
                formatNumber(jurnal.total_kredit) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  jurnal.status === 'menunggu_approval'
                    ? 'bg-yellow-100 text-yellow-800'
                    : jurnal.status === 'disetujui'
                      ? 'bg-green-100 text-green-800'
                      : jurnal.status === 'ditolak'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                ]">
                  {{ formatStatus(jurnal.status) }}
                </span>
              </td>
              <!-- <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button @click="handleView(jurnal)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    View
                  </button>
                  <button @click="handleEdit(jurnal)" class="text-green-600 hover:text-green-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 00-2-2h2a2 2 0 002-2v10a2 2 0 002 2z">
                      </path>
                    </svg>
                    Edit
                  </button>
                  <button @click="handleDelete(jurnal)" class="text-red-600 hover:text-red-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                    Delete
                  </button>
                </div>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Modal -->
    <ViewJurnalPenutup v-if="showViewModal" :show-modal="showViewModal" :jurnal="viewingItem"
      @close="handleViewClose" />

    <!-- Form Modal -->
    <FormJurnalPenutup v-if="showFormModal" :show-modal="showFormModal" :edit-item="editingItem"
      :akun-options="akunOptions" @close="closeForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../../services/api.js'
import FormJurnalPenutup from './FormJurnalPenutup.vue'
import ViewJurnalPenutup from './ViewJurnalPenutup.vue'

const jurnals = ref([])
const akunOptions = ref([])
const loading = ref(false)
const error = ref(null)
const showFormModal = ref(false)
const editingItem = ref(null)
const showViewModal = ref(false)
const viewingItem = ref(null)

// Filters
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedMonth = ref('')

// Computed
const filteredJurnals = computed(() => {
  let filtered = jurnals.value || []

  // Filter by search query
  if (searchQuery.value && Array.isArray(filtered)) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(jurnal =>
      jurnal.kode.toLowerCase().includes(query) ||
      jurnal.no_bukti.toLowerCase().includes(query) ||
      jurnal.keterangan.toLowerCase().includes(query) ||
      jurnal.nama_pencatat.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (selectedStatus.value && Array.isArray(filtered)) {
    filtered = filtered.filter(jurnal => jurnal.status === selectedStatus.value)
  }

  // Filter by month
  if (selectedMonth.value && Array.isArray(filtered)) {
    filtered = filtered.filter(jurnal => {
      const month = new Date(jurnal.tanggal).getMonth() + 1
      return month === parseInt(selectedMonth.value)
    })
  }

  return Array.isArray(filtered) ? filtered : []
})

// Methods
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
    'ditolak': 'Ditolak',
    'draft': 'Draft'
  }
  return statusMap[status] || status
}

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID')
}

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('Loading jurnal penutup...')
    const response = await api.getAllJurnalPenutup()
    console.log('Jurnal Penutup API Response:', response)

    if (response.success) {
      jurnals.value = response.data
      console.log('Jurnal penutup loaded successfully:', response.data.length, 'items')

      // Log each jurnal for debugging
      response.data.forEach((jurnal, index) => {
        console.log(`Jurnal ${index + 1}:`, {
          id: jurnal.id,
          kode: jurnal.kode,
          tanggal: jurnal.tanggal,
          no_bukti: jurnal.no_bukti,
          status: jurnal.status,
          nama_pencatat: jurnal.nama_pencatat,
          total_debit: jurnal.total_debit,
          total_kredit: jurnal.total_kredit
        })
      })
    } else {
      console.error('API returned error:', response)
      error.value = 'Gagal memuat data jurnal penutup: ' + (response.message || 'Unknown error')
    }
  } catch (err) {
    console.error('Error loading jurnal penutup:', err)
    error.value = 'Gagal memuat data jurnal penutup: ' + err.message
  } finally {
    loading.value = false
  }
}

const loadAkunOptions = async () => {
  try {
    console.log('Loading akun options for FormJurnalPenutup...')
    const response = await api.getAllNamaAkun()
    if (response.success) {
      akunOptions.value = response.data
      console.log('Akun options loaded:', response.data.length, 'items')
    } else {
      console.error('Failed to load akun options:', response.message)
    }
  } catch (err) {
    console.error('Error loading akun options:', err)
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = async (jurnal) => {
  try {
    console.log('Fetching complete jurnal data for edit:', jurnal.id)
    const response = await fetch(`https://api.coopdevs.com/api/jpa/getJurnalPenutup/${jurnal.id}`)
    const result = await response.json()

    if (result.success && result.data) {
      console.log('Complete jurnal data fetched:', result.data)
      editingItem.value = result.data
      showFormModal.value = true
    } else {
      console.error('Failed to fetch jurnal data:', result)
      alert('Gagal memuat data jurnal untuk edit: ' + (result.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error fetching jurnal data:', error)
    alert('Gagal memuat data jurnal untuk edit: ' + error.message)
  }
}

const handleView = async (jurnal) => {
  try {
    console.log('Fetching complete jurnal penutup data for view, ID:', jurnal.id)

    // Fetch complete data from API
    const response = await fetch(`https://api.coopdevs.com/api/jpa/getJurnalPenutup/${jurnal.id}`)
    const result = await response.json()
    console.log('View Jurnal Penutup API Response:', result)

    if (result.success && result.data) {
      viewingItem.value = result.data
      console.log('Complete jurnal penutup data loaded for view:', result.data)
    } else {
      console.error('Failed to fetch complete jurnal penutup data:', result.message)
      // Fallback to existing data
      viewingItem.value = jurnal
    }
  } catch (error) {
    console.error('Error fetching complete jurnal penutup data:', error)
    // Fallback to existing data
    viewingItem.value = jurnal
  }

  showViewModal.value = true
}

const handleViewClose = () => {
  console.log('View close event received in JurnalPenutupList')
  showViewModal.value = false
}

const handleDelete = async (jurnal) => {
  if (confirm(`Apakah Anda yakin ingin menghapus jurnal penutup "${jurnal.kode}"?`)) {
    try {
      await api.deleteJurnalPenutup(jurnal.id)
      await loadData()
    } catch (error) {
      console.error('Error deleting jurnal penutup:', error)
      alert('Gagal menghapus jurnal penutup')
    }
  }
}

const handleSaveForm = () => {
  closeForm()
  loadData()
}

const closeForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleOpenForm = () => {
  handleAddNew()
}

onMounted(() => {
  loadData()
  loadAkunOptions()

  // Add event listener for opening form
  window.addEventListener('openJurnalPenutupForm', handleOpenForm)
})

onUnmounted(() => {
  // Remove event listener
  window.removeEventListener('openJurnalPenutupForm', handleOpenForm)
})
</script>
