// Jurnal Umum Service
import api from './api.js'

class JurnalUmumService {
  // Get all nomor bukti
  async getAllNoBukti() {
    try {
      return await api.request('/getAllNoBukti', {}, 'ju')
    } catch (error) {
      console.error('Error fetching all no bukti:', error)
      throw error
    }
  }

  // Get all nomor bukti for Jurnal Umum module (new API)
  async getAllNoBuktiJU() {
    try {
      return await api.request('/getAllNoBukti', {}, 'ju')
    } catch (error) {
      console.error('Error fetching all no bukti:', error)
      throw error
    }
  }

  // Get akun default based on jenis jurnal and no bukti
  async getAkunDefault(noJenisJurnal, noBukti) {
    try {
      const url = `/akunDefault?no_jenis_jurnal=${noJenisJurnal}&no_bukti=${encodeURIComponent(noBukti)}`
      return await api.request(url, {}, 'ju')
    } catch (error) {
      console.error('Error fetching akun default:', error)
      throw error
    }
  }

  // Jenis jurnal options
  getJenisJurnalOptions() {
    return [
      { value: 1, label: 'Kas Masuk', description: 'Debit: Kas, Kredit: Akun lain' },
      { value: 2, label: 'Kas Keluar', description: 'Debit: Akun lain, Kredit: Kas' },
      { value: 3, label: 'Bank Masuk', description: 'Debit: Bank, Kredit: Akun lain' },
      { value: 4, label: 'Bank Keluar', description: 'Debit: Akun lain, Kredit: Bank' },
      { value: 5, label: 'Adjustment/Pembalik', description: 'Debit: Akun lain, Kredit: Akun lain' },
      { value: 6, label: 'Ayat Silang', description: 'Transaksi Antar Bank Internal' }
    ]
  }
}

export default new JurnalUmumService()
