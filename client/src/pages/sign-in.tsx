import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendOtp, supabase } from '@/lib/supabase'
import { OtpVerification } from '@/components/ui/otp-verification'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { safeSetItem } from '@/lib/storage'
import { Mail, ArrowLeft, PawPrint, Loader2, Lock, Shield, User, KeyRound } from 'lucide-react'
const logoPath = '/logo.png'

// Function to get the correct password reset URL for different environments
function getPasswordResetUrl(): string {
  const customResetUrl = import.meta.env.VITE_PASSWORD_RESET_URL;
  if (customResetUrl) {
    console.log('Using custom password reset URL from environment:', customResetUrl);
    return customResetUrl;
  }

  const currentOrigin = window.location.origin;

  if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
    return `${currentOrigin}/reset-password`;
  }

  const hostname = window.location.hostname;
  const href = window.location.href;
  const referrer = document.referrer;

  const replitMatch =
    href.match(/https?:\/\/([^\/]+\.replit\.dev)/) ||
    referrer.match(/https?:\/\/([^\/]+\.replit\.dev)/);

  if (replitMatch) {
    return `https://${replitMatch[1]}/reset-password`;
  }

  return `${currentOrigin}/reset-password`;
}

export default function SignInPage() {
  const [, setLocation] = useLocation()
  const [loading, setLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    password: ''
  })
  const [showAdminAccess, setShowAdminAccess] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      })
      return
    }

    if (!formData.password.trim()) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // First, validate email and password
      console.log('Validating credentials...')
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json()
        toast({
          title: 'Sign In Failed',
          description: errorData.message || 'Invalid email or password',
          variant: 'destructive',
        })
        return
      }

      // If login successful, send OTP for email verification (REQUIRED)
      console.log('Credentials validated, sending OTP for email verification...')
      const result = await sendOtp(formData.email, false) // false = isSignIn
      
      console.log('OTP send result:', result)
      
      if (result.error) {
        console.error('OTP send error:', result.error)
        
        // Email verification is REQUIRED - no fallback allowed
        let errorMessage = result.error.message || 'Failed to send verification code. Please try again later.'
        
        // Check for network errors more comprehensively
        const isNetworkErr = result.error.isNetworkError || 
                            result.error.shouldUseFallback ||
                            result.error.status === 0 ||
                            result.error.name === 'AuthRetryableFetchError' ||
                            result.error.message?.includes('Failed to fetch') ||
                            result.error.message?.includes('ERR_CONNECTION_CLOSED') ||
                            result.error.message?.includes('Network connection failed')
        
        // Provide specific error messages
        if (result.error.code === 'over_email_send_rate_limit' || 
            result.error.message?.includes('rate limit') ||
            result.error.message?.includes('too frequent')) {
          errorMessage = 'Too many requests. Please wait 5-10 minutes before trying again. Email verification is required for login.'
        } else if (isNetworkErr) {
          errorMessage = 'Network connection failed. Unable to send verification email. The system has automatically retried 3 times but still failed. Please check your network connection, ensure you can access Supabase services, and try again. Email verification is required for login.'
          
          // Add diagnostic information
          console.error('Network error details:', {
            status: result.error.status,
            name: result.error.name,
            code: result.error.code,
            message: result.error.message,
            retryable: result.error.retryable
          })
          
          // Log Supabase configuration status
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
          console.error('Supabase configuration:', {
            urlConfigured: !!supabaseUrl,
            urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not configured'
          })
        }
        
        toast({
          title: 'Email Verification Failed',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000, // Show longer for network errors
        })
        setLoading(false)
        return
      }
      
      // OTP sent successfully - show verification screen
      console.log('OTP sent successfully')
      toast({
        title: 'Verification Code Sent! 📧',
        description: 'Please check your email and enter the 6-digit verification code to complete login. Email verification is required.',
      })
      setShowOtpVerification(true)
    } catch (error) {
      console.error('Unexpected error during signin:', error)
      toast({
        title: 'Sign In Error',
        description: 'An unexpected error occurred during sign in. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAdminInputChange = (field: string, value: string) => {
    setAdminFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adminFormData.username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter admin username',
        variant: 'destructive',
      })
      return
    }

    if (!adminFormData.password.trim()) {
      toast({
        title: 'Password Required',
        description: 'Please enter admin password',
        variant: 'destructive',
      })
      return
    }

    // Check admin credentials
    if (adminFormData.username !== 'admin' || adminFormData.password !== 'admin123') {
      toast({
        title: 'Invalid Admin Credentials',
        description: 'Incorrect username or password',
        variant: 'destructive',
      })
      return
    }

    setAdminLoading(true)

    try {
      // Create admin user object
      const adminUser = {
        id: 'admin',
        username: 'admin',
        email: 'admin@meowmeowpetshop.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'admin'
      }
      
      safeSetItem('meow_meow_auth_user', JSON.stringify(adminUser))
      
      toast({
        title: 'Admin Login Successful!',
        description: 'Welcome to the admin panel.',
      })
      
      // Small delay to ensure localStorage is written, then redirect
      setTimeout(() => {
        window.location.href = '/admin'
      }, 100)
    } catch (error) {
      console.error('Admin login error:', error)
      toast({
        title: 'Login Error',
        description: 'An error occurred during admin login.',
        variant: 'destructive',
      })
    } finally {
      setAdminLoading(false)
    }
  }

  const handleOtpSuccess = (user: any) => {
    console.log('OTP verification successful:', user)
    
    // Store user in the custom auth system's localStorage
    const authUser = {
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      email: user.email,
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'user'
    }
    
    safeSetItem('meow_meow_auth_user', JSON.stringify(authUser))
    console.log('User stored in localStorage for header display:', authUser)
    
    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    })
    
    // Trigger a page refresh to ensure the header updates with the new auth state
    window.location.href = '/'
  }

  const handleBackToSignIn = () => {
    setShowOtpVerification(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotPasswordEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      })
      return
    }

    setForgotPasswordLoading(true)

    try {
      const redirectUrl = getPasswordResetUrl();
      console.log('Password reset redirect URL:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast({
          title: 'Reset Failed',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        setForgotPasswordSubmitted(true)
        toast({
          title: 'Reset Email Sent',
          description: 'Check your email for password reset instructions',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Show OTP verification component if needed
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <OtpVerification
          email={formData.email}
          isSignUp={false}
          onSuccess={handleOtpSuccess}
          onBack={handleBackToSignIn}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 p-2 text-sm font-medium transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Card - Modern Glass Morphism Design */}
        <Card className="relative shadow-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-yellow-50/30 pointer-events-none" />
          
          {/* Subtle Border Gradient */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-50 pointer-events-none" />
          
          <CardHeader className="text-center pb-6 px-8 pt-8 relative">
            {/* Logo with Enhanced Styling */}
            <div className="flex justify-center mb-6">
              <Link href="/" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative">
                  <img 
                    src={logoPath} 
                    alt="PawCart Online Pet Store Logo" 
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300"
                  />
                </div>
              </Link>
            </div>
            
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600 text-base font-normal">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field - Enhanced Design */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12 pl-11 pr-4 text-base border-slate-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300"
                      required
                      data-testid="input-email"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-emerald-500 transition-colors duration-200" />
                  </div>
                </div>
              </div>

              {/* Password Field - Enhanced Design */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    Password
                  </Label>
                  <span
                    onClick={(e) => {
                      console.log('Forgot Password clicked!')
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Before setShowForgotPassword, current value:', showForgotPassword)
                      setShowForgotPassword(true)
                      console.log('After setShowForgotPassword(true) called')
                      // Force a re-render check
                      setTimeout(() => {
                        console.log('State should be updated now')
                      }, 0)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 p-0 h-auto font-medium transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline decoration-2 hover:decoration-emerald-600 bg-transparent border-none outline-none focus:outline-none focus:ring-0 relative z-50 pointer-events-auto select-none"
                    style={{ zIndex: 50, pointerEvents: 'auto' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowForgotPassword(true)
                      }
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-12 pl-11 pr-4 text-base border-slate-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300"
                      required
                      data-testid="input-password"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-emerald-500 transition-colors duration-200" />
                  </div>
                </div>
              </div>

              {/* Sign In Button - Premium Design */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg relative overflow-hidden group"
                data-testid="button-send-code"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Divider - Modern Style */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-slate-500 font-medium">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link - Enhanced Button */}
            <div className="text-center">
              <Link href="/sign-up">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                >
                  Create New Account
                </Button>
              </Link>
            </div>

            {/* Admin Access Toggle - Subtle Design */}
            <div className="text-center pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowAdminAccess(!showAdminAccess)}
                className="w-full h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all duration-200 rounded-lg"
                data-testid="button-toggle-admin"
              >
                <Shield className="w-4 h-4 mr-2" />
                {showAdminAccess ? 'Hide Admin Access' : 'Admin Access'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Login Section - Enhanced Design */}
        {showAdminAccess && (
          <Card className="relative shadow-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/80 via-white/80 to-red-50/80 backdrop-blur-xl mt-6 overflow-hidden">
            {/* Admin Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-red-50/30 pointer-events-none" />
            
            <CardHeader className="text-center pb-6 px-8 pt-8 relative">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Admin Access
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm font-normal">
                Login with admin credentials
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-8 pb-8 relative">
              <form onSubmit={handleAdminSubmit} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="admin-username" 
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Username
                  </Label>
                  <div className="relative group">
                    <div className="relative">
                      <Input
                        id="admin-username"
                        type="text"
                        placeholder="Enter admin username"
                        value={adminFormData.username}
                        onChange={(e) => handleAdminInputChange('username', e.target.value)}
                        className="h-12 pl-11 pr-4 text-base border-orange-200 bg-white/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300"
                        required
                        data-testid="input-admin-username"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-orange-500 transition-colors duration-200" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="admin-password" 
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={adminFormData.password}
                        onChange={(e) => handleAdminInputChange('password', e.target.value)}
                        className="h-12 pl-11 pr-4 text-base border-orange-200 bg-white/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300"
                        required
                        data-testid="input-admin-password"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-orange-500 transition-colors duration-200" />
                    </div>
                  </div>
                </div>

                {/* Admin Login Button */}
                <Button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-red-600 hover:to-red-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg relative overflow-hidden group"
                  data-testid="button-admin-login"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center">
                    {adminLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Admin Login
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Section - Enhanced Design */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgotPassword(false)}>
            <Card 
              className="relative shadow-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-50/80 backdrop-blur-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Forgot Password Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 pointer-events-none" />
            
            <CardHeader className="text-center pb-6 px-8 pt-8 relative">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-full shadow-lg">
                    <KeyRound className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm font-normal">
                {forgotPasswordSubmitted 
                  ? 'We\'ve sent password reset instructions to your email'
                  : 'Enter your email address to receive password reset instructions'}
              </CardDescription>
            </CardHeader>

            {!forgotPasswordSubmitted ? (
              <CardContent className="space-y-5 px-8 pb-8 relative">
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="forgot-password-email" 
                      className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-slate-400" />
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="forgot-password-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="h-12 pl-11 pr-4 text-base border-blue-200 bg-white/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300"
                          required
                          data-testid="input-forgot-password-email"
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg relative overflow-hidden group"
                    data-testid="button-forgot-password-submit"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center">
                      {forgotPasswordLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Send Reset Email
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Back to Sign In Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                      setForgotPasswordSubmitted(false)
                    }}
                    className="w-full h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all duration-200 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </form>
              </CardContent>
            ) : (
              <CardContent className="space-y-5 px-8 pb-8 relative">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-green-100 rounded-full p-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-700 font-medium">
                      Check your email
                    </p>
                    <p className="text-sm text-slate-600">
                      We've sent password reset instructions to <span className="font-medium text-slate-900">{forgotPasswordEmail}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-4">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setForgotPasswordEmail('')
                        setForgotPasswordSubmitted(false)
                      }}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                    >
                      Back to Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForgotPasswordSubmitted(false)
                        setForgotPasswordEmail('')
                      }}
                      className="w-full h-10 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm transition-all duration-200 rounded-lg"
                    >
                      Try Another Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          </div>
        )}

        {/* Footer - Enhanced Design */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p className="font-medium">© 2025 PawCart Online Pet Store. All rights reserved.</p>
          <div className="flex justify-center items-center space-x-3 mt-3">
            <Link href="/privacy">
              <Button 
                variant="link" 
                className="text-slate-500 hover:text-emerald-600 p-0 h-auto text-sm font-medium transition-colors duration-200"
              >
                Privacy Policy
              </Button>
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms">
              <Button 
                variant="link" 
                className="text-slate-500 hover:text-emerald-600 p-0 h-auto text-sm font-medium transition-colors duration-200"
              >
                Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}