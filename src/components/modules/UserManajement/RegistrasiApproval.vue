<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Pengajuan Registrasi Anggota</h1>
        <p class="mt-2 text-sm text-gray-700">
          Daftar pengajuan registrasi anggota yang membutuhkan persetujuan
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 flex justify-center">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0"
      class="mt-8 text-center py-12 bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pengajuan</h3>
      <p class="mt-1 text-sm text-gray-500">Saat ini tidak ada pengajuan registrasi yang perlu diproses.</p>
    </div>

    <!-- Table -->
    <div v-else class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role
                    Approval</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(req, index) in paginatedRequests" :key="req.id_user_pendaftar" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(req.tanggal_pendaftaran) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ req.nama_user }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ req.jenis_user }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ req.nama_role_approval }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Step {{ req.urutan_step }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                      {{ req.status_approval }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button @click="openApprovalModal(req, 'disetujui')" class="text-green-600 hover:text-green-900">
                        Setujui
                      </button>
                      <button @click="openApprovalModal(req, 'ditolak')" class="text-red-600 hover:text-red-900">
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination v-if="requests.length > 0" :current-page="currentPage" :total-items="requests.length"
            :items-per-page="itemsPerPage" @page-change="currentPage = $event" />
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
      aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal">
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div :class="[
              'mx-auto flex items-center justify-center h-12 w-12 rounded-full',
              currentAction === 'disetujui' ? 'bg-green-100' : 'bg-red-100'
            ]">
              <svg v-if="currentAction === 'disetujui'" class="h-6 w-6 text-green-600" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ currentAction === 'disetujui' ? 'Setujui Registrasi' : 'Tolak Registrasi' }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Konfirmasi pengajuan untuk user <strong>{{ selectedRequest?.nama_user }}</strong>. Silakan tambahkan
                  catatan jika diperlukan.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <label for="catatan" class="block text-sm font-medium text-gray-700">Catatan</label>
            <textarea v-model="catatan" id="catatan" rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tambahkan catatan di sini..."></textarea>
          </div>

          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button type="button" @click="submitApproval" :disabled="submitting" :class="[
              'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm',
              currentAction === 'disetujui' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            ]">
              {{ submitting ? 'Memproses...' : (currentAction === 'disetujui' ? 'Setujui' : 'Tolak') }}
            </button>
            <button type="button" @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../services/api.js'
import { getAuthData } from '../../../utils/auth.js'
import { showSuccess, showError } from '@/composables/useModal.js'
import Pagination from '../../Pagination.vue'

const requests = ref([])
const loading = ref(false)
const error = ref(null)
const submitting = ref(false)

const showModal = ref(false)
const selectedRequest = ref(null)
const currentAction = ref('')
const catatan = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const authData = getAuthData()

const paginatedRequests = computed(() => {
  const data = requests.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return data.slice(start, end)
})



const fetchRequests = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getDaftarApprovalRegistrasi()
    requests.value = response.data || []
    currentPage.value = 1
  } catch (err) {
    error.value = 'Gagal memuat daftar pengajuan registrasi.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openApprovalModal = (req, action) => {
  selectedRequest.value = req
  currentAction.value = action
  catatan.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRequest.value = null
  catatan.value = ''
}

const submitApproval = async () => {
  if (!selectedRequest.value) return

  submitting.value = true

  try {
    const payload = {
      id_user_pendaftar: selectedRequest.value.id_user_pendaftar,
      id_approver: authData?.user?.id,
      action: currentAction.value,
      catatan: catatan.value
    }

    await api.prosesApprovalRegistrasi(payload)

    await showSuccess(
      'Persetujuan berhasil diproses!'
    )

    await fetchRequests()
    closeModal()
  } catch (err) {
    await showError(
      'Gagal memproses persetujuan: ' +
      (err.message || 'Terjadi kesalahan')
    )

    console.error(err)
  } finally {
    submitting.value = false
  }
}


onMounted(() => {
  fetchRequests()
})
</script>
