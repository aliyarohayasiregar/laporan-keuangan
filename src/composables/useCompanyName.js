import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const companyName = ref('PT') // Default jika API gagal
const loading = ref(false)
const error = ref(null)

export function useCompanyName() {
  const fetchCompanyName = async () => {
    try {
      loading.value = true
      error.value = null
      const result = await api.getAllTemplateVoucher()
      if (result.data && result.data.length > 0 && result.data[0].company_name) {
        companyName.value = result.data[0].company_name
      }
    } catch (err) {
      console.error('Error fetching company name:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCompanyName()
  })

  return {
    companyName,
    loading,
    error,
    fetchCompanyName
  }
}
