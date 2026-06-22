// Permission management utilities

// Store permissions in memory with cache
let permissionsCache = new Map()

// Module mapping for frontend routes (will be loaded dynamically from database)
let MODULE_MAPPING = {}

// Load module mapping from database
export const loadModuleMapping = async () => {
  try {
    const api = await import('../services/api.js')
    const response = await api.default.getAllModuls()

    if (response.success) {
      const mapping = {}
      response.data.forEach(modul => {
        // Handle different field name variations
        const moduleName = modul.nama_modul || modul.NamaModul || modul.nama_modul || ''

        if (moduleName) {
          // Convert database field nama_modul to route-friendly format
          const routeName = moduleName
            .toLowerCase()
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens

          // Handle different ID field variations
          const moduleId = modul.id || modul.ID || modul.fk_module
          if (moduleId) {
            mapping[routeName] = moduleId
          }
        }
      })

      MODULE_MAPPING = mapping
      return mapping
    }
  } catch (error) {
    console.error('Failed to load module mapping:', error)

    // Fallback to mock data when API is unavailable
    console.warn('Using mock module mapping due to API connection failure')
    const mockMapping = {
      'nyawit': 1,
      'ayam-goreng-mail': 2,
      'kelompok-tani': 3,
      'jurnal-penyesuaian': 4,
      'posting-jurnal': 5,
      'neraca-saldo': 6,
      'laporan-laba-rugi': 7,
      'laporan-ekuitas': 8
    }

    MODULE_MAPPING = mockMapping
    return mockMapping
  }
}

// Get module mapping (ensure it's loaded)
export const getModuleMapping = async () => {
  if (Object.keys(MODULE_MAPPING).length === 0) {
    await loadModuleMapping()
  }
  return MODULE_MAPPING
}

// Get user's role permissions
export const getUserPermissions = async (roleId) => {
  if (permissionsCache.has(roleId)) {
    return permissionsCache.get(roleId)
  }

  try {
    const api = await import('../services/api.js')
    const response = await api.default.getModulPermission(roleId)

    if (response.success) {
      const permissions = {}
      response.data.forEach(perm => {
        permissions[perm.fk_module] = {
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
          nama_modul: perm.nama_modul
        }
      })

      permissionsCache.set(roleId, permissions)
      return permissions
    }
  } catch (error) {
    console.error('Failed to fetch permissions:', error)

    // Fallback to mock permissions when API is unavailable
    console.warn('Using mock permissions due to API connection failure')
    const mockPermissions = {
      1: { // Nyawit
        can_view: false,
        can_create: false,
        can_edit: true,
        can_delete: false,
        nama_modul: 'Nyawit'
      },
      2: { // ayam goreng mail
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        nama_modul: 'ayam goreng mail'
      }
    }

    permissionsCache.set(roleId, mockPermissions)
    return mockPermissions
  }

  return {}
}

// Check if user has permission for specific action on module
export const hasPermission = async (roleId, moduleName, action) => {
  const permissions = permissionsCache.get(roleId)
  if (!permissions) return false

  // Get dynamic module mapping
  const moduleMapping = await getModuleMapping()
  const moduleId = moduleMapping[moduleName]
  if (!moduleId) return false

  const modulePermissions = permissions[moduleId]
  if (!modulePermissions) return false

  return modulePermissions[`can_${action}`] === true
}

// Check if user can view module
export const canViewModule = async (roleId, moduleName) => {
  return await hasPermission(roleId, moduleName, 'view')
}

// Check if user can create in module
export const canCreateInModule = async (roleId, moduleName) => {
  return await hasPermission(roleId, moduleName, 'create')
}

// Check if user can edit in module
export const canEditInModule = async (roleId, moduleName) => {
  return await hasPermission(roleId, moduleName, 'edit')
}

// Check if user can delete in module
export const canDeleteInModule = async (roleId, moduleName) => {
  return await hasPermission(roleId, moduleName, 'delete')
}

// Get all modules user can access
export const getAccessibleModules = async (roleId) => {
  const permissions = permissionsCache.get(roleId)
  if (!permissions) return []

  const moduleMapping = await getModuleMapping()
  return Object.entries(moduleMapping)
    .filter(([moduleName, moduleId]) => {
      const modulePermissions = permissions[moduleId]
      return modulePermissions && modulePermissions.can_view
    })
    .map(([moduleName]) => moduleName)
}

// Clear permissions cache (useful when role changes)
export const clearPermissionsCache = () => {
  permissionsCache.clear()
}

// Load permissions for current user
export const loadUserPermissions = async () => {
  const { getAuthData } = await import('./auth.js')
  const authData = getAuthData()

  if (authData?.role?.id) {
    return await getUserPermissions(authData.role.id)
  }

  return {}
}
