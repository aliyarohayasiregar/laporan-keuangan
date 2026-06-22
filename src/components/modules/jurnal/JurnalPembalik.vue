<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Jurnal Pembalik</h2>
        <p class="text-gray-600 mt-1">Manajemen jurnal pembalik per periode</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button @click="activeTab = 'list'" :class="[
            activeTab === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
          ]">
            Daftar Jurnal
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-lg shadow p-6">
      <!-- List Tab -->
      <div v-if="activeTab === 'list'">
        <JurnalPembalikList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JurnalPembalikList from './JurnalPembalikList.vue'

// Reactive data
const activeTab = ref('list')
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
