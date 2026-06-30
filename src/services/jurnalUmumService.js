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
  // Untuk jenis jurnal 7: tambah kategoriJenis, bulan, tahun
  async getAkunDefault(noJenisJurnal, noBukti, kategoriJenis = null, bulan = null, tahun = null) {
    try {
      let url = `/akunDefault?no_jenis_jurnal=${noJenisJurnal}&no_bukti=${encodeURIComponent(noBukti)}`

      if (bulan) url += `&bulan=${bulan}`
      if (tahun) url += `&tahun=${tahun}`
      if (kategoriJenis) url += `&kategori_jenis=${kategoriJenis}`

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
      { value: 6, label: 'Ayat Silang', description: 'Transaksi Antar Bank Internal' },
      { value: 7, label: 'Transaksi Vendor & Customer', description: 'Beli/Jual/Bayar ke Vendor & Customer' }
    ]
  }

  // Kategori jenis options khusus jenis jurnal 7
  getKategoriJenisOptions() {
    return [
      { value: 1, label: 'Beli Barang ke Vendor' },
      { value: 2, label: 'Bayar ke Vendor' },
      { value: 3, label: 'Jual ke Customer' },
      { value: 4, label: 'Customer Bayar' }
    ]
  }
}

export default new JurnalUmumService()