import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import voucherTemplateService, {
  createDefaultTemplate,
  getSampleVoucherData,
  ELEMENT_TYPES
} from '../services/voucherTemplateService.js'

export function useTemplateBuilder() {
  const router = useRouter()
  const hasPermission = inject('hasPermission', () => true)

  // State - initialize with default template immediately
  const template = ref(createDefaultTemplate())
  const selectedId = ref(null)
  const saving = ref(false)
  const saveMessage = ref('')
  const showPreview = ref(false)
  const previewData = ref(null)
  const canvasRef = ref(null)
  const dragging = ref(null)
  const dragType = ref(null)

  // Sample data
  const sampleData = getSampleVoucherData()

  // Computed
  const selectedElement = computed(() =>
    template.value.components.find(el => el.id === selectedId.value)
  )

  const hasTextProps = computed(() =>
    selectedElement.value && ['title', 'text', 'company_name', 'field'].includes(selectedElement.value.type)
  )

  const paperDimensions = computed(() => {
    const sizes = { A4: { width: 210, height: 297 }, Letter: { width: 216, height: 279 }, Legal: { width: 216, height: 356 } }
    const size = sizes[template.value.paper_size] || sizes.A4
    return template.value.orientation === 'landscape' ? { width: size.height, height: size.width } : size
  })

  const canvasStyle = computed(() => {
    const scale = 2.5
    return {
      width: `${paperDimensions.value.width * scale}px`,
      height: `${paperDimensions.value.height * scale}px`,
      minWidth: `${paperDimensions.value.width * scale}px`
    }
  })

  const displayRows = computed(() => previewData.value?.rows || [
    { no: 1, deskripsi: '...', reff: 'COA Lawan', debit: 'xxx', kredit: '' },
    { no: 2, deskripsi: '...', reff: 'COA Lawan', debit: '', kredit: 'xxx' }
  ])

  const displayTotals = computed(() => ({
    debit: previewData.value?.total_debit || 'xxx',
    kredit: previewData.value?.total_kredit || 'xxx'
  }))

  // Methods
  const elementStyle = (el) => ({
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.width}%`,
    height: `${el.height}%`
  })

  const textStyle = (props = {}) => ({
    fontSize: `${props.fontSize || 12}px`,
    fontWeight: props.fontWeight || 'normal',
    textAlign: props.align || 'left'
  })

  const generateElementId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  const createElement = (type) => {
    const defaults = {
      logo: { x: 5, y: 5, width: 12, height: 10, properties: {} },
      company_name: { x: 20, y: 5, width: 50, height: 6, properties: { fontSize: 14, fontWeight: 'bold' } },
      title: { x: 25, y: 15, width: 50, height: 6, properties: { text: 'VOUCHER', fontSize: 16, fontWeight: 'bold', align: 'center' } },
      field: { x: 5, y: 25, width: 40, height: 4, properties: { label: 'NO VOUCHER', fieldKey: 'no_voucher', fontSize: 12 } },
      table: {
        x: 5, y: 35, width: 90, height: 30,
        properties: {
          columns: [
            { key: 'no', label: 'NO', width: 8 },
            { key: 'deskripsi', label: 'DESKRIPSI', width: 35 },
            { key: 'reff', label: 'REFF', width: 25 },
            { key: 'debit', label: 'D', width: 16 },
            { key: 'kredit', label: 'K', width: 16 }
          ],
          showTotals: true
        }
      },
      signature: { x: 5, y: 70, width: 20, height: 18, properties: { label: 'Dibuat Oleh' } },
      text: { x: 5, y: 50, width: 50, height: 4, properties: { text: 'Catatan...', fontSize: 12 } },
      line: { x: 5, y: 55, width: 90, height: 0.3, properties: {} }
    }
    return {
      id: generateElementId(),
      type,
      ...defaults[type]
    }
  }

  const deleteSelected = () => {
    if (confirm('Hapus elemen yang dipilih?')) {
      template.value.components = template.value.components.filter(el => el.id !== selectedId.value)
      selectedId.value = null
    }
  }

  const resetToDefault = () => {
    if (!confirm('Reset template ke layout default?')) return
    const saved = { ...template.value }
    template.value = { ...createDefaultTemplate(), id: saved.id, template_name: saved.template_name }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const response = await voucherTemplateService.uploadLogo(file)
      template.value.logo_url = response.data?.logo_url || response.data
      saveMessage.value = response.message || 'Logo berhasil diupload'
      setTimeout(() => { saveMessage.value = '' }, 3000)
    } catch (err) {
      alert('Gagal upload logo: ' + err.message)
    }
    event.target.value = ''
  }

  const handleSave = async () => {
    saving.value = true
    saveMessage.value = ''
    try {
      const payload = { ...template.value }
      let response
      if (payload.id) {
        response = await voucherTemplateService.updateTemplate(payload.id, payload)
      } else {
        response = await voucherTemplateService.createTemplate(payload)
        template.value.id = response.data.id
      }
      saveMessage.value = response.message || 'Template berhasil disimpan'
      setTimeout(() => { saveMessage.value = '' }, 3000)
    } catch (err) {
      saveMessage.value = 'Gagal menyimpan template'
      alert(err.message)
    } finally {
      saving.value = false
    }
  }

  const loadTemplate = async () => {
    const id = window.location.hash.split('/').pop()
    if (!id || id === 'template-voucher') return

    try {
      const response = await voucherTemplateService.getTemplate(id)
      if (response.success && response.data) {
        template.value = response.data
      }
    } catch {
      // keep default template
    }
  }

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString('id-ID')
  }

  // Drag & Drop Logic - fixed to be more reliable
  const onDragStart = (e, type) => {
    e.preventDefault()
    dragType.value = type
  }

  const onCanvasDrop = (e) => {
    if (!dragType.value) return
    if (!canvasRef.value) {
      console.warn('Canvas ref not available')
      return
    }

    const rect = canvasRef.value.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newEl = createElement(dragType.value)
    newEl.x = Math.max(0, Math.min(95, x - newEl.width / 2))
    newEl.y = Math.max(0, Math.min(95, y - newEl.height / 2))

    template.value.components.push(newEl)
    dragType.value = null
  }

  const onElementMouseDown = (e, id) => {
    if (e.button !== 0) return
    e.stopPropagation()
    selectedId.value = id
    const el = template.value.components.find(c => c.id === id)
    if (!el) return
    dragging.value = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      elX: el.x,
      elY: el.y
    }
  }

  const onMouseMove = (e) => {
    if (!dragging.value || !canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    const dx = (e.clientX - dragging.value.startX) / rect.width * 100
    const dy = (e.clientY - dragging.value.startY) / rect.height * 100
    const el = template.value.components.find(c => c.id === dragging.value.id)
    if (el) {
      el.x = Math.max(0, Math.min(100 - el.width, dragging.value.elX + dx))
      el.y = Math.max(0, Math.min(100 - el.height, dragging.value.elY + dy))
    }
  }

  const onMouseUp = () => {
    dragging.value = null
  }

  // Permission Check
  const checkPermissions = () => {
    if (!hasPermission('template voucher')) {
      alert('Anda tidak memiliki izin untuk mengakses halaman ini.')
      router.push('/dashboard')
      return false
    }
    return true
  }

  // Lifecycle
  onMounted(() => {
    if (!checkPermissions()) return
    loadTemplate()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return {
    // State
    template,
    selectedId,
    saving,
    saveMessage,
    showPreview,
    previewData,
    canvasRef,
    sampleData,
    dragType,

    // Computed
    selectedElement,
    hasTextProps,
    paperDimensions,
    canvasStyle,
    displayRows,
    displayTotals,

    // Methods
    elementStyle,
    textStyle,
    createElement,
    deleteSelected,
    resetToDefault,
    handleLogoUpload,
    handleSave,
    loadTemplate,
    formatNumber,
    onDragStart,
    onCanvasDrop,
    onElementMouseDown,
    ELEMENT_TYPES
  }
}
