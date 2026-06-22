/**
 * Utility function to extract specific error message from API response
 * @param {Error} err - The error object
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} - The error message to display to user
 */
export const getErrorMessage = (err, defaultMessage = 'Terjadi kesalahan') => {
  // Extract specific error message from API response
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message
  } else if (err.message) {
    return err.message
  } else if (typeof err === 'string') {
    return err
  }
  return defaultMessage
}

/**
 * Show error message to user (either via alert or setting error state)
 * @param {Error} err - The error object
 * @param {Function} setError - Function to set error state (optional)
 * @param {string} defaultMessage - Default message if no specific error found
 */
export const showError = (err, setError = null, defaultMessage = 'Terjadi kesalahan') => {
  const errorMessage = getErrorMessage(err, defaultMessage)
  
  if (setError && typeof setError === 'function') {
    setError(errorMessage)
  } else {
    alert(errorMessage)
  }
  
  console.error('Error occurred:', err)
}
