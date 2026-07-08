<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input v-model="searchQuery" type="text" placeholder="Cari jurnal penyesuaian..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
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
        <h3 class="text-lg font-semibold text-gray-900">Daftar Jurnal Penyesuaian</h3>
        <p class="text-sm text-gray-600 mt-1">Total {{ filteredJurnals?.length || 0 }} jurnal penyesuaian</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-max divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Kode</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Tanggal</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                No. Voucher</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Keterangan</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Dibuat Oleh</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Total Debit</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Total Kredit</th>
              <th v-if="hasPermission('jurnal penyesuaian', 'edit') || hasPermission('jurnal penyesuaian', 'delete')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
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
                {{ jurnal.keterangan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  jurnal.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : jurnal.status === 'posted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                ]">
                  {{ formatStatus(jurnal.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ jurnal.nama_pencatat }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                Rp {{ formatNumber(jurnal.total_debit) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                Rp {{ formatNumber(jurnal.total_kredit) }}
              </td>
              <td v-if="hasPermission('jurnal penyesuaian', 'edit') || hasPermission('jurnal penyesuaian', 'delete')"
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
                  <button v-if="hasPermission('jurnal penyesuaian', 'edit')" @click="handleEdit(jurnal)"
                    class="text-green-600 hover:text-green-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-1v1.5a.5.5 0 01-.5.5z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.5 10.5H19v8.5a1 1 0 001 1h-5.5a1 1 0 01-1-1V10.5z"></path>
                    </svg>
                  </button>
                  <button v-if="hasPermission('jurnal penyesuaian', 'delete')" @click="handleDelete(jurnal)"
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
  <FormJurnalPenyesuaian :show-modal="showFormModal" :edit-item="editingItem" :akun-options="akunOptions"
    @close="closeForm" @save="handleSaveForm" />

  <!-- View Details Modal -->
  <ViewJurnalPenyesuaian v-if="showViewModal" :show-modal="showViewModal" :jurnal="viewingItem"
    @close="showViewModal = false" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import api from '../../../services/api.js'
import Pagination from '../../Pagination.vue'
import FormJurnalPenyesuaian from './FormJurnalPenyesuaian.vue'
import ViewJurnalPenyesuaian from './ViewJurnalPenyesuaian.vue'

const jurnals = ref([])
const loading = ref(false)
const error = ref(null)
const showFormModal = ref(false)
const editingItem = ref(null)
const showViewModal = ref(false)
const viewingItem = ref(null)
const akunOptions = ref([])

// Pagination State
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filters
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedMonth = ref('')

const filteredJurnals = computed(() => {
  let filtered = jurnals.value || []

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
  return filtered.slice(start, end)
})

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
    'draft': 'Draft',
    'posted': 'Posted'
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
    console.log('Loading jurnal penyesuaian...')
    const response = await api.getAllJurnalPenyesuaian()
    const result = response
    console.log('Jurnal Penyesuaian API Response:', result)

    if (result.success) {
      jurnals.value = result.data
      console.log('Jurnal penyesuaian loaded successfully:', result.data.length, 'items')

      // Log each jurnal for debugging
      result.data.forEach((jurnal, index) => {
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
      console.error('API returned error:', result)
      error.value = 'Gagal memuat data jurnal penyesuaian: ' + (result.message || 'Unknown error')
    }
  } catch (err) {
    console.error('Error loading jurnal penyesuaian:', err)
    error.value = 'Gagal memuat data jurnal penyesuaian: ' + err.message
  } finally {
    loading.value = false
  }
}

const loadAkunOptions = async () => {
  try {
    console.log('Loading akun options for FormJurnalPenyesuaian...')
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

const handleView = async (jurnal) => {
  try {
    console.log('Fetching complete jurnal penyesuaian data for view, ID:', jurnal.id)

    // Fetch complete data from API
    const response = await fetch(`https://api.coopdevs.com/api/jp/getJurnalPenyesuaian/${jurnal.id}`)
    const result = await response.json()
    console.log('View Jurnal Penyesuaian API Response:', result)

    if (result.success && result.data) {
      viewingItem.value = result.data
      console.log('Complete jurnal penyesuaian data loaded for view:', result.data)
    } else {
      console.error('Failed to fetch complete jurnal penyesuaian data:', result.message)
      // Fallback to existing data
      viewingItem.value = jurnal
    }
  } catch (error) {
    console.error('Error fetching complete jurnal penyesuaian data:', error)
    // Fallback to existing data
    viewingItem.value = jurnal
  }

  showViewModal.value = true
}

const handleEdit = (jurnal) => {
  editingItem.value = jurnal
  showFormModal.value = true
}

const handleDelete = async (jurnal) => {
  if (confirm(`Apakah Anda yakin ingin menghapus jurnal penyesuaian "${jurnal.kode}"?`)) {
    try {
      console.log('Deleting jurnal penyesuaian ID:', jurnal.id)
      const response = await fetch(`https://api.coopdevs.com/api/jp/deleteJurnalPenyesuaian/${jurnal.id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      console.log('Delete API Response:', result)

      if (result.success) {
        console.log('Jurnal penyesuaian deleted successfully')
        await loadData()
      } else {
        console.error('Failed to delete jurnal penyesuaian:', result.message)
        alert('Gagal menghapus jurnal penyesuaian: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting jurnal penyesuaian:', error)
      alert('Gagal menghapus jurnal penyesuaian: ' + error.message)
    }
  }
}

const closeForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleSaveForm = () => {
  closeForm()
  loadData()
}

const handleOpenForm = () => {
  console.log('Opening jurnal penyesuaian form')
  console.log('showFormModal before:', showFormModal.value)
  showFormModal.value = true
  console.log('showFormModal after:', showFormModal.value)
  editingItem.value = null
}

onMounted(() => {
  loadData()
  loadAkunOptions()

  // Add event listener for opening form
  window.addEventListener('openJurnalPenyesuaianForm', handleOpenForm)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('openJurnalPenyesuaianForm', handleOpenForm)
})
</script>
