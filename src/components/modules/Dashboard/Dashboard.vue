<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Mobile Menu Button -->
    <button @click="sidebarOpen = !sidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg">
      <svg v-if="!sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Sidebar Fixed -->
    <aside :class="[
      'bg-white shadow-lg fixed left-0 top-0 h-screen overflow-y-auto flex flex-col z-40 transition-transform duration-300',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      'w-64'
    ]">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-900"> General Ledger</h1>
        <p class="text-gray-600 mt-1">Sistem Manajemen</p>
      </div>

      <!-- User Info Section -->
      <div class="px-4 pb-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white font-medium">
              {{ authData?.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ authData?.user?.name || 'User' }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ authData?.role?.name || 'Staff' }}
            </p>
          </div>
        </div>
      </div>

      <nav class="px-4 pb-6 flex-1">
        <div class="space-y-1">
          <router-link v-if="hasPermission('kartu stok')" to="/kartu-stok" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'kartu-stok'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            Kartu Stok
          </router-link>

          <router-link v-if="hasPermission('nomor voucher')" to="/nomor-voucher" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'nomor-voucher'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            Nomor Voucher
          </router-link>
          <router-link v-if="hasPermission('kelompok akun')" to="/kelompok-akun" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'kelompok-akun'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
            Kelompok Akun
          </router-link>

          <router-link v-if="hasPermission('nama akun')" to="/nama-akun" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'nama-akun'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-3 3h-5a3 3 0 00-3 3z"></path>
            </svg>
            Daftar Akun
          </router-link>








          <router-link v-if="hasPermission('jurnal umum')" to="/jurnal-umum" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            ['jurnal-umum', 'jurnal-penyesuaian', 'jurnal-pembalik'].includes(route.name)
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 0h6m2 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2v-4h-4v3a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 002-2h-4v4a2 2 0 00-2-2H4a2 2 0 00-2-2v-3a2 2 0 002-2z">
              </path>
            </svg>
            Jurnal
          </router-link>






          <!-- <button @click="currentPage = 'neraca-lajur'" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            currentPage === 'neraca-lajur'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
              </path>
            </svg>
            Lembar Kerja
          </button> -->


          <!-- Divider -->
          <div v-if="hasAnyReportPermission" class="border-t border-gray-200 my-4"></div>

          <!-- Laporan -->
          <div v-if="hasAnyReportPermission"
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Laporan
          </div>

          <!-- Laporan Menu with Sub-menu -->
          <div v-if="hasAnyReportPermission" class="space-y-1">
            <button @click="toggleLaporanMenu" :class="[
              'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
              laporanMenuOpen
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
                </path>
              </svg>
              <span class="flex-1">Laporan</span>
              <svg :class="['w-5 h-5 transition-transform duration-200', laporanMenuOpen ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>



            <!-- Sub-menu items -->
            <div v-show="laporanMenuOpen" class="ml-8 space-y-1">

              <router-link v-if="hasPermission('posting entry')" to="/posting-jurnal" :class="[
                'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-sm',
                route.name === 'posting-jurnal'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              ]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                  </path>
                </svg>
                Buku Besar
              </router-link>


              <router-link v-if="hasPermission('neraca saldo')" to="/neraca-saldo-tabs" :class="[
                'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-sm',
                route.name === 'neraca-saldo-tabs'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              ]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
                  </path>
                </svg>
                Neraca Saldo
              </router-link>
              <router-link v-if="hasPermission('laporan laba rugi')" to="/laporan-laba-rugi" :class="[
                'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-sm',
                route.name === 'laporan-laba-rugi'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              ]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
                  </path>
                </svg>
                Laporan Laba Rugi
              </router-link>

              <!-- Placeholder for future reports -->
              <router-link v-if="hasPermission('neraca')" to="/laporan-posisi-keuangan" :class="[
                'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-sm',
                route.name === 'laporan-posisi-keuangan'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              ]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
                  </path>
                </svg>
                Neraca
              </router-link>


              <router-link v-if="hasPermission('laporan ekuitas')" to="/laporan-ekuitas" :class="[
                'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-sm',
                route.name === 'laporan-ekuitas'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              ]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                  </path>
                </svg>
                Laporan Perubahan Ekuitas
              </router-link>

            </div>
          </div>

          <!-- Divider -->
          <div v-if="hasAnyUserManagementPermission" class="border-t border-gray-200 my-4"></div>

          <!-- Authentication & User Management -->
          <div v-if="hasAnyUserManagementPermission"
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Manajemen User
          </div>
          <router-link v-if="hasPermission('posting entry')" to="/posting-entry" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'posting-entry'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Posting Entry
          </router-link>

          <router-link v-if="hasTemplateVoucherPermission" to="/template-voucher" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'template-voucher'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z">
              </path>
            </svg>
            Template Voucher
          </router-link>

          <router-link v-if="hasPermission('manajemen vendor dan customer')" to="/vendor-customer" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'vendor-customer'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-3-3H5a3 3 0 00-3 3v2M12 7a4 4 0 100-8 4 4 0 000 8zM12 3a1 1 0 100-2 1 1 0 000 2zM12 9a2 2 0 100-4 2 2 0 000 4zM12 13a1 1 0 100 2 1 1 0 000-2z">
              </path>
            </svg>
            Vendor & Customer
          </router-link>

          <router-link v-if="hasPermission('user management')" to="/user-management" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'user-management'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
              </path>
            </svg>
            Manajemen User
          </router-link>

          <router-link v-if="hasPermission('role management')" to="/role-management" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'role-management'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
              </path>
            </svg>
            Manajemen Role
          </router-link>

          <router-link v-if="hasPermission('modul management')" to="/modul-management" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'modul-management'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
            Manajemen Modul
          </router-link>

          <router-link v-if="hasPermission('approval workflow')" to="/approval-workflow" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'approval-workflow'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            Workflow Approval
          </router-link>

          <router-link v-if="hasPermission('management registrasi')" to="/registrasi-approval" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            route.name === 'registrasi-approval'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Pendaftaran Anggota
          </router-link>

          <!-- <router-link to="/login" :class="[
            'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3',
            $route.name === 'login'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Login
          </router-link> -->
        </div>
      </nav>

      <!-- Logout Button -->
      <div class="px-4 pb-6 border-t border-gray-200">
        <button @click="handleLogout"
          class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-3 text-red-600 hover:bg-red-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile sidebar -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30">
    </div>

    <!-- Main Content -->
    <main class="flex-1 lg:ml-64 ml-0 h-screen overflow-auto">
      <div class="p-4 lg:p-6 pt-16 lg:pt-6">
        <!-- Kartu Stok Page -->
        <div v-if="route.name === 'kartu-stok'">
          <!-- Stats bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
            <div class="flex flex-wrap gap-3 w-full sm:w-auto">
              <button v-if="hasPermission('kartu stok', 'create')" @click="handleAddNew"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Tambah Barang
              </button>
              <button @click="router.push('/laporan-stok')"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17v1a3 3 0 006 0v-3a3 3 0 00-6 0v-1m6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1m-6 0v3a3 3 0 006 0v-1">
                  </path>
                </svg>
                Laporan Stok
              </button>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="flex flex-col sm:flex-row gap-4 pb-6">
            <div class="flex-1 w-full">
              <input v-model="searchQuery" type="text" placeholder="Cari barang..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <select v-model="selectedCategory"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="all">Semua Kategori</option>
              <option value="elektronik">Elektronik</option>
              <option value="furniture">Furniture</option>
              <option value="atk">ATK</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <select v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="nama">Urutkan Nama</option>
              <option value="stok">Urutkan Stok</option>
              <option value="nilai">Urutkan Nilai</option>
            </select>
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

          <!-- Empty State -->
          <div v-else-if="stokItems.length === 0" class="text-center py-12">
            <div class="text-gray-500 text-lg">Tidak ada data kartu stok</div>
            <div class="text-gray-400 text-sm mt-2">Silakan tambah data kartu stok terlebih dahulu</div>
          </div>

          <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <KartuStok v-for="item in filteredItems" :key="item.id" :item="item" @detail="handleDetail"
                @edit="handleEdit" @delete="handleDelete" :is-selected="detailItem && detailItem.id === item.id" />
            </div>

            <!-- Inline Detail Kartu Stok -->
            <DetailKartuStok v-if="showDetailModal && detailItem" :item="detailItem" @close="handleCloseDetail" />
          </div>
        </div>

        <!-- Nomor Voucher Page -->
        <div v-else-if="route.name === 'nomor-voucher'">
          <NomorVoucher />
        </div>

        <!-- Template Voucher Builder Page -->
        <div v-else-if="route.name === 'template-voucher'">
          <TemplateVoucherBuilder />
        </div>

        <!-- Vendor & Customer Page -->
        <div v-else-if="route.name === 'vendor-customer'">
          <VendorCustomer />
        </div>

        <!-- Kelompok Akun Page -->
        <div v-else-if="route.name === 'kelompok-akun'">
          <KelompokAkun />
        </div>

        <!-- Nama Akun Page -->
        <div v-else-if="route.name === 'nama-akun'">
          <NamaAkun />
        </div>

        <!-- Jurnal Umum Page -->
        <div v-else-if="route.name === 'jurnal-umum'">
          <JurnalUmum />
        </div>

        <!-- User Management Page -->
        <div v-else-if="route.name === 'user-management'">
          <UserManagement />
        </div>

        <!-- Role Management Page -->
        <div v-else-if="route.name === 'role-management'">
          <RoleManagement />
        </div>

        <!-- Approval Workflow Page -->
        <div v-else-if="route.name === 'approval-workflow'">
          <ApprovalWorkflow />
        </div>

        <!-- Modul Management Page -->
        <div v-else-if="route.name === 'modul-management'">
          <ModulManagement />
        </div>

        <!-- Registrasi Approval Page -->
        <div v-else-if="route.name === 'registrasi-approval'">
          <RegistrasiApproval />
        </div>

        <!-- Posting Jurnal Page -->
        <div v-else-if="route.name === 'posting-jurnal'">
          <PostingJurnal />
        </div>

        <!-- Posting Entry Page -->
        <div v-else-if="route.name === 'posting-entry'">
          <PostingEntry />
        </div>

        <!-- Neraca Saldo Tabs Page -->
        <div v-else-if="route.name === 'neraca-saldo-tabs'">
          <NeracaSaldoTabs />
        </div>

        <!-- Neraca Lajur Page -->
        <div v-else-if="route.name === 'neraca-lajur'">
          <NeracaLajur />
        </div>

        <!-- Jurnal Penyesuaian Page -->
        <div v-else-if="route.name === 'jurnal-penyesuaian'">
          <JurnalPenyesuaian />
        </div>

        <!-- Laporan Laba Rugi Page -->
        <div v-else-if="route.name === 'laporan-laba-rugi'">
          <LaporanLabaRugi />
        </div>

        <!-- Laporan Ekuitas Page -->
        <div v-else-if="route.name === 'laporan-ekuitas'">
          <LaporanEkuitas />
        </div>

        <!-- Laporan Posisi Keuangan Page -->
        <div v-else-if="route.name === 'laporan-posisi-keuangan'">
          <LaporanPosisiKeuangan />
        </div>

        <div v-else-if="route.name === 'laporan-arus-kas'" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z">
            </path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan Arus Kas</h3>
          <p class="text-gray-500">Fitur ini akan segera tersedia</p>
        </div>

        <div v-else-if="route.name === 'laporan-perubahan-modal'" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Laporan Perubahan Modal</h3>
          <p class="text-gray-500">Fitur ini akan segera tersedia</p>
        </div>
      </div>
    </main>

    <FormStok :show-modal="showFormModal" :edit-item="editingItem" @close="handleCloseForm" @save="handleSaveForm" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirm, showError } from '@/composables/useModal.js'
import { logout, getAuthData } from '../../../utils/auth.js'
import KartuStok from '../KartuStok/KartuStok.vue'
import FormStok from '../KartuStok/FormStok.vue'
import DetailKartuStok from '../KartuStok/DetailKartuStok.vue'
import NomorVoucher from '../NomorVoucher/NomorVoucher.vue'
import TemplateVoucherBuilder from '../TemplateVoucher/TemplateVoucherBuilder.vue'
import KelompokAkun from '../KelompokAkun/KelompokAkun.vue'
import NamaAkun from '../NamaAkun/NamaAkun.vue'
import JurnalUmum from '../jurnal/JurnalUmumList.vue'
import PostingJurnal from '../Posting/PostingJurnal.vue'
import PostingEntry from '../Posting/PostingEntry.vue'
import NeracaSaldoTabs from '../Neraca/NeracaSaldoTabs.vue'
import NeracaLajur from '../Neraca/NeracaLajur.vue'
import JurnalPenyesuaian from '../jurnal/JurnalPenyesuaianList.vue'
import LaporanLabaRugi from '../LabaRugi/LaporanLabaRugi.vue'
import LaporanEkuitas from '../Ekuitas/LaporanEkuitas.vue'
import LaporanPosisiKeuangan from '../PosisiKeuangan/LaporanPosisiKeuangan.vue'
import UserManagement from '../UserManajement/UserManagement.vue'
import RoleManagement from '../Role/RoleManagement.vue'
import ApprovalWorkflow from '../approval/ApprovalWorkflow.vue'
import ModulManagement from '../Modul/ModulManagement.vue'
import RegistrasiApproval from '../UserManajement/RegistrasiApproval.vue'
import VendorCustomer from '../VendorCustomer/VendorCustomer.vue'
import kartuStokAPI from '../../../services/api.js'

// Router and route instances
const router = useRouter()
const route = useRoute()

// Get auth data for user info
const authData = getAuthData()

// Logout function
const handleLogout = () => {
  logout()
  router.push('/login')
}

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('nama')
const showFormModal = ref(false)
const editingItem = ref(null)
const showDetailModal = ref(false)
const detailItem = ref(null)
const currentPage = computed(() => route.name || 'kartu-stok')
const laporanMenuOpen = ref(false)
const sidebarOpen = ref(false)

const stokItems = ref([])
const permissions = ref([])
const loading = ref(false)
const error = ref(null)

// Check if a module is visible based on permissions
const hasPermission = (modulName, action = 'view') => {
  if (!permissions.value || permissions.value.length === 0) return false

  return permissions.value.some(p => {
    if (!p.nama_modul || p.nama_modul.toLowerCase().trim() !== modulName.toLowerCase().trim()) {
      return false
    }

    let field = 'can_view'
    if (action === 'create') field = 'can_create'
    else if (action === 'edit') field = 'can_edit'
    else if (action === 'delete') field = 'can_delete'

    return p[field] === true || p[field] === 1 || p[field] === 'true'
  })
}

// Provide hasPermission to child components
provide('hasPermission', hasPermission)

// Check if any report module is visible
const hasAnyReportPermission = computed(() => {
  const reportModules = ['neraca saldo', 'laporan laba rugi', 'laporan ekuitas', 'neraca']
  return reportModules.some(m => hasPermission(m))
})

const hasTemplateVoucherPermission = computed(() =>
  hasPermission('template voucher')
)

// Check if any user management module is visible
const hasAnyUserManagementPermission = computed(() => {
  const userModules = ['user management', 'role management', 'modul management', 'approval workflow', 'management registrasi']
  return userModules.some(m => hasPermission(m))
})

const fetchPermissions = async () => {
  if (!authData?.role?.id) return
  try {
    const response = await kartuStokAPI.getModulPermission(authData.role.id)
    if (response && response.success) {
      permissions.value = response.data
      console.log('Permissions loaded:', permissions.value)
    }
  } catch (err) {
    console.error('Error fetching permissions:', err)
  }
}

const filteredItems = computed(() => {
  let filtered = stokItems.value

  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.nama_barang.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  filtered.sort((a, b) => {
    if (sortBy.value === 'nama') return a.nama_barang.localeCompare(b.nama_barang)
    if (sortBy.value === 'stok') return b.sisa_stok - a.sisa_stok
    if (sortBy.value === 'nilai') return b.nilai_persediaan_akhir - a.nilai_persediaan_akhir
    return 0
  })

  return filtered
})

const lowStockCount = computed(() => {
  return stokItems.value.filter(item => item.sisa_stok <= 50).length
})

const totalValue = computed(() => {
  return stokItems.value.reduce((total, item) => total + item.nilai_persediaan_akhir, 0)
})

const loadKartuStok = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await kartuStokAPI.getAllKartuStok()
    stokItems.value = response.data
  } catch (err) {
    error.value = 'Gagal memuat data kartu stok'
    console.error('Error loading kartu stok:', err)
  } finally {
    loading.value = false
  }
}

const handleEdit = (item) => {
  editingItem.value = item
  showFormModal.value = true
}

const handleDetail = (item) => {
  detailItem.value = item
  showDetailModal.value = true
}

const handleCloseDetail = () => {
  detailItem.value = null
  showDetailModal.value = false
}

const handleDelete = async (item) => {
  const ok = await showConfirm({
    type: 'danger',
    title: 'Hapus Barang',
    message: `Apakah Anda yakin ingin menghapus <strong>${item.nama_barang}</strong>? Data yang dihapus tidak dapat dikembalikan.`,
    confirmLabel: 'Ya, Hapus',
    cancelLabel: 'Batal',
  })
  if (!ok) return

  try {
    await kartuStokAPI.deleteKartuStok(item.id)
    await loadKartuStok()
  } catch (err) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal menghapus data'
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    await showError(errorMessage)
    console.error('Error deleting kartu stok:', err)
  }
}

const handleAddNew = () => {
  editingItem.value = null
  showFormModal.value = true
}


const handleSaveForm = async (formData) => {
  try {
    console.log('Saving kartu stok data:', formData)
    console.log('Is edit mode:', !!editingItem.value)

    if (editingItem.value) {
      await kartuStokAPI.editKartuStok(editingItem.value.id, formData)
    } else {
      await kartuStokAPI.createKartuStok(formData)
    }
    await loadKartuStok()
    handleCloseForm()
  } catch (err) {
    // Extract specific error message from API response
    let errorMessage = 'Gagal menyimpan data'
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    await showError(errorMessage)
    console.error('Error saving kartu stok:', err)
  }
}

const handleCloseForm = () => {
  showFormModal.value = false
  editingItem.value = null
}

const toggleLaporanMenu = () => {
  laporanMenuOpen.value = !laporanMenuOpen.value
}

// Watch for page changes to reset modals
watch(currentPage, () => {
  console.log('Page changed to:', currentPage.value)
  // Reset all modals when page changes
  showFormModal.value = false
  showDetailModal.value = false
  editingItem.value = null
  detailItem.value = null
})

// Handle navigation events from child components
const handleNavigationEvent = (event) => {
  console.log('Navigation event received:', event.type)
  if (event.type === 'navigateToJurnalUmum') {
    router.push('/jurnal-umum')
  } else if (event.type === 'navigateToJurnalPenyesuaian') {
    router.push('/jurnal-penyesuaian')
  }
}

onMounted(() => {
  loadKartuStok()
  fetchPermissions()

  // Add event listener for navigation events
  window.addEventListener('navigateToJurnalUmum', handleNavigationEvent)
  window.addEventListener('navigateToJurnalPenyesuaian', handleNavigationEvent)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('navigateToJurnalUmum', handleNavigationEvent)
  window.removeEventListener('navigateToJurnalPenyesuaian', handleNavigationEvent)
})
</script>