<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pengaturan Akun Sistem</h1>
        <p class="text-gray-600 mt-1">Kelola akun sistem untuk jenis jurnal 1, 2, dan 6</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <div class="text-gray-500 text-lg mt-4">Memuat data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Pengaturan Table -->
    <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jenis</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun Sistem</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Akun</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in paginatedPengaturan" :key="item.no_jenis_jurnal" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ item.nama_jenis_jurnal }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ item.nama_akun || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ item.kode_akun || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 text-xs rounded-full font-medium',
                item.akun_id ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ item.akun_id ? 'Teratur' : 'Belum Diatur' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button v-if="hasPermission('pengaturan akun', 'edit')" @click="handleEdit(item)"
                class="text-blue-600 hover:text-blue-900">
                {{ item.akun_id ? 'Edit' : 'Tambah' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination v-if="pengaturanList.length > 0" :current-page="currentPage" :total-items="pengaturanList.length"
        :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
    </div>

    <!-- Form Modal -->
    <FormPengaturanAkun :show-modal="showFormModal" :edit-item="editingItem" :nama-akun-options="namaAkunOptions"
      @close="handleCloseForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import FormPengaturanAkun from './FormPengaturanAkun.vue'
import Pagination from '../../Pagination.vue'
import api from '../../../services/api.js'

const loading = ref(false)
const error = ref(null)
const showFormModal = ref(false)
const editingItem = ref(null)
const namaAkunOptions = ref([])

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Jenis jurnal yang bisa diatur: 1, 2, 6
const jenisJurnalList = ref([
  { no_jenis_jurnal: 1, nama_jenis_jurnal: 'Kas Masuk' },
  { no_jenis_jurnal: 2, nama_jenis_jurnal: 'Kas Keluar' },
  { no_jenis_jurnal: 6, nama_jenis_jurnal: 'Ayat Silang' }
])

const pengaturanList = ref([])

const paginatedPengaturan = computed(() => {
  const list = pengaturanList.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return list.slice(start, end)
})

const loadPengaturan = async () => {
  loading.value = true
  error.value = null
  try {
    // Load pengaturan untuk setiap jenis jurnal
    const promises = jenisJurnalList.value.map(async (jenis) => {
      try {
        const response = await api.getDefaultPengaturan(jenis.no_jenis_jurnal)
        if (response.success && response.data) {
          return {
            ...jenis,
            ...response.data
          }
        }
        return jenis
      } catch (err) {
        // Jika belum ada pengaturan, return jenis saja
        return jenis
      }
    })

    pengaturanList.value = await Promise.all(promises)
  } catch (err) {
    error.value = 'Gagal memuat data pengaturan akun'
    console.error('Error loading pengaturan:', err)
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

const handleEdit = (item) => {
  editingItem.value = item
  showFormModal.value = true
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleSaveForm = async () => {
  await loadPengaturan()
  handleCloseForm()
}

onMounted(() => {
  loadPengaturan()
  loadNamaAkunOptions()
})
</script>
