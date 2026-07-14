<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEdit ? 'Edit Jurnal Umum' : 'Tambah Jurnal Umum' }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ isEdit ? 'Perbarui informasi jurnal' : 'Masukkan informasi jurnal baru' }}
          </p>
        </div>
        <div class="flex gap-2">
          <button type="button" @click="openVoucherPreview" v-if="formData.no_bukti" :disabled="isLoadingTemplate"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {{ isLoadingTemplate ? 'Loading...' : 'Preview & Cetak Voucher' }}
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
            <input v-model="formData.tanggal" type="date" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <!-- Pengaturan Akun Sistem: hanya jenis 1 (Kas Masuk), 2 (Kas Keluar), 6 (Ayat Silang) -->
          <div v-if="needsAkunSistemConfig && selectedJenisJurnal && !akunSistemConfig && !isLoadingAkunSistem"
            class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p class="text-sm text-amber-800">
              Akun sistem untuk jenis jurnal ini belum diatur.
            </p>
            <button type="button" @click="openAkunSistemModal"
              class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              + Tambah Akun
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template v-if="selectedJenisJurnal == 5">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti</label>
                <input :value="formData.no_bukti" type="text" readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono font-bold text-blue-700"
                  :placeholder="isGeneratingNoBukti ? 'Generating...' : (!formData.tanggal ? 'Pilih tanggal terlebih dahulu' : 'Akan digenerate otomatis')" />
              </div>
            </template>
            <template v-else-if="selectedJenisJurnal == 6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti Jurnal 1</label>
                <input :value="formData.no_bukti" type="text" readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono font-bold text-blue-700"
                  :placeholder="isGeneratingNoBukti ? 'Generating...' : 'Akan digenerate otomatis setelah pilih akun jurnal 1'" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti Jurnal 2</label>
                <input :value="formData.no_bukti_silang" type="text" readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono font-bold text-green-700"
                  :placeholder="isGeneratingNoBukti ? 'Generating...' : 'Akan digenerate otomatis setelah pilih akun jurnal 2'" />
              </div>
            </template>

            <template v-else>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti</label>
                <input :value="formData.no_bukti" type="text" readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono font-bold text-blue-700"
                  :placeholder="isGeneratingNoBukti ? 'Generating...' : 'Akan digenerate otomatis setelah pilih akun'" />
              </div>
            </template>
          </div>

          <!-- Dropdown Kategori Jenis (khusus jenis jurnal 7) -->
          <div v-if="selectedJenisJurnal == 7">
            <label class="block text-sm font-medium text-gray-700 mb-2">Kategori Transaksi *</label>
            <select v-model="selectedKategoriJenis" @change="handleKategoriJenisChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isEdit">
              <option value="">Pilih Kategori Transaksi</option>
              <option v-for="k in kategoriJenisOptions" :key="k.value" :value="k.value">
                {{ k.label }}
              </option>
            </select>
            <p v-if="!selectedKategoriJenis" class="text-xs text-blue-500 mt-1">
              Pilih kategori transaksi terlebih dahulu sebelum memilih akun
            </p>
          </div>

          <!-- NEW: Pilih Vendor/Customer (khusus jenis jurnal 7, setelah kategori dipilih) -->
          <div v-if="selectedJenisJurnal == 7 && selectedKategoriJenis">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih {{ isKategoriVendor ? 'Vendor' : 'Customer' }} *
            </label>
            <select v-model="selectedVendorCustomerId" @change="handleVendorCustomerChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isLoadingVendorCustomer || isEdit">
              <option value="">
                {{ isLoadingVendorCustomer ? 'Memuat data...' : `Pilih Nama ${isKategoriVendor ? 'Vendor' : 'Customer'}`
                }}
              </option>
              <option v-for="v in daftarVendorCustomer" :key="v.id" :value="v.id">
                {{ v.nama }}
              </option>
            </select>
            <p v-if="!isLoadingVendorCustomer && daftarVendorCustomer.length === 0" class="text-xs text-red-500 mt-1">
              Belum ada data {{ isKategoriVendor ? 'vendor' : 'customer' }}. Tambahkan terlebih dahulu di menu Daftar
              {{ isKategoriVendor ? 'Vendor' : 'Customer' }}.
            </p>
          </div>

          <div v-if="selectedJenisJurnal != 6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan *</label>
            <div class="relative">
              <textarea v-model="formData.keterangan" rows="3" required maxlength="150"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Masukkan keterangan jurnal (maksimal 150 karakter)"></textarea>
              <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                {{ formData.keterangan?.length || 0 }}/150 karakter
              </div>
            </div>
          </div>

          <!-- Field khusus untuk jenis jurnal 6 - 2 Jurnal Terpisah -->
          <div v-else class="space-y-6 pt-4 border-t border-gray-200">
            <!-- Jurnal 1 -->
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="text-md font-semibold text-blue-800 mb-4">Jurnal 1</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti</label>
                  <input v-model="formData.no_bukti" type="text" readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono font-bold text-blue-700">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan *</label>
                  <div class="relative">
                    <textarea v-model="formData.keterangan" rows="2" required maxlength="150"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Masukkan keterangan jurnal 1"></textarea>
                    <div class="absolute bottom-1 right-2 text-xs text-gray-500">
                      {{ formData.keterangan?.length || 0 }}/150
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detail Jurnal 1 -->
              <div class="border-t border-blue-200 pt-4">
                <div class="flex justify-between items-center mb-4">
                  <h5 class="text-sm font-semibold text-blue-800">Detail Jurnal 1</h5>
                  <button type="button" @click="addDetail(false)"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                    Tambah Detail
                  </button>
                </div>
                <div class="relative overflow-visible">
                  <table class="min-w-full divide-y divide-blue-200 bg-white rounded-lg">
                    <thead class="bg-blue-100">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Akun
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Debit
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                          Kredit</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-20">
                          Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-blue-100">
                      <tr v-for="(detail, index) in formData.details" :key="index">
                        <td class="px-4 py-2">
                          <div class="relative inline-block w-full">
                            <div v-if="index === 0">
                              <input :value="getAyatSilangDebitText()" type="text" readonly
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div v-else class="relative inline-block w-full">
                              <div @click="() => toggleAkunCard(index)"
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white">
                                <div v-if="selectedAkun[index]" class="flex items-center justify-between">
                                  <span class="text-gray-900">{{ getAkunLabel(selectedAkun[index]) }}</span>
                                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7">
                                    </path>
                                  </svg>
                                </div>
                                <div v-else class="flex items-center justify-between text-gray-500">
                                  <span>Pilih akun...</span>
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7">
                                    </path>
                                  </svg>
                                </div>
                              </div>
                              <div v-show="showAkunCard[index]"
                                class="absolute z-[999999] bg-white border border-gray-300 rounded-lg shadow-xl w-full"
                                style="top: calc(100% + 4px); left: 0; min-width: 350px;">
                                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                  <div class="flex items-center justify-between">
                                    <h5 class="text-sm font-medium text-gray-900">Pilih Akun</h5>
                                    <button @click="() => closeAkunCard(index)"
                                      class="text-gray-400 hover:text-gray-600">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="mt-2">
                                    <input v-model="searchQueries[index]" type="text" placeholder="Cari akun..."
                                      class="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                                  </div>
                                </div>
                                <div class="max-h-48 overflow-y-auto">
                                  <div v-for="akun in filteredAkunOptions(index)" :key="akun.id"
                                    @click="selectAkun(index, akun)"
                                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                                    <div class="text-sm font-medium text-gray-900">
                                      {{ akun.kode_akun || akun.kode || akun.no_akun || '-' }}
                                    </div>
                                    <div class="text-xs text-gray-600">{{ akun.nama_akun || akun.nama }}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-2">
                          <input :value="shouldDisableDebit(index) ? '0' : formatNumberInput(detail.debit)" @input="(e) => {
                            if (!shouldDisableDebit(index)) detail.debit = parseNumberInput(e.target.value);
                          }" :disabled="shouldDisableDebit(index)" type="text"
                            class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                            placeholder="0" />
                        </td>
                        <td class="px-4 py-2">
                          <input :value="shouldDisableKredit(index) ? '0' : formatNumberInput(detail.kredit)" @input="(e) => {
                            if (!shouldDisableKredit(index)) detail.kredit = parseNumberInput(e.target.value);
                          }" :disabled="shouldDisableKredit(index)" type="text"
                            class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                            placeholder="0" />
                        </td>
                        <td class="px-4 py-2 text-center">
                          <button type="button" @click="removeDetail(index)" :disabled="index === 0"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                              </path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="mt-4 pt-4 border-t border-blue-200">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-100 p-3 rounded-lg flex justify-between items-center">
                      <span class="text-sm text-blue-800">Total Debit:</span>
                      <span class="text-lg font-bold text-blue-900">{{ formatNumber(totalDebitJurnal1) }}</span>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-lg flex justify-between items-center">
                      <span class="text-sm text-blue-800">Total Kredit:</span>
                      <span class="text-lg font-bold text-blue-900">{{ formatNumber(totalKreditJurnal1) }}</span>
                    </div>
                  </div>
                  <div class="mt-2 text-center">
                    <span :class="['text-sm font-bold', balanceJurnal1 === 0 ? 'text-green-600' : 'text-red-600']">
                      {{ balanceJurnal1 === 0 ? 'BALANCE' : 'SELISIH: ' + formatNumber(Math.abs(balanceJurnal1)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Jurnal 2 (Silang) -->
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 class="text-md font-semibold text-green-800 mb-4">Jurnal 2 (Silang)</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti Silang</label>
                  <input :value="formData.no_bukti_silang" type="text" readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono font-bold text-green-700 cursor-not-allowed"
                    :placeholder="isGeneratingNoBukti ? 'Generating...' : ''">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan Silang *</label>
                  <div class="relative">
                    <textarea v-model="formData.keterangan_silang" rows="2" required maxlength="50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Masukkan keterangan jurnal silang"></textarea>
                    <div class="absolute bottom-1 right-2 text-xs text-gray-500">
                      {{ formData.keterangan_silang?.length || 0 }}/50
                    </div>
                  </div>
                </div>
              </div>
              <div class="border-t border-green-200 pt-4">
                <div class="flex justify-between items-center mb-4">
                  <h5 class="text-sm font-semibold text-green-800">Detail Jurnal 2 (Silang)</h5>
                  <button type="button" @click="addDetail(true)"
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                    Tambah Detail
                  </button>
                </div>
                <div class="relative overflow-visible">
                  <table class="min-w-full divide-y divide-green-200 bg-white rounded-lg">
                    <thead class="bg-green-100">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">Akun
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">
                          Debit</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">
                          Kredit</th>
                        <th
                          class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider w-20">
                          Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-green-100">
                      <tr v-for="(detail, index) in formData.details_silang" :key="index">
                        <td class="px-4 py-2">
                          <div class="relative inline-block w-full">
                            <div v-if="index === 1">
                              <input :value="getAyatSilangKreditText()" type="text" readonly
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div v-else class="relative inline-block w-full">
                              <div @click="() => toggleAkunCard(index, true)"
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white">
                                <div v-if="selectedAkun['s_' + index]" class="flex items-center justify-between">
                                  <span class="text-gray-900">{{ selectedAkun['s_' + index].kode_akun }} - {{
                                    selectedAkun['s_' + index].nama_akun }}</span>
                                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7">
                                    </path>
                                  </svg>
                                </div>
                                <div v-else class="flex items-center justify-between text-gray-500">
                                  <span>Pilih akun...</span>
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7">
                                    </path>
                                  </svg>
                                </div>
                              </div>
                              <div v-show="showAkunCard['s_' + index]"
                                class="absolute z-[999999] bg-white border border-gray-300 rounded-lg shadow-xl w-full"
                                style="top: calc(100% + 4px); left: 0; min-width: 350px;">
                                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                  <div class="flex items-center justify-between">
                                    <h5 class="text-sm font-medium text-gray-900">Pilih Akun</h5>
                                    <button @click="() => closeAkunCard('s_' + index)"
                                      class="text-gray-400 hover:text-gray-600">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="mt-2">
                                    <input v-model="searchQueries['s_' + index]" type="text" placeholder="Cari akun..."
                                      class="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                                  </div>
                                </div>
                                <div class="max-h-48 overflow-y-auto">
                                  <div v-for="akun in filteredAkunOptions('s_' + index)" :key="akun.id"
                                    @click="selectAkun(index, akun, true)"
                                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                                    <div class="text-sm font-medium text-gray-900">{{ akun.kode_akun }}</div>
                                    <div class="text-xs text-gray-600">{{ akun.nama_akun }}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-2">
                          <input :value="shouldDisableDebit(index, 's_') ? '0' : formatNumberInput(detail.debit)"
                            @input="(e) => {
                              if (!shouldDisableDebit(index, 's_')) detail.debit = parseNumberInput(e.target.value);
                            }" :disabled="shouldDisableDebit(index, 's_')" type="text"
                            class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                            placeholder="0" />
                        </td>
                        <td class="px-4 py-2">
                          <input :value="shouldDisableKredit(index, 's_') ? '0' : formatNumberInput(detail.kredit)"
                            @input="(e) => {
                              if (!shouldDisableKredit(index, 's_')) detail.kredit = parseNumberInput(e.target.value);
                            }" :disabled="shouldDisableKredit(index, 's_')" type="text"
                            class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                            placeholder="0" />
                        </td>
                        <td class="px-4 py-2 text-center">
                          <button type="button" @click="removeDetail(index, true)" :disabled="index === 1"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                              </path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="mt-4 pt-4 border-t border-green-200">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-green-100 p-3 rounded-lg flex justify-between items-center">
                      <span class="text-sm text-green-800">Total Debit:</span>
                      <span class="text-lg font-bold text-green-900">{{ formatNumber(totalDebitJurnal2) }}</span>
                    </div>
                    <div class="bg-green-100 p-3 rounded-lg flex justify-between items-center">
                      <span class="text-sm text-green-800">Total Kredit:</span>
                      <span class="text-lg font-bold text-green-900">{{ formatNumber(totalKreditJurnal2) }}</span>
                    </div>
                  </div>
                  <div class="mt-2 text-center">
                    <span :class="['text-sm font-bold', balanceJurnal2 === 0 ? 'text-green-600' : 'text-red-600']">
                      {{ balanceJurnal2 === 0 ? 'BALANCE' : 'SELISIH: ' + formatNumber(Math.abs(balanceJurnal2)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jurnal Details Section (jenis selain 6) -->
          <div v-if="selectedJenisJurnal != 6" class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-medium text-gray-900">Detail Jurnal</h4>
              <button type="button" @click="addDetail(false)"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                Tambah Detail
              </button>
            </div>

            <div class="relative overflow-visible">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Aksi
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(detail, index) in formData.details" :key="index">
                    <td class="px-4 py-2">
                      <div class="relative inline-block w-full">
                        <!-- Baris akun default: Kas (1/2) dari pengaturan sistem -->
                        <div v-if="index === 0 && shouldShowLockedDefaultRow">
                          <input :value="getPrimaryDefaultText()" type="text" readonly
                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed" />
                        </div>
                        <!-- Baris akun bank (3/4): pilih bank aktif -->
                        <div v-else-if="index === 0 && isBankJenis">
                          <select v-model="selectedBankId" @change="handleBankChange"
                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            :disabled="isLoadingBank">
                            <option value="">{{ isLoadingBank ? 'Memuat bank...' : 'Pilih Bank' }}</option>
                            <option v-for="bank in daftarBankAktif" :key="bank.id" :value="bank.id">
                              {{ bank.kode_akun }} - {{ bank.nama_akun }}
                            </option>
                          </select>
                        </div>
                        <div v-else class="relative inline-block w-full">
                          <div @click="() => toggleAkunCard(index)"
                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white">
                            <!-- SESUDAH (benar) -->
                            <div v-if="selectedAkun[index]" class="flex items-center justify-between">
                              <span class="text-gray-900">{{ getAkunLabel(selectedAkun[index]) }}</span> <svg
                                class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                            <div v-else class="flex items-center justify-between text-gray-500">
                              <span>Pilih akun...</span>
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                          <div v-show="showAkunCard[index]"
                            class="absolute z-[9999] bg-white border border-gray-300 rounded-lg shadow-xl w-full"
                            style="top: calc(100% + 4px); left: 0; min-width: 350px;">
                            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                              <div class="flex items-center justify-between">
                                <h5 class="text-sm font-medium text-gray-900">Pilih Akun</h5>
                                <button @click="() => closeAkunCard(index)" class="text-gray-400 hover:text-gray-600">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                              <div class="mt-2">
                                <input v-model="searchQueries[index]" type="text" placeholder="Cari akun..."
                                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                              </div>
                            </div>
                            <div class="max-h-48 overflow-y-auto">
                              <div v-for="akun in filteredAkunOptions(index)" :key="akun.id"
                                @click="selectAkun(index, akun)"
                                class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                                <div class="text-sm font-medium text-gray-900">
                                  {{ akun.kode_akun || akun.kode || akun.no_akun || '-' }}
                                </div>
                                <div class="text-xs text-gray-600">{{ akun.nama_akun || akun.nama }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-2">
                      <input :value="getDisplayDebit(index)"
                        @input="(e) => { if (!shouldDisableDebit(index)) detail.debit = parseNumberInput(e.target.value); }"
                        :disabled="shouldDisableDebit(index)" type="text"
                        class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                        placeholder="0" />
                    </td>
                    <td class="px-4 py-2">
                      <input :value="getDisplayKredit(index)" @input="(e) => {
                        if (!shouldDisableKredit(index)) detail.kredit = parseNumberInput(e.target.value);
                      }" :disabled="shouldDisableKredit(index)" type="text"
                        class="w-full px-2 py-1 border rounded text-sm text-right border-gray-300 disabled:bg-gray-100"
                        placeholder="0" />
                    </td>
                    <td class="px-4 py-2 text-center">
                      <button type="button" @click="removeDetail(index)"
                        :disabled="usesDefaultAccountRow && index === 0"
                        class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                          </path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Totals Section -->
        <div v-if="selectedJenisJurnal != 6" class="border-t border-gray-200 mt-6 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Debit:</span>
              <span class="text-lg font-bold text-blue-700">{{ formatNumber(totalDebit) }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Kredit:</span>
              <span class="text-lg font-bold text-blue-700">{{ formatNumber(totalKredit) }}</span>
            </div>
          </div>
          <div class="mt-2 text-center">
            <span :class="['text-sm font-bold', balance === 0 ? 'text-green-600' : 'text-red-600']">
              {{ balance === 0 ? 'BALANCE' : 'SELISIH: ' + formatNumber(Math.abs(balance)) }}
            </span>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-8 flex justify-end gap-3">
          <button type="button" @click="$emit('close')"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {{ isSubmitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Preview Voucher -->
  <div v-if="showVoucherModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div class="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
      <div
        class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
        <div>
          <h3 class="text-xl font-bold text-white">Preview Voucher</h3>
          <p class="text-blue-100 text-sm">Template: {{ currentVoucherTemplate?.template_name || 'Umum' }} ({{
            currentVoucherTemplate?.category }})</p>
        </div>
        <div class="flex gap-2">
          <button @click="handleDownloadPDF"
            class="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">
            Download PDF
          </button>
          <button @click="showVoucherModal = false"
            class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 font-medium transition-colors">
            Tutup
          </button>
        </div>
      </div>

      <div v-if="selectedJenisJurnal == 6" class="px-6 pt-4 bg-gray-50 border-b border-gray-200 flex gap-2">
        <button @click="activeVoucherTab = 'jurnal1'" :class="[
          'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
          activeVoucherTab === 'jurnal1' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
        ]">
          Jurnal 1 {{ voucherPreviewDataJurnal1.no_voucher ? `(${voucherPreviewDataJurnal1.no_voucher})` : '' }}
        </button>
        <button @click="activeVoucherTab = 'jurnal2'" :class="[
          'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
          activeVoucherTab === 'jurnal2' ? 'border-green-600 text-green-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
        ]">
          Jurnal 2 (Silang) {{ voucherPreviewDataJurnal2.no_voucher ? `(${voucherPreviewDataJurnal2.no_voucher})` : ''
          }}
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 bg-gray-50">
        <VoucherPreview :template="currentVoucherTemplate" :voucher-data="activeVoucherPreviewData" />
      </div>
    </div>
  </div>

  <!-- Modal Pengaturan Akun Sistem (generic, berlaku untuk semua jenis jurnal) -->
  <div v-if="showAkunSistemModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Pengaturan Akun Sistem</h3>
        <button @click="closeAkunSistemModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <p class="text-sm text-gray-600 mb-4">
          {{ akunSistemModalMessage }}
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Akun</label>
          <select v-model="selectedAkunSistemPilihan"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="isLoadingAkunSistemOptions">
            <option value="">{{ isLoadingAkunSistemOptions ? 'Memuat akun...' : '-- Pilih Akun --' }}</option>
            <option v-for="akun in akunSistemOptions" :key="akun.id" :value="akun">
              {{ akun.kode_akun }} - {{ akun.nama_akun }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="closeAkunSistemModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button @click="createPengaturanAkunSistem" :disabled="isLoadingAkunSistem"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {{ isLoadingAkunSistem ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Alert (pengganti browser alert()) -->
  <div v-if="showAlertModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
    <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4">
      <div class="p-6 text-center">
        <div class="mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4"
          :class="alertType === 'success' ? 'bg-green-100' : 'bg-red-100'">
          <svg v-if="alertType === 'success'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ alertType === 'success' ? 'Berhasil' : 'Perhatian' }}
        </h3>
        <p class="text-sm text-gray-600 mb-6 whitespace-pre-line">{{ alertMessage }}</p>
        <button @click="closeAlertModal" class="w-full px-4 py-2 rounded-lg text-white font-medium transition-colors"
          :class="alertType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import api from '../../../services/api.js'
import jurnalUmumService from '../../../services/jurnalUmumService.js'
import voucherTemplateService from '../../../services/voucherTemplateService.js'
import VoucherPreview from '../TemplateVoucher/VoucherPreview.vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'


const props = defineProps({
  showModal: { type: Boolean, required: true },
  editItem: { type: Object, default: null },
  namaAkunOptions: { type: Array, default: () => [] },
  preselectedData: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.editItem)
const isSubmitting = ref(false)



// ===== Modal Alert (pengganti browser alert()) =====
const showAlertModal = ref(false)
const alertMessage = ref('')
const alertType = ref('error') // 'success' | 'error'
let alertOnCloseCallback = null

const showAlert = (message, type = 'error', onClose = null) => {
  alertMessage.value = message
  alertType.value = type
  alertOnCloseCallback = onClose
  showAlertModal.value = true
}

const closeAlertModal = () => {
  showAlertModal.value = false
  if (typeof alertOnCloseCallback === 'function') {
    const cb = alertOnCloseCallback
    alertOnCloseCallback = null
    cb()
  }
}
// ===== END Modal Alert =====

const selectedNoBukti = ref('')
const selectedNoBuktiTujuan = ref('')
const selectedJenisJurnal = ref('')
const selectedKategoriJenis = ref('') // khusus jenis 7
const kategoriJenisOptions = jurnalUmumService.getKategoriJenisOptions()
const nomorBuktiList = ref([])
const isLoadingNomorBukti = ref(false)
const isGeneratingNoBukti = ref(false)
const akunDefault = ref(null)

// Pengaturan Akun Sistem (generic, berlaku untuk semua jenis jurnal)
// GET  /getDefaultPengaturan/{no_jenis_jurnal}
// POST /createPengaturanAkunSistem/{no_jenis_jurnal}  { akun_id }
const showAkunSistemModal = ref(false)
const isLoadingAkunSistem = ref(false)
const akunSistemConfig = ref(null)
const selectedAkunSistemPilihan = ref(null)
const akunSistemOptions = ref([])
const isLoadingAkunSistemOptions = ref(false)

// Bank (jenis jurnal 3 & 4)
const daftarBankAktif = ref([])
const selectedBankId = ref('')
const isLoadingBank = ref(false)

// ===== NEW: Vendor/Customer (khusus jenis jurnal 7) =====
// Kategori 1 = Beli Barang ke Vendor, 2 = Bayar ke Vendor -> Vendor
// Kategori 3 = Jual ke Customer, 4 = Customer Bayar -> Customer
const selectedVendorCustomerId = ref('')
const selectedVendorCustomer = ref(null) // { id, nama, tanggal_dibuat }
const daftarVendorCustomer = ref([])
const isLoadingVendorCustomer = ref(false)

const isKategoriVendor = computed(() => ['1', '2'].includes(String(selectedKategoriJenis.value)))

const fetchDaftarVendorCustomer = async () => {
  if (!selectedKategoriJenis.value) return
  isLoadingVendorCustomer.value = true
  daftarVendorCustomer.value = []
  try {
    const endpoint = isKategoriVendor.value ? '/getDaftarVendor' : '/getDaftarCustomer'
    const res = await api.request(endpoint, { method: 'GET' }, 'ju')
    if (res.success) daftarVendorCustomer.value = res.data || []
  } catch (err) {
    console.error('Error fetch daftar vendor/customer:', err)
  } finally {
    isLoadingVendorCustomer.value = false
  }
}

const getKategoriAksiText = (kategori) => {
  const map = {
    '1': 'Beli barang dari',
    '2': 'Bayar ke',
    '3': 'Jual ke',
    '4': 'Terima pembayaran dari'
  }
  return map[String(kategori)] || ''
}

const handleVendorCustomerChange = () => {
  const found = daftarVendorCustomer.value.find(v => v.id == selectedVendorCustomerId.value)
  if (!found) {
    selectedVendorCustomer.value = null
    return
  }
  selectedVendorCustomer.value = found

  // Auto-fill keterangan, tapi tetap bisa diedit manual oleh user
  const aksi = getKategoriAksiText(selectedKategoriJenis.value)
  formData.value.keterangan = `${aksi} ${found.nama}`.trim()
}

const resetVendorCustomerState = () => {
  selectedVendorCustomerId.value = ''
  selectedVendorCustomer.value = null
  daftarVendorCustomer.value = []
}
// ===== END NEW =====

// Voucher Preview & Cetak
const showVoucherModal = ref(false)
const isLoadingTemplate = ref(false)
const allVoucherTemplates = ref([])
const currentVoucherTemplate = ref(null)
const selectedTemplateId = ref(null)
const activeVoucherTab = ref('jurnal1')

const makeEmptyVoucherData = () => ({
  no_voucher: '',
  tanggal: '',
  company_name: 'PT. Nama Perusahaan',
  jenis_jurnal_label: '',
  rows: [],
  total: 0
})

const voucherPreviewDataJurnal1 = ref(makeEmptyVoucherData())
const voucherPreviewDataJurnal2 = ref(makeEmptyVoucherData())

const activeVoucherPreviewData = computed(() => {
  if (selectedJenisJurnal.value == 6 && activeVoucherTab.value === 'jurnal2') {
    return voucherPreviewDataJurnal2.value
  }
  return voucherPreviewDataJurnal1.value
})

const formData = ref({
  tanggal: new Date().toISOString().split('T')[0],
  no_bukti: '',
  keterangan: '',
  details: [],
  no_bukti_silang: '',
  keterangan_silang: '',
  details_silang: []
})

const searchQueries = ref({})
const showAkunCard = ref({})
const selectedAkun = ref({})

// Computed totals
const totalDebitJurnal1 = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKreditJurnal1 = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balanceJurnal1 = computed(() => totalDebitJurnal1.value - totalKreditJurnal1.value)

const totalDebitJurnal2 = computed(() => (formData.value.details_silang || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKreditJurnal2 = computed(() => (formData.value.details_silang || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balanceJurnal2 = computed(() => totalDebitJurnal2.value - totalKreditJurnal2.value)

const totalDebit = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKredit = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balance = computed(() => totalDebit.value - totalKredit.value)

const activeAccountGroup = computed(() => {
  if (selectedJenisJurnal.value) return String(selectedJenisJurnal.value)
  const firstDetailIndex = formData.value.details.findIndex(d => d.akun_id)
  if (firstDetailIndex === -1) return null
  const akun = selectedAkun.value[firstDetailIndex]
  if (!akun || !akun.kode_akun) return null
  return String(akun.kode_akun).trim().charAt(0)
})

const filteredNomorBuktiList = computed(() => {
  if (!activeAccountGroup.value) return nomorBuktiList.value
  return nomorBuktiList.value.filter(v => String(v.kelompok_jurnal) === activeAccountGroup.value)
})

const usesAutoNoBuktiGeneration = computed(() => !!selectedJenisJurnal.value)
const isBankJenis = computed(() => ['3', '4'].includes(String(selectedJenisJurnal.value)))
const needsAkunSistemConfig = computed(() => ['1', '2', '6'].includes(String(selectedJenisJurnal.value)))
const usesDefaultAccountRow = computed(() =>
  !!selectedJenisJurnal.value && !['5', '6'].includes(String(selectedJenisJurnal.value))
)
const shouldShowLockedDefaultRow = computed(() => usesDefaultAccountRow.value && !isBankJenis.value)
const showAkunDefaultRow = computed(() => akunDefault.value && selectedJenisJurnal.value != 5)

const akunSistemModalMessage = computed(() => {
  const jenis = String(selectedJenisJurnal.value)
  let keyword = 'kas'
  if (jenis !== '6') {
    const options = jurnalUmumService.getJenisJurnalOptions()
    const selected = options.find(opt => String(opt.value) === jenis)
    keyword = selected?.label?.split(' ')[0]?.toLowerCase() || 'kas'
  }
  return `Silahkan pilih akun default (${keyword}) yang akan digunakan sebagai akun default jenis jurnal ini.`
})

const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}
const formatNumberInput = (val) => val ? val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
const parseNumberInput = (val) => val ? parseFloat(val.toString().replace(/\./g, '')) || 0 : 0

const getTanggalPayload = () => {
  if (!formData.value.tanggal) return null
  const [tahun, bulan, tanggal] = formData.value.tanggal.split('-')
  if (!tahun || !bulan || !tanggal) return null
  return parseInt(`${tanggal}${bulan}${tahun}`)
}

const getExpectedDefaultPosisi = () => {
  const jenis = String(selectedJenisJurnal.value || '')
  if (['1', '3'].includes(jenis)) return 'debet'
  if (['2', '4'].includes(jenis)) return 'kredit'
  if (jenis === '7' && akunDefault.value?.posisi_akun) return akunDefault.value.posisi_akun
  return akunDefault.value?.posisi_akun || null
}

// Auto-hitung nominal baris akun default (index 0) = total dari semua baris lawan (index >= 1)
watch(
  () => usesDefaultAccountRow.value && selectedJenisJurnal.value != 6
    ? formData.value.details.slice(1).map(d => `${d.debit}|${d.kredit}`).join(',')
    : null,
  () => {
    if (!usesDefaultAccountRow.value || selectedJenisJurnal.value == 6) return
    if (!formData.value.details[0]) return

    const posisi = getExpectedDefaultPosisi()
    const otherRows = formData.value.details.slice(1)
    const sumDebit = otherRows.reduce((s, d) => s + (parseFloat(d.debit) || 0), 0)
    const sumKredit = otherRows.reduce((s, d) => s + (parseFloat(d.kredit) || 0), 0)

    if (posisi === 'debet') {
      formData.value.details[0].debit = sumKredit
      formData.value.details[0].kredit = 0
    } else if (posisi === 'kredit') {
      formData.value.details[0].kredit = sumDebit
      formData.value.details[0].debit = 0
    }
  },
  { immediate: true }
)


watch(() => getExpectedDefaultPosisi(), (posisi) => {
  if (!usesDefaultAccountRow.value || !posisi) return
  formData.value.details.slice(1).forEach(d => {
    if (posisi === 'debet') d.debit = 0
    else if (posisi === 'kredit') d.kredit = 0
  })
})

const getDisplayDebit = (index) => {
  if (index === 0 && usesDefaultAccountRow.value) {
    return formatNumberInput(formData.value.details[0]?.debit)
  }
  return shouldDisableDebit(index) ? '0' : formatNumberInput(formData.value.details[index]?.debit)
}
const getDisplayKredit = (index) => {
  if (index === 0 && usesDefaultAccountRow.value) {
    return formatNumberInput(formData.value.details[0]?.kredit)
  }
  return shouldDisableKredit(index) ? '0' : formatNumberInput(formData.value.details[index]?.kredit)
}

const getAkunDefaultText = () => {
  if (!akunDefault.value) return ''
  if (selectedJenisJurnal.value == 6 && akunDefault.value.debet) {
    return getAkunLabel(akunDefault.value.debet)
  }
  return getAkunLabel(akunDefault.value)
}


const getPrimaryDefaultText = () => {
  return getAkunDefaultText() || 'Akun default akan otomatis terisi setelah pilih akun'
}

const getAyatSilangDebitText = () => {
  return akunSistemConfig.value ? akunSistemConfig.value.label : 'Ayat silang'
}

const getAyatSilangKreditText = () => {
  return akunSistemConfig.value ? akunSistemConfig.value.label : 'Ayat silang'
}

const shouldDisableDebit = (index, prefix = '') => {
  if (selectedJenisJurnal.value == 6) return index === 1
  const key = prefix === '' ? index : `${prefix}${index}`

  // Baris akun default/bank (index 0): selalu dikunci, nominal auto dari lawan
  if (index === 0 && usesDefaultAccountRow.value) {
    return true
  }

  // Baris lawan: sisi yang boleh diisi = kebalikan dari posisi akun default
  if (usesDefaultAccountRow.value) {
    const defaultPosisi = getExpectedDefaultPosisi()
    if (defaultPosisi === 'debet') return true   // default di debit -> lawan wajib isi kredit
    if (defaultPosisi === 'kredit') return false // default di kredit -> lawan wajib isi debit
  }

  // Fallback (belum ada default row, mis. jenis 5)
  const selectedAccount = selectedAkun.value[key]
  if (selectedAccount) return selectedAccount.posisi_akun === 'kredit'
  return false
}

const shouldDisableKredit = (index, prefix = '') => {
  if (selectedJenisJurnal.value == 6) return index === 0
  const key = prefix === '' ? index : `${prefix}${index}`

  if (index === 0 && usesDefaultAccountRow.value) {
    return true
  }

  if (usesDefaultAccountRow.value) {
    const defaultPosisi = getExpectedDefaultPosisi()
    if (defaultPosisi === 'kredit') return true
    if (defaultPosisi === 'debet') return false
  }

  const selectedAccount = selectedAkun.value[key]
  if (selectedAccount) return selectedAccount.posisi_akun === 'debet'
  return false
}

const getAkunLabel = (akun) => {
  if (!akun) return ''
  const kode = akun.kode_akun || akun.kode || akun.no_akun || akun.account_code || ''
  const nama = akun.nama_akun || akun.nama || ''
  return kode ? `${kode} - ${nama}` : nama
}

const filteredAkunOptions = (key) => {
  const query = (searchQueries.value[key] || '').toLowerCase()
  let options = props.namaAkunOptions
  return options.filter(a =>
    (a.kode_akun || '').toLowerCase().includes(query) ||
    (a.nama_akun || '').toLowerCase().includes(query)
  )
}

const toggleAkunCard = (index, isSilang = false) => {
  const key = isSilang ? `s_${index}` : index
  Object.keys(showAkunCard.value).forEach(k => { if (k != key) showAkunCard.value[k] = false })
  showAkunCard.value[key] = !showAkunCard.value[key]
}

const closeAkunCard = (key) => { showAkunCard.value[key] = false }

const createEmptyDetail = () => ({ akun_id: '', debit: 0, kredit: 0 })

const resetDetailSelections = () => {
  searchQueries.value = {}
  selectedAkun.value = {}
  showAkunCard.value = {}
}

const resetBankState = () => {
  selectedBankId.value = ''
  daftarBankAktif.value = []
}

const fetchDaftarBankAktif = async () => {
  isLoadingBank.value = true
  try {
    const res = await jurnalUmumService.getDaftarBankAktif()
    if (res.success) daftarBankAktif.value = res.data || []
  } catch (err) {
    console.error('Error fetch daftar bank aktif:', err)
    daftarBankAktif.value = []
  } finally {
    isLoadingBank.value = false
  }
}

const handleBankChange = async () => {
  const bank = daftarBankAktif.value.find(b => String(b.id) === String(selectedBankId.value))
  if (!bank) {
    formData.value.details[0].akun_id = ''
    selectedAkun.value[0] = null
    searchQueries.value[0] = ''
    formData.value.no_bukti = ''
    return
  }

  const posisi = String(selectedJenisJurnal.value) === '3' ? 'debet' : 'kredit'
  const akun = {
    id: bank.id,
    kode_akun: bank.kode_akun,
    nama_akun: bank.nama_akun,
    posisi_akun: posisi
  }
  formData.value.details[0].akun_id = bank.id
  selectedAkun.value[0] = akun
  searchQueries.value[0] = getAkunLabel(akun)

  if (!isEdit.value && usesAutoNoBuktiGeneration.value) {
    await generateNoBuktiBySelectedAkun()
  }
}

const fetchAkunSistemOptions = async () => {
  isLoadingAkunSistemOptions.value = true
  akunSistemOptions.value = []
  try {
    if (String(selectedJenisJurnal.value) === '6') {
      const res = await jurnalUmumService.getAyatSilangPermissions()
      if (res.success) akunSistemOptions.value = res.data || []
    } else {
      akunSistemOptions.value = props.namaAkunOptions
    }
  } catch (err) {
    console.error('Error fetch akun sistem options:', err)
    if (String(selectedJenisJurnal.value) !== '6') {
      akunSistemOptions.value = props.namaAkunOptions
    }
  } finally {
    isLoadingAkunSistemOptions.value = false
  }
}

const initializeDetailsForJenis = (jenis = selectedJenisJurnal.value) => {
  const jenisValue = String(jenis || '')
  akunDefault.value = null
  formData.value.no_bukti = ''
  formData.value.no_bukti_silang = ''
  resetDetailSelections()
  resetBankState()

  if (jenisValue === '6') {
    formData.value.details = [createEmptyDetail(), createEmptyDetail()]
    formData.value.details_silang = [createEmptyDetail(), createEmptyDetail()]
    return
  }

  formData.value.details_silang = []
  if (jenisValue === '5') {
    formData.value.details = [createEmptyDetail()]
    return
  }

  formData.value.details = [createEmptyDetail(), createEmptyDetail()]
}

const findAkunFromOptions = (data) => {
  const code = (data?.kode_akun || data?.kode || '').toString().trim()
  const found = props.namaAkunOptions.find(a => (a.kode_akun || a.kode || '').toString().trim() === code)
  return {
    id: found?.id || found?.id_akun || found?.akun_id || found?.id_nama_akun || data?.id || data?.id_akun || data?.akun_id,
    akun: found || { kode_akun: code, nama_akun: data?.nama_akun, posisi_akun: data?.posisi_akun }
  }
}

const getNoBuktiPayloadByAkun = (isSilang = false) => {
  if (!usesAutoNoBuktiGeneration.value) return null
  const tanggal = getTanggalPayload()
  if (!tanggal) return null

  const jenis = Number(selectedJenisJurnal.value)
  if (!jenis) return null

  if (jenis === 6) {
    const akunId = isSilang ? formData.value.details_silang[0]?.akun_id : formData.value.details[1]?.akun_id
    if (!akunId) return null
    return {
      no_jenis_jurnal: 6,
      akun_id: parseInt(akunId),
      tanggal,
      urutan_transaksi: isSilang ? 2 : 1
    }
  }

  if (jenis === 7 && !selectedKategoriJenis.value) return null

  if (['3', '4'].includes(String(jenis))) {
    const bankAkunId = formData.value.details[0]?.akun_id
    if (!bankAkunId) return null
    return {
      no_jenis_jurnal: jenis,
      akun_id: parseInt(bankAkunId),
      tanggal
    }
  }

  const akunId = formData.value.details[1]?.akun_id
  if (!akunId) return null

  const payload = {
    no_jenis_jurnal: jenis,
    akun_id: parseInt(akunId),
    tanggal
  }

  if (jenis === 7) {
    payload.kategori_jenis = parseInt(selectedKategoriJenis.value)
  }

  return payload
}

const generateNoBuktiBySelectedAkun = async (isSilang = false) => {
  const payload = getNoBuktiPayloadByAkun(isSilang)
  if (!payload) return

  isGeneratingNoBukti.value = true
  try {
    const res = await jurnalUmumService.generateNoBuktiByAkun(payload)
    if (!res.success) {
      showAlert(res.message || 'Gagal generate nomor bukti!', 'error')
      return
    }

    if (payload.no_jenis_jurnal === 6) {
      if (isSilang) {
        formData.value.no_bukti_silang = res.no_bukti_full || ''
      } else {
        formData.value.no_bukti = res.no_bukti_full || ''
        if (formData.value.no_bukti) {
          applyAkunDefault()
        }
      }
      return
    }

    formData.value.no_bukti = res.no_bukti_full || ''
    if (formData.value.no_bukti) {
      await fetchAkunDefault(payload.no_jenis_jurnal, formData.value.no_bukti)
    }
  } catch (err) {
    console.error('Error generate no bukti by akun:', err)
    showAlert('Terjadi kesalahan saat generate nomor bukti!', 'error')
  } finally {
    isGeneratingNoBukti.value = false
  }
}

const selectAkun = async (index, akun, isSilang = false) => {
  const akunId = akun.id || akun.id_akun || akun.akun_id || akun.id_nama_akun
  const key = isSilang ? `s_${index}` : index
  if (isSilang) {
    formData.value.details_silang[index].akun_id = akunId
  } else {
    formData.value.details[index].akun_id = akunId
  }
  selectedAkun.value[key] = akun
  searchQueries.value[key] = getAkunLabel(akun)
  showAkunCard.value[key] = false

  if (isEdit.value || !usesAutoNoBuktiGeneration.value) return

  if (selectedJenisJurnal.value == 6) {
    if (!isSilang && index === 1) await generateNoBuktiBySelectedAkun(false)
    if (isSilang && index === 0) await generateNoBuktiBySelectedAkun(true)
    return
  }



}

const addDetail = (isSilang = false) => {
  if (isSilang) {
    formData.value.details_silang.push({ akun_id: '', debit: 0, kredit: 0 })
  } else {
    formData.value.details.push({ akun_id: '', debit: 0, kredit: 0 })
  }
}

const removeDetail = (index, isSilang = false) => {
  if (isSilang) {
    formData.value.details_silang.splice(index, 1)
  } else {
    formData.value.details.splice(index, 1)
  }
  const key = isSilang ? `s_${index}` : index
  delete selectedAkun.value[key]
  delete searchQueries.value[key]
  delete showAkunCard.value[key]
}

watch(activeAccountGroup, (newGroup) => {
  if (newGroup && selectedNoBukti.value && !isEdit.value) {
    const stillValid = filteredNomorBuktiList.value.some(v => v.kode === selectedNoBukti.value)
    if (!stillValid) {
      selectedNoBukti.value = ''
      formData.value.no_bukti = ''
      akunDefault.value = null
    }
  }
})

// const autoInitTanpaLawan = async (jenis) => {
//   if (!formData.value.tanggal) return
//   try {
//     // pastikan daftar kode bukti (template) sudah ada
//     if (nomorBuktiList.value.length === 0) {
//       await fetchNomorBuktiList()
//     }

//     // cari kode template yang sesuai jenis jurnal ini
//     const matchingBukti = nomorBuktiList.value.find(
//       v => String(v.kelompok_jurnal) === String(jenis)
//     )
//     if (!matchingBukti) {
//       console.warn(`Tidak ada kode no_bukti terdaftar untuk jenis jurnal ${jenis}`)
//       return
//     }

//     const tanggalParts = formData.value.tanggal.split('-')
//     const res = await jurnalUmumService.getAkunDefault(
//       jenis,
//       matchingBukti.kode,           // <- ini yang tadinya null, sekarang diisi kode template
//       null,
//       parseInt(tanggalParts[1]),
//       parseInt(tanggalParts[0])
//     )
//     if (!res.success) {
//       console.warn('getAkunDefault gagal:', res.message)
//       return
//     }

//     akunDefault.value = res.data
//     applyAkunDefault()

//     const akunId = res.data.id_akun
//     const tanggal = getTanggalPayload()
//     if (!akunId || !tanggal) {
//   console.warn('akunId atau tanggal kosong, generate no bukti dibatalkan', { akunId, tanggal })
//   return
// }
//     isGeneratingNoBukti.value = true
//     const genRes = await jurnalUmumService.generateNoBuktiByAkun({
//       no_jenis_jurnal: parseInt(jenis),
//       akun_id: parseInt(akunId),
//       tanggal
//     })
//     if (genRes.success) {
//       formData.value.no_bukti = genRes.no_bukti_full || ''
//     } else {
//       console.warn('generateNoBuktiByAkun gagal:', genRes.message)
//     }
//   } catch (err) {
//     console.error('Error auto init jenis 1/2/3/4:', err)
//   } finally {
//     isGeneratingNoBukti.value = false
//   }
// }

const generateNoBuktiJenis12 = async (jenis) => {
  const akunId = akunSistemConfig.value?.akun_id
  const tanggal = getTanggalPayload()
  if (!akunId || !tanggal) {
    console.warn('akunId atau tanggal kosong, generate no bukti dibatalkan', { akunId, tanggal })
    return
  }

  isGeneratingNoBukti.value = true
  try {
    const genRes = await jurnalUmumService.generateNoBuktiByAkun({
      no_jenis_jurnal: parseInt(jenis),
      akun_id: parseInt(akunId),
      tanggal
    })
    if (genRes.success) {
      formData.value.no_bukti = genRes.no_bukti_full || ''
    } else {
      console.warn('generateNoBuktiByAkun gagal:', genRes.message)
    }
  } catch (err) {
    console.error('Error generate no bukti jenis 1/2:', err)
  } finally {
    isGeneratingNoBukti.value = false
  }
}

const generateNoBuktiJenis5 = async () => {
  const tanggal = getTanggalPayload()
  if (!tanggal) {
    console.warn('tanggal kosong, generate no bukti jenis 5 dibatalkan')
    return
  }

  isGeneratingNoBukti.value = true
  try {
    const genRes = await jurnalUmumService.generateNoBuktiByAkun({
      no_jenis_jurnal: 5,
      tanggal
    })
    if (genRes.success) {
      formData.value.no_bukti = genRes.no_bukti_full || ''
    } else {
      showAlert(genRes.message || 'Gagal generate nomor bukti!', 'error')
    }
  } catch (err) {
    console.error('Error generate no bukti jenis 5:', err)
    showAlert('Terjadi kesalahan saat generate nomor bukti!', 'error')
  } finally {
    isGeneratingNoBukti.value = false
  }
}


watch(selectedJenisJurnal, async (newJenis) => {
  if (!isEdit.value) {
    initializeDetailsForJenis(newJenis)
    selectedNoBukti.value = ''
    selectedNoBuktiTujuan.value = ''
    selectedArahJenis5.value = ''
    if (newJenis != 7) {
      selectedKategoriJenis.value = ''
      resetVendorCustomerState()
    }
    if (['3', '4'].includes(String(newJenis))) {
      selectedBankId.value = ''
      await fetchDaftarBankAktif()
    }

    if (String(newJenis) === '5' && formData.value.tanggal) {
      await generateNoBuktiJenis5()
    }
  }

  if (needsAkunSistemConfig.value && newJenis) {
    await getPengaturanAkunSistem(newJenis)
    if (akunSistemConfig.value) {
      applyAkunDefault()
      if (!isEdit.value && ['1', '2'].includes(String(newJenis)) && formData.value.tanggal) {
        await generateNoBuktiJenis12(newJenis)
      }
    }
  } else {
    akunSistemConfig.value = null
  }
})

const fetchNomorBuktiList = async () => {
  isLoadingNomorBukti.value = true
  try {
    const res = await jurnalUmumService.getAllNoBuktiJU()
    if (res.success) {
      nomorBuktiList.value = res.data
      console.log('DEBUG nomorBuktiList:', JSON.stringify(res.data, null, 2)) // <- tambahkan ini
    }
  } finally {
    isLoadingNomorBukti.value = false
  }
}

const fetchAkunDefault = async (jenis, bukti) => {
  if (jenis == 5) {
    akunDefault.value = null
    if (formData.value.details.length === 0) formData.value.details = [createEmptyDetail()]
    return
  }
  if (jenis == 6) return // pengaturan default ayat silang sudah diambil lewat getPengaturanAkunSistem(6)
  if (jenis == 7 && !selectedKategoriJenis.value) return
  try {
    const tanggalParts = formData.value.tanggal.split('-')
    const bulan = parseInt(tanggalParts[1])
    const tahun = parseInt(tanggalParts[0])
    const res = await jurnalUmumService.getAkunDefault(
      jenis,
      bukti,
      jenis == 7 ? selectedKategoriJenis.value : null,
      bulan,
      tahun
    )
    if (res.success) {
      akunDefault.value = res.data
      applyAkunDefault()
    }
  } catch (err) { console.error(err) }
}


const applyAkunDefault = () => {
  if (selectedJenisJurnal.value == 5) return

  if (selectedJenisJurnal.value == 6) {
    if (!akunSistemConfig.value) return

    const ayatSilangAkun = {
      id: akunSistemConfig.value.id,
      label: akunSistemConfig.value.label
    }

    const manualJurnal1 = formData.value.details[1] || createEmptyDetail()
    const manualJurnal2 = formData.value.details_silang[0] || createEmptyDetail()
    const selectedManualJurnal1 = selectedAkun.value[1]
    const selectedManualJurnal2 = selectedAkun.value['s_0']

    formData.value.details = [
      { akun_id: ayatSilangAkun.id, debit: formData.value.details[0]?.debit || 0, kredit: formData.value.details[0]?.kredit || 0 },
      { ...manualJurnal1 }
    ]
    formData.value.details_silang = [
      { ...manualJurnal2 },
      { akun_id: ayatSilangAkun.id, debit: formData.value.details_silang[1]?.debit || 0, kredit: formData.value.details_silang[1]?.kredit || 0 }
    ]

    selectedAkun.value[0] = ayatSilangAkun
    searchQueries.value[0] = ayatSilangAkun.label
    selectedAkun.value['s_1'] = ayatSilangAkun
    searchQueries.value['s_1'] = ayatSilangAkun.label
    if (selectedManualJurnal1) {
      selectedAkun.value[1] = selectedManualJurnal1
      searchQueries.value[1] = `${selectedManualJurnal1.kode_akun || selectedManualJurnal1.kode || ''} - ${selectedManualJurnal1.nama_akun || ''}`
    }
    if (selectedManualJurnal2) {
      selectedAkun.value['s_0'] = selectedManualJurnal2
      searchQueries.value['s_0'] = `${selectedManualJurnal2.kode_akun || selectedManualJurnal2.kode || ''} - ${selectedManualJurnal2.nama_akun || ''}`
    }
  } else {
    if (!akunDefault.value) return
    const defaultAkun = findAkunFromOptions(akunDefault.value)
    const manualDetail = formData.value.details[1] || createEmptyDetail()
    const selectedManualDetail = selectedAkun.value[1]

    formData.value.details = [
      { akun_id: defaultAkun.id, debit: formData.value.details[0]?.debit || 0, kredit: formData.value.details[0]?.kredit || 0 },
      { ...manualDetail }
    ]

    searchQueries.value[0] = getAkunDefaultText()
    selectedAkun.value[0] = {
      id: defaultAkun.id,
      kode_akun: (akunDefault.value.kode_akun || akunDefault.value.kode || '').toString().trim(),
      nama_akun: akunDefault.value.nama_akun,
      posisi_akun: akunDefault.value.posisi_akun
    }
    if (selectedManualDetail) {
      selectedAkun.value[1] = selectedManualDetail
      searchQueries.value[1] = `${selectedManualDetail.kode_akun || selectedManualDetail.kode || ''} - ${selectedManualDetail.nama_akun || ''}`
    }
  }
}


// Handler saat kategori jenis dipilih (khusus jenis 7)
const handleKategoriJenisChange = async () => {
  resetVendorCustomerState()
  initializeDetailsForJenis(7)
  if (!selectedKategoriJenis.value) return
  await fetchDaftarVendorCustomer()

  try {
    // pastikan daftar kode bukti (template) sudah ada
    if (nomorBuktiList.value.length === 0) {
      await fetchNomorBuktiList()
    }

    // cari kode template yang sesuai jenis jurnal 7
    const matchingBukti = nomorBuktiList.value.find(
      v => String(v.kelompok_jurnal) === '7'
    )
    if (!matchingBukti) {
      console.warn('Tidak ada kode no_bukti terdaftar untuk jenis jurnal 7')
      return
    }

    const tanggalParts = formData.value.tanggal.split('-')
    const res = await jurnalUmumService.getAkunDefault(
      7,
      matchingBukti.kode,           // <- diisi kode template, bukan null lagi
      selectedKategoriJenis.value,
      parseInt(tanggalParts[1]),
      parseInt(tanggalParts[0])
    )
    if (!res.success) {
      console.warn('getAkunDefault jenis 7 gagal:', res.message)
      return
    }
    akunDefault.value = res.data
    applyAkunDefault()

    const akunId = res.data.id_akun || res.data.id || res.data.akun_id
    const tanggal = getTanggalPayload()
    if (!akunId || !tanggal) return

    isGeneratingNoBukti.value = true
    const genRes = await jurnalUmumService.generateNoBuktiByAkun({
      no_jenis_jurnal: 7,
      akun_id: parseInt(akunId),
      tanggal,
      kategori_jenis: parseInt(selectedKategoriJenis.value)
    })
    if (genRes.success) {
      formData.value.no_bukti = genRes.no_bukti_full || ''
    } else {
      console.warn('generateNoBuktiByAkun jenis 7 gagal:', genRes.message)
    }
  } catch (err) {
    console.error('Error auto init jenis 7:', err)
  } finally {
    isGeneratingNoBukti.value = false
  }
}


const openVoucherPreview = async () => {
  isLoadingTemplate.value = true
  try {
    if (allVoucherTemplates.value.length === 0) {
      const res = await voucherTemplateService.getAllTemplates()
      allVoucherTemplates.value = res.data
    }

    let category = 'umum'
    const jenis = Number(selectedJenisJurnal.value)
    if (jenis === 1) category = 'kas_masuk'
    else if (jenis === 2) category = 'kas_keluar'
    else if (jenis === 3) category = 'bank_masuk'
    else if (jenis === 4) category = 'bank_keluar'
    else if (jenis === 5) category = 'adjustment'
    else if (jenis === 6) category = 'ayat_silang'
    else if (jenis === 7) category = 'vendor_customer'

    let template = allVoucherTemplates.value.find(t => t.category === category && t.is_default)
    if (!template) template = allVoucherTemplates.value.find(t => t.category === category)
    if (!template) {
      category = 'umum'
      template = allVoucherTemplates.value.find(t => t.category === category && t.is_default)
      if (!template) template = allVoucherTemplates.value.find(t => t.category === category)
    }

    if (!template) {
      showAlert(`Template voucher kategori "${category}" tidak ditemukan!`, 'error')
      return
    }

    prepareVoucherPreviewData(template)
    currentVoucherTemplate.value = template
    selectedTemplateId.value = template.id
    activeVoucherTab.value = 'jurnal1'
    showVoucherModal.value = true
  } catch (err) {
    console.error('Error load template:', err)
    showAlert('Gagal memuat template voucher', 'error')
  } finally {
    isLoadingTemplate.value = false
  }
}

const buildVoucherRows = (detailsList, keyPrefix = '', keterangan = '') => {
  return (detailsList || []).map((detail, index) => {
    const akunKey = keyPrefix ? `${keyPrefix}${index}` : index
    const akun = selectedAkun.value[akunKey]
    let kodeAkun = ''
    if (akun) kodeAkun = akun.kode_akun || akun.kode || ''
    if (!kodeAkun && detail.akun_id) kodeAkun = detail.akun_id

    // Tentukan jumlah: gunakan debit jika tidak nol, jika tidak gunakan kredit
    const jumlah = parseFloat(detail.debit) > 0 ? parseFloat(detail.debit) : parseFloat(detail.kredit)

    return {
      no: index + 1,
      deskripsi: index === 0 ? keterangan : '', // Hanya baris pertama yang menampilkan keterangan
      reff: kodeAkun,
      jumlah: jumlah
    }
  })
}

const sumJumlah = (rows) => {
  let total = 0
  rows.forEach(row => {
    total += parseFloat(row.jumlah) || 0
  })
  return total
}

const getJenisJurnalLabel = (jenis) => {
  const options = jurnalUmumService.getJenisJurnalOptions()
  const selected = options.find(opt => opt.value == jenis)
  return selected ? selected.label : 'Voucher'
}

const prepareVoucherPreviewData = (template) => {
  const tanggalFormatted = formData.value.tanggal ? new Date(formData.value.tanggal).toLocaleDateString('id-ID') : ''
  const companyName = template.company_name || 'PT. Nama Perusahaan'
  const jenisJurnalLabel = getJenisJurnalLabel(selectedJenisJurnal.value)

  if (selectedJenisJurnal.value == 6) {
    const rowsJurnal1 = buildVoucherRows(formData.value.details, '', formData.value.keterangan)
    const total1 = sumJumlah(rowsJurnal1)
    voucherPreviewDataJurnal1.value = {
      no_voucher: formData.value.no_bukti,
      tanggal: tanggalFormatted,
      company_name: companyName,
      jenis_jurnal_label: jenisJurnalLabel,
      rows: rowsJurnal1,
      total: total1
    }

    const rowsJurnal2 = buildVoucherRows(formData.value.details_silang, 's_', formData.value.keterangan_silang)
    const total2 = sumJumlah(rowsJurnal2)
    voucherPreviewDataJurnal2.value = {
      no_voucher: formData.value.no_bukti_silang,
      tanggal: tanggalFormatted,
      company_name: companyName,
      jenis_jurnal_label: jenisJurnalLabel,
      rows: rowsJurnal2,
      total: total2
    }
  } else {
    const rows = buildVoucherRows(formData.value.details, '', formData.value.keterangan)
    const total = sumJumlah(rows)
    voucherPreviewDataJurnal1.value = {
      no_voucher: formData.value.no_bukti,
      tanggal: tanggalFormatted,
      company_name: companyName,
      jenis_jurnal_label: jenisJurnalLabel,
      rows,
      total
    }
  }
}

const handleDownloadPDF = async () => {
  await nextTick()
  setTimeout(async () => {
    try {
      const element = document.getElementById('voucher-print-area')
      if (!element) { showAlert('Area voucher tidak ditemukan!', 'error'); return }

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      let pdfWidth, pdfHeight
      const paperSize = currentVoucherTemplate.value.paper_size
      const isLandscape = currentVoucherTemplate.value.orientation === 'landscape'

      if (paperSize === 'Letter') { pdfWidth = isLandscape ? 279 : 216; pdfHeight = isLandscape ? 216 : 279 }
      else if (paperSize === 'Legal') { pdfWidth = isLandscape ? 356 : 216; pdfHeight = isLandscape ? 216 : 356 }
      else { pdfWidth = isLandscape ? 297 : 210; pdfHeight = isLandscape ? 210 : 297 }

      const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] })
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      pdf.addImage(imgData, 'PNG', (pdfWidth - scaledWidth) / 2, (pdfHeight - scaledHeight) / 2, scaledWidth, scaledHeight)
      pdf.save(`voucher-${activeVoucherPreviewData.value.no_voucher || 'nota'}.pdf`)
    } catch (err) {
      console.error('Error download PDF:', err)
      showAlert('Gagal mendownload PDF voucher!', 'error')
    }
  }, 300)
}

const resetForm = () => {
  formData.value = {
    tanggal: new Date().toISOString().split('T')[0],
    no_bukti: '',
    keterangan: '',
    details: [],
    no_bukti_silang: '',
    keterangan_silang: '',
    details_silang: []
  }
  selectedNoBukti.value = ''
  selectedNoBuktiTujuan.value = ''
  selectedJenisJurnal.value = ''
  selectedKategoriJenis.value = ''
  akunDefault.value = null
  searchQueries.value = {}
  showAkunCard.value = {}
  selectedAkun.value = {}
  resetVendorCustomerState() // NEW
  akunSistemConfig.value = null
  selectedAkunSistemPilihan.value = null
}

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    fetchNomorBuktiList()
    if (isEdit.value && props.editItem) {
      // ... (bagian isEdit tetap sama, tidak diubah)
    } else if (props.preselectedData) {
      resetForm()
      const jenis = String(props.preselectedData.jenis_jurnal)
      selectedJenisJurnal.value = jenis
      await nextTick()

      // Panggil langsung generate-nya, jangan andalkan watcher selectedJenisJurnal saja
      if (['3', '4'].includes(jenis)) {
        await fetchDaftarBankAktif()
      }
      if (jenis === '5' && formData.value.tanggal) {
        await generateNoBuktiJenis5()
      }
      if (['1', '2'].includes(jenis) && formData.value.tanggal) {
        await getPengaturanAkunSistem(jenis)
        if (akunSistemConfig.value) {
          applyAkunDefault()
          await generateNoBuktiJenis12(jenis)
        }
      }
    }
  } else if (props.preselectedData) {
    resetForm()
    const jenis = String(props.preselectedData.jenis_jurnal)
    selectedJenisJurnal.value = jenis
    await nextTick()
    if (['1', '2'].includes(jenis) && formData.value.tanggal) {
      await autoInitTanpaLawan(jenis)
    }
    if (['3', '4'].includes(jenis)) {
      await fetchDaftarBankAktif()
    }
  }

}, { immediate: true })

watch(() => props.namaAkunOptions, (newOptions) => {
  if (newOptions && newOptions.length > 0 && akunDefault.value && !formData.value.details[0]?.akun_id) {
    applyAkunDefault()
  }
}, { deep: true })

watch(() => formData.value.tanggal, async (newVal, oldVal) => {
  if (!isEdit.value && newVal && newVal !== oldVal) {
    selectedNoBukti.value = ''
    selectedNoBuktiTujuan.value = ''
    if (selectedJenisJurnal.value) {
      initializeDetailsForJenis(selectedJenisJurnal.value)
      if (['3', '4'].includes(String(selectedJenisJurnal.value))) {
        await fetchDaftarBankAktif()
      }
      if (['1', '2'].includes(String(selectedJenisJurnal.value)) && akunSistemConfig.value) {
        applyAkunDefault()
        await generateNoBuktiJenis12(selectedJenisJurnal.value)
      }
      if (String(selectedJenisJurnal.value) === '5') {
        await generateNoBuktiJenis5()
      }
    }
  }
})

const handleSubmit = async () => {
  if (['1', '2'].includes(String(selectedJenisJurnal.value)) && !akunSistemConfig.value) {
    showAlert('Pengaturan Akun Sistem belum diatur. Silakan atur akun terlebih dahulu!', 'error')
    return
  }
  if (selectedJenisJurnal.value == 6 && !akunSistemConfig.value) {
    showAlert('Pengaturan Akun Sistem (Ayat Silang) belum diatur. Silakan atur akun terlebih dahulu!', 'error')
    return
  }
  if (isBankJenis.value && !selectedBankId.value) {
    showAlert('Silakan pilih bank terlebih dahulu di detail jurnal!', 'error')
    return
  }

  // Validasi balance
  if (selectedJenisJurnal.value == 6) {
    if (Math.abs(balanceJurnal1.value) > 0.01 || Math.abs(balanceJurnal2.value) > 0.01) {
      showAlert('Total Debit dan Kredit di kedua jurnal harus seimbang (Balance)!', 'error')
      return
    }
  } else {
    if (Math.abs(balance.value) > 0.01) {
      showAlert('Total Debit dan Kredit harus seimbang (Balance)!', 'error')
      return
    }
  }

  if (!formData.value.no_bukti) {
    showAlert('Nomor bukti belum tergenerate. Silakan lengkapi data terlebih dahulu!', 'error')
    return
  }

  if (selectedJenisJurnal.value == 6 && !formData.value.no_bukti_silang) {
    showAlert('Nomor bukti jurnal 2 belum tergenerate. Silakan pilih akun jurnal 2 terlebih dahulu!', 'error')
    return
  }
  if (selectedJenisJurnal.value == 7 && !selectedKategoriJenis.value) {
    showAlert('Silakan pilih Kategori Transaksi!', 'error')
    return
  }
  // NEW: validasi vendor/customer wajib dipilih untuk jenis 7
  if (selectedJenisJurnal.value == 7 && !selectedVendorCustomerId.value) {
    showAlert(`Silakan pilih ${isKategoriVendor.value ? 'Vendor' : 'Customer'}!`, 'error')
    return
  }

  const emptyRows = []
  if (selectedJenisJurnal.value == 6) {
    formData.value.details.forEach((d, i) => { if (!d.akun_id) emptyRows.push(`Jurnal 1 baris ${i + 1}`) })
    formData.value.details_silang.forEach((d, i) => { if (!d.akun_id) emptyRows.push(`Jurnal 2 baris ${i + 1}`) })
  } else {
    formData.value.details.forEach((d, i) => { if (!d.akun_id) emptyRows.push(i + 1) })
  }

  if (emptyRows.length > 0) {
    showAlert(`Baris ${emptyRows.join(', ')} belum memiliki akun. Silakan pilih akun terlebih dahulu.`, 'error')
    return
  }

  isSubmitting.value = true
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData.id || 1

    let payload

    if (selectedJenisJurnal.value == 6) {
      payload = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        keterangan: formData.value.keterangan,
        dibuat_oleh: userId,
        jenis_jurnal: 6,
        details: formData.value.details.map(d => ({ akun_id: parseInt(d.akun_id), debit: Math.round(parseFloat(d.debit) || 0), kredit: Math.round(parseFloat(d.kredit) || 0) })),
        no_bukti_silang: formData.value.no_bukti_silang,
        keterangan_silang: formData.value.keterangan_silang,
        details_silang: formData.value.details_silang.map(d => ({ akun_id: parseInt(d.akun_id), debit: Math.round(parseFloat(d.debit) || 0), kredit: Math.round(parseFloat(d.kredit) || 0) }))
      }
    } else if (selectedJenisJurnal.value == 7) {
      // Payload jenis 7 dengan tambahan kategori_jenis + referensi vendor/customer
      payload = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        keterangan: formData.value.keterangan,
        dibuat_oleh: userId,
        jenis_jurnal: 7,
        kategori_jenis: parseInt(selectedKategoriJenis.value),
        // NEW: referensi vendor/customer yang dipilih (disimpan sebagai ID, bukan teks bebas)
        vendor_customer_id: parseInt(selectedVendorCustomerId.value),
        tipe_vendor_customer: isKategoriVendor.value ? 'vendor' : 'customer',
        details: formData.value.details.map(d => ({ akun_id: parseInt(d.akun_id), debit: Math.round(parseFloat(d.debit) || 0), kredit: Math.round(parseFloat(d.kredit) || 0) }))
      }
    } else {
      payload = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        keterangan: formData.value.keterangan,
        dibuat_oleh: userId,
        details: formData.value.details.map(d => ({ akun_id: parseInt(d.akun_id), debit: Math.round(parseFloat(d.debit) || 0), kredit: Math.round(parseFloat(d.kredit) || 0) }))
      }
    }

    console.log('Sending Jurnal Umum payload:', JSON.stringify(payload, null, 2))

    let res
    if (isEdit.value) {
      res = await api.request(`/editJurnalUmum/${props.editItem.id}`, { method: 'PUT', body: JSON.stringify(payload) }, 'ju')
    } else {
      res = await api.request('/createJurnalUmum', { method: 'POST', body: JSON.stringify(payload) }, 'ju')
    }

    if (res.success) {
      showAlert(res.message || (isEdit.value ? 'Jurnal Umum berhasil diperbarui' : 'Jurnal Umum berhasil disimpan'), 'success', () => {
        emit('save')
        emit('close')
      })
    } else {
      showAlert(res.message || 'Gagal menyimpan jurnal', 'error')
    }
  } catch (err) {
    console.error(err)
    let errorMsg = 'Terjadi kesalahan sistem'
    if (err.responseData?.message) errorMsg = err.responseData.message
    else if (err.message) errorMsg = err.message
    showAlert(errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Pengaturan Akun Sistem — hanya jenis 1, 2, 6
// GET  /getDefaultPengaturan/{no_jenis_jurnal}
const getPengaturanAkunSistem = async (jenis) => {
  if (!jenis || !['1', '2', '6'].includes(String(jenis))) return
  isLoadingAkunSistem.value = true
  try {
    const res = await api.request(`/getDefaultPengaturan/${jenis}`, { method: 'GET' }, 'ju')
    if (res.success && res.data && res.data.is_configured) {
      akunSistemConfig.value = res.data
      if (!['5', '6'].includes(String(jenis))) {
        akunDefault.value = {
          ...res.data,
          kode_akun: res.data.akun_kode,   // "10 10 100 90000"
          nama_akun: res.data.akun_nama,   // "Ayat Silang Kas Dan Bank"
        }
      }
    } else {
      akunSistemConfig.value = null
    }
  } catch (err) {
    console.error('Error getting pengaturan akun sistem:', err)
    akunSistemConfig.value = null
  } finally {
    isLoadingAkunSistem.value = false
  }
}

// POST /createPengaturanAkunSistem/{no_jenis_jurnal}  { akun_id }
const createPengaturanAkunSistem = async () => {
  if (!selectedAkunSistemPilihan.value) {
    showAlert('Silakan pilih akun terlebih dahulu!', 'error')
    return
  }
  if (!selectedJenisJurnal.value) return

  isLoadingAkunSistem.value = true
  try {
    const res = await api.request(`/createPengaturanAkunSistem/${selectedJenisJurnal.value}`, {
      method: 'POST',
      body: JSON.stringify({ akun_id: selectedAkunSistemPilihan.value.id })
    }, 'ju')

    if (res.success) {
      await getPengaturanAkunSistem(selectedJenisJurnal.value)
      showAkunSistemModal.value = false
      applyAkunDefault()
      showAlert('Pengaturan akun sistem berhasil disimpan!', 'success')
    } else {
      showAlert(res.message || 'Gagal menyimpan pengaturan akun sistem!', 'error')
    }
  } catch (err) {
    console.error('Error creating pengaturan akun sistem:', err)
    showAlert('Terjadi kesalahan saat menyimpan pengaturan akun sistem!', 'error')
  } finally {
    isLoadingAkunSistem.value = false
  }
}

const openAkunSistemModal = async () => {
  selectedAkunSistemPilihan.value = null
  await fetchAkunSistemOptions()
  showAkunSistemModal.value = true
}

const closeAkunSistemModal = () => {
  showAkunSistemModal.value = false
  if (selectedJenisJurnal.value == 6 && !akunSistemConfig.value) {
    // Jenis 6 (ayat silang) wajib memiliki pengaturan akun sistem agar bisa dipakai
    selectedJenisJurnal.value = ''
  }
  selectedAkunSistemPilihan.value = null
}

onMounted(() => {
  if (props.showModal) fetchNomorBuktiList()
})
</script>