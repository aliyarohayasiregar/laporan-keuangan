const KS_API_BASE_URL = 'https://api.coopdevs.com/api/ks'
const PB_API_BASE_URL = 'https://api.coopdevs.com/api/pb'
const JU_API_BASE_URL = 'https://api.coopdevs.com/api/ju'
const JP_API_BASE_URL = 'https://api.coopdevs.com/api/jp'
const JPA_API_BASE_URL = 'https://api.coopdevs.com/api/jpa'
const NB_API_BASE_URL = 'https://api.coopdevs.com/api/nb'
const AUTH_API_BASE_URL = 'https://api.coopdevs.com/api/auth'
const APV_API_BASE_URL = 'https://api.coopdevs.com/api/apv'
const AP_API_BASE_URL = 'https://api.coopdevs.com/api/ap'
const JPB_API_BASE_URL = 'https://api.coopdevs.com/api/jpb'
const MODUL_API_BASE_URL = 'https://api.coopdevs.com/api/modul'
const ROLE_API_BASE_URL = 'https://api.coopdevs.com/api/role'
const BB_API_BASE_URL = 'https://api.coopdevs.com/api/bb'
const AKUN_API_BASE_URL = 'https://api.coopdevs.com/api/akun'
const VT_API_BASE_URL = 'https://api.coopdevs.com/api/vt'
const VB_API_BASE_URL = 'https://api.coopdevs.com/api/vb'

class KartuStokAPI {
  // Helper method to get base URL for a specific API type
  getApiBase(apiType = 'ks') {
    let baseUrl
    if (apiType === 'pb') {
      baseUrl = PB_API_BASE_URL
    } else if (apiType === 'ju') {
      baseUrl = JU_API_BASE_URL
    } else if (apiType === 'jp') {
      baseUrl = JP_API_BASE_URL
    } else if (apiType === 'jpa') {
      baseUrl = JPA_API_BASE_URL
    } else if (apiType === 'nb') {
      baseUrl = NB_API_BASE_URL
    } else if (apiType === 'auth') {
      baseUrl = AUTH_API_BASE_URL
    } else if (apiType === 'ap') {
      baseUrl = AP_API_BASE_URL
    } else if (apiType === 'apv') {
      baseUrl = APV_API_BASE_URL
    } else if (apiType === 'jpb') {
      baseUrl = JPB_API_BASE_URL
    } else if (apiType === 'modul') {
      baseUrl = MODUL_API_BASE_URL
    } else if (apiType === 'role') {
      baseUrl = ROLE_API_BASE_URL
    } else if (apiType === 'bb') {
      baseUrl = BB_API_BASE_URL
    } else if (apiType === 'akun') {
      baseUrl = AKUN_API_BASE_URL
    } else if (apiType === 'vt') {
      baseUrl = VT_API_BASE_URL
    } else if (apiType === 'vb') {
      baseUrl = VB_API_BASE_URL
    } else {
      baseUrl = KS_API_BASE_URL
    }
    return baseUrl
  }

  // Helper method to get auth token
  getToken() {
    return getAuthToken()
  }

  async request(endpoint, options = {}, apiType = 'ks') {
    const baseUrl = this.getApiBase(apiType)
    const url = `${baseUrl}${endpoint}`

    // Public endpoints that don't need security checks
    const publicEndpoints = ['/login', '/register', '/forgot-password']
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.includes(ep))

    // Rate limiting check (skip for public endpoints)
    if (!isPublicEndpoint) {
      const rateLimitKey = `${apiType}:${endpoint}`
      if (!apiRateLimiter.canMakeRequest(rateLimitKey)) {
        const remaining = apiRateLimiter.getRemainingRequests(rateLimitKey)
        const error = new Error(`Rate limit exceeded. Please wait before making more requests. Remaining: ${remaining}`)
        error.status = 429
        throw error
      }
    }

    // Get auth token using utility function
    const token = getAuthToken()
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Add authorization header if token exists (except for public endpoints)
    if (token && !isPublicEndpoint) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Add CSRF token for state-changing requests (skip for public endpoints)
    if (!isPublicEndpoint && options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
      headers['X-CSRF-Token'] = getCSRFToken()
    }

    // Sanitize request body (skip for public endpoints like login)
    let body = options.body
    if (!isPublicEndpoint && body && typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body)
        const sanitizedBody = sanitizeObject(parsedBody)
        body = JSON.stringify(sanitizedBody)
      } catch (e) {
        // If not JSON, sanitize as text
        body = sanitizeText(body)
      }
    }

    const config = {
      headers,
      body,
      ...options
    }

    try {
      const response = await fetch(url, config)

      // Check security headers (skip for public endpoints)
      if (!isPublicEndpoint) {
        const securityIssues = checkSecurityHeaders(response.headers)
        if (securityIssues.length > 0 && import.meta.env.DEV) {
          console.warn('Security headers missing:', securityIssues)
        }
      }

      // Handle 401 Unauthorized - distinguish between login errors and token expiry
      if (response.status === 401) {
        // If this is a login endpoint, let the error message pass through
        if (isPublicEndpoint) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.message || 'Authentication failed'
          const error = new Error(errorMessage)
          error.status = 401
          error.responseData = errorData
          throw error
        }
        
        // For other endpoints, treat as token expiry
        console.warn('Token expired or invalid, logging out...')
        const { logout } = await import('../utils/auth.js')
        logout()
        throw new Error('Session expired. Please login again.')
      }

      // Handle 429 Rate Limit
      if (response.status === 429) {
        const error = new Error('Too many requests. Please try again later.')
        error.status = 429
        throw error
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const sanitizedError = sanitizeError({
          status: response.status,
          message: errorData.message || 'Request failed',
          data: errorData
        })
        console.error('API Error Response:', sanitizedError)
        const error = new Error(sanitizedError.message)
        error.status = sanitizedError.status
        error.responseData = sanitizedError.data
        throw error
      }

      const data = await response.json()

      if (!data.success) {
        // Don't sanitize error messages for public endpoints to preserve user feedback
        const errorMessage = isPublicEndpoint ? (data.message || 'API request failed') : sanitizeText(data.message || 'API request failed')
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      const sanitizedError = sanitizeError(error)
      console.error('API Error:', sanitizedError)
      throw error
    }
  }

  // Create kartu stok
  async createKartuStok(kartuStokData) {
    return this.request('/createKartuStok', {
      method: 'POST',
      body: JSON.stringify(kartuStokData)
    })
  }

  // Get all kartu stok
  async getAllKartuStok() {
    return this.request('/getAllKartuStok')
  }

  // Get kartu stok by ID
  async getKartuStokById(id) {
    return this.request(`/getKartuStokByID/${id}`)
  }

  // Edit kartu stok
  async editKartuStok(id, kartuStokData) {
    return this.request(`/editKartuStok/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kartuStokData)
    })
  }

  // Delete kartu stok
  async deleteKartuStok(id) {
    return this.request(`/deleteKartuStok/${id}`, {
      method: 'DELETE'
    })
  }

  // Create detail kartu stok
  async createKartuStokDetail(detailData) {
    return this.request('/createKartuStokDetail', {
      method: 'POST',
      body: JSON.stringify(detailData)
    })
  }

  // Get all detail kartu stok
  async getAllKartuStokDetail(bulan, tahun, idKartuStok) {
    return this.request(`/getAllKartuStokDetail?bulan=${bulan}&tahun=${tahun}&id_kartu_stok=${idKartuStok}`)
  }

  // Get detail kartu stok by ID
  async getKartuStokDetailById(id) {
    return this.request(`/getKartuStokDetail/${id}`)
  }

  // Edit detail kartu stok
  async editKartuStokDetail(id, detailData) {
    return this.request(`/editKartuStokDetail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(detailData)
    })
  }

  // Delete detail kartu stok
  async deleteKartuStokDetail(id) {
    return this.request(`/deleteKartuStokDetail/${id}`, {
      method: 'DELETE'
    })
  }

  // Laporan Stok API Methods
  async getLaporanStokByPeriode(bulan, tahun) {
    return this.request(`/getLaporanStokByPeriode?bulan=${bulan}&tahun=${tahun}`)
  }

  // Kelompok Akun API Methods
  async getAllKelompokAkun() {
    return this.request('/getParentKelompokAkun', {}, 'pb')
  }

  async getParentKelompokAkun() {
    return this.request('/getParentKelompokAkun', {}, 'pb')
  }

  async createKelompokAkun(kelompokData) {
    return this.request('/createKelompokAkun', {
      method: 'POST',
      body: JSON.stringify(kelompokData)
    }, 'pb')
  }

  async editKelompokAkun(id, kelompokData) {
    return this.request(`/editKelompokAkun/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kelompokData)
    }, 'pb')
  }

  async deleteKelompokAkun(id) {
    return this.request(`/deleteKelompokAkun/${id}`, {
      method: 'DELETE'
    }, 'pb')
  }

  // Tipe Akun API Methods
  async getAllTipeAkun() {
    return this.request('/getAllTipeAkun', {}, 'pb')
  }

  // Nama Akun API Methods
  async getAllNamaAkun() {
    return this.request('/getAllNamaAkun', {}, 'pb')
  }

  async getAllKelompokAkunAkun() {
    return this.request('/getAllKelompokAkun', {}, 'akun')
  }

  // Jurnal Umum Module - New APIs
  async getAllNamaAkunJU() {
    return this.request('/getAllNamaAkun', {}, 'ju')
  }

  async getAllNoBuktiJU() {
    return this.request('/getAllNoBukti', {}, 'ju')
  }

  async getTreeNamaAkun() {
    return this.request('/getTreeNamaAkun', {}, 'pb')
  }

  async createNamaAkun(akunData) {
    return this.request('/createNamaAkun', {
      method: 'POST',
      body: JSON.stringify(akunData)
    }, 'pb')
  }

  async editNamaAkun(id, akunData) {
    return this.request(`/editNamaAkun/${id}`, {
      method: 'PUT',
      body: JSON.stringify(akunData)
    }, 'pb')
  }

  async deleteNamaAkun(id) {
    return this.request(`/deleteNamaAkun/${id}`, {
      method: 'DELETE'
    }, 'pb')
  }

  // Nomor Bukti API Methods
  async getAllNoBukti() {
    return this.request('/getAllNoBukti', {}, 'nb')
  }

  // Jurnal Umum API Methods
  async getAllJurnalUmum() {
    return this.request('/getAllJurnalUmum', {}, 'ju')
  }

  async getJurnalUmumById(id) {
    return this.request(`/getJurnalUmum/${id}`, {}, 'ju')
  }

  async createJurnalUmum(jurnalData) {
    return this.request('/createJurnalUmum', {
      method: 'POST',
      body: JSON.stringify(jurnalData)
    }, 'ju')
  }

  async editJurnalUmum(id, jurnalData) {
    return this.request(`/editJurnalUmum/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jurnalData)
    }, 'ju')
  }

  async deleteJurnalUmum(id) {
    return this.request(`/deleteJurnalUmum/${id}`, {
      method: 'DELETE'
    }, 'ju')
  }

  
  async getDataPosting(tahun, startBulan, endBulan, kode_akun = '') {
    let url = `/getDataPosting?start_bulan=${startBulan}&end_bulan=${endBulan}&tahun=${tahun}`
    if (kode_akun) {
      url += `&kode_akun=${kode_akun}`
    }
    return this.request(url, {}, 'ju')
  }

  async getDataPostingSetelahPenyesuaian(tahun) {
    return this.request(`/getDataPostingSetelahPenyesuaian?tahun=${tahun}`, {}, 'jp')
  }

  async postingJurnalUmum(postingData) {
    return this.request('/postingJurnalUmum', {
      method: 'POST',
      body: JSON.stringify(postingData)
    }, 'ju')
  }

  async getNeracaSaldo(tahun, startBulan, endBulan, kode_akun = '') {
    let url = `/getNeracaSaldo?start_bulan=${startBulan}&end_bulan=${endBulan}&tahun=${tahun}`
    if (kode_akun) {
      url += `&kode_akun=${kode_akun}`
    }
    return this.request(url, {}, 'ju')
  }

  async getNeracaSaldoSebelumPenyesuaian(tahun, bulan) {
    return this.request(`/getNeracaSaldoSebelumPenyesuaian?tahun=${tahun}&bulan=${bulan}`, {}, 'ju')
  }

  async getNeracaSaldoSetelahPenyesuaian(tahun) {
    return this.request(`/getNeracaSaldoSetelahPenyesuaian?tahun=${tahun}`, {}, 'jp')
  }

  async getNeracaLajur(tahun) {
    return this.request(`/getNeracaLajur?tahun=${tahun}`, {}, 'ap')
  }

  async getLaporanLabaRugi(tahun) {
    return this.request(`/getLaporanLabaRugi?tahun=${tahun}`, {}, 'ap')
  }

  async getLaporanEquitas(tahun) {
    return this.request(`/getLaporanEquitas?tahun=${tahun}`, {}, 'ap')
  }

  async getLaporanPosisiKeuangan(tahun) {
    return this.request(`/getLaporanPosisiKeuangan?tahun=${tahun}`, {}, 'ap')
  }

  async getDaftarPostingByTahun(tahun) {
    return this.request(`/getDaftarPostingByTahun?tahun=${tahun}`, {}, 'ap')
  }

  // Buku Besar Module - New APIs
  async getAllNamaAkunBB() {
    return this.request('/getAllNamaAkun', {}, 'bb')
  }

  async getDaftarPostingByTahunBB(tahun) {
    return this.request(`/getDaftarPostingByTahun?tahun=${tahun}`, {}, 'bb')
  }

  async getDataPostingBB(tahun, startBulan, endBulan, kode_akun = '') {
    let url = `/getDataPosting?start_bulan=${startBulan}&end_bulan=${endBulan}&tahun=${tahun}`
    if (kode_akun) {
      url += `&kode_akun=${kode_akun}`
    }
    return this.request(url, {}, 'bb')
  }

  async getAllJurnalPenyesuaian() {
    return this.request('/getAllJurnalPenyesuaian', {}, 'jp')
  }

  async getJurnalPenyesuaian(id) {
    return this.request(`/getJurnalPenyesuaian/${id}`, {}, 'jp')
  }

  async createJurnalPenyesuaian(penyesuaianData) {
    return this.request('/createJurnalPenyesuaian', {
      method: 'POST',
      body: JSON.stringify(penyesuaianData)
    }, 'jp')
  }

  async editJurnalPenyesuaian(id, penyesuaianData) {
    return this.request(`/editJurnalPenyesuaian/${id}`, {
      method: 'PUT',
      body: JSON.stringify(penyesuaianData)
    }, 'jp')
  }

  async deleteJurnalPenyesuaian(id) {
    return this.request(`/deleteJurnalPenyesuaian/${id}`, {
      method: 'DELETE'
    }, 'jp')
  }

  // Authentication API Methods
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, 'auth')
  }

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 'auth')
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST'
    }, 'auth')
  }

  async getProfile() {
    return this.request('/profile', {}, 'auth')
  }

  async updateProfile(userData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, 'auth')
  }

  async changePassword(passwordData) {
    return this.request('/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    }, 'auth')
  }

  async getDaftarApprovalRegistrasi() {
    return this.request('/daftarApprovalRegistrasi', {}, 'auth')
  }

  async prosesApprovalRegistrasi(approvalData) {
    return this.request('/prosesApprovalRegistrasi', {
      method: 'PUT',
      body: JSON.stringify(approvalData)
    }, 'auth')
  }

  // Role Management API Methods
  async getAllRoles() {
    return this.request('/getAllRole', {}, 'apv')
  }

  // Role Management Module - New APIs
  async getAllRolesRole() {
    return this.request('/getAllRole', {}, 'role')
  }

  async getAllModulsRole() {
    return this.request('/getAllModul', {}, 'role')
  }

  async getRoleById(id) {
    return this.request(`/getRole/${id}`, {}, 'apv')
  }

  async createRole(roleData) {
    return this.request('/createRole', {
      method: 'POST',
      body: JSON.stringify(roleData)
    }, 'apv')
  }

  async updateRole(id, roleData) {
    return this.request(`/editRole/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    }, 'apv')
  }

  async deleteRole(id) {
    return this.request(`/deleteRole/${id}`, {
      method: 'DELETE'
    }, 'apv')
  }

  // Approval Process API
  async getAllApprovalProcesses() {
    return this.request('/getAllApprovalProcess', {
      method: 'GET'
    }, 'apv')
  }

  async getApprovalProcess(id) {
    return this.request(`/getApprovalProcess/${id}`, {
      method: 'GET'
    }, 'apv')
  }

  async createApprovalProcess(processData) {
    return this.request('/createApprovalProcess', {
      method: 'POST',
      body: JSON.stringify(processData)
    }, 'apv')
  }

  async updateApprovalProcess(id, processData) {
    return this.request(`/editApprovalProcess/${id}`, {
      method: 'PUT',
      body: JSON.stringify(processData)
    }, 'apv')
  }

  async deleteApprovalProcess(id) {
    return this.request(`/deleteApprovalProcess/${id}`, {
      method: 'DELETE'
    }, 'apv')
  }

  // Approval Step API
  async getAllApprovalSteps() {
    return this.request('/getAllApprovalStep', {
      method: 'GET'
    }, 'apv')
  }

  async getApprovalStep(id) {
    return this.request(`/getApprovalStep/${id}`, {
      method: 'GET'
    }, 'apv')
  }

  async createApprovalStep(stepData) {
    return this.request('/createApprovalStep', {
      method: 'POST',
      body: JSON.stringify(stepData)
    }, 'apv')
  }

  async updateApprovalStep(id, stepData) {
    return this.request(`/editApprovalStep/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stepData)
    }, 'apv')
  }

  async deleteApprovalStep(id) {
    return this.request(`/deleteApprovalStep/${id}`, {
      method: 'DELETE'
    }, 'apv')
  }

  // User Management API Methods
  async getAllUsers() {
    return this.request('/users', {}, 'auth')
  }

  async getUserById(id) {
    return this.request(`/users/${id}`, {}, 'auth')
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, 'auth')
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    }, 'auth')
  }

  // Jurnal Penutup API Methods
  async getAllJurnalPenutup() {
    return this.request('/getAllJurnalPenutup', {}, 'jpa')
  }

  async getJurnalPenutupById(id) {
    return this.request(`/getJurnalPenutup/${id}`, {}, 'jpa')
  }

  async getNeracaSaldoSetelahPenutup(tahun) {
    return this.request(`/getNeracaSaldoSetelahPenutup?tahun=${tahun}`, {}, 'jpa')
  }

  async getDataPostingPenutup(tahun) {
    return this.request(`/getDataPostingPenutup?tahun=${tahun}`, {}, 'jpa')
  }

  // Jurnal Pembalik API endpoints
  async getAllJurnalPembalik() {
    return this.request('/getAllJurnalPembalik', {}, 'jpb')
  }

  async getJurnalPembalikById(id) {
    return this.request(`/getJurnalPembalik/${id}`, {}, 'jpb')
  }

  async createJurnalPembalik(jurnalData) {
    return this.request('/createJurnalPembalik', {
      method: 'POST',
      body: JSON.stringify(jurnalData)
    }, 'jpb')
  }

  async editJurnalPembalik(id, jurnalData) {
    return this.request(`/editJurnalPembalik/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jurnalData)
    }, 'jpb')
  }

  async deleteJurnalPembalik(id) {
    return this.request(`/deleteJurnalPembalik/${id}`, {
      method: 'DELETE'
    }, 'jpb')
  }

  // Posting Pembalik API Methods
  async getDataPostingPembalik(tahun) {
    return this.request(`/getDataPostingPembalik?tahun=${tahun}`, {}, 'jpb')
  }

  // Neraca Saldo Sebelum Pembalik API Methods
  async getNeracaSaldoSebelumPembalik(tahun) {
    return this.request(`/getNeracaSaldoSebelumPembalik?tahun=${tahun}`, {}, 'jpb')
  }

  async createJurnalPenutup(jurnalData) {
    return this.request('/createJurnalPenutup', {
      method: 'POST',
      body: JSON.stringify(jurnalData)
    }, 'jpa')
  }

  async editJurnalPenutup(id, jurnalData) {
    return this.request(`/editJurnalPenutup/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jurnalData)
    }, 'jpa')
  }

  async deleteJurnalPenutup(id) {
    return this.request(`/deleteJurnalPenutup/${id}`, {
      method: 'DELETE'
    }, 'jpa')
  }

  // Modul API Methods
  async getAllModuls() {
    return this.request('/getAllModul', {}, 'modul')
  }

  async createModul(modulData) {
    return this.request('/createModul', {
      method: 'POST',
      body: JSON.stringify(modulData)
    }, 'modul')
  }

  async updateModul(id, modulData) {
    return this.request(`/editModul/${id}`, {
      method: 'PUT',
      body: JSON.stringify(modulData)
    }, 'modul')
  }

  async deleteModul(id) {
    return this.request(`/deleteModul/${id}`, {
      method: 'DELETE'
    }, 'modul')
  }

  // Permission API Methods
  async getModulPermission(roleId) {
    return this.request(`/getModulPermission/${roleId}`, {}, 'modul')
  }

  async createModulPermission(permissionData) {
    return this.request('/createModulPermission', {
      method: 'POST',
      body: JSON.stringify(permissionData)
    }, 'modul')
  }

  async updatePermission(id, permissionData) {
    return this.request(`/editPermission/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData)
    }, 'apv')
  }

  async deletePermission(id) {
    return this.request(`/deletePermission/${id}`, {
      method: 'DELETE'
    }, 'apv')
  }

  // Voucher Template API Methods
  async getAllTemplateVoucher() {
    return this.request('/getAllTemplateVoucher', {}, 'vb')
  }

  // Vendor & Customer API Methods
  async createVendorCustomer(data) {
    return this.request('/createNamaVendorCustomer', {
      method: 'POST',
      body: JSON.stringify(data)
    }, 'ju')
  }

  async getAllVendor() {
    return this.request('/getDaftarVendor', {}, 'ju')
  }

  async getAllCustomer() {
    return this.request('/getDaftarCustomer', {}, 'ju')
  }

  async editVendorCustomer(id, jenis, data) {
    return this.request(`/editNamaVendorCustomer/${id}/${jenis}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, 'ju')
  }

  // Pengaturan Akun API Methods
  async getDefaultPengaturan(noJenisJurnal) {
    return this.request(`/getDefaultPengaturan/${noJenisJurnal}`, {}, 'ju')
  }

  async createPengaturanAkunSistem(noJenisJurnal, pengaturanData) {
    return this.request(`/createPengaturanAkunSistem/${noJenisJurnal}`, {
      method: 'POST',
      body: JSON.stringify(pengaturanData)
    }, 'ju')
  }

  async editPengaturanAkunSistem(id, pengaturanData) {
    return this.request(`/editPengaturanAkunSistem/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pengaturanData)
    }, 'ju')
  }

  async getAllPengaturanAkun() {
    return this.request('/getAllPengaturanAkun', {}, 'ju')
  }

}

import { ref } from 'vue'
import { getAuthToken } from '../utils/auth.js'
import { 
  sanitizeObject, 
  sanitizeText, 
  apiRateLimiter, 
  sanitizeError, 
  checkSecurityHeaders,
  getCSRFToken 
} from '../utils/security.js'

const apiInstance = new KartuStokAPI()
export default apiInstance
export { KartuStokAPI }