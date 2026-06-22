// Authentication utility functions

export const isAuthenticated = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return false
  
  try {
    const parsedAuth = JSON.parse(authData)
    return !!parsedAuth.token
  } catch (e) {
    console.warn('Invalid auth data in localStorage')
    return false
  }
}

export const getAuthData = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return null
  
  try {
    return JSON.parse(authData)
  } catch (e) {
    console.warn('Invalid auth data in localStorage')
    return null
  }
}

export const logout = () => {
  localStorage.removeItem('auth')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('email')
}

export const getAuthToken = () => {
  const authData = getAuthData()
  return authData?.token || null
}
