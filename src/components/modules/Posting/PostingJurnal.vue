<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <!-- Beautiful Header -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div class="text-white">
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
                Buku Besar
              </h2>
              <p class="text-blue-100 text-sm sm:text-base lg:text-lg">
                Laporan Buku Besar Interaktif
              </p>
              <!-- <div class="mt-4 flex items-center gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-blue-100 text-xs sm:text-sm">Sistem Aktif</span>
              </div> -->
            </div>

            <!-- Filter Controls -->
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
              <div class="space-y-4">
                <!-- Row 1: Pilih Akun -->
                <div class="w-full lg:w-80 relative" ref="dropdownContainer">
                  <label class="block text-blue-100 text-xs sm:text-sm font-medium mb-2">
                    Pilih Akun
                  </label>

                  <!-- Custom Searchable Dropdown -->
                  <!-- Custom Searchable Dropdown -->
                  <div class="relative">
                    <button type="button" @click="toggleDropdown"
                      class="w-full flex justify-between items-center px-4 py-3 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-left"
                      :disabled="loadingAkun" ref="dropdownButton">
                      <span :class="selectedAkun ? 'text-gray-900' : 'text-gray-500'">
                        {{ selectedAkunText }}
                      </span>
                      <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    <!-- Dropdown Panel - Fixed position -->
                    <Teleport to="body">
                      <div v-if="showAkunDropdown" :style="dropdownStyle"
                        class="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                        @click.stop>
                        <div class="p-2 border-b border-gray-50">
                          <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input v-model="searchAkun" type="text" placeholder="Cari kode atau nama akun..."
                              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              @click.stop />
                          </div>
                        </div>
                        <div class="max-h-[250px] overflow-y-auto">
                          <div v-if="filteredAkunList.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada akun ditemukan
                          </div>
                          <button v-for="akun in filteredAkunList" :key="akun.id" @click="selectAkun(akun)"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 flex flex-col border-b border-gray-50 last:border-0">
                            <span class="font-semibold text-blue-600">{{ akun.kode }}</span>
                            <span class="text-gray-600">{{ akun.nama_akun }}</span>
                          </button>
                        </div>
                      </div>
                    </Teleport>
                  </div>

                  <p class="text-blue-200 text-xs mt-2">
                    <span v-if="loadingAkun">Memuat data akun...</span>
                    <span v-else>Pilih akun untuk melihat buku besar</span>
                  </p>
                </div>

                <!-- Row 2: Filter Range Bulan -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-blue-100 text-xs font-medium mb-2">Bulan Awal</label>
                    <select v-model="startBulan"
                      class="w-full px-3 py-2 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm">
                      <option v-for="(bulan, index) in bulanOptions" :key="index" :value="index + 1">
                        {{ bulan }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-blue-100 text-xs font-medium mb-2">Bulan Akhir</label>
                    <select v-model="endBulan"
                      class="w-full px-3 py-2 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm">
                      <option v-for="(bulan, index) in bulanOptions" :key="index" :value="index + 1">
                        {{ bulan }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-blue-100 text-xs font-medium mb-2">Tahun</label>
                    <select v-model="selectedYear"
                      class="w-full px-3 py-2 text-sm bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm">
                      <option v-for="year in yearOptions" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Row 3: Primary Buttons -->
                <div class="flex flex-col sm:flex-row gap-3">
                  <button @click="handleTampilkanData" :disabled="!selectedAkun || loading"
                    class="flex-1 sm:flex-none bg-white text-blue-600 hover:bg-blue-50 disabled:bg-white/50 disabled:text-blue-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                    <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                      </path>
                    </svg>
                    {{ loading ? 'Memuat...' : 'Tampilkan Data' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Beautiful Loading State -->
      <div v-if="loading" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 sm:p-12">
        <div class="flex flex-col items-center justify-center">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div
              class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0">
            </div>
          </div>
          <div class="mt-6 text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Memuat Data</h3>
            <p class="text-gray-600 text-sm">Sedang mengambil data buku besar...</p>
          </div>
        </div>
      </div>

      <!-- Beautiful Error State -->
      <div v-else-if="error" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-900 mb-1">Terjadi Kesalahan</h3>
            <p class="text-red-700 text-sm">{{ error }}</p>
            <button @click="loadDataSebelum"
              class="mt-3 text-red-600 text-sm font-medium hover:text-red-800 transition-colors duration-200">
              Coba Lagi →
            </button>
          </div>
        </div>
      </div>

      <!-- Beautiful Posting Data -->
      <div v-else-if="postingData" class="space-y-8">
        <!-- Cek jika tidak ada akun -->
        <div v-if="!postingData.akun || postingData.akun.length === 0"
          class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum ada data</h3>
          <p class="text-gray-600 text-sm">Tidak ada transaksi untuk periode yang dipilih</p>
        </div>

        <!-- Account Details -->
        <div v-else v-for="(akun, index) in postingData.akun" :key="akun.akun_id"
          class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">

          <!-- Account Header with Gradient -->
          <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
            <div class="bg-white rounded-xl p-6">
              <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {{ akun.kode_akun.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-1">
                        {{ akun.kode_akun }} - {{ akun.nama_akun }}
                      </h3>
                      <p class="text-sm text-gray-600">Akun ID: {{ akun.akun_id }}</p>
                    </div>
                  </div>
                </div>

                <!-- Beautiful Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto">
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                        </svg>
                      </div>
                      <p class="text-xs font-medium text-green-700">Total Debit</p>
                    </div>
                    <p class="text-lg font-bold text-green-900">{{ formatNumber(akun.total_mutasi_debit) }}</p>
                  </div>

                  <div class="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                        </svg>
                      </div>
                      <p class="text-xs font-medium text-red-700">Total Kredit</p>
                    </div>
                    <p class="text-lg font-bold text-red-900">{{ formatNumber(akun.total_mutasi_kredit) }}</p>
                  </div>

                  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 17h.01M15 7h6m-6 0v3m0 0v3m0-3h3m-3 0h-3"></path>
                        </svg>
                      </div>
                      <p class="text-xs font-medium text-blue-700">Saldo Akhir</p>
                    </div>
                    <p class="text-lg font-bold"
                      :class="akun.saldo_akhir_debit > 0 ? 'text-green-900' : 'text-red-900'">
                      {{ formatNumber(akun.saldo_akhir_debit || akun.saldo_akhir_kredit) }}
                    </p>
                    <span class="text-xs" :class="akun.saldo_akhir_debit > 0 ? 'text-green-600' : 'text-red-600'">
                      ({{ akun.saldo_akhir_debit > 0 ? 'Debit' : 'Kredit' }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Beautiful Transaction Table -->
          <div class="p-6">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Detail Transaksi</h4>
              <p class="text-sm text-gray-600">Riwayat transaksi untuk akun ini</p>
            </div>

            <!-- Empty State untuk tabel transaksi -->
            <div v-if="!akun.tabel || akun.tabel.length === 0" class="py-12 text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
              <h5 class="text-md font-semibold text-gray-700 mb-1">Belum ada transaksi</h5>
              <p class="text-gray-500 text-sm">Tidak ada riwayat transaksi untuk akun ini</p>
            </div>

            <div v-else class="overflow-x-auto">
              <div class="inline-block min-w-full">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                            </path>
                          </svg>
                          Nomor Voucher
                        </div>
                      </th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                          </svg>
                          Tanggal
                        </div>
                      </th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                          </svg>
                          Keterangan
                        </div>
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center justify-end gap-2">
                          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                          </svg>
                          Debit
                        </div>
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center justify-end gap-2">
                          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                          </svg>
                          Kredit
                        </div>
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center justify-end gap-2">
                          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                          </svg>
                          Saldo
                        </div>
                      </th>
                      <!-- <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Saldo Kredit
                        </div>
                      </th> -->
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="(transaksi, index) in akun.tabel" :key="index"
                      class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <button @click="handleVoucherClick(transaksi.reff)"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 cursor-pointer">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                            </path>
                          </svg>
                          {{ transaksi.reff || '-' }}
                        </button>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span class="text-sm font-medium text-gray-900">{{ formatDate(transaksi.tanggal) }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="max-w-xs">
                          <p class="text-sm text-gray-900 font-medium truncate" :title="transaksi.keterangan">
                            {{ transaksi.keterangan }}
                          </p>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <span v-if="transaksi.mutasi_debit > 0"
                          class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-800">
                          {{ formatNumber(transaksi.mutasi_debit) }}
                        </span>
                        <span v-else class="text-gray-400 text-sm">-</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <span v-if="transaksi.mutasi_kredit > 0"
                          class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-red-100 text-red-800">
                          {{ formatNumber(transaksi.mutasi_kredit) }}
                        </span>
                        <span v-else class="text-gray-400 text-sm">-</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="flex items-center justify-end gap-2">
                          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span class="text-sm font-bold text-gray-900">{{ formatNumber(transaksi.saldo_debit)
                          }}</span>
                        </div>
                      </td>
                      <!-- <td class="px-6 py-4 whitespace-nowrap">
                        <span v-if="transaksi.saldo_kredit > 0"
                          class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-indigo-100 text-indigo-800">
                          Rp {{ formatNumber(transaksi.saldo_kredit) }}
                        </span>
                        <span v-else class="text-gray-400 text-sm">-</span>
                      </td> -->
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../services/api.js'

// Reactive data
const selectedAkun = ref('')
const searchAkun = ref('')
const showAkunDropdown = ref(false)
const startBulan = ref(1)
const endBulan = ref(12)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const loadingAkun = ref(false)
const error = ref(null)
const postingData = ref(null)
const namaAkunList = ref([])
const dropdownContainer = ref(null)

const dropdownButton = ref(null)
const dropdownStyle = ref({})

const toggleDropdown = () => {
  if (!showAkunDropdown.value) {
    // Hitung posisi sebelum buka
    const rect = dropdownButton.value.getBoundingClientRect()
    const dropdownHeight = 320 // estimasi tinggi dropdown
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // Buka ke bawah
      top = rect.bottom + 4
    } else {
      // Buka ke atas
      top = rect.top - dropdownHeight - 4
    }

    dropdownStyle.value = {
      top: `${top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
  showAkunDropdown.value = !showAkunDropdown.value
}

// Options
const bulanOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

// Computed
const filteredAkunList = computed(() => {
  if (!searchAkun.value) return namaAkunList.value
  const query = searchAkun.value.toLowerCase()
  return namaAkunList.value.filter(akun =>
    akun.kode.toLowerCase().includes(query) ||
    akun.nama_akun.toLowerCase().includes(query)
  )
})

const selectedAkunText = computed(() => {
  const akun = namaAkunList.value.find(a => a.kode === selectedAkun.value)
  return akun ? `${akun.kode} - ${akun.nama_akun}` : 'Pilih Akun'
})

// Load nama akun
const loadNamaAkun = async () => {
  try {
    loadingAkun.value = true
    const result = await api.getAllNamaAkunBB()
    if (result.success) {
      namaAkunList.value = result.data || []
      console.log('Nama akun loaded:', namaAkunList.value)
    }
  } catch (err) {
    console.error('Error loading nama akun:', err)
  } finally {
    loadingAkun.value = false
  }
}

// Handle akun change
const selectAkun = (akun) => {
  selectedAkun.value = akun.kode
  searchAkun.value = ''
  showAkunDropdown.value = false
  handleAkunChange()
}

const handleAkunChange = () => {
  // Reset data when account changes
  postingData.value = null
}

// Load daftar posting
const loadDaftarPosting = async () => {
  try {
    loadingDaftarPosting.value = true
    errorDaftarPosting.value = null

    console.log('Fetching daftar posting for year:', selectedYear.value)
    const result = await api.getDaftarPostingByTahunBB(selectedYear.value)
    console.log('Daftar Posting API Response:', result)

    if (result.success) {
      daftarPosting.value = result.data || []

      // Check if the year is already final posted from API response
      // If the API doesn't provide this flag, we should only set it to true 
      // after a successful handlePostingFinal call.
      isFinalPosted.value = result.is_final_posted || false

      console.log('Daftar posting loaded:', daftarPosting.value)
    } else {
      errorDaftarPosting.value = result.message || 'Gagal memuat daftar posting'
      daftarPosting.value = []
    }
  } catch (err) {
    console.error('Error loading daftar posting:', err)
    errorDaftarPosting.value = 'Terjadi kesalahan saat memuat daftar posting: ' + err.message
    daftarPosting.value = []
  } finally {
    loadingDaftarPosting.value = false
  }
}

// Handle tampilkan data
const handleTampilkanData = async () => {
  if (!selectedAkun.value) {
    alert('Silakan pilih akun terlebih dahulu')
    return
  }

  if (startBulan.value > endBulan.value) {
    alert('Bulan awal tidak boleh lebih besar dari bulan akhir')
    return
  }

  await loadDataSebelum()
}

const getMonthName = (month) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[month - 1] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format number with thousand separator and 2 decimal places, handle negative values
const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0,00'

  let numericValue
  let isNegative = false

  if (typeof num === 'string') {
    // Handle (123.456) format - with safety check!
    if (num && num.startsWith('(') && num.endsWith(')')) {
      isNegative = true
      numericValue = parseFloat(num.slice(1, -1).replace(/,/g, ''))
    } else {
      numericValue = parseFloat(num.replace(/,/g, ''))
    }
  } else {
    numericValue = num
  }

  if (isNaN(numericValue)) return '0,00'
  if (numericValue < 0) isNegative = true

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(numericValue)).replace('.', ',')
  return isNegative ? `(${formatted})` : formatted
}

// Load data sebelum
const loadDataSebelum = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('Fetching data posting with params:', {
      start_bulan: startBulan.value,
      end_bulan: endBulan.value,
      tahun: selectedYear.value,
      kode_akun: selectedAkun.value
    })

    const result = await api.getDataPostingBB(selectedYear.value, startBulan.value, endBulan.value, selectedAkun.value)
    console.log('API Response:', result)

    if (result.success) {
      postingData.value = result.data
      console.log('Posting data loaded:', result.data)
    } else {
      alert(result.message || 'Gagal memuat data posting')
      postingData.value = null
    }
  } catch (err) {
    console.error('Error loading posting data:', err)
    // Extract specific error message from API response
    let errorMessage = 'Terjadi kesalahan saat memuat data'
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = 'Terjadi kesalahan saat memuat data: ' + err.message
    }
    alert(errorMessage)
    postingData.value = null
  } finally {
    loading.value = false
  }
}

// Router instance
const router = useRouter()

// Handle voucher click - navigate to jurnal umum with ref filter
const handleVoucherClick = (nomorRef) => {
  if (!nomorRef) return

  // Navigate to jurnal umum page with ref parameter
  router.push({
    path: '/jurnal-umum',
    query: { ref: nomorRef }
  })
}

// On mounted
onMounted(() => {
  loadNamaAkun()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    showAkunDropdown.value = false
  }
}
</script>
