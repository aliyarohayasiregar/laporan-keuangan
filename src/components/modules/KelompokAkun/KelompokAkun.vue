<template>
  <div class="p-4 lg:p-6">
    <!-- Header Section -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Kelompok Akun</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Manajemen kelompok akun perusahaan</p>
      </div>
      <button v-if="hasPermission('kelompok akun', 'create')" @click="handleAddNew"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Tambah Kelompok Akun
      </button>
    </header>

    <!-- Tab Navigation -->
    <nav class="border-b border-gray-200 mb-6">
      <div class="flex space-x-4 sm:space-x-8">
        <button @click="activeTab = 'table'" :class="tabClasses('table')">
          Table View
        </button>
        <button @click="activeTab = 'tree'" :class="tabClasses('tree')">
          Tree View
        </button>
      </div>
    </nav>

    <!-- Table View Content -->
    <main v-if="activeTab === 'table'">
      <!-- Search and Filter -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="flex-1 w-full">
          <input v-model="tableSearchQuery" type="text" placeholder="Cari kelompok akun..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
        </div>
        <select v-model="levelFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
          <option value="">Semua Level</option>
          <option value="0">Level 0</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
        </select>
        <select v-model="balanceFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
          <option value="">Semua Balance</option>
          <option value="D">Debit</option>
          <option value="K">Kredit</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="tableLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div class="text-gray-500 text-lg mt-4">Memuat data...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="tableError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ tableError }}
      </div>

      <!-- Table -->
      <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Horizontal scroll wrapper -->
        <div class="overflow-x-auto">
          <table class="w-full min-w-max">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  ID</th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Kode</th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Nama Kelompok Akun</th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Level</th>
                <!-- <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Parent</th> -->
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Kode Group</th>
                <!-- <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Saldo Normal</th> -->
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Created At</th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="kelompok in paginatedKelompokAkun" :key="kelompok.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ kelompok.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ kelompok.kode }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ kelompok.nama_kelompok_akun }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Level {{ kelompok.level }}
                  </span>
                </td>
                <!-- <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ kelompok.parent ? kelompok.parent.nama_kelompok_akun : '-' }}
                  </div>
                  <div v-if="kelompok.parent_id" class="text-xs text-gray-500">
                    ID: {{ kelompok.parent_id }}
                  </div>
                </td> -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ kelompok.kode_group }}</div>
                </td>
                <!-- <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    kelompok.saldo_normal === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  ]">
                    {{ kelompok.saldo_normal === 'D' ? 'Debit' : 'Kredit' }}
                  </span>
                </td> -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ formatDate(kelompok.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button v-if="hasPermission('kelompok akun', 'edit')" @click="handleEdit(kelompok)"
                    class="text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button v-if="hasPermission('kelompok akun', 'delete')" @click="handleDelete(kelompok)"
                    class="text-red-600 hover:text-red-900">
                    Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredKelompokAkun.length === 0" class="text-center py-12">
          <div class="text-gray-500 text-lg">Tidak ada data kelompok akun</div>
          <div class="text-gray-400 text-sm mt-2">Silakan tambah kelompok akun terlebih dahulu</div>
        </div>

        <!-- Pagination -->
        <Pagination v-if="filteredKelompokAkun.length > 0" :current-page="currentPage"
          :total-items="filteredKelompokAkun.length" :items-per-page="itemsPerPage"
          @page-change="currentPage = $event" />
      </div>
    </main>

    <!-- Tree View Content -->
    <main v-if="activeTab === 'tree'">
      <!-- Search -->
      <div class="mb-6">
        <input v-model="treeSearchQuery" type="text" placeholder="Cari kelompok akun atau nama akun..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <!-- Loading State -->
      <div v-if="treeLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div class="text-gray-500 text-lg mt-4">Memuat data...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="treeError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ treeError }}
      </div>

      <!-- Tree Content -->
      <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-6">
          <div v-if="filteredTreeData.length === 0" class="text-center py-12">
            <div class="text-gray-500 text-lg">Tidak ada data kelompok akun</div>
            <div class="text-gray-400 text-sm mt-2">Silakan tambah kelompok akun terlebih dahulu</div>
          </div>

          <div v-else>
            <div v-for="node in filteredTreeData" :key="node.id" class="mb-4">
              <!-- Level 0: Root Kelompok Akun -->
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div class="flex items-center gap-3">
                    <button @click="toggleNode(node.id)"
                      class="flex items-center gap-2 text-left hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200">
                      <svg v-if="node.children && node.children.length > 0"
                        class="w-4 h-4 transition-transform duration-200"
                        :class="{ 'rotate-90': expandedNodes.has(node.id) }" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                      <span v-else class="w-4 h-4"></span>
                      <div>
                        <div class="font-medium text-gray-900">{{ node.kode }}</div>
                        <div class="text-sm text-gray-600">{{ node.nama_kelompok_akun }}</div>
                      </div>
                    </button>
                    <!-- <span :class="[
                      'px-2 py-1 text-xs rounded-full font-medium',
                      node.saldo_normal === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    ]">
                      {{ node.saldo_normal === 'D' ? 'Debit' : 'Kredit' }}
                    </span> -->
                    <span class="text-gray-500 text-xs">Level {{ node.level }}</span>
                  </div>
                  <div class="flex gap-2">
                    <!-- <button @click="handleEdit(node)" class="text-blue-600 hover:text-blue-900 text-sm">
                      Edit
                    </button> -->
                  </div>
                </div>

                <!-- Level 1: Child Kelompok Akun -->
                <div v-if="expandedNodes.has(node.id) && node.children" class="border-t border-gray-200">
                  <div v-for="child in node.children" :key="child.id" class="border-l-2 border-gray-200 ml-4">
                    <div
                      class="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-200">
                      <div class="flex items-center gap-3">
                        <button @click="toggleNode(child.id)"
                          class="flex items-center gap-2 text-left hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200">
                          <svg v-if="child.children && child.children.length > 0"
                            class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'rotate-90': expandedNodes.has(child.id) }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                            </path>
                          </svg>
                          <span v-else class="w-4 h-4"></span>
                          <div>
                            <div class="font-medium text-gray-900">{{ child.kode }}</div>
                            <div class="text-sm text-gray-600">{{ child.nama_kelompok_akun }}</div>
                          </div>
                        </button>
                        <!-- <span :class="[
                          'px-2 py-1 text-xs rounded-full font-medium',
                          child.saldo_normal === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        ]">
                          {{ child.saldo_normal === 'D' ? 'Debit' : 'Kredit' }}
                        </span> -->
                        <span class="text-gray-500 text-xs">Level {{ child.level }}</span>
                      </div>
                      <div class="flex gap-2">
                        <!-- <button @click="handleEdit(child)" class="text-blue-600 hover:text-blue-900 text-sm">
                          Edit
                        </button> -->
                      </div>
                    </div>

                    <!-- Level 2: Sub Child Kelompok Akun dengan Accounts -->
                    <div v-if="expandedNodes.has(child.id) && child.children" class="border-t border-gray-200">
                      <div v-for="subChild in child.children" :key="subChild.id"
                        class="border-l-2 border-gray-200 ml-4">
                        <div
                          class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          <div class="flex items-center gap-3">
                            <button @click="toggleNode(subChild.id)"
                              class="flex items-center gap-2 text-left hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200">
                              <svg v-if="subChild.accounts && subChild.accounts.length > 0"
                                class="w-4 h-4 transition-transform duration-200"
                                :class="{ 'rotate-90': expandedNodes.has(subChild.id) }" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                              </svg>
                              <span v-else class="w-4 h-4"></span>
                              <div>
                                <div class="font-medium text-gray-900">{{ subChild.kode }}</div>
                                <div class="text-sm text-gray-600">{{ subChild.nama_kelompok_akun }}</div>
                              </div>
                            </button>
                            <!-- <span :class="[
                              'px-2 py-1 text-xs rounded-full font-medium',
                              subChild.saldo_normal === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            ]">
                              {{ subChild.saldo_normal === 'D' ? 'Debit' : 'Kredit' }}
                            </span> -->
                            <span class="text-gray-500 text-xs">Level {{ subChild.level }}</span>
                            <span class="text-gray-500 text-xs">{{ subChild.accounts ? subChild.accounts.length : 0 }}
                              akun</span>
                          </div>
                          <div class="flex gap-2">
                            <!-- <button @click="handleEdit(subChild)" class="text-blue-600 hover:text-blue-900 text-sm">
                              Edit
                            </button> -->
                          </div>
                        </div>

                        <!-- Accounts (Nama Akun) -->
                        <div v-if="expandedNodes.has(subChild.id) && subChild.accounts"
                          class="border-t border-gray-200 bg-blue-50">
                          <div class="p-4">
                            <h4 class="text-sm font-medium text-gray-700 mb-3">Nama Akun dalam {{
                              subChild.nama_kelompok_akun }}</h4>
                            <div class="space-y-2">
                              <div v-for="account in subChild.accounts" :key="account.id"
                                class="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow duration-200">
                                <div class="flex items-center gap-3">
                                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <div>
                                    <div class="font-medium text-gray-900">{{ account.nama_akun }}</div>
                                    <div class="text-sm text-gray-600">{{ account.kode }}</div>
                                  </div>
                                  <!-- <span :class="[
                                    'px-2 py-1 text-xs rounded-full font-medium',
                                    account.normal_balance === 'D' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                  ]">
                                    {{ account.normal_balance === 'D' ? 'Debit' : 'Kredit' }}
                                  </span> -->
                                  <span :class="[
                                    'px-2 py-1 text-xs rounded-full font-medium',
                                    account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  ]">
                                    {{ account.is_active ? 'Aktif' : 'Non-aktif' }}
                                  </span>
                                </div>
                                <div class="flex items-center gap-3">
                                  <div class="text-sm text-gray-500 max-w-xs truncate" :title="account.deskripsi">
                                    {{ account.deskripsi || '-' }}
                                  </div>
                                  <div class="flex gap-2">
                                    <button v-if="hasPermission('nama akun', 'edit')"
                                      @click="handleEditAccount(account)"
                                      class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                      Edit
                                    </button>
                                    <button v-if="hasPermission('nama akun', 'edit')"
                                      @click="handleToggleAccountStatus(account)" :class="[
                                        'text-sm font-medium',
                                        account.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                                      ]">
                                      {{ account.is_active ? 'Non-aktifkan' : 'Aktifkan' }}
                                    </button>
                                    <button v-if="hasPermission('nama akun', 'delete')"
                                      @click="handleDeleteAccount(account)"
                                      class="text-red-600 hover:text-red-900 text-sm font-medium">
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Form Modal -->
    <FormKelompokAkun :show-modal="showFormModal" :edit-item="editingItem" :parent-options="kelompokAkun"
      @close="handleCloseForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const hasPermission = inject('hasPermission', () => true)
import FormKelompokAkun from './FormKelompokAkun.vue'
import Pagination from '../../Pagination.vue'
import api from '../../../services/api.js'

// State Management
const activeTab = ref('table')
const showFormModal = ref(false)
const editingItem = ref(null)

// Table View State
const kelompokAkun = ref([])
const tableLoading = ref(false)
const tableError = ref(null)
const tableSearchQuery = ref('')
const levelFilter = ref('')
const balanceFilter = ref('')

// Pagination State
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Tree View State
const treeData = ref([])
const treeLoading = ref(false)
const treeError = ref(null)
const treeSearchQuery = ref('')
const expandedNodes = ref(new Set())





// Computed Properties
const filteredKelompokAkun = computed(() => {
  let filtered = kelompokAkun.value || []

  if (tableSearchQuery.value) {
    const query = tableSearchQuery.value.toLowerCase()
    filtered = filtered.filter(kelompok =>
      kelompok.nama_kelompok_akun.toLowerCase().includes(query) ||
      kelompok.kode.toLowerCase().includes(query)
    )
  }

  if (levelFilter.value !== '') {
    filtered = filtered.filter(kelompok => kelompok.level === parseInt(levelFilter.value))
  }

  if (balanceFilter.value !== '') {
    filtered = filtered.filter(kelompok => kelompok.saldo_normal === balanceFilter.value)
  }

  return filtered
})

const paginatedKelompokAkun = computed(() => {
  const filtered = filteredKelompokAkun.value || []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

const filteredTreeData = computed(() => {
  if (!treeSearchQuery.value) return treeData.value || []

  const query = treeSearchQuery.value.toLowerCase()
  const filterTree = (nodes) => {
    return nodes.filter(node => {
      const nodeMatches =
        node.nama_kelompok_akun.toLowerCase().includes(query) ||
        node.kode.toLowerCase().includes(query)

      let accountsMatch = false
      if (node.children) {
        node.children.forEach(child => {
          if (child.children) {
            child.children.forEach(subChild => {
              if (subChild.accounts) {
                accountsMatch = accountsMatch || subChild.accounts.some(account =>
                  account.nama_akun.toLowerCase().includes(query) ||
                  account.kode.toLowerCase().includes(query)
                )
              }
            })
          }
        })
      }

      if (node.children) {
        node.children = filterTree(node.children.map(child => ({
          ...child,
          children: child.children ? filterTree(child.children) : []
        })))
      }

      return nodeMatches || accountsMatch || (node.children && node.children.length > 0)
    })
  }

  return filterTree(JSON.parse(JSON.stringify(treeData.value)))
})

// Helper Functions
const tabClasses = (tab) => {
  const baseClasses = 'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
  const activeClasses = activeTab.value === tab
    ? 'border-blue-500 text-blue-600'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  return `${baseClasses} ${activeClasses}`
}

// Data Loading Methods
const loadTableData = async () => {
  tableLoading.value = true
  tableError.value = null
  try {
    const response = await api.getAllKelompokAkun()
    if (response.success) {
      kelompokAkun.value = response.data
    } else {
      tableError.value = 'Gagal memuat data kelompok akun'
    }
  } catch (err) {
    tableError.value = 'Gagal memuat data kelompok akun'
    console.error('Error loading table data:', err)
  } finally {
    tableLoading.value = false
  }
}

const loadTreeData = async () => {
  treeLoading.value = true
  treeError.value = null
  try {
    const response = await api.getTreeNamaAkun()
    if (response.success) {
      treeData.value = response.data
    } else {
      treeError.value = 'Gagal memuat data tree'
    }
  } catch (err) {
    treeError.value = 'Gagal memuat data tree'
    console.error('Error loading tree data:', err)
  } finally {
    treeLoading.value = false
  }
}

// Tree Interaction Methods
const toggleNode = (nodeId) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

// CRUD Methods
const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}

const handleEdit = (item) => {
  editingItem.value = item
  showFormModal.value = true
}

const handleSaveForm = async (formData) => {
  try {
    const id = editingItem.value?.id
    if (editingItem.value) {
      await api.editKelompokAkun(id, formData)
    } else {
      await api.createKelompokAkun(formData)
    }
    await Promise.all([loadTableData(), loadTreeData()])
    handleCloseForm()
  } catch (err) {
    const error = activeTab.value === 'table' ? tableError : treeError
    // Extract specific error message from API response
    let errorMessage = 'Gagal menyimpan data kelompok akun'
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    alert(errorMessage)
    console.error('Error saving kelompok akun:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const handleDelete = async (item) => {
  const name = item.nama_kelompok_akun
  if (confirm(`Apakah Anda yakin ingin menghapus kelompok akun "${name}"?`)) {
    try {
      const id = item.id
      await api.deleteKelompokAkun(id)
      await Promise.all([loadTableData(), loadTreeData()])
    } catch (err) {
      alert('Gagal menghapus data kelompok akun')
      console.error('Error deleting kelompok akun:', err)
    }
  }
}

// Account Management Methods
const handleEditAccount = (account) => {
  alert(`Edit akun: ${account.nama_akun}\n(ID: ${account.id})\n\nFitur ini akan redirect ke halaman Nama Akun dengan mode edit.`)
}

const handleToggleAccountStatus = async (account) => {
  if (confirm(`Apakah Anda yakin ingin ${account.is_active ? 'menon-aktifkan' : 'mengaktifkan'} akun "${account.nama_akun}"?`)) {
    try {
      await api.updateNamaAkun(account.id, {
        kode: account.kode,
        nama_akun: account.nama_akun,
        kelompok_akun_id: account.kelompok_akun_id,
        normal_balance: account.normal_balance,
        is_active: !account.is_active,
        deskripsi: account.deskripsi
      })
      await loadTreeData()
    } catch (err) {
      treeError.value = 'Gagal mengubah status nama akun'
      console.error('Error toggling account status:', err)
    }
  }
}

const handleDeleteAccount = async (account) => {
  if (confirm(`Apakah Anda yakin ingin menghapus akun "${account.nama_akun}"?`)) {
    try {
      await api.deleteNamaAkun(account.id)
      await loadTreeData()
    } catch (err) {
      treeError.value = 'Gagal menghapus data nama akun'
      console.error('Error deleting account:', err)
    }
  }
}

// Utility Methods
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadTableData()
  loadTreeData()
})
</script>
