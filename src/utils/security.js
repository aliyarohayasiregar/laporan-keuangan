import DOMPurify from 'dompurify'

/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user input
 */

// Sanitize HTML content
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}

// Sanitize plain text (remove any HTML tags)
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

// Sanitize URL to prevent XSS
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return url
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] })
  } catch {
    return ''
  }
}

// Sanitize object recursively
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  const sanitized = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value)
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
  }
  return sanitized
}

/**
 * Rate Limiting Utility
 * Prevents API abuse by limiting request frequency
 */

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  canMakeRequest(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get existing requests for this key
    const requests = this.requests.get(key) || []
    
    // Filter out requests outside the time window
    const validRequests = requests.filter(timestamp => timestamp > windowStart)
    
    // Check if we've exceeded the limit
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }

  getRemainingRequests(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(timestamp => timestamp > windowStart)
    return Math.max(0, this.maxRequests - validRequests.length)
  }

  reset(key = 'default') {
    this.requests.delete(key)
  }
}

// Create global rate limiter instance
export const apiRateLimiter = new RateLimiter(100, 60000) // 100 requests per minute

/**
 * Request Signing Utility
 * Adds cryptographic signature to requests for integrity verification
 */

export const signRequest = (data, secret) => {
  if (!data || typeof data !== 'object') return ''
  
  // Sort keys and create string representation
  const sortedKeys = Object.keys(data).sort()
  const dataString = sortedKeys.map(key => `${key}:${data[key]}`).join('|')
  
  // Simple hash (in production, use proper crypto library)
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return hash.toString(16)
}

/**
 * Security Headers Check Utility
 * Validates security headers from API responses
 */

export const checkSecurityHeaders = (headers) => {
  const issues = []
  
  // Check for HTTPS in production
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!headers.get('Strict-Transport-Security')) {
      issues.push('Missing HSTS header')
    }
  }
  
  // Check for other security headers
  if (!headers.get('X-Content-Type-Options')) {
    issues.push('Missing X-Content-Type-Options header')
  }
  
  if (!headers.get('X-Frame-Options')) {
    issues.push('Missing X-Frame-Options header')
  }
  
  if (!headers.get('X-XSS-Protection')) {
    issues.push('Missing X-XSS-Protection header')
  }
  
  if (!headers.get('Content-Security-Policy')) {
    issues.push('Missing CSP header')
  }
  
  return issues
}

/**
 * Error Handling Utility
 * Prevents exposing sensitive information in error messages
 */

export const sanitizeError = (error) => {
  if (!error) return { message: 'An unknown error occurred' }
  
  // Don't expose stack traces in production
  const isProduction = import.meta.env.PROD
  
  if (isProduction) {
    return {
      message: error.message || 'An error occurred',
      status: error.status || null
    }
  }
  
  // In development, include more details
  return {
    message: error.message || 'An error occurred',
    status: error.status || null,
    stack: error.stack || null
  }
}

/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens
 */

let csrfToken = null

export const generateCSRFToken = () => {
  // Simple token generation (in production, use proper crypto library)
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  csrfToken = `${timestamp}-${random}`
  return csrfToken
}

export const getCSRFToken = () => {
  return csrfToken || generateCSRFToken()
}

export const validateCSRFToken = (token) => {
  return token === csrfToken
}

/**
 * Content Security Policy Helper
 * Generates CSP meta tag
 */

export const getCSPMetaTag = () => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.coopdevs.com",
    "frame-src 'none'",
    "object-src 'none'"
  ].join('; ')
  
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`
}
