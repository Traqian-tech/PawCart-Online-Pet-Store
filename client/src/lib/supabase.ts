import { createClient } from '@supabase/supabase-js'
import { safeSetItem } from './storage'

// Initialize Supabase client safely
let supabase: any = null

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  console.log('Supabase URL configured:', !!supabaseUrl)
  console.log('Supabase Key configured:', !!supabaseAnonKey)
  console.log('URL starts with:', supabaseUrl.substring(0, 20))

  // Check if Supabase credentials are available
  const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey

  // Create supabase client if credentials are available
  if (hasSupabaseCredentials) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client created successfully')
  } else {
    console.warn('Supabase credentials not configured. Authentication features will show appropriate messages.')
  }
} catch (error) {
  console.error('Supabase configuration error:', error)
  supabase = null
}

export { supabase }

export type AuthUser = {
  id: string
  email: string
  name?: string
}

// Connection tracking
let connectionCount = 0
let useSupabaseAuth = true

// Check connection limit
export function checkConnectionLimit() {
  if (connectionCount >= 190) { // Keep buffer of 10
    useSupabaseAuth = false
    console.log('Supabase connection limit reached, using fallback auth')
  }
  return useSupabaseAuth
}

// Track connections
export function trackConnection(increment: boolean = true) {
  if (increment) {
    connectionCount++
  } else {
    connectionCount = Math.max(0, connectionCount - 1)
  }
  try {
    safeSetItem('supabase_connections', connectionCount.toString())
  } catch (error) {
    // Storage may be blocked by tracking prevention, ignore silently
    console.warn('Could not save connection count to localStorage')
  }
}

// Helper function to detect network errors
export function isNetworkError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = (error.message || error.toString() || '').toLowerCase()
  const errorCode = (error.code || '').toLowerCase()
  const errorName = (error.name || '').toLowerCase()
  const status = error.status || error.statusCode || 0
  
  // Check for common network error patterns
  const networkErrorPatterns = [
    'failed to fetch',
    'err_connection_closed',
    'err_internet_disconnected',
    'err_network_changed',
    'err_connection_refused',
    'err_connection_reset',
    'err_connection_timed_out',
    'networkerror',
    'network request failed',
    'fetch failed',
    'authretryablefetcherror',
    'cors',
    'cross-origin',
    'networkerrorwhenattemptingtofetchresource',
    'Network connection failed'
  ]
  
  // Check if error name or message matches network error patterns
  const matchesPattern = networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern) || 
    errorCode.includes(pattern) ||
    errorName.includes(pattern)
  )
  
  if (matchesPattern) {
    return true
  }
  
  // Status 0 usually indicates network error (CORS, connection refused, etc.)
  // AuthRetryableFetchError with status 0 is a network error
  if (status === 0) {
    // AuthRetryableFetchError is always a network error when status is 0
    if (errorName.includes('authretryable') || errorName.includes('retryable')) {
      return true
    }
    // Any Fetch or Network error with status 0
    if (errorName.includes('fetch') || errorName.includes('network')) {
      return true
    }
    // Status 0 without a proper HTTP response usually means network/CORS error
    // This catches generic errors that occur during network failures
    if (!errorName || errorName === 'typeerror' || errorName === 'error') {
      // Additional check: if message contains network-related terms
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
          errorMessage.includes('connection') || errorMessage.includes('cors')) {
        return true
      }
    }
  }
  
  return false
}

// Helper function to get user-friendly error message
function getErrorMessage(error: any): string {
  if (!error) return 'Unknown error, please try again later'
  
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your network connection and try again later'
  }
  
  // Check for specific Supabase errors
  if (error.message) {
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return 'Too many requests, please try again later'
    }
    if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      return 'Invalid email address, please check and try again'
    }
    if (error.message.includes('email')) {
      return 'Invalid email format, please check and try again'
    }
    return error.message
  }
  
  return 'Failed to send verification code, please try again later'
}

// Check if Supabase is available and reachable
export async function checkSupabaseAvailability(): Promise<boolean> {
  if (!supabase) {
    return false
  }
  
  try {
    // Try a simple health check by getting the current session
    // This will fail fast if Supabase is unreachable
    const { error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]) as any
    
    // If we get here, Supabase is reachable (even if there's no session)
    return true
  } catch (err) {
    console.warn('Supabase availability check failed:', err)
    return false
  }
}

export async function sendOtp(email: string, isSignUp: boolean = false, retryCount: number = 0) {
  // Check connection limit first
  if (!checkConnectionLimit() || !supabase) {
    console.log('Using fallback authentication for OTP (no Supabase client)')
    // For OTP fallback, we'll simulate OTP with a simple code
    if (isSignUp) {
      try {
        const { safeSetItem } = await import('./storage')
        safeSetItem(`otp_${email}`, '123456')
      } catch (error) {
        // Storage may be blocked, continue anyway
        console.warn('Could not save OTP to localStorage')
      }
      return { data: { message: 'OTP sent successfully (Fallback mode)' }, error: null }
    }
    return { data: { message: 'Please use sign up first (Fallback mode)' }, error: null }
  }
  
  // Quick availability check before attempting to send OTP (only on first attempt)
  if (retryCount === 0) {
    const isAvailable = await checkSupabaseAvailability()
    if (!isAvailable) {
      console.log('Supabase not available, using fallback')
      return {
        data: null,
        error: {
          message: 'Verification service is temporarily unavailable. Using fallback authentication.',
          isNetworkError: true,
          shouldUseFallback: true
        }
      }
    }
  }
  
  console.log('Sending OTP to:', email, isSignUp ? '(signup)' : '(signin)', retryCount > 0 ? `(retry ${retryCount})` : '')
  
  try {
    // Try sending OTP with retry mechanism for network errors
    let lastResult: any = null
    let attempts = 0
    const maxRetries = 3
    
    while (attempts < maxRetries) {
      attempts++
      console.log(`OTP send attempt ${attempts}/${maxRetries}`)
      
      try {
        const result = await Promise.race([
          supabase.auth.signInWithOtp({
            email,
            options: {
              // For signup, auto-create user. For signin, don't create if user doesn't exist
              shouldCreateUser: isSignUp,
              data: isSignUp ? {
                role: 'user'
              } : undefined
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]) as any
        
        lastResult = result
        const { data, error } = result
        
        console.log('OTP send response:', { data: !!data, error: error?.message })
        
        // If no error, return success
        if (!error) {
          return { 
            data: { message: 'OTP sent successfully' }, 
            error: null 
          }
        }
        
        // Check if it's a network error that we should retry
        const isNetworkErr = isNetworkError(error)
        
        // If it's not a network error, or we've exhausted retries, return the error
        if (!isNetworkErr || attempts >= maxRetries) {
          // Format error with user-friendly message
          const formattedError = {
            ...error,
            message: getErrorMessage(error),
            isNetworkError: isNetworkErr,
            shouldUseFallback: isNetworkErr,
            // Ensure status and name are preserved
            status: error.status || error.statusCode || 0,
            name: error.name || '',
            code: error.code || ''
          }
          
          return { data, error: formattedError }
        }
        
        // Network error and we can retry - wait before retrying
        console.log(`Network error detected, retrying in ${attempts * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, attempts * 1000))
        
      } catch (err: any) {
        // Exception thrown (timeout or other)
        const isNetworkErr = isNetworkError(err)
        
        if (!isNetworkErr || attempts >= maxRetries) {
          // Not a network error or exhausted retries
          const errorMessage = getErrorMessage(err)
          return { 
            data: null, 
            error: { 
              message: errorMessage,
              isNetworkError: isNetworkErr,
              shouldUseFallback: isNetworkErr,
              status: err?.status || err?.statusCode || 0,
              name: err?.name || '',
              code: err?.code || '',
              originalError: err,
              retryable: isNetworkErr
            } 
          }
        }
        
        // Network error - retry
        console.log(`Network exception, retrying in ${attempts * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, attempts * 1000))
      }
    }
    
    // Should not reach here, but handle it just in case
    if (lastResult) {
      const { data, error } = lastResult
      const formattedError = {
        ...error,
        message: getErrorMessage(error),
        isNetworkError: isNetworkError(error),
        shouldUseFallback: isNetworkError(error),
        status: error.status || error.statusCode || 0,
        name: error.name || '',
        code: error.code || ''
      }
      return { data, error: formattedError }
    }
    
    throw new Error('Failed to send OTP after retries')
  } catch (err: any) {
    console.error('OTP send error:', err)
    
    // Check if it's a network error
    const isNetwork = isNetworkError(err)
    const errorMessage = getErrorMessage(err)
    
    return { 
      data: null, 
      error: { 
        message: errorMessage,
        isNetworkError: isNetwork,
        shouldUseFallback: isNetwork, // Suggest fallback for network errors
        // Preserve error properties
        status: err?.status || err?.statusCode || 0,
        name: err?.name || '',
        code: err?.code || '',
        originalError: err,
        retryable: isNetwork // Indicate if error is retryable
      } 
    }
  }
}

export async function verifyOtp(email: string, token: string) {
  if (!supabase) {
    console.error('Supabase client not initialized')
    return { data: null, error: { message: 'Authentication service not configured.' } }
  }
  
  console.log('Verifying OTP for:', email)
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    
    console.log('OTP verification response:', { 
      session: !!data?.session, 
      user: !!data?.user, 
      error: error?.message 
    })
    
    return { data, error }
  } catch (err) {
    console.error('OTP verification error:', err)
    return { 
      data: null, 
      error: { message: 'Invalid or expired code. Please try again.' } 
    }
  }
}

export async function signIn(email: string, password?: string) {
  // This app uses OTP authentication, so we redirect to OTP flow
  // For consistency, we'll use the sendOtp function for sign-in
  return sendOtp(email, false) // false = not a sign-up
}

export async function signOut() {
  if (!supabase) {
    return { error: { message: 'Authentication service not configured.' } }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  if (!supabase) {
    return null
  }
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: any) => void) {
  if (!supabase) {
    callback(null)
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session?.user ?? null)
  })
}