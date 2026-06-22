<template>
  <div class="bg-white border-r border-gray-200 w-64 p-4 flex flex-col">
    <h3 class="font-semibold text-gray-800 mb-4">Komponen</h3>
    <p class="text-xs text-gray-500 mb-4">Drag ke canvas</p>
    <div class="space-y-2 flex-1">
      <button
        @mousedown="onDragStart($event, 'logo')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Logo
      </button>
      <button
        @mousedown="onDragStart($event, 'company_name')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4v-5m10 5v-5" />
        </svg>
        Nama Perusahaan
      </button>
      <button
        @mousedown="onDragStart($event, 'title')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Judul Dokumen
      </button>
      <button
        @mousedown="onDragStart($event, 'field')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Field Dinamis
      </button>
      <button
        @mousedown="onDragStart($event, 'text')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
        Teks
      </button>
      <button
        @mousedown="onDragStart($event, 'table')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Tabel
      </button>
      <button
        @mousedown="onDragStart($event, 'signature')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Tanda Tangan
      </button>
      <button
        @mousedown="onDragStart($event, 'line')"
        class="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm flex items-center gap-2 cursor-grab"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
        </svg>
        Garis
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  onDragStart: { type: Function, required: true }
})
</script>
