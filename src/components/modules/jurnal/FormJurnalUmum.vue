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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Nomor Voucher *</label>
              <select v-model="selectedNoBukti" @change="handleNoBuktiChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :disabled="isLoadingNomorBukti || isEdit || isGeneratingNoBukti || !formData.tanggal">
                <option value="">Pilih No. Voucher</option>
                <option v-for="voucher in filteredNomorBuktiList" :key="voucher.kode" :value="voucher.kode">
                  {{ voucher.kode }} {{ voucher.kelompok_jurnal ? `(Grup ${voucher.kelompok_jurnal})` : '' }}
                </option>
              </select>
              <p v-if="isLoadingNomorBukti || isGeneratingNoBukti || !formData.tanggal"
                class="text-xs text-blue-500 mt-1">
                {{ !formData.tanggal ? 'Pilih tanggal terlebih dahulu' : (isLoadingNomorBukti ? 'Memuat data voucher...'
                  : 'Generating nomor bukti...') }}
              </p>
            </div>

            <div v-if="selectedJenisJurnal != 6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Bukti</label>
              <input :value="formData.no_bukti" type="text" readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono font-bold text-blue-700"
                :placeholder="isGeneratingNoBukti ? 'Generating...' : ''" />
            </div>

            <!-- Pilih Nomor Voucher Tujuan (khusus jenis jurnal 6), sejajar dengan Pilih Nomor Voucher
                 di baris yang sama supaya lebih mudah dibaca/dibandingkan -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Nomor Voucher Tujuan *</label>
              <select v-model="selectedNoBuktiTujuan" @change="handleNoBuktiTujuanChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                :disabled="isLoadingNomorBukti || isEdit || isGeneratingNoBukti || !selectedNoBukti">
                <option value="">Pilih No. Voucher Tujuan</option>
                <option v-for="voucher in nomorBuktiList" :key="voucher.kode" :value="voucher.kode">
                  {{ voucher.kode }} {{ voucher.kelompok_jurnal ? `(Grup ${voucher.kelompok_jurnal})` : '' }}
                </option>
              </select>
              <p v-if="!selectedNoBukti" class="text-xs text-blue-500 mt-1">
                Pilih Nomor Voucher Jurnal 1 terlebih dahulu
              </p>
            </div>
          </div>

          <div v-if="selectedJenisJurnal != 6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan *</label>
            <div class="relative">
              <textarea v-model="formData.keterangan" rows="3" required maxlength="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Masukkan keterangan jurnal (maksimal 50 karakter)"></textarea>
              <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                {{ formData.keterangan?.length || 0 }}/50 karakter
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
                    <textarea v-model="formData.keterangan" rows="2" required maxlength="50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Masukkan keterangan jurnal 1"></textarea>
                    <div class="absolute bottom-1 right-2 text-xs text-gray-500">
                      {{ formData.keterangan?.length || 0 }}/50
                    </div>
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
            </div>
          </div>

          <!-- Jurnal Details Section -->
          <div v-if="selectedJenisJurnal != 6" class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-medium text-gray-900">Detail Jurnal</h4>
              <button type="button" @click="addDetail(false)"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200">
                Tambah Detail
              </button>
            </div>

            <!-- Details Table -->
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
                        <div v-if="index === 0 && showAkunDefaultRow">
                          <input :value="getAkunDefaultText()" type="text" readonly
                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div v-else class="relative inline-block w-full">
                          <div @click="() => toggleAkunCard(index)"
                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white">
                            <div v-if="selectedAkun[index]" class="flex items-center justify-between">
                              <span class="text-gray-900">{{ selectedAkun[index].kode_akun }} - {{
                                selectedAkun[index].nama_akun }}</span>
                              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                          <!-- Akun Selection Card -->
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
                                <div class="flex items-center justify-between">
                                  <div>
                                    <div class="text-sm font-medium text-gray-900">{{ akun.kode_akun }}</div>
                                    <div class="text-xs text-gray-600">{{ akun.nama_akun }}</div>
                                  </div>
                                </div>
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
                      <button type="button" @click="removeDetail(index)" :disabled="showAkunDefaultRow && index === 0"
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

          <!-- Detail Jurnal untuk Jenis 6 - 2 Tabel Terpisah -->
          <div v-else class="space-y-8 pt-4 border-t border-gray-200">
            <!-- Tabel Jurnal 1 -->
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-semibold text-blue-800">Detail Jurnal 1</h4>
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
                      <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Kredit
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-20">
                        Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-blue-100">
                    <tr v-for="(detail, index) in formData.details" :key="index">
                      <td class="px-4 py-2">
                        <div class="relative inline-block w-full">
                          <div v-if="index === 0 && showAkunDefaultRow">
                            <input
                              :value="akunDefault.debet ? `${akunDefault.debet.kode_akun} - ${akunDefault.debet.nama_akun}` : getAkunDefaultText()"
                              type="text" readonly
                              class="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed" />
                          </div>
                          <div v-else class="relative inline-block w-full">
                            <div @click="() => toggleAkunCard(index)"
                              class="w-full px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-blue-400 transition-colors bg-white">
                              <div v-if="selectedAkun[index]" class="flex items-center justify-between">
                                <span class="text-gray-900">{{ selectedAkun[index].kode_akun }} - {{
                                  selectedAkun[index].nama_akun }}</span>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                  viewBox="0 0 24 24">
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

                            <!-- Akun Selection Card -->
                            <div v-show="showAkunCard[index]"
                              class="absolute z-[999999] bg-white border border-gray-300 rounded-lg shadow-xl w-full"
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
                                  <div class="flex items-center justify-between">
                                    <div>
                                      <div class="text-sm font-medium text-gray-900">{{ akun.kode_akun }}</div>
                                      <div class="text-xs text-gray-600">{{ akun.nama_akun }}</div>
                                    </div>
                                  </div>
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
                        <button type="button" @click="removeDetail(index)" :disabled="showAkunDefaultRow && index === 0"
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
              <!-- Total Jurnal 1 -->
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

            <!-- Tabel Jurnal 2 (Silang) -->
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-semibold text-green-800">Detail Jurnal 2 (Silang)</h4>
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
                      <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">Debit
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">Kredit
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider w-20">
                        Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-green-100">
                    <tr v-for="(detail, index) in formData.details_silang" :key="index">
                      <td class="px-4 py-2">
                        <div class="relative inline-block w-full">
                          <div v-if="index === 1 && showAkunDefaultRow">
                            <input
                              :value="akunDefault.kredit ? `${akunDefault.kredit.kode_akun} - ${akunDefault.kredit.nama_akun}` : getAkunDefaultText()"
                              type="text" readonly
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

                            <!-- Akun Selection Card -->
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
                                  <div class="flex items-center justify-between">
                                    <div>
                                      <div class="text-sm font-medium text-gray-900">{{ akun.kode_akun }}</div>
                                      <div class="text-xs text-gray-600">{{ akun.nama_akun }}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <input :value="shouldDisableDebit(index, 's_') ? '0' : formatNumberInput(detail.debit)" @input="(e) => {
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
                        <button type="button" @click="removeDetail(index, true)"
                          :disabled="showAkunDefaultRow && index === 1"
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
              <!-- Total Jurnal 2 -->
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

      <!-- Tab switcher: hanya untuk jenis jurnal 6 (Ayat Silang), karena nomor voucher Jurnal 1
           dan Jurnal 2 berbeda dan harus dipreview/didownload sebagai voucher terpisah -->
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
          Jurnal 2 (Silang) {{ voucherPreviewDataJurnal2.no_voucher ? `(${voucherPreviewDataJurnal2.no_voucher})` : '' }}
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 bg-gray-50">
        <VoucherPreview :template="currentVoucherTemplate" :voucher-data="activeVoucherPreviewData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
const selectedNoBukti = ref('')
const selectedNoBuktiTujuan = ref('') // NEW: nomor voucher tujuan, khusus jenis jurnal 6 (Jurnal 2/Silang)
const selectedJenisJurnal = ref('')
const nomorBuktiList = ref([])
const isLoadingNomorBukti = ref(false)
const isGeneratingNoBukti = ref(false)
const akunDefault = ref(null)

// Voucher Preview & Cetak
const showVoucherModal = ref(false)
const isLoadingTemplate = ref(false)
const allVoucherTemplates = ref([])
const currentVoucherTemplate = ref(null)
const selectedTemplateId = ref(null)
const activeVoucherTab = ref('jurnal1') // 'jurnal1' | 'jurnal2' — tab aktif khusus jenis jurnal 6

const makeEmptyVoucherData = () => ({
  no_voucher: '',
  tanggal: '',
  company_name: 'PT. Nama Perusahaan',
  rows: [],
  total_debit: 0,
  total_kredit: 0
})

// Untuk jenis jurnal selain 6: dipakai sebagai satu-satunya data preview.
// Untuk jenis jurnal 6: voucherPreviewDataJurnal1 = data Jurnal 1, voucherPreviewDataJurnal2 = data Jurnal 2 (Silang),
// masing-masing dengan no_voucher dan rows sendiri (tidak digabung).
const voucherPreviewDataJurnal1 = ref(makeEmptyVoucherData())
const voucherPreviewDataJurnal2 = ref(makeEmptyVoucherData())

// Data yang sedang ditampilkan di VoucherPreview, mengikuti tab aktif (untuk jenis 6)
// atau langsung data Jurnal 1 (untuk jenis jurnal lain, yang hanya punya satu set data)
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
const dropdownRefs = ref({}) // Store DOM refs for dropdown triggers
const activeDropdown = ref({ key: null, rect: null }) // Track active dropdown key and position

// Computed untuk total masing-masing jurnal
const totalDebitJurnal1 = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKreditJurnal1 = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balanceJurnal1 = computed(() => totalDebitJurnal1.value - totalKreditJurnal1.value)

const totalDebitJurnal2 = computed(() => (formData.value.details_silang || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKreditJurnal2 = computed(() => (formData.value.details_silang || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balanceJurnal2 = computed(() => totalDebitJurnal2.value - totalKreditJurnal2.value)

// Total keseluruhan untuk jenis jurnal lain
const totalDebit = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0))
const totalKredit = computed(() => (formData.value.details || []).reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0))
const balance = computed(() => totalDebit.value - totalKredit.value)

// Filter nomor voucher based on account group
const activeAccountGroup = computed(() => {
  // Prioritas 1: Berdasarkan Jenis Jurnal yang dipilih saat buka modal (Kas Masuk, Kas Keluar, dll)
  if (selectedJenisJurnal.value) {
    return String(selectedJenisJurnal.value)
  }

  // Prioritas 2: Berdasarkan akun yang dipilih di tabel detail (digit pertama kode akun)
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

const showAkunDefaultRow = computed(() => akunDefault.value && selectedJenisJurnal.value != 5)

const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0,00'
  return Number(num || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',')
}
const formatNumberInput = (val) => val ? val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
const parseNumberInput = (val) => val ? parseFloat(val.toString().replace(/\./g, '')) || 0 : 0

const getAkunDefaultText = () => {
  if (!akunDefault.value) return ''
  // For jenis jurnal 6, use debet's info
  if (selectedJenisJurnal.value == 6 && akunDefault.value.debet) {
    return `${akunDefault.value.debet.kode_akun} - ${akunDefault.value.debet.nama_akun}`
  }
  return `${akunDefault.value.kode_akun || akunDefault.value.kode} - ${akunDefault.value.nama_akun}`
}

// Fungsi helper untuk menentukan apakah debit harus di-disable
// prefix = '' untuk jurnal 1, prefix = 's_' untuk jurnal 2
const shouldDisableDebit = (index, prefix = '') => {
  if (selectedJenisJurnal.value != 6) {
    const key = prefix === '' ? index : `${prefix}${index}`
    const selectedAccount = selectedAkun.value[key]

    // Untuk baris default (index 0), cek posisi akun dari API
    if (index === 0 && showAkunDefaultRow.value) {
      return akunDefault.value?.posisi_akun === 'kredit'
    }

    // Untuk baris lain, cek posisi akun dari selected account
    if (selectedAccount) {
      return selectedAccount.posisi_akun === 'kredit'
    }

    return false
  }
  // Untuk jenis jurnal 6:
  if (prefix === '') { // Jurnal 1
    return index === 1 // Baris 1 (manual) tidak boleh debit, hanya kredit
  } else { // Jurnal 2 (silang)
    return index === 1 // Baris 1 (ayat silang kredit) tidak boleh debit
  }
}

// Fungsi helper untuk menentukan apakah kredit harus di-disable
const shouldDisableKredit = (index, prefix = '') => {
  if (selectedJenisJurnal.value != 6) {
    const key = prefix === '' ? index : `${prefix}${index}`
    const selectedAccount = selectedAkun.value[key]

    // Untuk baris default (index 0), cek posisi akun dari API
    if (index === 0 && showAkunDefaultRow.value) {
      return akunDefault.value?.posisi_akun === 'debet'
    }

    // Untuk baris lain, cek posisi akun dari selected account
    if (selectedAccount) {
      return selectedAccount.posisi_akun === 'debet'
    }

    return false
  }
  // Untuk jenis jurnal 6:
  if (prefix === '') { // Jurnal 1
    return index === 0 // Baris 0 (ayat silang debit) tidak boleh kredit
  } else { // Jurnal 2 (silang)
    return index === 0 // Baris 0 (manual debit) tidak boleh kredit
  }
}

const filteredAkunOptions = (key) => {
  const query = (searchQueries.value[key] || '').toLowerCase()
  return props.namaAkunOptions.filter(a => (a.kode_akun || '').toLowerCase().includes(query) || (a.nama_akun || '').toLowerCase().includes(query))
}

const toggleAkunCard = (index, isSilang = false) => {
  const key = isSilang ? `s_${index}` : index
  Object.keys(showAkunCard.value).forEach(k => { if (k != key) showAkunCard.value[k] = false })
  showAkunCard.value[key] = !showAkunCard.value[key]
}

const closeAkunCard = (key) => { showAkunCard.value[key] = false }

const selectAkun = (index, akun, isSilang = false) => {
  // Ambil ID akun (bisa berupa id, id_akun, atau akun_id tergantung response API)
  const akunId = akun.id || akun.id_akun || akun.akun_id || akun.id_nama_akun
  const key = isSilang ? `s_${index}` : index
  if (isSilang) {
    formData.value.details_silang[index].akun_id = akunId
  } else {
    formData.value.details[index].akun_id = akunId
  }
  selectedAkun.value[key] = akun
  searchQueries.value[key] = `${akun.kode_akun || akun.kode || ''} - ${akun.nama_akun}`
  showAkunCard.value[key] = false
}

const addDetail = (isSilang = false) => {
  if (isSilang) {
    formData.value.details_silang.push({
      akun_id: '',
      debit: 0,
      kredit: 0
    })
  } else {
    formData.value.details.push({
      akun_id: '',
      debit: 0,
      kredit: 0
    })
  }
}

const removeDetail = (index, isSilang = false) => {
  if (isSilang) {
    formData.value.details_silang.splice(index, 1)
  } else {
    formData.value.details.splice(index, 1)
  }
  delete selectedAkun.value[index]
  delete searchQueries.value[index]
  delete showAkunCard.value[index]
}

// Watch active account group to clear voucher if no longer valid
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

// Watch selectedJenisJurnal untuk reset form
watch(selectedJenisJurnal, async (newJenis) => {
  if (!isEdit.value) {
    // Reset form
    formData.value.details = []
    formData.value.details_silang = []
    searchQueries.value = {}
    selectedAkun.value = {}
    showAkunCard.value = {}
    if (newJenis && selectedNoBukti.value) {
      await fetchAkunDefault(newJenis, selectedNoBukti.value)
    }
  }
})

const fetchNomorBuktiList = async () => {
  isLoadingNomorBukti.value = true
  try {
    const res = await jurnalUmumService.getAllNoBuktiJU()
    if (res.success) nomorBuktiList.value = res.data
  } finally {
    isLoadingNomorBukti.value = false
  }
}

const fetchAkunDefault = async (jenis, bukti) => {
  if (jenis == 5) {
    akunDefault.value = null
    if (formData.value.details.length === 0) addDetail(false)
    return
  }
  try {
    const res = await jurnalUmumService.getAkunDefault(jenis, bukti)
    if (res.success) {
      akunDefault.value = res.data
      applyAkunDefault()
    }
  } catch (err) { console.error(err) }
}

const applyAkunDefault = () => {
  if (!akunDefault.value || selectedJenisJurnal.value == 5) return
  formData.value.details = []
  formData.value.details_silang = []
  searchQueries.value = {}

  // Jika jenis jurnal 6 (Ayat Silang), kita butuh 2 jurnal terpisah
  if (selectedJenisJurnal.value == 6) {
    // Dapatkan akun debet dan kredit dari API (untuk jenis 6, response punya .debet dan .kredit)
    const debetAkunData = akunDefault.value.debet || akunDefault.value
    const kreditAkunData = akunDefault.value.kredit || akunDefault.value

    // Cari ID untuk akun debet
    let debetAkunId = debetAkunData.id || debetAkunData.id_akun || debetAkunData.akun_id || debetAkunData.id_nama_akun
    const debetCode = (debetAkunData.kode_akun || debetAkunData.kode || '').toString().trim()
    let debetAkunFull = null
    if (debetCode) {
      debetAkunFull = props.namaAkunOptions.find(a => {
        const optionCode = (a.kode_akun || a.kode || '').toString().trim()
        return optionCode === debetCode
      })
      if (debetAkunFull) {
        debetAkunId = debetAkunFull.id || debetAkunFull.id_akun || debetAkunFull.akun_id || debetAkunFull.id_nama_akun
      }
    }

    // Cari ID untuk akun kredit
    let kreditAkunId = kreditAkunData.id || kreditAkunData.id_akun || kreditAkunData.akun_id || kreditAkunData.id_nama_akun
    const kreditCode = (kreditAkunData.kode_akun || kreditAkunData.kode || '').toString().trim()
    let kreditAkunFull = null
    if (kreditCode) {
      kreditAkunFull = props.namaAkunOptions.find(a => {
        const optionCode = (a.kode_akun || a.kode || '').toString().trim()
        return optionCode === kreditCode
      })
      if (kreditAkunFull) {
        kreditAkunId = kreditAkunFull.id || kreditAkunFull.id_akun || kreditAkunFull.akun_id || kreditAkunFull.id_nama_akun
      }
    }

    // Jurnal 1 (details): Debit = Ayat Silang, Kredit = Manual
    formData.value.details.push({
      akun_id: debetAkunId,
      debit: 0,
      kredit: 0
    })
    formData.value.details.push({
      akun_id: '',
      debit: 0,
      kredit: 0
    })

    // Jurnal 2 (details_silang): Debit = Manual, Kredit = Ayat Silang
    formData.value.details_silang.push({
      akun_id: '',
      debit: 0,
      kredit: 0
    })
    formData.value.details_silang.push({
      akun_id: kreditAkunId,
      debit: 0,
      kredit: 0
    })

    // Set selectedAkun dan searchQueries (pakai full akun dari props, atau fallback ke data API!)
    if (debetAkunFull) {
      selectedAkun.value[0] = debetAkunFull
      searchQueries.value[0] = `${debetAkunFull.kode_akun} - ${debetAkunFull.nama_akun}`
    } else {
      // Fallback ke data dari API jika tidak ditemukan di props.namaAkunOptions
      selectedAkun.value[0] = {
        id: debetAkunId,
        kode_akun: debetCode,
        nama_akun: debetAkunData.nama_akun
      }
      searchQueries.value[0] = `${debetCode} - ${debetAkunData.nama_akun}`
    }

    if (kreditAkunFull) {
      selectedAkun.value['s_1'] = kreditAkunFull
      searchQueries.value['s_1'] = `${kreditAkunFull.kode_akun} - ${kreditAkunFull.nama_akun}`
    } else {
      // Fallback ke data dari API jika tidak ditemukan di props.namaAkunOptions
      selectedAkun.value['s_1'] = {
        id: kreditAkunId,
        kode_akun: kreditCode,
        nama_akun: kreditAkunData.nama_akun
      }
      searchQueries.value['s_1'] = `${kreditCode} - ${kreditAkunData.nama_akun}`
    }
    searchQueries.value[1] = ''
    searchQueries.value['s_0'] = ''
  } else {
    // Jenis jurnal selain 6
    let defaultAkunId = akunDefault.value.id || akunDefault.value.id_akun || akunDefault.value.akun_id || akunDefault.value.id_nama_akun
    const defaultCode = (akunDefault.value.kode_akun || akunDefault.value.kode || '').toString().trim()

    if (!defaultAkunId && defaultCode) {
      const found = props.namaAkunOptions.find(a => {
        const optionCode = (a.kode_akun || a.kode || '').toString().trim()
        return optionCode === defaultCode
      })

      if (found) {
        defaultAkunId = found.id || found.id_akun || found.akun_id || found.id_nama_akun
      }
    }

    formData.value.details.push({
      akun_id: defaultAkunId,
      debit: 0,
      kredit: 0
    })
    formData.value.details.push({ akun_id: '', debit: 0, kredit: 0 })

    searchQueries.value[0] = getAkunDefaultText()
    searchQueries.value[1] = ''

    selectedAkun.value[0] = {
      id: defaultAkunId,
      kode_akun: defaultCode,
      nama_akun: akunDefault.value.nama_akun,
      posisi_akun: akunDefault.value.posisi_akun
    }
  }
}

// Helper terpusat: panggil createNoBuktiGenerate. Untuk jenis jurnal 6, kirim juga
// no_bukti_tujuan bila keduanya (no voucher jurnal 1 & tujuan) sudah terisi, dan backend
// akan membalas no_bukti_full (utk Jurnal 1) + no_bukti_full_tujuan (utk Jurnal 2/Silang).
const generateNoBukti = async () => {
  if (!selectedNoBukti.value || !formData.value.tanggal) return

  // Untuk jenis jurnal 6, tunggu sampai voucher tujuan juga sudah dipilih
  if (selectedJenisJurnal.value == 6 && !selectedNoBuktiTujuan.value) {
    return
  }

  // Konversi tanggal formData.tanggal (YYYY-MM-DD) ke DDMMYYYY
  const dateParts = formData.value.tanggal.split('-')
  const tanggalFormat = `${dateParts[2]}${dateParts[1]}${dateParts[0]}`

  isGeneratingNoBukti.value = true
  try {
    const payload = {
      no_bukti: selectedNoBukti.value,
      tanggal: parseInt(tanggalFormat)
    }

    // Khusus jenis jurnal 6 (Ayat Silang): kirim juga no_jenis_jurnal dan no_bukti_tujuan,
    // karena Jurnal 1 dan Jurnal 2 (Silang) punya bank/akun & nomor bukti yang berbeda (in vs out).
    // Tanpa no_jenis_jurnal, backend tidak tahu ini request ayat silang dan tidak akan
    // membalas no_bukti_full_tujuan di response.
    if (selectedJenisJurnal.value == 6) {
      payload.no_jenis_jurnal = 6
      payload.no_bukti_tujuan = selectedNoBuktiTujuan.value
    }

    const res = await api.request('/createNoBuktiGenerate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 'nb')

    if (res.success) {
      formData.value.no_bukti = res.no_bukti_full
      // Untuk jenis jurnal 6, nomor bukti silang berasal dari no_bukti_full_tujuan (bukan
      // auto-sync dari no_bukti, karena keduanya independen / beda bank)
      if (selectedJenisJurnal.value == 6) {
        if (res.no_bukti_full_tujuan) {
          formData.value.no_bukti_silang = res.no_bukti_full_tujuan
        } else {
          console.warn('Response createNoBuktiGenerate tidak mengandung no_bukti_full_tujuan:', res)
          formData.value.no_bukti_silang = ''
        }
      }
      await fetchAkunDefault(selectedJenisJurnal.value, selectedNoBukti.value)
    } else {
      alert(res.message || 'Gagal generate nomor bukti!')
      selectedNoBukti.value = ''
      if (selectedJenisJurnal.value == 6) selectedNoBuktiTujuan.value = ''
    }
  } catch (err) {
    console.error('Error generate no bukti:', err)
    alert('Terjadi kesalahan saat generate nomor bukti!')
    selectedNoBukti.value = ''
    if (selectedJenisJurnal.value == 6) selectedNoBuktiTujuan.value = ''
  } finally {
    isGeneratingNoBukti.value = false
  }
}

const handleNoBuktiChange = async () => {
  if (!selectedNoBukti.value) {
    akunDefault.value = null
    formData.value.no_bukti = ''
    selectedJenisJurnal.value = ''
    selectedNoBuktiTujuan.value = ''
    formData.value.no_bukti_silang = ''
    return
  }

  // Dapatkan selected voucher to get kelompok_jurnal!
  const selectedVoucher = nomorBuktiList.value.find(v => v.kode === selectedNoBukti.value)
  if (selectedVoucher && selectedVoucher.kelompok_jurnal) {
    selectedJenisJurnal.value = String(selectedVoucher.kelompok_jurnal)
  }

  // Untuk jenis jurnal selain 6, generate langsung seperti biasa.
  // Untuk jenis jurnal 6, tunggu user juga memilih voucher tujuan dulu (lihat handleNoBuktiTujuanChange)
  if (selectedJenisJurnal.value != 6) {
    await generateNoBukti()
  }
}

const handleNoBuktiTujuanChange = async () => {
  if (!selectedNoBuktiTujuan.value) {
    formData.value.no_bukti_silang = ''
    return
  }
  // Begitu voucher tujuan dipilih, generate kedua nomor bukti sekaligus (Jurnal 1 & Jurnal 2/Silang)
  await generateNoBukti()
}

const openVoucherPreview = async () => {
  isLoadingTemplate.value = true
  try {
    if (allVoucherTemplates.value.length === 0) {
      // Load all templates from API
      const res = await voucherTemplateService.getAllTemplates()
      allVoucherTemplates.value = res.data
    }

    // 1. Map jenis jurnal ke category template
    let category = 'umum'
    const jenis = Number(selectedJenisJurnal.value)
    if (jenis === 1) category = 'kas_masuk'
    else if (jenis === 2) category = 'kas_keluar'
    else if (jenis === 3) category = 'bank_masuk'
    else if (jenis === 4) category = 'bank_keluar'
    else if (jenis === 5) category = 'adjustment'
    else if (jenis === 6) category = 'ayat_silang'

    console.log('✅ Menggunakan template kategori:', category.toUpperCase(), 'untuk jenis jurnal:', jenis)

    // 2. Cari template sesuai kategori (prioritas yang is_default = true)
    let template = allVoucherTemplates.value.find(t => t.category === category && t.is_default)

    if (!template) {
      template = allVoucherTemplates.value.find(t => t.category === category)
    }

    // Fallback ke kategori umum jika template spesifik tidak ditemukan
    if (!template) {
      console.log('⚠️ Template kategori', category, 'tidak ditemukan, fallback ke UMUM')
      category = 'umum'
      template = allVoucherTemplates.value.find(t => t.category === category && t.is_default)
      if (!template) {
        template = allVoucherTemplates.value.find(t => t.category === category)
      }
    }

    if (!template) {
      alert(`Template voucher dengan kategori "${category}" tidak ditemukan! Silakan buat template terlebih dahulu di halaman Template Voucher.`)
      return
    }

    // 3. Prepare preview data
    prepareVoucherPreviewData(template)
    currentVoucherTemplate.value = template
    selectedTemplateId.value = template.id
    activeVoucherTab.value = 'jurnal1'
    showVoucherModal.value = true

  } catch (err) {
    console.error('❌ Error load template:', err)
    alert('Gagal memuat template voucher')
  } finally {
    isLoadingTemplate.value = false
  }
}

// Helper: bangun rows untuk satu set details (Jurnal 1 atau Jurnal 2/Silang)
// detailsList = formData.details atau formData.details_silang
// keyPrefix = '' untuk Jurnal 1, 's_' untuk Jurnal 2 (Silang) — dipakai untuk lookup selectedAkun
const buildVoucherRows = (detailsList, keyPrefix = '') => {
  return (detailsList || []).map((detail, index) => {
    const akunKey = keyPrefix ? `${keyPrefix}${index}` : index
    const akun = selectedAkun.value[akunKey]
    let kodeAkun = ''
    if (akun) {
      kodeAkun = akun.kode_akun || akun.kode || ''
    }
    if (!kodeAkun && detail.akun_id) {
      kodeAkun = detail.akun_id
    }
    return {
      no: index + 1,
      deskripsi: akun ? `${akun.nama_akun}` : '',
      reff: kodeAkun,
      debit: detail.debit,
      kredit: detail.kredit
    }
  })
}

const sumDebitKredit = (rows) => {
  let totalDebit = 0
  let totalKredit = 0
  rows.forEach(row => {
    totalDebit += parseFloat(row.debit) || 0
    totalKredit += parseFloat(row.kredit) || 0
  })
  return { totalDebit, totalKredit }
}

const prepareVoucherPreviewData = (template) => {
  const tanggalFormatted = formData.value.tanggal ? new Date(formData.value.tanggal).toLocaleDateString('id-ID') : ''
  const companyName = template.company_name || 'PT. Nama Perusahaan'

  if (selectedJenisJurnal.value == 6) {
    // Jenis jurnal 6 (Ayat Silang): Jurnal 1 dan Jurnal 2 (Silang) punya nomor voucher dan
    // bank/akun yang berbeda, jadi disiapkan sebagai 2 voucher independen — tidak digabung.
    const rowsJurnal1 = buildVoucherRows(formData.value.details, '')
    const { totalDebit: totalDebitJ1, totalKredit: totalKreditJ1 } = sumDebitKredit(rowsJurnal1)
    voucherPreviewDataJurnal1.value = {
      no_voucher: formData.value.no_bukti,
      tanggal: tanggalFormatted,
      company_name: companyName,
      rows: rowsJurnal1,
      total_debit: totalDebitJ1,
      total_kredit: totalKreditJ1
    }

    const rowsJurnal2 = buildVoucherRows(formData.value.details_silang, 's_')
    const { totalDebit: totalDebitJ2, totalKredit: totalKreditJ2 } = sumDebitKredit(rowsJurnal2)
    voucherPreviewDataJurnal2.value = {
      no_voucher: formData.value.no_bukti_silang,
      tanggal: tanggalFormatted,
      company_name: companyName,
      rows: rowsJurnal2,
      total_debit: totalDebitJ2,
      total_kredit: totalKreditJ2
    }
  } else {
    // Jenis jurnal selain 6: hanya satu set data, disimpan di voucherPreviewDataJurnal1
    // (dipakai juga oleh activeVoucherPreviewData karena tab switcher tidak tampil untuk jenis ini)
    const rows = buildVoucherRows(formData.value.details, '')
    const { totalDebit, totalKredit } = sumDebitKredit(rows)
    voucherPreviewDataJurnal1.value = {
      no_voucher: formData.value.no_bukti,
      tanggal: tanggalFormatted,
      company_name: companyName,
      rows,
      total_debit: totalDebit,
      total_kredit: totalKredit
    }
  }
}

const handleDownloadPDF = async () => {
  // Tunggu DOM terupdate
  await nextTick()

  setTimeout(async () => {
    try {
      const element = document.getElementById('voucher-print-area')
      if (!element) {
        alert('Area voucher tidak ditemukan!')
        return
      }

      // Capture voucher menjadi gambar dengan kualitas tinggi
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')

      // Buat PDF sesuai ukuran template
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      let pdfWidth, pdfHeight
      const paperSize = currentVoucherTemplate.value.paper_size
      const isLandscape = currentVoucherTemplate.value.orientation === 'landscape'

      if (paperSize === 'Letter') {
        pdfWidth = isLandscape ? 279 : 216
        pdfHeight = isLandscape ? 216 : 279
      } else if (paperSize === 'Legal') {
        pdfWidth = isLandscape ? 356 : 216
        pdfHeight = isLandscape ? 216 : 356
      } else {
        // Default A4
        pdfWidth = isLandscape ? 297 : 210
        pdfHeight = isLandscape ? 210 : 297
      }

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      })

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      const x = (pdfWidth - scaledWidth) / 2
      const y = (pdfHeight - scaledHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
      pdf.save(`voucher-${activeVoucherPreviewData.value.no_voucher || 'nota'}.pdf`)
    } catch (err) {
      console.error('Error download PDF:', err)
      alert('Gagal mendownload PDF voucher!')
    }
  }, 300)
}

const onTemplateChange = () => {
  if (!selectedTemplateId.value) return
  const template = allVoucherTemplates.value.find(t => t.id === selectedTemplateId.value)
  if (template) {
    console.log('✅ Manual memilih template:', template.template_name, 'Kategori:', template.category)
    currentVoucherTemplate.value = template
    prepareVoucherPreviewData(template)
  }
}

const resetForm = () => {
  formData.value = {
    tanggal: new Date().toISOString().split('T')[0],
    no_bukti: '',
    keterangan: '',
    details: [],
    no_bukti_silang: '',
    keterangan_silang: ''
  }
  selectedNoBukti.value = ''
  selectedNoBuktiTujuan.value = ''
  selectedJenisJurnal.value = ''
  akunDefault.value = null
  searchQueries.value = {}
  showAkunCard.value = {}
  selectedAkun.value = {}
}

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    fetchNomorBuktiList()
    if (isEdit.value && props.editItem) {
      formData.value = {
        tanggal: props.editItem.tanggal,
        no_bukti: props.editItem.no_bukti,
        keterangan: props.editItem.keterangan,
        details: (props.editItem.details || []).map(d => ({ ...d })),
        no_bukti_silang: props.editItem.no_bukti_silang || '',
        keterangan_silang: props.editItem.keterangan_silang || '',
        details_silang: (props.editItem.details_silang || []).map(d => ({ ...d }))
      }
      selectedNoBukti.value = props.editItem.no_bukti
      selectedNoBuktiTujuan.value = props.editItem.no_bukti_silang || ''
      selectedJenisJurnal.value = props.editItem.no_jenis_jurnal || props.editItem.jenis_jurnal

      // Set selectedAkun dan searchQueries for both details and details_silang (if jenis 6)
      if (selectedJenisJurnal.value == 6) {
        // Jurnal 1 (details)
        formData.value.details.forEach((d, i) => {
          const akun = props.namaAkunOptions.find(a => a.kode_akun === d.akun_id || a.id === d.akun_id)
          if (akun) {
            selectedAkun.value[i] = akun
            searchQueries.value[i] = `${akun.kode_akun} - ${akun.nama_akun}`
          }
        })
        // Jurnal 2 (details_silang)
        formData.value.details_silang.forEach((d, i) => {
          const key = `s_${i}`
          const akun = props.namaAkunOptions.find(a => a.kode_akun === d.akun_id || a.id === d.akun_id)
          if (akun) {
            selectedAkun.value[key] = akun
            searchQueries.value[key] = `${akun.kode_akun} - ${akun.nama_akun}`
          }
        })
      } else {
        // Normal
        formData.value.details.forEach((d, i) => {
          const akun = props.namaAkunOptions.find(a => a.kode_akun === d.akun_id || a.id === d.akun_id)
          if (akun) {
            selectedAkun.value[i] = akun
            searchQueries.value[i] = `${akun.kode_akun} - ${akun.nama_akun}`
          }
        })
      }
    } else if (props.preselectedData) {
      resetForm()
      selectedJenisJurnal.value = props.preselectedData.jenis_jurnal
    }
  }
}, { immediate: true })

watch(() => props.namaAkunOptions, (newOptions) => {
  if (newOptions && newOptions.length > 0 && akunDefault.value && !formData.value.details[0]?.akun_id) {
    applyAkunDefault()
  }
}, { deep: true })

// Reset selectedNoBukti dan formData.no_bukti ketika tanggal berubah dan bukan mode edit
watch(() => formData.value.tanggal, (newVal, oldVal) => {
  if (!isEdit.value && newVal && newVal !== oldVal) {
    selectedNoBukti.value = ''
    selectedNoBuktiTujuan.value = ''
    formData.value.no_bukti = ''
    formData.value.no_bukti_silang = ''
    akunDefault.value = null
  }
})

const handleSubmit = async () => {
  // Validasi balance
  if (selectedJenisJurnal.value == 6) {
    if (Math.abs(balanceJurnal1.value) > 0.01 || Math.abs(balanceJurnal2.value) > 0.01) {
      alert('Total Debit dan Kredit di kedua jurnal harus seimbang (Balance)!')
      return
    }
  } else {
    if (Math.abs(balance.value) > 0.01) {
      alert('Total Debit dan Kredit harus seimbang (Balance)!')
      return
    }
  }

  if (!selectedNoBukti.value) {
    alert('Silakan pilih Nomor Voucher!')
    return
  }

  // Khusus jenis jurnal 6: voucher tujuan untuk Jurnal 2 (Silang) wajib dipilih
  if (selectedJenisJurnal.value == 6 && !selectedNoBuktiTujuan.value) {
    alert('Silakan pilih Nomor Voucher Tujuan untuk Jurnal 2 (Silang)!')
    return
  }

  // Validasi: Semua baris harus memiliki akun
  const emptyRows = []
  if (selectedJenisJurnal.value == 6) {
    formData.value.details.forEach((d, i) => {
      if (d.akun_id === '' || d.akun_id === null || d.akun_id === undefined) {
        emptyRows.push(`Jurnal 1 baris ${i + 1}`)
      }
    })
    formData.value.details_silang.forEach((d, i) => {
      if (d.akun_id === '' || d.akun_id === null || d.akun_id === undefined) {
        emptyRows.push(`Jurnal 2 baris ${i + 1}`)
      }
    })
  } else {
    formData.value.details.forEach((d, i) => {
      if (d.akun_id === '' || d.akun_id === null || d.akun_id === undefined) {
        emptyRows.push(i + 1)
      }
    })
  }

  if (emptyRows.length > 0) {
    alert(`${emptyRows.join(', ')} belum memiliki akun yang dipilih. Silakan pilih akun terlebih dahulu.`)
    return
  }

  isSubmitting.value = true
  try {
    // Ambil ID user dari localStorage jika ada, fallback ke 1
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData.id || 1

    let payload
    if (selectedJenisJurnal.value == 6) {
      // Format khusus untuk jenis jurnal 6
      payload = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        keterangan: formData.value.keterangan,
        dibuat_oleh: userId,
        jenis_jurnal: 6,
        details: formData.value.details.map(d => ({
          akun_id: parseInt(d.akun_id),
          debit: Math.round(parseFloat(d.debit) || 0),
          kredit: Math.round(parseFloat(d.kredit) || 0)
        })),
        no_bukti_silang: formData.value.no_bukti_silang,
        keterangan_silang: formData.value.keterangan_silang,
        details_silang: formData.value.details_silang.map(d => ({
          akun_id: parseInt(d.akun_id),
          debit: Math.round(parseFloat(d.debit) || 0),
          kredit: Math.round(parseFloat(d.kredit) || 0)
        }))
      }
    } else {
      // Format untuk jenis jurnal 1-5
      payload = {
        tanggal: formData.value.tanggal,
        no_bukti: formData.value.no_bukti,
        dibuat_oleh: userId,
        keterangan: formData.value.keterangan,
        details: formData.value.details.map(d => ({
          akun_id: parseInt(d.akun_id),
          debit: Math.round(parseFloat(d.debit) || 0),
          kredit: Math.round(parseFloat(d.kredit) || 0)
        }))
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
      alert(res.message || (isEdit.value ? 'Jurnal Umum berhasil diperbarui' : 'Jurnal Umum berhasil disimpan'))
      emit('save')
      emit('close')
    } else {
      alert(res.message || 'Gagal menyimpan jurnal')
    }
  } catch (err) {
    console.error(err)
    let errorMsg = 'Terjadi kesalahan sistem'
    if (err.responseData && err.responseData.message) {
      errorMsg = err.responseData.message
    } else if (err.message) {
      errorMsg = err.message
    }
    alert(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (props.showModal) fetchNomorBuktiList()
})
</script>