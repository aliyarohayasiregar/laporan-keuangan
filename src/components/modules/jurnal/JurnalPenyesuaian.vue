<template>
  <div class="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
    <!-- Beautiful Header -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div class="flex-1">
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Jurnal</h1>
            <p class="text-purple-100 text-lg">Manajemen jurnal penyesuaian perusahaan</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Beautiful Tabs -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
        <nav class="flex flex-wrap -mb-px p-1">
          <button @click="activeTab = 'sebelum-penyesuaian'" :class="[
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 m-1',
            activeTab === 'sebelum-penyesuaian'
              ? 'bg-white border-purple-500 text-purple-700 shadow-sm'
              : 'border-transparent text-gray-600 hover:text-purple-700 hover:bg-purple-100/50'
          ]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            Jurnal Umum
            <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Sebelum</span>
          </button>

          <!-- Commented tabs for now
          <button @click="activeTab = 'penyesuaian'" :class="[
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 m-1',
            activeTab === 'penyesuaian'
              ? 'bg-white border-purple-500 text-purple-700 shadow-sm'
              : 'border-transparent text-gray-600 hover:text-purple-700 hover:bg-purple-100/50'
          ]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
              </path>
            </svg>
            Jurnal Penyesuaian
            <span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Aktif</span>
          </button>
          <button @click="activeTab = 'pembalik'" :class="[
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 m-1',
            activeTab === 'pembalik'
              ? 'bg-white border-purple-500 text-purple-700 shadow-sm'
              : 'border-transparent text-gray-600 hover:text-purple-700 hover:bg-purple-100/50'
          ]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            Jurnal Pembalik
          </button>
          <button @click="activeTab = 'penutup'" :class="[
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 m-1',
            activeTab === 'penutup'
              ? 'bg-white border-purple-500 text-purple-700 shadow-sm'
              : 'border-transparent text-gray-600 hover:text-purple-700 hover:bg-purple-100/50'
          ]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Jurnal Penutup
          </button>
          -->
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6 sm:p-8 bg-gradient-to-br from-white to-purple-50/30">
        <!-- Jurnal Penyesuaian Tab -->
        <div v-if="activeTab === 'penyesuaian'" class="animate-fadeIn">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Jurnal Penyesuaian</h3>
          </div>
          <JurnalPenyesuaianList />
        </div>

        <!-- Jurnal Sebelum Penyesuaian Tab -->
        <div v-if="activeTab === 'sebelum-penyesuaian'" class="animate-fadeIn">
          <JurnalUmumList />
        </div>

        <!-- Jurnal Penutup Tab -->
        <div v-if="activeTab === 'penutup'" class="animate-fadeIn">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Jurnal Penutup</h3>
          </div>
          <JurnalPenutupList />
        </div>

        <!-- Jurnal Pembalik Tab -->
        <div v-if="activeTab === 'pembalik'" class="animate-fadeIn">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Jurnal Pembalik</h3>
          </div>
          <JurnalPembalik />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JurnalPenyesuaianList from './JurnalPenyesuaianList.vue'
import JurnalUmumList from './JurnalUmumList.vue'
import JurnalPenutupList from './JurnalPenutupList.vue'
import JurnalPembalik from './JurnalPembalik.vue'

const activeTab = ref('sebelum-penyesuaian')

const handleAddJurnalUmum = () => {
  console.log('Add new jurnal umum')
  // Switch to jurnal umum tab and trigger form opening
  activeTab.value = 'sebelum-penyesuaian'
  // Emit event to trigger form opening
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openJurnalUmumForm'))
  }, 100)
}

const handleAddJurnalPenyesuaian = () => {
  console.log('Add new jurnal penyesuaian')
  // Switch to jurnal penyesuaian tab and trigger form opening
  activeTab.value = 'penyesuaian'
  // Emit event to trigger form opening
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openJurnalPenyesuaianForm'))
  }, 100)
}

const handleAddJurnalPenutup = () => {
  console.log('Add new jurnal penutup')
  // Switch to jurnal penutup tab and trigger form opening
  activeTab.value = 'penutup'
  // Emit event to trigger form opening
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openJurnalPenutupForm'))
  }, 100)
}

const handleAddJurnalPembalik = () => {
  console.log('Add new jurnal pembalik')
  // Switch to jurnal pembalik tab and trigger form opening
  activeTab.value = 'pembalik'
  // Emit event to trigger form opening
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openJurnalPembalikForm'))
  }, 100)
}
</script>
