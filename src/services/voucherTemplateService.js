import api from './api.js'

// Constants
export const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4' },
  Letter: { width: 216, height: 279, label: 'Letter' },
  Legal: { width: 216, height: 356, label: 'Legal' }
}

export const ELEMENT_TYPES = [
  { type: 'logo', label: 'Logo', icon: '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' },
  { type: 'company_name', label: 'Nama Perusahaan', icon: '<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4v-5m10 5v-5" /></svg>' },
  { type: 'title', label: 'Judul Dokumen', icon: '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>' },
  { type: 'field', label: 'Field Dinamis', icon: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' },
  { type: 'table', label: 'Tabel Transaksi', icon: '<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>' },
  { type: 'signature', label: 'Tanda Tangan', icon: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>' },
  { type: 'text', label: 'Teks Bebas', icon: '<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>' },
  { type: 'line', label: 'Garis', icon: '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" /></svg>' }
]

// --- Converter Functions (FE <-> BE) ---
// Convert FE format to BE format for POST/PUT
const convertFEtoBE = (feTemplate) => {
  return {
    template_name: feTemplate.template_name,
    category: feTemplate.category,
    paper_size: feTemplate.paper_size,
    orientation: feTemplate.orientation,
    company_name: feTemplate.company_name,
    logo_url: feTemplate.logo_url || '',
    is_default: feTemplate.is_default,
    components: feTemplate.components.map(el => {
      // Convert properties object to array { key, value } for BE
      let beProperties = []

      for (const [key, value] of Object.entries(el.properties)) {
        if (key === 'columns') continue // Columns is special for table
        beProperties.push({ key, value: String(value) })
      }

      const componentData = {
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        properties: beProperties
      }

      // Handle table component: extract columns
      if (el.type === 'table' && el.properties.columns) {
        componentData.columns = el.properties.columns.map((col, idx) => ({
          key: col.key,
          label: col.label,
          width: col.width,
          sort_order: col.sort_order || idx + 1
        }))
      }

      return componentData
    })
  }
}

// Convert BE format to FE format for display
const convertBEtoFE = (beTemplate) => {
  return {
    id: beTemplate.id,
    template_name: beTemplate.template_name,
    category: beTemplate.category,
    paper_size: beTemplate.paper_size,
    orientation: beTemplate.orientation,
    company_name: beTemplate.company_name,
    logo_url: beTemplate.logo_url,
    is_default: beTemplate.is_default,
    components: beTemplate.components.map(el => {
      // Convert properties array back to object
      let feProperties = {}
      if (Array.isArray(el.properties)) {
        el.properties.forEach(p => {
          feProperties[p.key] = p.value
        })
      } else if (typeof el.properties === 'object') {
        feProperties = el.properties
      }

      // Handle table component: merge columns into properties for FE
      if (el.type === 'table' && el.columns) {
        feProperties.columns = el.columns
      }

      // For FE, make sure numeric values are numbers
      if (feProperties.fontSize) {
        feProperties.fontSize = Number(feProperties.fontSize)
      }
      if (feProperties.showTotals) {
        feProperties.showTotals = feProperties.showTotals === 'true'
      }

      return {
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        properties: feProperties
      }
    })
  }
}

// --- Default Data ---
export const createDefaultTemplate = () => ({
  template_name: 'Template Voucher Default',
  category: 'umum',
  paper_size: 'A4',
  orientation: 'landscape',
  company_name: 'PT NAMA PERUSAHAAN',
  logo_url: '',
  is_default: true,
  components: [
    { id: 'el_logo', type: 'logo', x: 5, y: 3, width: 12, height: 10, properties: {} },
    { id: 'el_company', type: 'company_name', x: 20, y: 4, width: 55, height: 6, properties: { fontSize: 16, fontWeight: 'bold', align: 'left' } },
    { id: 'el_title', type: 'title', x: 25, y: 14, width: 50, height: 6, properties: { text: 'VOUCHER', fontSize: 18, fontWeight: 'bold', align: 'center' } },
    { id: 'el_no', type: 'field', x: 5, y: 22, width: 45, height: 4, properties: { label: 'NO VOUCHER', fieldKey: 'no_voucher', fontSize: 12 } },
    { id: 'el_tgl', type: 'field', x: 5, y: 27, width: 45, height: 4, properties: { label: 'TGL', fieldKey: 'tanggal', fontSize: 12 } },
    {
      id: 'el_table', type: 'table', x: 5, y: 33, width: 90, height: 35, properties: {
        columns: [
          { key: 'no', label: 'NO', width: 8, sort_order: 1 },
          { key: 'deskripsi', label: 'DESKRIPSI', width: 35, sort_order: 2 },
          { key: 'reff', label: 'REFF', width: 25, sort_order: 3 },
          { key: 'debit', label: 'D', width: 16, sort_order: 4 },
          { key: 'kredit', label: 'K', width: 16, sort_order: 5 }
        ],
        showTotals: true
      }
    },
    { id: 'el_sign1', type: 'signature', x: 5, y: 75, width: 20, height: 18, properties: { label: 'Disiapkan Oleh' } },
    { id: 'el_sign2', type: 'signature', x: 27, y: 75, width: 20, height: 18, properties: { label: 'Diperiksa Oleh' } },
    { id: 'el_sign3', type: 'signature', x: 49, y: 75, width: 20, height: 18, properties: { label: 'Disetujui Oleh' } },
    { id: 'el_sign4', type: 'signature', x: 71, y: 75, width: 20, height: 18, properties: { label: 'Diterima Oleh' } }
  ]
})

export const getSampleVoucherData = () => ({
  no_voucher: 'JV-2026-0001',
  tanggal: '11/06/2026',
  company_name: 'PT NAMA PERUSAHAAN',
  rows: [
    { no: 1, deskripsi: 'Biaya Operasional', reff: '5-101', debit: 500000, kredit: 0 },
    { no: 2, deskripsi: 'Kas', reff: '1-101', debit: 0, kredit: 500000 }
  ],
  total_debit: 500000,
  total_kredit: 500000
})

// --- API Calls ---

export default {
  // Upload logo
  async uploadLogo(file) {
    const formData = new FormData()
    formData.append('logo', file)
    return { data: { logo_url: '' }, message: 'Upload logo belum didukung BE' }
  },

  // Create new template
  async createTemplate(templateData, logoFile = null) {
    const beTemplate = convertFEtoBE(templateData)

    // 1. Buat FormData
    const formData = new FormData()

    // 2. Tambahkan field teks
    formData.append('template_name', beTemplate.template_name)
    formData.append('category', beTemplate.category)
    formData.append('paper_size', beTemplate.paper_size)
    formData.append('orientation', beTemplate.orientation)
    formData.append('company_name', beTemplate.company_name)
    formData.append('is_default', String(beTemplate.is_default))

    // 3. Tambahkan components sebagai JSON string
    formData.append('components', JSON.stringify(beTemplate.components))

    // 4. Tambahkan logo jika ada file yang diupload
    if (logoFile) {
      formData.append('logo', logoFile)
    } else if (beTemplate.logo_url) {
      formData.append('logo_url', beTemplate.logo_url)
    }

    console.log('📤 POST FormData to BE:')
    for (const pair of formData.entries()) {
      if (pair[0] === 'components') {
        console.log(`      ${pair[0]}: (JSON string, length: ${pair[1].length})`)
      } else {
        console.log(`      ${pair[0]}: ${pair[1]}`)
      }
    }

    try {
      // Gunakan fetch langsung untuk FormData (karena api.request kita untuk JSON)
      const baseUrl = api.getApiBase('vb')
      const token = api.getToken()

      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${baseUrl}/createTemplateVoucher`, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ POST Response:', result)

      const data = result.data || result
      return {
        success: true,
        data: { id: data.id || Date.now() },
        message: result.message || 'Template berhasil disimpan'
      }

    } catch (err) {
      console.error('❌ API Error POST:', err)
      throw err
    }
  },

  // Update existing template
  async updateTemplate(id, templateData, logoFile = null) {
    const beTemplate = convertFEtoBE(templateData)
    console.log('PUT to BE:', beTemplate)

    // 1. Buat FormData
    const formData = new FormData()

    // 2. Tambahkan field teks
    formData.append('template_name', beTemplate.template_name)
    formData.append('category', beTemplate.category)
    formData.append('paper_size', beTemplate.paper_size)
    formData.append('orientation', beTemplate.orientation)
    formData.append('company_name', beTemplate.company_name)
    formData.append('is_default', String(beTemplate.is_default))

    // 3. Tambahkan components sebagai JSON string
    formData.append('components', JSON.stringify(beTemplate.components))

    // 4. Tambahkan logo jika ada file yang diupload
    if (logoFile) {
      formData.append('logo', logoFile)
    } else if (beTemplate.logo_url) {
      formData.append('logo_url', beTemplate.logo_url)
    }

    try {
      const baseUrl = api.getApiBase('vb')
      const token = api.getToken()

      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${baseUrl}/editTemplateVoucher/${id}`, {
        method: 'PUT',
        headers: headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ PUT Response:', result)

      return {
        success: true,
        message: result.message || 'Template berhasil diupdate'
      }
    } catch (err) {
      console.error('❌ API Error PUT:', err)
      throw err
    }
  },

  // Delete template
  async deleteTemplate(id) {
    console.log('DELETE to BE, ID:', id)
    await api.request(`/deleteTemplateVoucher/${id}`, {
      method: 'DELETE'
    }, 'vb')
    return {
      success: true,
      message: 'Template berhasil dihapus'
    }
  },

  // Get all templates
  async getAllTemplates() {
    const response = await api.request('/getAllTemplateVoucher', {}, 'vb')
    console.log('GET all templates response:', response)
    // Handle kemungkinan struktur data: response.data atau response.data.data
    let templateList = []
    if (Array.isArray(response.data)) {
      templateList = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      templateList = response.data.data
    }
    return {
      success: true,
      data: templateList.map(convertBEtoFE)
    }
  },

  // Get single template
  async getTemplate(id) {
    const all = await this.getAllTemplates()
    const found = all.data.find(t => t.id === id)
    if (found) return { success: true, data: found }
    throw new Error('Template not found')
  }
}
