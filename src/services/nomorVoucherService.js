// Nomor Voucher Service
import api from './api.js'

class NomorVoucherService {
  // Get all nomor bukti
  async getAllNoBukti() {
    try {
      return await api.request('/getAllNoBukti', {}, 'nb')
    } catch (error) {
      console.error('Error fetching all no bukti:', error)
      throw error
    }
  }

  // Get nomor bukti by ID
  async getNoBukti(id) {
    try {
      return await api.request(`/getNoBukti/${id}`, {}, 'nb')
    } catch (error) {
      console.error('Error fetching no bukti by ID:', error)
      throw error
    }
  }

  // Create new nomor bukti
  async createNoBukti(data) {
    try {
      return await api.request('/createNoBukti', {
        method: 'POST',
        body: JSON.stringify(data)
      }, 'nb')
    } catch (error) {
      console.error('Error creating no bukti:', error)
      throw error
    }
  }

  // Update nomor bukti (if needed)
  async updateNoBukti(id, data) {
    try {
      return await api.request(`/updateNoBukti/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }, 'nb')
    } catch (error) {
      console.error('Error updating no bukti:', error)
      throw error
    }
  }

  // Delete nomor bukti (if needed)
  async deleteNoBukti(id) {
    try {
      return await api.request(`/deleteNoBukti/${id}`, {
        method: 'DELETE'
      }, 'nb')
    } catch (error) {
      console.error('Error deleting no bukti:', error)
      throw error
    }
  }
}

export default new NomorVoucherService()
