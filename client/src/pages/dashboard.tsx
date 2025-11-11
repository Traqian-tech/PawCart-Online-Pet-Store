import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { useLocation, Link } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useWishlist } from '@/hooks/use-wishlist'
import { useCurrency } from '@/contexts/currency-context'
import { useCart } from '@/contexts/cart-context'
import { useWallet } from '@/contexts/wallet-context'
import { supabase } from '@/lib/supabase'
import { getAllCountries, getStatesByCountry, getCitiesByState, getCountryByCode, getStateByCode } from '@/lib/global-address-data'
import { ThemeColorPicker } from '@/components/theme-color-picker'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Gift, 
  HelpCircle, 
  Phone, 
  MessageCircle, 
  LogOut,
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Star,
  CreditCard,
  Edit,
  Save,
  X,
  Camera,
  Upload,
  Crown,
  Trash2,
  Plus,
  FileText,
  AlertCircle,
  Copy,
  Send,
  TrendingUp,
  Calendar,
  Mail,
  MailOpen,
  Zap,
  ArrowRight,
  Users,
  Award,
  LayoutDashboard,
  UserCircle,
  FileCheck,
  Sparkles,
  Headphones,
  MessageSquare,
  Lock,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Verified,
  Activity,
  Settings,
  Home,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Search,
  Info,
  Stethoscope,
  Weight,
  Thermometer,
  ClipboardList,
  ClipboardCheck,
  CalendarClock,
  CheckSquare
} from 'lucide-react'
import { format as formatDate } from 'date-fns'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PetCard } from '@/components/pets/PetCard'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'

interface Order {
  id: string
  invoiceId?: string
  date: string
  status: 'delivered' | 'pending' | 'processing'
  total: number
  items: { name: string; quantity: number; price: number }[]
}

interface Request {
  _id: string
  userId: string
  type: 'product_inquiry' | 'return_refund' | 'custom_order' | 'complaint' | 'other'
  subject: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  orderId?: string
  attachments?: string[]
  response?: string
  createdAt: string
  updatedAt: string
}

interface Address {
  _id: string
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  region?: string
  province?: string
  postCode: string
  country: string
  isDefault: boolean
  label?: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalSpent: number
  walletBalance: number
  wishlistCount: number
  deliveredOrders: number
  pendingOrders: number
  processingOrders: number
  activeCoupons: number
  requestedProducts: number
}

interface Pet {
  _id: string
  userId: string
  name: string
  species: 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'other'
  breed?: string
  age?: number
  weight?: number
  gender?: 'male' | 'female' | 'unknown'
  photo?: string
  birthday?: string
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor'
  healthNotes?: string
  specialNeeds?: string[]
  preferences?: {
    foodType?: string[]
    activityLevel?: 'low' | 'medium' | 'high'
    favoriteToys?: string[]
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  nextBirthday?: Date
  daysUntil?: number
}

type CarePlanCategory = 'nutrition' | 'exercise' | 'grooming' | 'medication' | 'wellness' | 'other'
type CarePlanFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'

interface PetHealthRecord {
  _id: string
  petId: string
  userId: string
  recordType: 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'grooming' | 'other'
  title: string
  description?: string
  date: string
  veterinarian?: string
  location?: string
  cost?: number
  attachments?: string[]
  nextDueDate?: string
  notes?: string
  weight?: number
  temperature?: number
  healthScore?: number
  createdAt: string
  updatedAt: string
}

interface PetCarePlan {
  _id: string
  petId: string
  userId: string
  title: string
  description?: string
  category: CarePlanCategory
  frequency: CarePlanFrequency
  customIntervalDays?: number
  startDate: string
  nextDueDate?: string
  remindersEnabled: boolean
  reminderLeadDays?: number
  status: 'upcoming' | 'completed' | 'overdue'
  lastCompletedAt?: string
  createdAt: string
  updatedAt: string
}

type HealthReminder =
  | (PetHealthRecord & { reminderType: 'healthRecord' })
  | (PetCarePlan & { reminderType: 'carePlan'; recordType: 'care-plan' })

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
});

const passwordChangeSchema = z.object({
  otpCode: z.string().min(6, "Verification code must be 6 digits").max(6, "Verification code must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const petFormSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.enum(['cat', 'dog', 'rabbit', 'bird', 'hamster', 'other']),
  breed: z.string().optional(),
  age: z.number().min(0).max(300).optional(),
  weight: z.number().min(0).max(200).optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  photo: z.string().optional(),
  birthday: z.string().optional(),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  healthNotes: z.string().optional(),
  specialNeeds: z.string().optional(),
});

const healthRecordFormSchema = z.object({
  recordType: z.enum(['vaccination', 'checkup', 'medication', 'surgery', 'grooming', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  veterinarian: z.string().optional(),
  location: z.string().optional(),
  cost: z.number().min(0).optional(),
  nextDueDate: z.string().optional(),
  notes: z.string().optional(),
  weight: z.number().min(0).max(200).optional(),
  temperature: z.number().min(20).max(45).optional(),
  healthScore: z.number().min(0).max(100).optional(),
});

const carePlanFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['nutrition', 'exercise', 'grooming', 'medication', 'wellness', 'other']),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom']),
  customIntervalDays: z.number().min(1).max(365).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  reminderLeadDays: z.number().min(0).max(30).optional(),
  remindersEnabled: z.boolean().optional(),
}).refine(
  (data) => data.frequency !== 'custom' || (data.customIntervalDays !== undefined && data.customIntervalDays !== null),
  {
    message: 'Please provide an interval in days',
    path: ['customIntervalDays'],
  }
);

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
type PetFormData = z.infer<typeof petFormSchema>;
type HealthRecordFormData = z.infer<typeof healthRecordFormSchema>;
type CarePlanFormData = z.infer<typeof carePlanFormSchema>;

export default function DashboardPage() {
  const { user, signOut, updateProfile, refreshUser, authMethod } = useAuth()
  const { toast } = useToast()
  const [location, setLocation] = useLocation()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { items: wishlistItems, removeItem: removeFromWishlist, clearWishlist } = useWishlist()
  const { format } = useCurrency()
  const { addItem: addToCart } = useCart()
  const { wallet, isLoading: isWalletLoading } = useWallet()
  const queryClient = useQueryClient()
  
  // Pets state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isHealthRecordDialogOpen, setIsHealthRecordDialogOpen] = useState(false)
  const [isHealthOverviewOpen, setIsHealthOverviewOpen] = useState(false)
  const [isCarePlanDialogOpen, setIsCarePlanDialogOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [activeTab, setActiveTab] = useState('pets')
  
  // Fetch pets
  const { data: petsData, isLoading: isLoadingPets } = useQuery({
    queryKey: ['/api/pets'],
    enabled: !!user,
    retry: 1,
  })
  
  const pets: Pet[] = petsData?.pets || []
  
  // Birthdays removed in redesign
  
  // Fetch health reminders
  const { data: remindersData } = useQuery<{ reminders: HealthReminder[] }>({
    queryKey: ['/api/pets/health-reminders?days=30'],
    enabled: !!user && pets.length > 0,
  })
  
  const healthReminders: HealthReminder[] = remindersData?.reminders || []
  
  // Pet form
  const petForm = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: 'cat',
      breed: '',
      age: undefined,
      weight: undefined,
      gender: 'unknown',
      photo: '',
      birthday: '',
      healthStatus: 'good',
      healthNotes: '',
      specialNeeds: '',
    },
  })
  
  // Health record form
  const healthRecordForm = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordFormSchema),
    defaultValues: {
      recordType: 'checkup',
      title: '',
      description: '',
      date: formatDate(new Date(), 'yyyy-MM-dd'),
      veterinarian: '',
      location: '',
      cost: undefined,
      nextDueDate: '',
      notes: '',
      weight: undefined,
      temperature: undefined,
      healthScore: undefined,
    },
  })

  // Care plan form
  const carePlanForm = useForm<CarePlanFormData>({
    resolver: zodResolver(carePlanFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'wellness',
      frequency: 'once',
      customIntervalDays: undefined,
      startDate: formatDate(new Date(), 'yyyy-MM-dd'),
      reminderLeadDays: 1,
      remindersEnabled: true,
    },
  })

  const carePlanFrequency = carePlanForm.watch('frequency')
  const carePlanRemindersEnabled = carePlanForm.watch('remindersEnabled')

  const selectedPetId = selectedPet?._id

  const { data: healthRecordsData, isLoading: isLoadingHealthRecords } = useQuery<{ records: PetHealthRecord[] }>({
    queryKey: ['pet-health-records', selectedPetId],
    enabled: isHealthOverviewOpen && !!selectedPetId,
    queryFn: async () => {
      if (!selectedPetId) return { records: [] }
      const response = await fetch(`/api/pets/${selectedPetId}/health-records`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch health records')
      }
      return response.json()
    },
  })

  const healthRecords: PetHealthRecord[] = healthRecordsData?.records || []

  const { data: carePlansData, isLoading: isLoadingCarePlans } = useQuery<{ plans: PetCarePlan[] }>({
    queryKey: ['pet-care-plans', selectedPetId],
    enabled: isHealthOverviewOpen && !!selectedPetId,
    queryFn: async () => {
      if (!selectedPetId) return { plans: [] }
      const response = await fetch(`/api/pets/${selectedPetId}/care-plans`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch care plans')
      }
      return response.json()
    },
  })

  const carePlans: PetCarePlan[] = carePlansData?.plans || []

  const healthChartConfig = useMemo(
    () => ({
      weight: {
        label: 'Weight (kg)',
        color: '#22c55e',
      },
      healthScore: {
        label: 'Health Score',
        color: '#0ea5e9',
      },
      temperature: {
        label: 'Temperature (°C)',
        color: '#f97316',
      },
    }),
    []
  )

  const healthMetricChartData = useMemo(() => {
    if (!healthRecords.length) {
      return []
    }

    return [...healthRecords]
      .filter(
        (record) =>
          record.weight !== undefined ||
          record.healthScore !== undefined ||
          record.temperature !== undefined
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((record) => ({
        label: formatDate(new Date(record.date), 'MMM d'),
        date: record.date,
        weight: record.weight ?? null,
        healthScore: record.healthScore ?? null,
        temperature: record.temperature ?? null,
      }))
  }, [healthRecords])

  const hasWeightData = useMemo(
    () => healthMetricChartData.some((entry) => entry.weight !== null),
    [healthMetricChartData]
  )
  const hasScoreData = useMemo(
    () => healthMetricChartData.some((entry) => entry.healthScore !== null),
    [healthMetricChartData]
  )
  const hasTemperatureData = useMemo(
    () => healthMetricChartData.some((entry) => entry.temperature !== null),
    [healthMetricChartData]
  )

  const latestHealthRecord = useMemo(() => {
    if (!healthRecords.length) return undefined
    return [...healthRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  }, [healthRecords])

  const activeCarePlans = useMemo(
    () => carePlans.filter((plan) => plan.status !== 'completed'),
    [carePlans]
  )

  const completedCarePlans = useMemo(
    () => carePlans.filter((plan) => plan.status === 'completed'),
    [carePlans]
  )
  
  // Create pet mutation
  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      // Check if user is logged in
      if (!user) {
        throw new Error('You must be logged in to create a pet profile')
      }
      
      // Prepare pet data, cleaning up undefined values and handling specialNeeds
      const petData: any = {
        name: data.name,
        species: data.species,
        gender: data.gender || 'unknown',
      }
      
      // Add optional fields only if they have values
      if (data.breed) petData.breed = data.breed
      if (data.age !== undefined && data.age !== null) petData.age = data.age
      if (data.weight !== undefined && data.weight !== null) petData.weight = data.weight
      if (data.photo) petData.photo = data.photo
      if (data.birthday) petData.birthday = data.birthday
      if (data.healthStatus) petData.healthStatus = data.healthStatus
      if (data.healthNotes) petData.healthNotes = data.healthNotes
      
      // Handle specialNeeds safely
      if (data.specialNeeds && typeof data.specialNeeds === 'string' && data.specialNeeds.trim()) {
        petData.specialNeeds = data.specialNeeds.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        petData.specialNeeds = []
      }
      
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(petData),
      })
      
      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Please sign in again to continue',
            variant: 'destructive',
          })
          // Redirect to sign-in after a short delay
          setTimeout(() => {
            setLocation('/sign-in')
          }, 1500)
          throw new Error('Your session has expired. Please sign in again.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create pet: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] })
      toast({
        title: 'Success! 🎉',
        description: 'Pet profile created successfully',
      })
      setIsAddDialogOpen(false)
      petForm.reset()
    },
    onError: (error: Error) => {
      // Only show toast if it's not a 401 (already handled above)
      if (!error.message.includes('session has expired')) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create pet profile',
          variant: 'destructive',
        })
      }
    },
  })
  
  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: PetFormData }) => {
      // Check if user is logged in
      if (!user) {
        throw new Error('You must be logged in to update a pet profile')
      }
      
      // Prepare pet data, cleaning up undefined values and handling specialNeeds
      const petData: any = {
        name: data.name,
        species: data.species,
        gender: data.gender || 'unknown',
      }
      
      // Add optional fields only if they have values
      if (data.breed) petData.breed = data.breed
      if (data.age !== undefined && data.age !== null) petData.age = data.age
      if (data.weight !== undefined && data.weight !== null) petData.weight = data.weight
      if (data.photo) petData.photo = data.photo
      if (data.birthday) petData.birthday = data.birthday
      if (data.healthStatus) petData.healthStatus = data.healthStatus
      if (data.healthNotes) petData.healthNotes = data.healthNotes
      
      // Handle specialNeeds safely
      if (data.specialNeeds && typeof data.specialNeeds === 'string' && data.specialNeeds.trim()) {
        petData.specialNeeds = data.specialNeeds.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        petData.specialNeeds = []
      }
      
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(petData),
      })
      
      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Please sign in again to continue',
            variant: 'destructive',
          })
          // Redirect to sign-in after a short delay
          setTimeout(() => {
            setLocation('/sign-in')
          }, 1500)
          throw new Error('Your session has expired. Please sign in again.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update pet: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] })
      toast({
        title: 'Success! 🎉',
        description: 'Pet profile updated successfully',
      })
      setIsEditDialogOpen(false)
      setSelectedPet(null)
      petForm.reset()
    },
    onError: (error: Error) => {
      // Only show toast if it's not a 401 (already handled above)
      if (!error.message.includes('session has expired')) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update pet profile',
          variant: 'destructive',
        })
      }
    },
  })
  
  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to delete pet')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] })
      toast({
        title: 'Success',
        description: 'Pet profile deleted successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete pet profile',
        variant: 'destructive',
      })
    },
  })
  
  // Create health record mutation
  const createHealthRecordMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: HealthRecordFormData }) => {
      const response = await fetch(`/api/pets/${petId}/health-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create health record')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] })
      queryClient.invalidateQueries({ queryKey: ['/api/pets/health-reminders?days=30'] })
      queryClient.invalidateQueries({ queryKey: ['pet-health-records', variables.petId] })
      toast({
        title: 'Success! 🎉',
        description: 'Health record created successfully',
      })
      setIsHealthRecordDialogOpen(false)
      healthRecordForm.reset()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create health record',
        variant: 'destructive',
      })
    },
  })

  const createCarePlanMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: CarePlanFormData }) => {
      const response = await fetch(`/api/pets/${petId}/care-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create care plan')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet-care-plans', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['/api/pets/health-reminders?days=30'] })
      toast({
        title: 'Care plan added',
        description: 'New care plan scheduled successfully',
      })
      setIsCarePlanDialogOpen(false)
      carePlanForm.reset({
        title: '',
        description: '',
        category: 'wellness',
        frequency: 'once',
        customIntervalDays: undefined,
        startDate: formatDate(new Date(), 'yyyy-MM-dd'),
        reminderLeadDays: 1,
        remindersEnabled: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create care plan',
        variant: 'destructive',
      })
    },
  })

  const deleteCarePlanMutation = useMutation({
    mutationFn: async ({ petId, planId }: { petId: string; planId: string }) => {
      const response = await fetch(`/api/pets/${petId}/care-plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to delete care plan')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet-care-plans', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['/api/pets/health-reminders?days=30'] })
      toast({
        title: 'Care plan removed',
        description: 'The care plan has been deleted',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete care plan',
        variant: 'destructive',
      })
    },
  })

  const completeCarePlanMutation = useMutation({
    mutationFn: async ({ petId, planId }: { petId: string; planId: string }) => {
      const response = await fetch(`/api/pets/${petId}/care-plans/${planId}/complete`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to update care plan')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet-care-plans', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['/api/pets/health-reminders?days=30'] })
      toast({
        title: 'Care plan updated',
        description: 'Care plan progress recorded',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update care plan',
        variant: 'destructive',
      })
    },
  })

  // Read section from URL parameter on mount and when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sectionParam = urlParams.get('section')
    if (sectionParam && ['dashboard', 'orders', 'profile', 'wishlist', 'requests', 'address', 'wallet', 'pets', 'coupons', 'rewards', 'refer', 'newsletter', 'savings'].includes(sectionParam)) {
      setActiveSection(sectionParam)
    }
  }, [location])

  // Update URL when section changes (but not on initial load from URL param)
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    // Update URL without page reload
    const newUrl = section === 'dashboard' 
      ? '/dashboard' 
      : `/dashboard?section=${section}`
    window.history.pushState({}, '', newUrl)
  }

  // Profile form - moved to top level to avoid hooks rules violation
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
    }
  })

  // Password change form
  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      otpCode: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  // Update form defaults when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any)?.phone || '',
      })
    }
  }, [user, profileForm])

  // Refresh user data when dashboard loads to ensure membership info is up-to-date
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [])

  // Show membership expiry notification on dashboard load
  useEffect(() => {
    const membership = (user as any)?.membership;
    if (membership && new Date(membership.expiryDate) > new Date()) {
      const daysUntilExpiry = Math.ceil(
        (new Date(membership.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should show notification (within 7 days and not shown today)
      const lastNotificationDate = localStorage.getItem('membershipExpiryNotification');
      const today = new Date().toDateString();

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 7 && lastNotificationDate !== today) {
        // Show toast notification
        toast({
          title: "⏰ Membership Expiring Soon!",
          description: `Your ${membership.tier} membership expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Renew now to keep your benefits!`,
          duration: 10000, // Show for 10 seconds
        });

        // Mark notification as shown today
        localStorage.setItem('membershipExpiryNotification', today);
      }
    }
  }, [user, toast])

  // Fetch membership statistics
  const { data: membershipStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/membership/statistics', (user as any)?._id],
    queryFn: async () => {
      const userId = (user as any)?._id || (user as any)?.id || (user as any)?.email;
      if (!userId) return null;
      
      const response = await fetch(`/api/membership/statistics/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership statistics');
      }
      return response.json();
    },
    enabled: !!user && !!(user as any)?.membership,
  })

  // Fetch real coupons from API
  const { data: apiCoupons = [], isLoading: isLoadingCoupons, refetch: refetchCoupons } = useQuery({
    queryKey: ['/api/coupons'],
    queryFn: async () => {
      const response = await fetch('/api/coupons');
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      return response.json();
    },
  })

  // Local state for temporarily added coupons (before they're saved to DB)
  const [localCoupons, setLocalCoupons] = useState<any[]>([])

  // Combine API coupons with locally added coupons (memoized to prevent infinite loops)
  const coupons = useMemo(() => [...localCoupons, ...apiCoupons], [localCoupons, apiCoupons])

  const [userStats, setUserStats] = useState<UserStats>({
    totalSpent: 1250.50,
    walletBalance: 0,
    wishlistCount: wishlistItems.length,
    deliveredOrders: 8,
    pendingOrders: 2,
    processingOrders: 1,
    activeCoupons: 4,
    requestedProducts: 0
  })
  
  // Update wishlist count when items change
  useEffect(() => {
    setUserStats(prev => ({ ...prev, wishlistCount: wishlistItems.length }))
  }, [wishlistItems.length])

  // Update active coupons count when coupons change
  useEffect(() => {
    const activeCouponsCount = coupons.filter(c => c.status === 'available').length
    setUserStats(prev => ({ ...prev, activeCoupons: activeCouponsCount }))
  }, [coupons])

  // Update wallet balance when wallet data changes
  useEffect(() => {
    if (wallet) {
      setUserStats(prev => ({ ...prev, walletBalance: wallet.balance }))
    }
  }, [wallet])

  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  // Update statistics from orders when orders change
  useEffect(() => {
    if (recentOrders.length > 0) {
      const totalSpent = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const deliveredOrders = recentOrders.filter(order => order.status === 'delivered').length;
      const pendingOrders = recentOrders.filter(order => order.status === 'pending').length;
      const processingOrders = recentOrders.filter(order => order.status === 'processing').length;
      
      setUserStats(prev => ({
        ...prev,
        totalSpent,
        deliveredOrders,
        pendingOrders,
        processingOrders
      }));
    }
  }, [recentOrders])
  const [requests, setRequests] = useState<Request[]>([])
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false)
  const [selectedRequestType, setSelectedRequestType] = useState<Request['type']>('product_inquiry')
  const [newRequestSubject, setNewRequestSubject] = useState('')
  const [newRequestDescription, setNewRequestDescription] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Request['status']>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '', // Now using province as the main region/province field
    postCode: '',
    country: 'HK', // Hong Kong country code
    isDefault: false,
    label: 'Home'
  })

  // Reward Points state (now mutable for real redemptions)
  const [pointsBalance, setPointsBalance] = useState(1250)
  const [pointsHistory, setPointsHistory] = useState([
    { id: 1, date: '2025-11-05', action: 'Referred friend', points: 500, type: 'earned' },
    { id: 2, date: '2025-11-03', action: 'Purchase order #ORD-001', points: 150, type: 'earned' },
    { id: 3, date: '2025-11-01', action: 'Newsletter subscription', points: 100, type: 'earned' },
    { id: 4, date: '2025-10-28', action: 'Redeemed for $50 coupon', points: -500, type: 'redeemed' },
    { id: 5, date: '2025-10-25', action: 'Purchase order #ORD-002', points: 200, type: 'earned' },
  ])

  // Referral state
  const [referrals, setReferrals] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'completed', date: '2025-11-01', reward: '500 points + $20 coupon' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', date: '2025-10-28', reward: 'Pending first purchase' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'completed', date: '2025-10-15', reward: '500 points + $20 coupon' },
  ])
  const [inviteEmail, setInviteEmail] = useState('')

  // Newsletter state
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [newsletters] = useState([
    { id: 1, title: 'November Pet Care Tips', date: '2025-11-01', read: true, preview: 'Learn about winter pet care essentials...' },
    { id: 2, title: 'Exclusive Black Friday Deals', date: '2025-10-25', read: true, preview: 'Get ready for our biggest sale of the year...' },
    { id: 3, title: 'New Product Launch: Premium Cat Food', date: '2025-10-15', read: false, preview: 'Introducing our new organic cat food line...' },
    { id: 4, title: 'Membership Benefits Update', date: '2025-10-01', read: true, preview: 'New perks added to our privilege club...' },
  ])
  const [preferences, setPreferences] = useState({
    promotions: true,
    newProducts: true,
    petCareTips: true,
    weeklyDeals: false,
  })

  // Savings Plan state
  const [activePlans] = useState([
    { 
      id: 1, 
      name: 'Premium Cat Food Monthly', 
      product: 'Royal Canin Indoor Cat 2kg',
      frequency: 'Monthly',
      price: 45.99,
      discount: 10,
      nextDelivery: '2025-11-15',
      status: 'active'
    },
  ])
  const [availablePlans] = useState([
    {
      id: 1,
      category: 'Cat Food',
      title: 'Monthly Cat Food Subscription',
      description: 'Regular delivery of premium cat food',
      discount: 10,
      minPrice: 30,
      icon: Package
    },
    {
      id: 2,
      category: 'Dog Food',
      title: 'Monthly Dog Food Subscription',
      description: 'Regular delivery of premium dog food',
      discount: 15,
      minPrice: 40,
      icon: Package
    },
    {
      id: 3,
      category: 'Pet Supplies',
      title: 'Pet Essentials Box',
      description: 'Monthly box with toys, treats, and essentials',
      discount: 20,
      minPrice: 50,
      icon: Gift
    },
  ])

  // Fetch user orders and invoices
  useEffect(() => {
    // Helper: get a canonical userId consistently across app
    const getCanonicalUserId = (u: any) =>
      String(u?._id || u?.id || u?.userId || '');
    const primaryUserId = getCanonicalUserId(user as any);
    // Fallback: alternate id some earlier flows might have used
    const altUserId = String((user as any)?.id || (user as any)?.userId || '');

    if (primaryUserId) {
      // Fetch orders
      console.log('Fetching orders for user:', primaryUserId);
      fetch(`/api/orders/user/${primaryUserId}`)
        .then(res => res.json())
        .then(orders => {
          console.log('Fetched orders:', orders);
          const formattedOrders = orders.map((order: any) => ({
            id: order._id,
            invoiceId: order.invoiceId || order._id, // Use invoiceId if available, fallback to order._id
            date: new Date(order.createdAt).toISOString().split('T')[0],
            status: order.status.toLowerCase(),
            total: order.total,
            items: order.items || []
          }))
          console.log('Formatted orders:', formattedOrders);
          setRecentOrders(formattedOrders)
        })
        .catch(err => console.error('Failed to fetch orders:', err))

      // Fetch requests (robust: try both primary and alternate userId if they differ)
      const requestsPromises: Promise<any[]>[] = [
        fetch(`/api/requests/user/${primaryUserId}`).then(res => res.ok ? res.json() : []),
      ];
      if (altUserId && altUserId !== primaryUserId) {
        requestsPromises.push(
          fetch(`/api/requests/user/${altUserId}`).then(res => res.ok ? res.json() : [])
        );
      }
      Promise.all(requestsPromises)
        .then(([primaryList = [], altList = []]) => {
          const combined = [...(primaryList || []), ...(altList || [])];
          // Deduplicate by request _id
          const uniqueById = Array.from(
            new Map(combined.map((r: any) => [r._id, r])).values()
          );
          setRequests(uniqueById);
        })
        .catch(err => {
          console.error('Failed to fetch requests:', err);
        });

      // Fetch addresses
      console.log('Fetching addresses for user:', primaryUserId);
      fetch(`/api/addresses/user/${primaryUserId}`)
        .then(res => {
          if (!res.ok) {
            console.error('Failed to fetch addresses - HTTP status:', res.status);
            return res.json().then(err => {
              throw new Error(err.message || `HTTP ${res.status}`);
            });
          }
          return res.json();
        })
        .then(data => {
          console.log('Fetched addresses response:', data);
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} addresses for user ${userId}`);
            setAddresses(data);
          } else {
            console.warn('Addresses response is not an array:', data);
            setAddresses([]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch addresses:', err);
          // Set empty array on error to show "no addresses" state
          setAddresses([]);
        })
    } else {
      // Demo data for non-logged in users
      setRecentOrders([
        {
          id: 'ORD-2025-001',
          date: '2025-01-27',
          status: 'delivered',
          total: 89.99,
          items: [
            { name: 'Royal Canin Cat Food 2kg', quantity: 1, price: 45.99 },
            { name: 'Cat Interactive Toy', quantity: 2, price: 22.00 }
          ]
        },
        {
          id: 'ORD-2025-002',
          date: '2025-01-25',
          status: 'processing',
          total: 156.50,
          items: [
            { name: 'Premium Dog Food 5kg', quantity: 1, price: 78.50 },
            { name: 'Dog Grooming Kit', quantity: 1, price: 78.00 }
          ]
        },
        {
          id: 'ORD-2025-003',
          date: '2025-01-20',
          status: 'pending',
          total: 234.75,
          items: [
            { name: 'Cat Litter Premium 10kg', quantity: 2, price: 89.90 },
            { name: 'Cat Tree Large', quantity: 1, price: 144.85 }
          ]
        }
      ])
    }
  }, [user])
  
  useEffect(() => {
    if (!user) {
      setLocation('/sign-in')
    }
  }, [user, setLocation])

  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <Truck className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setLocation('/')
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove order from local state
        setRecentOrders(prev => prev.filter(order => order.id !== orderId));
        toast({
          title: "Order Deleted",
          description: "The order has been deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  }

  const menuItems = [
    { key: 'dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', color: 'purple' },
    { key: 'profile', icon: <UserCircle className="h-5 w-5" />, label: 'My Profile', color: 'blue' },
    { key: 'orders', icon: <Package className="h-5 w-5" />, label: 'My Orders', color: 'orange' },
    { key: 'wishlist', icon: <Heart className="h-5 w-5" />, label: 'My Wishlist', color: 'pink' },
    { key: 'requests', icon: <FileCheck className="h-5 w-5" />, label: 'Track Requests', color: 'indigo' },
    { key: 'address', icon: <MapPin className="h-5 w-5" />, label: 'My Address', color: 'teal' },
    { key: 'wallet', icon: <Wallet className="h-5 w-5" />, label: 'My Wallet', color: 'green', highlight: true },
    { key: 'pets', icon: <Heart className="h-5 w-5" />, label: 'My Pets', color: 'pink' },
    { key: 'coupons', icon: <Gift className="h-5 w-5" />, label: 'My Coupons', color: 'red' },
    { key: 'rewards', icon: <Award className="h-5 w-5" />, label: 'Reward Points', color: 'yellow' },
    { key: 'refer', icon: <Users className="h-5 w-5" />, label: 'Refer a Friend', color: 'cyan' },
    { key: 'newsletter', icon: <Mail className="h-5 w-5" />, label: 'Newsletters', color: 'violet' },
    { key: 'savings', icon: <Sparkles className="h-5 w-5" />, label: 'Savings Plan', color: 'emerald' },
  ]

  const helpItems = [
    { key: 'faq', icon: <HelpCircle className="h-5 w-5" />, label: 'FAQ', color: 'slate' },
    { key: 'call', icon: <Phone className="h-5 w-5" />, label: 'Call to Order', color: 'blue' },
    { key: 'support', icon: <Headphones className="h-5 w-5" />, label: 'Customer Support', color: 'green' },
    { key: 'chat', icon: <MessageSquare className="h-5 w-5" />, label: 'Chat in Messenger', color: 'purple' },
  ]

  const renderDashboard = () => {
    // Get membership info
    const membership = (user as any).membership;
    const isActiveMembership = membership && new Date(membership.expiryDate) > new Date();

    // Calculate days until expiry
    const daysUntilExpiry = membership ? Math.ceil(
      (new Date(membership.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ) : 0;

    // Check if membership is expiring soon (within 7 days)
    const isExpiringSoon = isActiveMembership && daysUntilExpiry > 0 && daysUntilExpiry <= 7;

    // Get discount percentage based on tier
    const getMembershipDiscount = (tier: string) => {
      switch (tier) {
        case 'Silver Paw': return 5;
        case 'Golden Paw': return 10;
        case 'Diamond Paw': return 15;
        default: return 0;
      }
    };

    const getMembershipColor = (tier: string) => {
      switch (tier) {
        case 'Silver Paw': return 'from-gray-400 to-gray-600';
        case 'Golden Paw': return 'from-yellow-400 to-yellow-600';
        case 'Diamond Paw': return 'from-blue-400 to-purple-600';
        default: return 'from-gray-400 to-gray-600';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
            <AvatarImage src={(user as any).profilePicture} alt="Profile" />
            <AvatarFallback className="bg-green-100 text-green-800 text-sm sm:text-lg">
              {user.firstName?.[0] || user.name?.[0] || user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Hello {user.firstName || user.name || 'User'}!</h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              From your account dashboard you can easily manage your profile by checking your orders history, 
              reward points lists, your wishlists, coupons info
            </p>
          </div>
        </div>

        {/* Membership Expiring Soon Alert */}
        {isExpiringSoon && (
          <Alert className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-300">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 font-bold">
              ⏰ Membership Expiring Soon!
            </AlertTitle>
            <AlertDescription className="text-orange-800">
              Your <strong>{membership.tier}</strong> membership expires in <strong>{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</strong> on{' '}
              <strong>{(membership as any).lifetime ? 'Lifetime' : new Date(membership.expiryDate).toLocaleDateString()}</strong>.
              <div className="mt-2">
                <Button 
                  onClick={() => setLocation('/privilege-club')}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Renew Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Membership Card */}
        {isActiveMembership ? (
          <Card className={`bg-gradient-to-r ${getMembershipColor(membership.tier)} text-white border-none`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Crown className="h-12 w-12" />
                  <div>
                    <h3 className="text-2xl font-bold">{membership.tier} Member</h3>
                    <p className="opacity-90">
                      {getMembershipDiscount(membership.tier)}% discount on all products
                    </p>
                    <p className="text-sm opacity-75 mt-1">
                      {(() => {
                        const expiry = new Date(membership.expiryDate);
                        const isLifetime = (membership as any).lifetime === true || expiry.getFullYear() >= 9999;
                        return `Expires: ${isLifetime ? 'Lifetime' : expiry.toLocaleDateString()}`;
                      })()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-white text-green-700 hover:bg-gray-100">
                  Active
                </Badge>
              </div>

              {/* Auto-Renew Toggle */}
              {(membership as any).lifetime !== true && (
              <div className="border-t border-white/20 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <Label htmlFor="auto-renew" className="text-white font-semibold cursor-pointer">
                        Auto-Renew Membership
                      </Label>
                    </div>
                    <p className="text-xs opacity-75 mt-1 ml-7">
                      Automatically renew your membership before it expires
                    </p>
                  </div>
                  <Switch
                    id="auto-renew"
                    checked={membership.autoRenew || false}
                    onCheckedChange={async (checked) => {
                      try {
                        const userId = (user as any)?._id || (user as any)?.id || (user as any)?.email;
                        const response = await fetch('/api/membership/toggle-autorenew', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId, autoRenew: checked }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to update auto-renew setting');
                        }

                        await refreshUser();
                        
                        toast({
                          title: checked ? "✅ Auto-Renew Enabled" : "❌ Auto-Renew Disabled",
                          description: checked 
                            ? "Your membership will automatically renew before expiry" 
                            : "Your membership will not renew automatically",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update auto-renew setting",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="data-[state=checked]:bg-green-500"
                    />
                </div>
              </div>
              )}

              {/* Membership Statistics */}
              {membershipStats?.hasActiveMembership && membershipStats.statistics && (
                <div className="border-t border-white/20 pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Membership Benefits
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs opacity-75 mb-1">Total Saved</p>
                      <p className="text-xl font-bold">{format(parseFloat(membershipStats.statistics.totalSaved))}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs opacity-75 mb-1">Exclusive Products</p>
                      <p className="text-xl font-bold">{membershipStats.statistics.exclusiveProductsPurchased}</p>
                    </div>
                  </div>
                  {membershipStats.statistics.recentExclusivePurchases && membershipStats.statistics.recentExclusivePurchases.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs opacity-75 mb-2">Recent Exclusive Purchases</p>
                      <div className="space-y-2">
                        {membershipStats.statistics.recentExclusivePurchases.slice(0, 3).map((purchase: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 bg-white/10 rounded p-2">
                            <img 
                              src={purchase.image} 
                              alt={purchase.name} 
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{purchase.name}</p>
                              <p className="text-xs opacity-75">x{purchase.quantity}</p>
                            </div>
                            <p className="text-xs font-semibold">{format(purchase.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Gift className="h-12 w-12 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Join Our Privilege Club</h3>
                    <p className="text-gray-600">
                      Get exclusive discounts, free delivery, and premium benefits
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation('/privilege-club')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-1">
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">TOTAL SPENT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">${userStats.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">TOTAL WALLET</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{format(userStats.walletBalance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-400 to-rose-500 text-white">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">TOTAL WISHLIST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{userStats.wishlistCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-1">
        <Card className="text-center">
          <CardHeader className="pb-1 sm:pb-2">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto" />
            <CardTitle className="text-xs sm:text-sm text-gray-600">DELIVERED ORDER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userStats.deliveredOrders}</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-1 sm:pb-2">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto" />
            <CardTitle className="text-xs sm:text-sm text-gray-600">PENDING ORDER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userStats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-1 sm:pb-2">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto" />
            <CardTitle className="text-xs sm:text-sm text-gray-600">PROCESSING ORDER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userStats.processingOrders}</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-1 sm:pb-2">
            <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto" />
            <CardTitle className="text-xs sm:text-sm text-gray-600">ACTIVE COUPON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userStats.activeCoupons}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-1">
        <Card className="text-center">
          <CardHeader className="pb-1 sm:pb-2">
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mx-auto" />
            <CardTitle className="text-xs sm:text-sm text-gray-600">REQUEST PRODUCT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userStats.requestedProducts}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
  }

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Orders
          </h2>
          <p className="text-sm text-gray-500 mt-1">View and manage your order history</p>
        </div>
      </div>
      <div className="space-y-4">
        {recentOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500">Your order history will appear here</p>
          </Card>
        ) : (
          recentOrders.map((order, index) => (
            <Card 
              key={order.id} 
              className="overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-gray-50"
            >
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-md ${
                      order.status === 'delivered' 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : order.status === 'processing' 
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500' 
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    }`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-500" />
                        <h3 className="font-bold text-lg text-gray-800">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(order.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge 
                      className={`${getStatusColor(order.status)} px-3 py-1.5 text-sm font-semibold shadow-sm`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </Badge>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 font-medium">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {format(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="p-5 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Order Items
                    </span>
                  </div>
                  {order.items.map((item, itemIndex) => {
                    const itemAny = item as any;
                    const isMembership = itemAny.type === 'membership' || item.name?.includes('Membership');
                    return (
                      <div 
                        key={itemIndex} 
                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isMembership ? (
                            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                              <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Quantity: <span className="font-semibold">{item.quantity}</span>
                              </span>
                              {isMembership && itemAny.duration && (
                                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                                  {itemAny.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="font-bold text-gray-900">
                            {format(item.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-5 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/invoice/${order.invoiceId || (order as any)._id || order.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                      onClick={() => {
                        console.log('Order data:', order);
                        console.log('InvoiceId:', order.invoiceId);
                        console.log('Order ID:', order.id);
                        console.log('Order _id:', (order as any)._id);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {/* Only show track order for physical product orders */}
                  {!order.items.some((item: any) => (item as any).type === 'membership') && (
                    <Link href={`/track-order/${order.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
                      >
                        <Truck className="h-4 w-4" />
                        Track Order
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteOrder(order.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const onProfileSubmit = async (data: ProfileFormData) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditingProfile(false);
    } else {
      toast({
        title: "Update Failed",
        description: result.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendPasswordChangeOtp = async () => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to change your password.",
          variant: "destructive",
        });
        return false;
      }

      const userEmail = user.email || (user as any)?.email;
      if (!userEmail) {
        toast({
          title: "Error",
          description: "Unable to identify user email. Please sign out and sign in again.",
          variant: "destructive",
        });
        return false;
      }

      setIsSendingOtp(true);
      
      // Send OTP via backend API
      const response = await fetch('/api/auth/send-password-change-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to send OTP:', {
          status: response.status,
          message: result.message,
          debug: result.debug,
          result: result
        });
        
        let errorMessage = result.message || "Failed to send verification code. Please try again later.";
        
        // Add debug info in development
        if (result.debug && import.meta.env.DEV) {
          errorMessage += `\n\nDebug: ${JSON.stringify(result.debug, null, 2)}`;
        }
        
        toast({
          title: "Failed to Send Verification Code",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSendingOtp(false);
        return false;
      }

      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the 6-digit verification code.",
      });
      
      setOtpSent(true);
      setIsSendingOtp(false);
      return true;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSendingOtp(false);
      return false;
    }
  };

  const onPasswordChange = async (data: PasswordChangeData) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to change your password.",
          variant: "destructive",
        });
        return;
      }

      const userEmail = user.email || (user as any)?.email;
      if (!userEmail) {
        toast({
          title: "Error",
          description: "Unable to identify user email. Please sign out and sign in again.",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      // Verify OTP and change password
      let response: Response;
      try {
        response = await fetch('/api/auth/verify-password-change-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            otpCode: data.otpCode,
            newPassword: data.newPassword,
          }),
        });
      } catch (fetchError: any) {
        // Handle network errors (fetch failed)
        console.error('Network error during password change:', fetchError);
        toast({
          title: "Network Error",
          description: fetchError.message?.includes('fetch') 
            ? "Unable to connect to server. Please check your internet connection and try again."
            : fetchError.message || "Network error occurred. Please try again.",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      // Try to parse response JSON
      let result: any;
      try {
        result = await response.json();
      } catch (jsonError) {
        // If response is not JSON, it might be an error
        console.error('Failed to parse response:', jsonError);
        toast({
          title: "Password Update Failed",
          description: `Server error (${response.status}). Please try again later.`,
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      if (!response.ok) {
        console.error('Password update failed:', result);
        toast({
          title: "Password Update Failed",
          description: result.message || `Failed to update password (${response.status}). Please try again.`,
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      passwordForm.reset();
      setOtpSent(false);
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsChangingPassword(false);
    }
  };

  const handleNotificationPrefChange = async (key: keyof typeof notificationPrefs, value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: value }));
    // In a real app, you would save this to the backend
    toast({
      title: "Preference Updated",
      description: `Notification preference has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Get userId from user object - try different possible fields
      const userId = (user as any)._id || (user as any).id || user.id;
      
      if (!userId) {
        console.error('User object:', user);
        throw new Error('User ID not found. Please sign in again.');
      }

      console.log('Uploading avatar for user:', userId);
      console.log('User email:', user.email);

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);
      if (user.email) {
        formData.append('userEmail', user.email);
      }

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error response:', data);
        console.error('Error details:', data.error);
        if (data.details) {
          console.error('Stack trace:', data.details);
        }
        throw new Error(data.error || data.message || 'Upload failed');
      }

      // Update local user object with new avatar URL
      const newAvatarUrl = data.avatarUrl;
      console.log('New avatar URL:', newAvatarUrl);
      console.log('Upload response:', data);
      
      // Store the avatar URL in localStorage
      const storedUser = localStorage.getItem('meow_meow_auth_user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userObj.profilePicture = newAvatarUrl;
          localStorage.setItem('meow_meow_auth_user', JSON.stringify(userObj));
          console.log('Updated user in localStorage:', userObj);
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

      // Refresh user data to show the new avatar
      if (refreshUser) {
        await refreshUser();
        console.log('User data refreshed');
      }
      
      // Force a re-render by reloading the page (simple solution)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderProfile = () => {
    const memberSince = (user as any)?.createdAt 
      ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'January 2025';
    
    const lastUpdated = (user as any)?.updatedAt 
      ? new Date((user as any).updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </h2>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
          {!isEditingProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditingProfile(true)} 
              data-testid="button-edit-profile"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Account Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-white to-blue-50/50 border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.deliveredOrders + userStats.pendingOrders + userStats.processingOrders}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-white to-pink-50/50 border-pink-200 hover:shadow-lg hover:border-pink-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-md">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.wishlistCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-white to-purple-50/50 border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Coupons</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeCoupons}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Profile Information Card */}
        <Card className="p-6 bg-gradient-to-br from-white via-gray-50/50 to-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer border-4 border-white shadow-lg" onClick={handleAvatarClick}>
                    <AvatarImage src={(user as any).profilePicture} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {user.firstName?.[0] || user.name?.[0] || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                    onClick={handleAvatarClick}
                  >
                    {isUploadingAvatar ? (
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'User'}
                  </h3>
                  {user.email && (
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm">
                      <Verified className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="truncate break-all">{user.email || ''}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                </Button>
              </div>
            </div>
            
            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            
            {isEditingProfile ? (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-firstName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-lastName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="+1 (555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting} data-testid="button-save-profile">
                      <Save className="h-4 w-4 mr-2" />
                      {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} data-testid="button-cancel-edit">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    First Name
                  </label>
                  <p className="mt-1 text-gray-900 font-medium pl-6" data-testid="text-firstName">{user.firstName || 'Not set'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Last Name
                  </label>
                  <p className="mt-1 text-gray-900 font-medium pl-6" data-testid="text-lastName">{user.lastName || 'Not set'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    Email
                  </label>
                  <div className="mt-1 flex items-center space-x-2 pl-6">
                    <p className="truncate break-all text-gray-900 font-medium" data-testid="text-email">{user.email || ''}</p>
                    {user.email && (
                      <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 text-xs shadow-sm">
                        <Verified className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Phone Number
                  </label>
                  <p className="mt-1 text-gray-900 font-medium pl-6">{(user as any)?.phone || 'Not set'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Member Since
                  </label>
                  <p className="mt-1 flex items-center text-gray-900 font-medium pl-6">
                    {memberSince}
                  </p>
                </div>
                {lastUpdated && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-500" />
                      Last Updated
                    </label>
                    <p className="mt-1 flex items-center text-gray-900 font-medium pl-6">
                      {lastUpdated}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Account Security Card */}
        <Card className="p-6 bg-gradient-to-br from-white via-gray-50/50 to-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Account Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed: Recently</p>
                </div>
              </div>
              <Dialog open={isChangingPassword} onOpenChange={(open) => {
                setIsChangingPassword(open);
                if (!open) {
                  setOtpSent(false);
                  passwordForm.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      {!otpSent 
                        ? "We'll send a verification code to your email to confirm your identity."
                        : "Enter the verification code and your new password below."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">How it works:</p>
                            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                              <li>Click the button below to receive a verification code</li>
                              <li>Check your email inbox for the 6-digit code</li>
                              <li>Enter the code and your new password</li>
                              <li>Your password will be updated immediately</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center py-4">
                        {isSendingOtp ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meow-yellow mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Sending verification code...</p>
                          </div>
                        ) : (
                          <Button 
                            type="button" 
                            onClick={sendPasswordChangeOtp}
                            disabled={isSendingOtp}
                            className="w-full"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Verification Code
                          </Button>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsChangingPassword(false);
                          setOtpSent(false);
                          passwordForm.reset();
                        }}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="otpCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Code</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="text"
                                  placeholder="Enter 6-digit code"
                                  maxLength={6}
                                  className="text-center text-2xl tracking-widest"
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="flex items-center justify-between text-sm">
                                <p className="text-gray-500">Check your email for the code</p>
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={sendPasswordChangeOtp}
                                  disabled={isSendingOtp}
                                >
                                  {isSendingOtp ? "Sending..." : "Resend Code"}
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    {...field} 
                                    type={showNewPassword ? "text" : "password"} 
                                    placeholder="Enter new password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                  >
                                    {showNewPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    {...field} 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm new password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => {
                            setIsChangingPassword(false);
                            setOtpSent(false);
                            passwordForm.reset();
                          }}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                            {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card className="p-6 bg-gradient-to-br from-white via-gray-50/50 to-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.email}
                onCheckedChange={(checked) => handleNotificationPrefChange('email', checked)}
              />
            </div>
            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50/50 rounded-lg border border-gray-200 hover:border-green-300 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via SMS</p>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.sms}
                onCheckedChange={(checked) => handleNotificationPrefChange('sms', checked)}
              />
            </div>
            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive browser notifications</p>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.push}
                onCheckedChange={(checked) => handleNotificationPrefChange('push', checked)}
              />
            </div>
            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-pink-50/50 rounded-lg border border-gray-200 hover:border-pink-300 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Gift className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                </div>
              </div>
              <Switch
                checked={notificationPrefs.marketing}
                onCheckedChange={(checked) => handleNotificationPrefChange('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Color Picker Card */}
        <ThemeColorPicker />
      </div>
    );
  }

  const renderWishlist = () => {
    if (wishlistItems.length === 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <Card className="p-12">
            <div className="text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Save items you love so you don't lose sight of them!</p>
              <Button onClick={() => setLocation('/products')} className="bg-[#26732d] hover:bg-[#1e5d26]">
                Browse Products
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              clearWishlist()
              toast({
                title: "Wishlist cleared",
                description: "All items have been removed from your wishlist.",
              })
            }}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => {
                      removeFromWishlist(item.id)
                      toast({
                        title: "Removed from wishlist",
                        description: `${item.name} has been removed.`,
                      })
                    }}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-white transition-all"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-[#26732d] font-bold text-lg mb-4">{format(item.price)}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          maxStock: 100,
                        })
                        toast({
                          title: "Added to cart",
                          description: `${item.name} has been added to your cart.`,
                        })
                      }}
                      className="flex-1 bg-[#26732d] hover:bg-[#1e5d26]"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    {item.slug && (
                      <Link href={`/product/${item.slug}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderRequests = () => {
    const getRequestTypeLabel = (type: Request['type']) => {
      const labels = {
        product_inquiry: 'Product Inquiry',
        return_refund: 'Return/Refund',
        custom_order: 'Custom Order',
        complaint: 'Complaint',
        other: 'Other'
      }
      return labels[type]
    }

    const getRequestTypeIcon = (type: Request['type']) => {
      switch (type) {
        case 'product_inquiry': return <Package className="h-4 w-4" />
        case 'return_refund': return <RefreshCw className="h-4 w-4" />
        case 'custom_order': return <Sparkles className="h-4 w-4" />
        case 'complaint': return <AlertTriangle className="h-4 w-4" />
        case 'other': return <FileText className="h-4 w-4" />
      }
    }

    const getStatusColor = (status: Request['status']) => {
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
        resolved: 'bg-green-100 text-green-800 border-green-300',
        closed: 'bg-gray-100 text-gray-800 border-gray-300'
      }
      return colors[status]
    }

    const getStatusIcon = (status: Request['status']) => {
      switch (status) {
        case 'pending': return <Clock className="h-4 w-4" />
        case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />
        case 'resolved': return <CheckCircle className="h-4 w-4" />
        case 'closed': return <XCircle className="h-4 w-4" />
      }
    }

    const getPriorityColor = (priority: Request['priority']) => {
      const colors = {
        low: 'bg-gray-100 text-gray-800 border-gray-300',
        medium: 'bg-orange-100 text-orange-800 border-orange-300',
        high: 'bg-red-100 text-red-800 border-red-300'
      }
      return colors[priority]
    }

    // Statistics
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
    }

    const handleCreateRequest = async () => {
      if (!newRequestSubject.trim() || !newRequestDescription.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in both subject and description.",
          variant: "destructive",
        })
        return
      }

      // Use the same canonical userId logic as fetch to ensure persistence under one id
      const canonicalUserId = String((user as any)?._id || user?.id || (user as any)?.userId || '');
      
      if (!canonicalUserId) {
        toast({
          title: "Authentication Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      try {
        const requestData = {
          userId: canonicalUserId,
          type: selectedRequestType,
          subject: newRequestSubject,
          description: newRequestDescription,
          priority: 'medium'
        };

        console.log('Creating request with data:', requestData);

        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestData)
        })

        console.log('Response status:', response.status);

        if (response.ok) {
          const newRequest = await response.json()
          console.log('Request created:', newRequest);
          setRequests(prev => [newRequest, ...prev])
          setNewRequestSubject('')
          setNewRequestDescription('')
          setIsNewRequestDialogOpen(false)
          toast({
            title: "Request Created",
            description: "Your request has been submitted successfully.",
          })
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to create request')
        }
      } catch (error) {
        console.error('Error creating request:', error)
        toast({
          title: "Failed to Create Request",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        })
      }
    }

    const handleDeleteRequest = async (requestId: string) => {
      if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
      }

      try {
        const response = await fetch(`/api/requests/${requestId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // Remove request from local state
          setRequests(prev => prev.filter(req => req._id !== requestId));
          toast({
            title: "Request Deleted",
            description: "The request has been deleted successfully.",
          });
        } else {
          throw new Error('Failed to delete request');
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete the request. Please try again.",
          variant: "destructive",
        });
      }
    }

    // Filter and search
    let filteredRequests = filterStatus === 'all' 
      ? requests 
      : requests.filter(req => req.status === filterStatus)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredRequests = filteredRequests.filter(req => 
        req.subject.toLowerCase().includes(query) ||
        req.description.toLowerCase().includes(query) ||
        req._id.toLowerCase().includes(query)
      )
    }

    return (
      <div className="space-y-6">
        {/* Header with Title and New Request Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#26732d] to-[#1e5d26] bg-clip-text text-transparent">
              Track Requests
            </h2>
            <p className="text-gray-600 mt-1">Manage and track your service requests</p>
          </div>
          <Dialog open={isNewRequestDialogOpen} onOpenChange={setIsNewRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] hover:from-[#1e5d26] hover:to-[#26732d] shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#26732d] to-[#1e5d26] bg-clip-text text-transparent">
                  Create New Request
                </DialogTitle>
                <p className="text-gray-600 mt-2">Fill in the details below and we'll get back to you as soon as possible.</p>
              </DialogHeader>
              <div className="space-y-6 py-6">
                {/* Request Type Selection with Icons */}
                <div>
                  <Label htmlFor="request-type" className="text-base font-semibold mb-3 block">Request Type</Label>
                  <Select value={selectedRequestType} onValueChange={(value) => setSelectedRequestType(value as Request['type'])}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_inquiry" className="py-3">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-blue-600" />
                          <div className="text-left">
                            <div className="font-semibold">Product Inquiry</div>
                            <div className="text-xs text-gray-500">Questions about products</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="return_refund" className="py-3">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-5 w-5 text-orange-600" />
                          <div className="text-left">
                            <div className="font-semibold">Return/Refund</div>
                            <div className="text-xs text-gray-500">Return or refund requests</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom_order" className="py-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <div className="text-left">
                            <div className="font-semibold">Custom Order</div>
                            <div className="text-xs text-gray-500">Special or custom orders</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="complaint" className="py-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div className="text-left">
                            <div className="font-semibold">Complaint</div>
                            <div className="text-xs text-gray-500">Report an issue</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="other" className="py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div className="text-left">
                            <div className="font-semibold">Other</div>
                            <div className="text-xs text-gray-500">General inquiries</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Input */}
                <div>
                  <Label htmlFor="subject" className="text-base font-semibold mb-3 block">Subject</Label>
                  <Input
                    id="subject"
                    value={newRequestSubject}
                    onChange={(e) => setNewRequestSubject(e.target.value)}
                    placeholder="Brief summary of your request"
                    className="h-12 text-base"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <Label htmlFor="description" className="text-base font-semibold mb-3 block">Description</Label>
                  <Textarea
                    id="description"
                    value={newRequestDescription}
                    onChange={(e) => setNewRequestDescription(e.target.value)}
                    placeholder="Provide detailed information about your request. Include any relevant order numbers, product names, or specific concerns..."
                    rows={8}
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {newRequestDescription.length} characters
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <p>Your request will be reviewed by our team. We typically respond within 24-48 hours. You'll be notified via email when there's an update.</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsNewRequestDialogOpen(false)} className="px-6">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest} 
                  className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] hover:from-[#1e5d26] hover:to-[#26732d] px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-l-4 border-l-gray-500" onClick={() => setFilterStatus('all')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-l-4 border-l-yellow-500" onClick={() => setFilterStatus('pending')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-l-4 border-l-blue-500" onClick={() => setFilterStatus('in_progress')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-700 mt-2">{stats.inProgress}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-l-4 border-l-green-500" onClick={() => setFilterStatus('resolved')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">{stats.resolved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject, description, or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-[#26732d] hover:bg-[#1e5d26]' : ''}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
                className={filterStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in_progress')}
                className={filterStatus === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
                className={filterStatus === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Resolved
              </Button>
            </div>
          </div>
        </Card>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-12 bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#26732d] to-[#1e5d26] rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {filterStatus === 'all' ? 'No Requests Yet' : 'No Matching Requests'}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {filterStatus === 'all' 
                  ? "Start by creating your first request. We're here to help with product inquiries, returns, custom orders, and more!" 
                  : searchQuery 
                    ? `No requests match your search "${searchQuery}". Try different keywords or clear the search.`
                    : `You don't have any ${filterStatus.replace('_', ' ')} requests at the moment.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setIsNewRequestDialogOpen(true)} 
                  className="bg-gradient-to-r from-[#26732d] to-[#1e5d26] hover:from-[#1e5d26] hover:to-[#26732d] shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </Button>
                {(searchQuery || filterStatus !== 'all') && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4" style={{
                borderLeftColor: request.status === 'pending' ? '#eab308' : 
                                 request.status === 'in_progress' ? '#3b82f6' : 
                                 request.status === 'resolved' ? '#22c55e' : '#6b7280'
              }}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left Section - Main Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header with Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${getStatusColor(request.status)} border flex items-center gap-1.5 px-3 py-1`}>
                          {getStatusIcon(request.status)}
                          <span className="font-semibold">{request.status.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 border-2">
                          {getRequestTypeIcon(request.type)}
                          <span>{getRequestTypeLabel(request.type)}</span>
                        </Badge>
                        <Badge className={`${getPriorityColor(request.priority)} border flex items-center gap-1.5 px-3 py-1`}>
                          <AlertTriangle className="h-3 w-3" />
                          <span className="font-semibold">{request.priority.toUpperCase()} PRIORITY</span>
                        </Badge>
                      </div>

                      {/* Subject */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{request.subject}</h3>
                        <p className="text-gray-600 leading-relaxed">{request.description}</p>
                      </div>

                      {/* Response Section */}
                      {request.response && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-green-900 text-lg mb-2">Admin Response</p>
                              <p className="text-green-800 leading-relaxed">{request.response}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Order */}
                      {request.orderId && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700">Related Order:</span>
                          <span className="font-semibold text-blue-900">{request.orderId}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Metadata & Actions */}
                    <div className="lg:w-48 flex lg:flex-col justify-between lg:justify-start gap-4">
                      {/* Request Info Card */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 flex-1 lg:flex-initial">
                        <div className="text-center lg:text-left">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Request ID</p>
                          <p className="text-lg font-bold text-gray-900 font-mono">#{request._id.slice(-6)}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {new Date(request.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(request.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex lg:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request._id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderAddress = () => {
    // Helper functions to convert codes to names for display
    const getCountryName = (code: string) => {
      const country = getCountryByCode(code);
      return country ? country.name : code;
    };

    const getStateName = (countryCode: string, stateCode: string) => {
      const state = getStateByCode(countryCode, stateCode);
      return state ? state.name : stateCode;
    };

    const handleOpenAddressDialog = (address?: Address) => {
      if (address) {
        setEditingAddress(address)
        
        // Helper to find province/state code from name
        const findProvinceCode = (countryCode: string, provinceName: string) => {
          const states = getStatesByCountry(countryCode);
          const state = states.find(s => 
            s.name.toLowerCase() === provinceName.toLowerCase() ||
            s.code === provinceName
          );
          return state ? state.code : provinceName;
        };
        
        const findCityCode = (countryCode: string, provinceCode: string, cityName: string) => {
          const cities = getCitiesByState(countryCode, provinceCode);
          const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
          return city ? city.name : cityName;
        };
        
        // Use region or province field (backward compatible)
        const provinceCode = address.province || address.region
          ? findProvinceCode(address.country, address.province || address.region || '')
          : '';
          
        const cityCode = address.city && provinceCode
          ? findCityCode(address.country, provinceCode, address.city)
          : address.city;
        
        setAddressForm({
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: cityCode,
          province: provinceCode,
          postCode: address.postCode,
          country: address.country,
          isDefault: address.isDefault,
          label: address.label || 'Home'
        })
      } else {
        setEditingAddress(null)
        setAddressForm({
          fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
          phone: user?.phone || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          province: '',
          postCode: '',
          country: 'HK', // Hong Kong country code
          isDefault: addresses.length === 0,
          label: 'Home'
        })
      }
      setIsAddressDialogOpen(true)
    }

    const handleSaveAddress = async () => {
      // Get userId consistently - same logic as in useEffect
      const userId = String((user as any)?._id || (user as any)?.id || user?.id || '');

      if (!userId || userId === 'undefined' || userId === 'null') {
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.postCode || !addressForm.country || !addressForm.province) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields (Country, Region/Province, City, etc.).",
          variant: "destructive",
        })
        return
      }

      try {
        const url = editingAddress 
          ? `/api/addresses/${editingAddress._id}` 
          : '/api/addresses'
        
        const method = editingAddress ? 'PUT' : 'POST'
        
        // Save province to both region and province fields for compatibility
        const addressData = {
          userId,
          ...addressForm,
          region: addressForm.province // For backward compatibility
        };
        
        console.log('Saving address:', { url, method, addressData })
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addressData)
        })

        console.log('Response status:', response.status)

        if (response.ok) {
          const savedAddress = await response.json()
          console.log('Saved address:', savedAddress)
          
          if (editingAddress) {
            setAddresses(prev => prev.map(addr => 
              addr._id === savedAddress._id ? savedAddress : addr
            ))
          } else {
            setAddresses(prev => [savedAddress, ...prev])
          }

          toast({
            title: editingAddress ? "Address Updated" : "Address Added",
            description: `Your address has been ${editingAddress ? 'updated' : 'saved'} successfully.`,
          })
          
          setIsAddressDialogOpen(false)
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Server error:', errorData)
          throw new Error(errorData.message || 'Failed to save address')
        }
      } catch (error) {
        console.error('Error saving address:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save address. Please try again.",
          variant: "destructive",
        })
      }
    }

    const handleDeleteAddress = async (addressId: string) => {
      if (!window.confirm('Are you sure you want to delete this address?')) {
        return
      }

      try {
        const response = await fetch(`/api/addresses/${addressId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (response.ok) {
          setAddresses(prev => prev.filter(addr => addr._id !== addressId))
          toast({
            title: "Address Deleted",
            description: "The address has been deleted successfully.",
          })
        } else {
          throw new Error('Failed to delete address')
        }
      } catch (error) {
        console.error('Error deleting address:', error)
        toast({
          title: "Error",
          description: "Failed to delete address. Please try again.",
          variant: "destructive",
        })
      }
    }

    const handleSetDefaultAddress = async (addressId: string) => {
      try {
        const response = await fetch(`/api/addresses/${addressId}/set-default`, {
          method: 'PUT',
          credentials: 'include',
        })

        if (response.ok) {
          const updatedAddress = await response.json()
          setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr._id === updatedAddress._id
          })))
          toast({
            title: "Default Address Updated",
            description: "This address has been set as your default.",
          })
        } else {
          throw new Error('Failed to set default address')
        }
      } catch (error) {
        console.error('Error setting default address:', error)
        toast({
          title: "Error",
          description: "Failed to set default address. Please try again.",
          variant: "destructive",
        })
      }
    }

    const getLabelIcon = (label: string) => {
      switch (label) {
        case 'Home':
          return <Home className="h-4 w-4" />
        case 'Work':
          return <Building2 className="h-4 w-4" />
        default:
          return <MapPin className="h-4 w-4" />
      }
    }

    const getLabelColor = (label: string) => {
      switch (label) {
        case 'Home':
          return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'Work':
          return 'bg-purple-50 text-purple-700 border-purple-200'
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200'
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">My Addresses</h2>
            <p className="text-sm text-gray-500">Manage your delivery addresses</p>
          </div>
          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenAddressDialog()}
                className="bg-[#26732d] hover:bg-[#1e5d26] shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="Street address, building, floor, unit"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                    placeholder="Additional address details (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <select
                      id="country"
                      className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[#26732d] focus:ring-[#26732d] bg-white"
                      value={addressForm.country}
                      onChange={(e) => {
                        setAddressForm(prev => ({
                          ...prev,
                          country: e.target.value,
                          province: '',
                          city: ''
                        }));
                      }}
                    >
                      <option value="">Select Country</option>
                      {getAllCountries().map(country => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="province">State/Province *</Label>
                    {(() => {
                      const states = addressForm.country ? getStatesByCountry(addressForm.country) : [];
                      
                      // If no states available, show text input
                      if (states.length === 0 && addressForm.country) {
                        return (
                          <div>
                            <Input
                              id="province"
                              value={addressForm.province}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, province: e.target.value, city: '' }))}
                              placeholder="Enter state/province/region"
                              className="mt-1 border-gray-300 focus:border-[#26732d] focus:ring-[#26732d]"
                            />
                            <p className="text-xs text-gray-500 mt-1">Please enter your state/province manually</p>
                          </div>
                        );
                      }
                      
                      // Otherwise show select dropdown
                      return (
                        <select
                          id="province"
                          className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[#26732d] focus:ring-[#26732d] bg-white"
                          value={addressForm.province}
                          onChange={(e) => {
                            setAddressForm(prev => ({
                              ...prev,
                              province: e.target.value,
                              city: ''
                            }));
                          }}
                          disabled={!addressForm.country}
                        >
                          <option value="">Select State/Province</option>
                          {states.map(state => (
                            <option key={state.code} value={state.code}>{state.name}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>

                  <div>
                    <Label htmlFor="city">City/District *</Label>
                    {(() => {
                      // Check if country has states
                      const states = addressForm.country ? getStatesByCountry(addressForm.country) : [];
                      const hasStatesData = states.length > 0;
                      
                      // If country has no states data, always show text input
                      if (!hasStatesData && addressForm.country) {
                        return (
                          <div>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="Enter city/district name"
                              className="mt-1 border-gray-300 focus:border-[#26732d] focus:ring-[#26732d]"
                            />
                            <p className="text-xs text-gray-500 mt-1">Please enter your city/district name manually</p>
                          </div>
                        );
                      }
                      
                      // If country has states, check if selected state has cities
                      const cities = addressForm.province && addressForm.country 
                        ? getCitiesByState(addressForm.country, addressForm.province)
                        : [];
                      
                      // If no cities available for selected state, show text input
                      if (cities.length === 0 && addressForm.province) {
                        return (
                          <div>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="Enter city/district name"
                              className="mt-1 border-gray-300 focus:border-[#26732d] focus:ring-[#26732d]"
                            />
                            <p className="text-xs text-gray-500 mt-1">Please enter your city/district name manually</p>
                          </div>
                        );
                      }
                      
                      // Otherwise show select dropdown
                      return (
                        <select
                          id="city"
                          className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:border-[#26732d] focus:ring-[#26732d] bg-white"
                          value={addressForm.city}
                          onChange={(e) => {
                            setAddressForm(prev => ({
                              ...prev,
                              city: e.target.value
                            }));
                          }}
                          disabled={!addressForm.province}
                        >
                          <option value="">Select City/District</option>
                          {cities.map(city => (
                            <option key={city.name} value={city.name}>{city.name}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postCode">Post Code *</Label>
                    <Input
                      id="postCode"
                      value={addressForm.postCode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, postCode: e.target.value }))}
                      placeholder="Post code"
                    />
                  </div>

                  <div>
                    <Label htmlFor="label">Address Label</Label>
                    <Select 
                      value={addressForm.label} 
                      onValueChange={(value) => setAddressForm(prev => ({ ...prev, label: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAddress} className="bg-[#26732d] hover:bg-[#1e5d26]">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card className="p-12 border-2 border-dashed border-gray-200 bg-gray-50/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <MapPin className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Add your delivery addresses for faster checkout and a smoother shopping experience</p>
              <Button 
                onClick={() => handleOpenAddressDialog()} 
                className="bg-[#26732d] hover:bg-[#1e5d26] shadow-md hover:shadow-lg transition-all duration-200 px-6 py-6 text-base"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Address
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <Card 
                key={address._id} 
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  address.isDefault 
                    ? 'border-2 border-[#26732d] shadow-md bg-gradient-to-br from-green-50/50 to-white' 
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-0 right-0 bg-[#26732d] text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Default
                  </div>
                )}
                
                <div className="p-5 pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1.5 px-3 py-1 border ${getLabelColor(address.label || 'Home')}`}
                    >
                      {getLabelIcon(address.label || 'Home')}
                      <span className="font-medium">{address.label || 'Home'}</span>
                    </Badge>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAddressDialog(address)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address._id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg mb-1">{address.fullName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{address.phone}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <p className="leading-relaxed">
                            {address.addressLine1}
                            {address.addressLine2 && <>, {address.addressLine2}</>}
                          </p>
                          <p className="text-gray-600">
                            {address.city}
                            {address.province || address.region ? (
                              <>, {getStateName(address.country, address.province || address.region || '')}</>
                            ) : null}
                            {address.postCode && <>, {address.postCode}</>}
                          </p>
                          <p className="text-gray-600 font-medium">{getCountryName(address.country)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!address.isDefault && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="w-full hover:bg-[#26732d] hover:text-white hover:border-[#26732d] transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Set as Default
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Coupons rendering
  const renderCoupons = () => {
    if (isLoadingCoupons) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26732d] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading coupons...</p>
          </div>
        </div>
      );
    }

    const availableCoupons = coupons.filter(c => c.status === 'available')
    const usedCoupons = coupons.filter(c => c.status === 'used')
    const expiredCoupons = coupons.filter(c => c.status === 'expired')

    console.log('Rendering coupons:', {
      totalCoupons: coupons.length,
      availableCount: availableCoupons.length,
      usedCount: usedCoupons.length,
      expiredCount: expiredCoupons.length,
      allCoupons: coupons.map(c => ({ code: c.code, status: c.status, _id: c._id }))
    })

    const copyCouponCode = (code: string) => {
      navigator.clipboard.writeText(code)
      toast({
        title: "Copied!",
        description: `Coupon code "${code}" copied to clipboard.`,
      })
    }

    const CouponCard = ({ coupon }: any) => {
      // Check if this is a free delivery coupon
      const isFreeDelivery = coupon.discountType === 'free_delivery';
      
      // Format discount display text from API data
      const getDiscountDisplay = () => {
        if (isFreeDelivery) {
          return 'Free Delivery';
        } else if (coupon.discountType === 'percentage') {
          return `${coupon.discountValue}%`;
        } else {
          return format(coupon.discountValue);
        }
      };
      
      const minSpend = coupon.minOrderAmount || coupon.minSpend || 0;
      const expiryDate = coupon.validUntil || coupon.expiryDate;
      const source = coupon.source || coupon.description || 'Coupon';
      
      return (
        <Card className={`relative overflow-hidden ${
          coupon.status === 'available' ? 'border-2 border-[#26732d]' : 
          coupon.status === 'used' ? 'opacity-60' : 'opacity-40'
        }`}>
          <CardContent className="p-6">
            {coupon.status === 'available' && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600">Available</Badge>
              </div>
            )}
            {coupon.status === 'used' && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">Used</Badge>
              </div>
            )}
            {coupon.status === 'expired' && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive">Expired</Badge>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${
                isFreeDelivery ? 'bg-orange-100' : 'bg-[#26732d]/10'
              }`}>
                {isFreeDelivery ? (
                  <Truck className="h-8 w-8 text-orange-600" />
                ) : (
                  <Gift className="h-8 w-8 text-[#26732d]" />
                )}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  isFreeDelivery ? 'text-orange-600' : 'text-[#26732d]'
                }`}>
                  {isFreeDelivery ? (
                    <span className="text-base">Free Delivery</span>
                  ) : (
                    coupon.discount || getDiscountDisplay()
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  {isFreeDelivery ? 'VOUCHER' : 'OFF'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                <code className="font-mono font-bold text-lg">{coupon.code}</code>
                {coupon.status === 'available' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCouponCode(coupon.code)}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="text-sm space-y-1">
                {isFreeDelivery ? (
                  <>
                    <p className="text-gray-600">• Type: Free Delivery Voucher</p>
                    <p className="text-gray-600">• Apply at checkout for free shipping</p>
                    <p className="text-gray-600">• Valid until: {new Date(expiryDate).toLocaleDateString()}</p>
                  </>
                ) : (
                  <>
                    {minSpend > 0 && (
                      <p className="text-gray-600">• Min. spend: {format(minSpend)}</p>
                    )}
                    <p className="text-gray-600">• Valid until: {new Date(expiryDate).toLocaleDateString()}</p>
                  </>
                )}
                {source && <p className="text-gray-600">• Source: {source}</p>}
                {coupon.usageLimit && (
                  <p className="text-gray-600">• Usage: {coupon.usedCount || 0} / {coupon.usageLimit}</p>
                )}
              </div>
            </div>

            {coupon.status === 'available' && (
              <Button 
                type="button"
                className={`w-full ${
                  isFreeDelivery 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-[#26732d] hover:bg-[#1e5d26]'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  copyCouponCode(coupon.code)
                  setLocation('/')
                }}
              >
                Use Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Coupons</h2>
          <Badge className="bg-[#26732d]">{availableCoupons.length} Available</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold">{availableCoupons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Used</p>
                  <p className="text-2xl font-bold">{usedCoupons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold">{expiredCoupons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Coupons */}
        {availableCoupons.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#26732d]" />
              Available Coupons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCoupons.map(coupon => (
                <CouponCard key={coupon._id || coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        )}

        {/* Used Coupons */}
        {usedCoupons.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Used Coupons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usedCoupons.map(coupon => (
                <CouponCard key={coupon._id || coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              How to Get More Coupons?
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Refer friends and earn reward coupons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Redeem your reward points for coupons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Subscribe to newsletters for exclusive coupons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Join our savings plan for monthly coupons
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Reward Points rendering
  const renderRewards = () => {
    const redeemOptions = [
      { id: 1, title: '$10 Coupon', points: 200, discount: 10, icon: Gift, color: 'blue' },
      { id: 2, title: '$20 Coupon', points: 400, discount: 20, icon: Gift, color: 'green' },
      { id: 3, title: '$50 Coupon', points: 1000, discount: 50, icon: Gift, color: 'purple' },
      { id: 4, title: 'Free Delivery', points: 150, benefit: 'Free delivery on next order', icon: Truck, color: 'orange' },
    ]

    const handleRedeem = async (option: any) => {
      if (pointsBalance < option.points) {
        toast({
          title: "Insufficient Points",
          description: `You need ${option.points - pointsBalance} more points to redeem this reward.`,
          variant: "destructive",
        })
        return
      }

      // Deduct points from balance
      setPointsBalance(prev => prev - option.points)

      // Add redemption to history
      const newHistoryEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        action: `Redeemed for ${option.title}`,
        points: -option.points,
        type: 'redeemed' as const
      }
      setPointsHistory(prev => [newHistoryEntry, ...prev])

      // Generate coupon code
      const couponCode = option.discount 
        ? `REWARD${option.discount}${Date.now().toString().slice(-4)}`
        : `FREEDEL${Date.now().toString().slice(-4)}`

      try {
        // Create real coupon in database via API
        const validFrom = new Date(Date.now() - 60 * 1000) // 1 minute ago to ensure immediate availability
        const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days

        // Determine coupon type - free delivery or fixed discount
        const isFreeDelivery = !option.discount
        
        const couponData = {
          code: couponCode,
          description: `Points Redemption - ${option.title}`,
          discountType: isFreeDelivery ? 'free_delivery' : 'fixed',
          discountValue: option.discount || 10, // $10 value for free delivery
          minOrderAmount: option.discount ? option.discount * 2 : 0,
          validFrom: validFrom.toISOString(),
          validUntil: validUntil.toISOString(),
          isActive: true,
          usageLimit: 1, // One-time use for redemption coupons
        }

        console.log('Creating coupon with data:', couponData)
        
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData),
        })

        console.log('Coupon creation response:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Coupon creation failed:', errorData)
          throw new Error(errorData.message || 'Failed to create coupon')
        }

        const createdCoupon = await response.json()
        console.log('Coupon created successfully:', createdCoupon)

        // Refresh coupons list to show the newly created coupon
        console.log('Refetching coupons...')
        const refetchResult = await refetchCoupons()
        console.log('Coupons refetched, new count:', refetchResult.data?.length)

        toast({
          title: "Reward Redeemed! 🎉",
          description: `You've successfully redeemed ${option.title}. Coupon code "${couponCode}" has been added to My Coupons.`,
        })

        // Auto-switch to coupons tab
        console.log('Switching to coupons tab...')
        setTimeout(() => {
          handleSectionChange('coupons')
          console.log('Active section set to coupons')
        }, 1500)
      } catch (error) {
        console.error('Error creating coupon:', error)
        toast({
          title: "Error",
          description: "Failed to create coupon. Please try again.",
          variant: "destructive",
        })
        // Restore points on error
        setPointsBalance(prev => prev + option.points)
        // Remove history entry on error
        setPointsHistory(prev => prev.filter(entry => entry.id !== newHistoryEntry.id))
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reward Points</h2>
        </div>

        {/* Points Balance Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">Your Points Balance</p>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-5xl font-bold">{pointsBalance.toLocaleString()}</h1>
                  <Star className="h-8 w-8 fill-current" />
                </div>
                <p className="text-sm opacity-75 mt-2">Earn more points to unlock exclusive rewards!</p>
              </div>
              <Award className="h-24 w-24 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Redeem Rewards */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#26732d]" />
            Redeem Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {redeemOptions.map((option) => {
              const IconComponent = option.icon
              const canRedeem = pointsBalance >= option.points
              const colorClasses = {
                blue: 'from-blue-400 to-blue-600',
                green: 'from-green-400 to-green-600',
                purple: 'from-purple-400 to-purple-600',
                orange: 'from-orange-400 to-orange-600'
              }

              return (
                <Card key={option.id} className={`${!canRedeem ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClasses[option.color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">{option.title}</h4>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-[#26732d]">{option.points}</span>
                      <span className="text-sm text-gray-500">pts</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-[#26732d] hover:bg-[#1e5d26]"
                      disabled={!canRedeem}
                      onClick={() => handleRedeem(option)}
                    >
                      {canRedeem ? 'Redeem' : 'Need More'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Points History */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Points History</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {pointsHistory.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          record.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {record.type === 'earned' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <Gift className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{record.action}</p>
                          <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        record.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'earned' ? '+' : ''}{record.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Earn Points */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5" />
              How to Earn More Points?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <ShoppingBag className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Shop & Earn</p>
                  <p className="text-xs">Get 1 point for every $1 spent</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Refer Friends</p>
                  <p className="text-xs">Earn 500 points per referral</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Newsletter Subscription</p>
                  <p className="text-xs">Get 100 bonus points</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Daily Check-in</p>
                  <p className="text-xs">Earn 10 points daily</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Refer a Friend rendering
  const renderRefer = () => {
    const userId = (user as any)?._id || user?.id || 'USER123'
    const referralCode = `PAW${userId.toString().slice(-6).toUpperCase()}`
    const referralLink = `${window.location.origin}/sign-up?ref=${referralCode}`
    
    const completedReferrals = referrals.filter(r => r.status === 'completed')
    const pendingReferrals = referrals.filter(r => r.status === 'pending')

    const copyReferralLink = () => {
      navigator.clipboard.writeText(referralLink)
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
      })
    }

    const shareViaEmail = () => {
      const subject = encodeURIComponent("Join PawCart Pet Shop and Save!")
      const body = encodeURIComponent(
        `Hey! I love shopping at PawCart Pet Shop for all my pet supplies. Use my referral link to sign up and we both get rewards!\n\n${referralLink}\n\nYou'll get:\n- $10 welcome coupon\n- 100 bonus points\n- Free delivery on first order\n\nHappy shopping! 🐾`
      )
      window.open(`mailto:?subject=${subject}&body=${body}`)
    }

    const handleInviteFriend = () => {
      if (!inviteEmail.trim()) {
        toast({
          title: "Email Required",
          description: "Please enter your friend's email address.",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(inviteEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        })
        return
      }

      // Add to pending referrals
      const newReferral = {
        id: Date.now(),
        name: 'Pending',
        email: inviteEmail,
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        reward: 'Pending registration'
      }
      setReferrals(prev => [newReferral, ...prev])
      setInviteEmail('')

      toast({
        title: "Invitation Sent! 📧",
        description: `Invitation sent to ${inviteEmail}. You'll get 500 points + $20 coupon when they make their first purchase.`,
      })
    }

    const simulateReferralComplete = async (referralId: number) => {
      // Simulate friend completing purchase - add rewards
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'completed' as const, reward: '500 points + $20 coupon', name: ref.name === 'Pending' ? 'New Customer' : ref.name }
          : ref
      ))

      // Add 500 points
      setPointsBalance(prev => prev + 500)

      // Add to points history
      const newHistoryEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        action: 'Referred friend completed purchase',
        points: 500,
        type: 'earned' as const
      }
      setPointsHistory(prev => [newHistoryEntry, ...prev])

      // Generate coupon code
      const couponCode = `REFERRAL${Date.now().toString().slice(-4)}`

      try {
        // Create real $20 referral coupon in database
        const validFrom = new Date(Date.now() - 60 * 1000)
        const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

        const couponData = {
          code: couponCode,
          description: 'Referral Reward - $20 Off',
          discountType: 'fixed',
          discountValue: 20,
          minOrderAmount: 150,
          validFrom: validFrom.toISOString(),
          validUntil: validUntil.toISOString(),
          isActive: true,
          usageLimit: 1,
        }

        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData),
        })

        if (!response.ok) {
          throw new Error('Failed to create coupon')
        }

        // Refresh coupons list
        await refetchCoupons()

        toast({
          title: "Referral Completed! 🎉",
          description: `Your friend made a purchase! +500 points and coupon "${couponCode}" added to your account.`,
        })
      } catch (error) {
        console.error('Error creating referral coupon:', error)
        toast({
          title: "Referral Completed!",
          description: `Your friend made a purchase! +500 points added.`,
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Refer a Friend</h2>
          <Badge className="bg-[#26732d]">{completedReferrals.length} Friends Referred</Badge>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Total Referrals</p>
              <p className="text-3xl font-bold">{referrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-3xl font-bold">{completedReferrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <Star className="h-8 w-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Total Earned</p>
              <p className="text-3xl font-bold">{completedReferrals.length * 500} pts</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="border-2 border-[#26732d]">
          <CardHeader className="bg-[#26732d]/5">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#26732d]" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your unique referral code:</p>
              <div className="flex items-center justify-between">
                <code className="font-mono font-bold text-2xl text-[#26732d]">{referralCode}</code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode)
                    toast({ title: "Code Copied!", description: "Referral code copied to clipboard." })
                  }}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm bg-white"
                />
                <Button
                  size="sm"
                  onClick={copyReferralLink}
                  className="bg-[#26732d] hover:bg-[#1e5d26] flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={shareViaEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
              <Button
                onClick={() => {
                  const message = `Join PawCart Pet Shop! Use code ${referralCode} to get rewards: ${referralLink}`
                  if (navigator.share) {
                    navigator.share({ title: 'Join PawCart', text: message })
                  } else {
                    navigator.clipboard.writeText(message)
                    toast({ title: "Copied!", description: "Share message copied to clipboard." })
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Quick Invite */}
            <div className="pt-4 border-t">
              <Label htmlFor="invite-email" className="text-sm font-semibold mb-2 block">
                Quick Invite by Email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInviteFriend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleInviteFriend}
                  className="bg-[#26732d] hover:bg-[#1e5d26]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Send a referral invitation directly to your friend's email
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Referral Rewards
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-200 p-2 rounded-full">
                  <Users className="h-4 w-4 text-yellow-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">For You</p>
                  <p className="text-sm text-yellow-800">• 500 reward points</p>
                  <p className="text-sm text-yellow-800">• $20 coupon code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-yellow-200 p-2 rounded-full">
                  <Gift className="h-4 w-4 text-yellow-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">For Your Friend</p>
                  <p className="text-sm text-yellow-800">• $10 welcome coupon</p>
                  <p className="text-sm text-yellow-800">• 100 bonus points</p>
                  <p className="text-sm text-yellow-800">• Free delivery on first order</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Referral History</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {referrals.map((referral) => (
                  <div key={referral.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#26732d] text-white">
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-gray-500">{referral.email}</p>
                          <p className="text-xs text-gray-400">{new Date(referral.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <Badge className={referral.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {referral.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{referral.reward}</p>
                        </div>
                        {referral.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => simulateReferralComplete(referral.id)}
                            className="text-xs"
                            title="Simulate friend completing purchase (for demo)"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Newsletters rendering
  const renderNewsletters = () => {
    const handleSubscriptionToggle = async () => {
      const wasSubscribed = isSubscribed
      setIsSubscribed(!isSubscribed)
      
      // If subscribing, add points and coupon
      if (!wasSubscribed) {
        // Add 100 bonus points
        setPointsBalance(prev => prev + 100)
        
        // Add to points history
        const newHistoryEntry = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          action: 'Newsletter subscription',
          points: 100,
          type: 'earned' as const
        }
        setPointsHistory(prev => [newHistoryEntry, ...prev])
        
        // Generate coupon code
        const couponCode = `NEWSLETTER${Date.now().toString().slice(-4)}`
        
        try {
          // Create real $5 welcome coupon in database
          const validFrom = new Date(Date.now() - 60 * 1000)
          const validUntil = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days

          const couponData = {
            code: couponCode,
            description: 'Newsletter Subscription - Welcome Bonus',
            discountType: 'fixed',
            discountValue: 5,
            minOrderAmount: 50,
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
            isActive: true,
            usageLimit: 1,
          }

          const response = await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponData),
          })

          if (!response.ok) {
            throw new Error('Failed to create coupon')
          }

          // Refresh coupons list
          await refetchCoupons()

          toast({
            title: "Subscribed! 🎉",
            description: `Welcome back! +100 points and coupon code "${couponCode}" added to your account.`,
          })
        } catch (error) {
          console.error('Error creating newsletter coupon:', error)
          toast({
            title: "Subscribed! 🎉",
            description: `Welcome back! +100 points added.`,
          })
        }
        
        // Auto-switch to coupons after 2 seconds
        setTimeout(() => {
          handleSectionChange('coupons')
        }, 1500)
      } else {
        toast({
          title: "Unsubscribed",
          description: "You've been unsubscribed from our newsletter.",
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Newsletters</h2>
          <Badge className={isSubscribed ? "bg-green-600" : "bg-gray-400"}>
            {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </Badge>
        </div>

        {/* Subscription Card */}
        <Card className={`border-2 ${isSubscribed ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Newsletter Subscription</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Stay updated with exclusive offers, new products, and pet care tips delivered to your inbox.
                  </p>
                  {isSubscribed && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>You're currently subscribed to our newsletter</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleSubscriptionToggle}
                variant={isSubscribed ? "outline" : "default"}
                className={!isSubscribed ? "bg-[#26732d] hover:bg-[#1e5d26]" : ""}
              >
                {isSubscribed ? 'Unsubscribe' : 'Subscribe Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Benefits */}
        {!isSubscribed && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Subscribe & Get
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>100 bonus points instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>$5 welcome coupon</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Exclusive subscriber-only deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Early access to sales</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Preferences */}
        {isSubscribed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[#26732d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'promotions', label: 'Promotional emails', description: 'Special offers and discounts' },
                { key: 'newProducts', label: 'New product announcements', description: 'Be first to know about new arrivals' },
                { key: 'petCareTips', label: 'Pet care tips', description: 'Expert advice for your pets' },
                { key: 'weeklyDeals', label: 'Weekly deals digest', description: 'Best deals delivered weekly' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-xs text-gray-500">{pref.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences[pref.key as keyof typeof preferences]}
                      onChange={(e) => {
                        setPreferences(prev => ({ ...prev, [pref.key]: e.target.checked }))
                        toast({
                          title: e.target.checked ? "Enabled" : "Disabled",
                          description: `${pref.label} ${e.target.checked ? 'enabled' : 'disabled'}.`,
                        })
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Past Newsletters */}
        {isSubscribed && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Past Newsletters</h3>
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <Card key={newsletter.id} className={newsletter.read ? '' : 'border-2 border-blue-500'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${newsletter.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                          {newsletter.read ? (
                            <MailOpen className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Mail className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{newsletter.title}</h4>
                            {!newsletter.read && <Badge variant="secondary" className="text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{new Date(newsletter.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{newsletter.preview}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Wallet rendering
  const renderWallet = () => {
    const balance = wallet?.balance ?? 0
    const totalEarned = wallet?.totalEarned ?? 0
    const totalSpent = wallet?.totalSpent ?? 0

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Wallet</h2>
          <Link href="/wallet">
            <Button className="bg-green-600 hover:bg-green-700">
              <Wallet className="h-4 w-4 mr-2" />
              Open Full Wallet
            </Button>
          </Link>
        </div>

        {isWalletLoading ? (
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-green-100 text-sm mb-1">Available Balance</p>
                  <h3 className="text-4xl font-bold">{format(balance)}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-green-100 text-sm">Total Earned</p>
                  <p className="text-lg font-semibold">{format(totalEarned)}</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Total Spent</p>
                  <p className="text-lg font-semibold">{format(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/wallet/check-in')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Daily Check-in</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Sign in daily to earn rewards</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">+{format(1)}</span>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/wallet/games')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Play Games</CardTitle>
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Earn rewards by playing fun games</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">+{format(5)}</span>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ways to Earn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Daily Check-in</p>
                  <p className="text-sm text-gray-600">Sign in every day</p>
                </div>
              </div>
              <span className="font-semibold text-green-600">+{format(1)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Play Games</p>
                  <p className="text-sm text-gray-600">Fun mini-games</p>
                </div>
              </div>
              <span className="font-semibold text-purple-600">Up to {format(50)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Order Reviews</p>
                  <p className="text-sm text-gray-600">Review your purchases</p>
                </div>
              </div>
              <span className="font-semibold text-blue-600">+{format(3)}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Refer Friends</p>
                  <p className="text-sm text-gray-600">Invite and earn</p>
                </div>
              </div>
              <span className="font-semibold text-orange-600">+{format(20)}</span>
            </div>
          </CardContent>
        </Card>

        {(user as any).membership && new Date((user as any).membership.expiryDate) > new Date() && (
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <Crown className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-900 font-semibold">
              {(user as any).membership.tier.replace('_', ' ')} Member Benefits
            </AlertTitle>
            <AlertDescription className="text-yellow-800">
              You earn{' '}
              <strong>
                {(user as any).membership.tier === 'SILVER_PAW' ? '1.2x' : 
                 (user as any).membership.tier === 'GOLDEN_PAW' ? '1.5x' : '2.0x'}
              </strong>{' '}
              rewards on all wallet activities! 🎉
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Pets rendering
  const renderPets = () => {
    const speciesEmojis: Record<string, string> = {
      cat: '🐱',
      dog: '🐶',
      rabbit: '🐰',
      bird: '🦜',
      hamster: '🐹',
      other: '🐾',
    }

    const speciesLabels: Record<string, string> = {
      cat: 'Cat',
      dog: 'Dog',
      rabbit: 'Rabbit',
      bird: 'Bird',
      hamster: 'Hamster',
      other: 'Other',
    }

    const healthStatusLabels: Record<string, { label: string; color: string }> = {
      excellent: { label: 'Excellent', color: 'bg-green-500' },
      good: { label: 'Good', color: 'bg-blue-500' },
      fair: { label: 'Fair', color: 'bg-yellow-500' },
      poor: { label: 'Poor', color: 'bg-red-500' },
    }

    const recordTypeLabels: Record<string, { label: string; icon: any }> = {
      vaccination: { label: 'Vaccination', icon: Stethoscope },
      checkup: { label: 'Checkup', icon: Activity },
      medication: { label: 'Medication', icon: FileText },
      surgery: { label: 'Surgery', icon: Stethoscope },
      grooming: { label: 'Grooming', icon: Heart },
    other: { label: 'Other', icon: FileText },
    'care-plan': { label: 'Care Plan', icon: ClipboardList },
    }

    const carePlanCategoryLabels: Record<CarePlanCategory, string> = {
      nutrition: 'Nutrition',
      exercise: 'Exercise',
      grooming: 'Grooming',
      medication: 'Medication',
      wellness: 'Wellness',
      other: 'Other',
    }

    const carePlanFrequencyLabels: Record<CarePlanFrequency, string> = {
      once: 'One-time',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom Interval',
    }

    const carePlanStatusStyles: Record<PetCarePlan['status'], string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
    }

    const handleEditPet = (pet: Pet) => {
      setSelectedPet(pet)
      petForm.reset({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age,
        weight: pet.weight,
        gender: pet.gender || 'unknown',
        photo: pet.photo || '',
        birthday: pet.birthday ? formatDate(new Date(pet.birthday), 'yyyy-MM-dd') : '',
        healthStatus: pet.healthStatus || 'good',
        healthNotes: pet.healthNotes || '',
        specialNeeds: pet.specialNeeds?.join(', ') || '',
      })
      setIsEditDialogOpen(true)
    }

    const handleOpenHealthOverview = (pet: Pet) => {
      setSelectedPet(pet)
      setIsHealthOverviewOpen(true)
    }

    const handleAddHealthRecord = (pet: Pet) => {
      setSelectedPet(pet)
      healthRecordForm.reset({
        recordType: 'checkup',
        title: '',
        description: '',
        date: formatDate(new Date(), 'yyyy-MM-dd'),
        veterinarian: '',
        location: '',
        cost: undefined,
        nextDueDate: '',
        notes: '',
        weight: undefined,
        temperature: undefined,
        healthScore: undefined,
      })
      setIsHealthRecordDialogOpen(true)
    }

    const handleAddCarePlan = (pet: Pet) => {
      setSelectedPet(pet)
      carePlanForm.reset({
        title: '',
        description: '',
        category: 'wellness',
        frequency: 'once',
        customIntervalDays: undefined,
        startDate: formatDate(new Date(), 'yyyy-MM-dd'),
        reminderLeadDays: 1,
        remindersEnabled: true,
      })
      setIsCarePlanDialogOpen(true)
    }

    const handleCompleteCarePlan = (plan: PetCarePlan) => {
      if (completeCarePlanMutation.isPending) return
      completeCarePlanMutation.mutate({ petId: plan.petId, planId: plan._id })
    }

    const handleDeleteCarePlan = (plan: PetCarePlan) => {
      if (deleteCarePlanMutation.isPending) return
      if (confirm('Remove this care plan?')) {
        deleteCarePlanMutation.mutate({ petId: plan.petId, planId: plan._id })
      }
    }

    const handleDeletePet = (petId: string) => {
      if (confirm('Are you sure you want to delete this pet profile? This action cannot be undone.')) {
        deletePetMutation.mutate(petId)
      }
    }

    const onPetSubmit = (data: PetFormData) => {
      if (selectedPet) {
        updatePetMutation.mutate({ petId: selectedPet._id, data })
      } else {
        createPetMutation.mutate(data)
      }
    }

    const onHealthRecordSubmit = (data: HealthRecordFormData) => {
      if (selectedPet) {
        createHealthRecordMutation.mutate({ petId: selectedPet._id, data })
      }
    }

    const onCarePlanSubmit = (data: CarePlanFormData) => {
      if (!selectedPet) return
      const payload: CarePlanFormData = {
        ...data,
        remindersEnabled: data.remindersEnabled ?? true,
        customIntervalDays: data.frequency === 'custom' ? data.customIntervalDays : undefined,
      }
      createCarePlanMutation.mutate({ petId: selectedPet._id, data: payload })
    }

    const calculateAge = (birthday?: string): string => {
      if (!birthday) return 'Unknown'
      const birth = new Date(birthday)
      const today = new Date()
      const years = today.getFullYear() - birth.getFullYear()
      const months = today.getMonth() - birth.getMonth()
      if (months < 0) {
        return `${years - 1} years, ${12 + months} months`
      }
      return `${years} years, ${months} months`
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">My Pets 🐾</h2>
            <p className="text-gray-600 mt-1">Manage your pet profiles and health records</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#26732d] hover:bg-[#1e5d26]">
            <Plus className="h-4 w-4 mr-2" />
            Add Pet
          </Button>
        </div>

        {/* Alerts */}
        {/* Birthday alerts removed in redesign */}

        {healthReminders.length > 0 && (
          <Alert className="mb-6 border-blue-500 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle>Health Reminders</AlertTitle>
            <AlertDescription>
              You have {healthReminders.length} upcoming health appointment{healthReminders.length > 1 ? 's' : ''} that need to be scheduled.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pets">My Pets ({pets.length})</TabsTrigger>
            <TabsTrigger value="health">Health Records</TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="mt-6">
            {isLoadingPets ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading pets...</p>
              </div>
            ) : pets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🐾</div>
                  <h3 className="text-xl font-semibold mb-2">No pets yet</h3>
                  <p className="text-gray-600 mb-4">Add your first pet to get started!</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#26732d] hover:bg-[#1e5d26]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    speciesEmojis={speciesEmojis}
                    speciesLabels={speciesLabels}
                    healthStatusLabels={healthStatusLabels}
                    onEdit={() => handleEditPet(pet)}
                    onAddHealthRecord={() => handleAddHealthRecord(pet)}
                    onDelete={() => handleDeletePet(pet._id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Birthdays content removed */}

          <TabsContent value="health" className="mt-6">
            {healthReminders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-xl font-semibold mb-2">No upcoming health reminders</h3>
                  <p className="text-gray-600">Add health records with due dates to get reminders!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {healthReminders.map((reminder) => {
                  const recordTypeKey =
                    reminder.reminderType === 'carePlan' ? 'care-plan' : reminder.recordType
                  const RecordIcon = recordTypeLabels[recordTypeKey]?.icon || FileText
                  const iconStyles =
                    reminder.reminderType === 'carePlan'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-blue-100 text-blue-600'
                  const descriptionText =
                    reminder.reminderType === 'carePlan'
                      ? `${carePlanCategoryLabels[reminder.category]} • ${carePlanFrequencyLabels[reminder.frequency]}`
                      : recordTypeLabels[reminder.recordType]?.label || reminder.recordType
                  const statusBadgeClass =
                    reminder.reminderType === 'carePlan'
                      ? carePlanStatusStyles[reminder.status]
                      : 'bg-blue-100 text-blue-700'
                  const dueDateLabel = reminder.nextDueDate
                    ? formatDate(new Date(reminder.nextDueDate), 'MMM d, yyyy')
                    : 'No due date'

                  return (
                    <Card key={reminder._id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${iconStyles}`}>
                              <RecordIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {reminder.title}
                                {reminder.reminderType === 'carePlan' && (
                                  <Badge className={`${statusBadgeClass} border-0`}>
                                    {reminder.status === 'overdue'
                                      ? 'Overdue'
                                      : reminder.status === 'completed'
                                      ? 'Completed'
                                      : 'Upcoming'}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{descriptionText}</CardDescription>
                              {reminder.reminderType === 'carePlan' && reminder.reminderLeadDays !== undefined && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reminder {reminder.reminderLeadDays} day{reminder.reminderLeadDays === 1 ? '' : 's'} before due
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              reminder.reminderType === 'carePlan'
                                ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : 'text-blue-600 border-blue-200 bg-blue-50'
                            }
                          >
                            <CalendarClock className="h-3 w-3 mr-1" />
                            {dueDateLabel}
                          </Badge>
                        </div>
                      </CardHeader>
                      {reminder.description && (
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            {reminder.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Pet Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Pet</DialogTitle>
              <DialogDescription>Create a profile for your pet</DialogDescription>
            </DialogHeader>
            <Form {...petForm}>
              <form onSubmit={petForm.handleSubmit(onPetSubmit)} className="space-y-4">
                <FormField
                  control={petForm.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Photo</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={petForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fluffy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select species" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cat">🐱 Cat</SelectItem>
                            <SelectItem value="dog">🐶 Dog</SelectItem>
                            <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                            <SelectItem value="bird">🦜 Bird</SelectItem>
                            <SelectItem value="hamster">🐹 Hamster</SelectItem>
                            <SelectItem value="other">🐾 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={petForm.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Persian, Golden Retriever" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={petForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 24"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 5.5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">♂ Male</SelectItem>
                            <SelectItem value="female">♀ Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={petForm.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="healthStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select health status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="healthNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any health concerns or notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Needs (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Allergies, Diabetes, Special diet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#26732d] hover:bg-[#1e5d26]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Pet
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Pet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pet Profile</DialogTitle>
              <DialogDescription>Update your pet's information</DialogDescription>
            </DialogHeader>
            <Form {...petForm}>
              <form onSubmit={petForm.handleSubmit(onPetSubmit)} className="space-y-4">
                <FormField
                  control={petForm.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Photo</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={petForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fluffy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select species" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cat">🐱 Cat</SelectItem>
                            <SelectItem value="dog">🐶 Dog</SelectItem>
                            <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                            <SelectItem value="bird">🦜 Bird</SelectItem>
                            <SelectItem value="hamster">🐹 Hamster</SelectItem>
                            <SelectItem value="other">🐾 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={petForm.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Persian, Golden Retriever" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={petForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 24"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 5.5"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={petForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">♂ Male</SelectItem>
                            <SelectItem value="female">♀ Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={petForm.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="healthStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select health status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="healthNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any health concerns or notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={petForm.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Needs (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Allergies, Diabetes, Special diet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#26732d] hover:bg-[#1e5d26]">
                    <Save className="h-4 w-4 mr-2" />
                    Update Pet
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Health Record Dialog */}
        <Dialog open={isHealthRecordDialogOpen} onOpenChange={setIsHealthRecordDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Health Record</DialogTitle>
              <DialogDescription>
                Record health information for {selectedPet?.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...healthRecordForm}>
              <form onSubmit={healthRecordForm.handleSubmit(onHealthRecordSubmit)} className="space-y-4">
                <FormField
                  control={healthRecordForm.control}
                  name="recordType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select record type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vaccination">💉 Vaccination</SelectItem>
                          <SelectItem value="checkup">🏥 Checkup</SelectItem>
                          <SelectItem value="medication">💊 Medication</SelectItem>
                          <SelectItem value="surgery">⚕️ Surgery</SelectItem>
                          <SelectItem value="grooming">✂️ Grooming</SelectItem>
                          <SelectItem value="other">📝 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={healthRecordForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Annual Checkup, Rabies Vaccination" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={healthRecordForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={healthRecordForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={healthRecordForm.control}
                    name="nextDueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={healthRecordForm.control}
                    name="veterinarian"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veterinarian</FormLabel>
                        <FormControl>
                          <Input placeholder="Vet name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={healthRecordForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Clinic name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={healthRecordForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (HKD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={healthRecordForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsHealthRecordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#26732d] hover:bg-[#1e5d26]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Savings Plan rendering
  const renderSavings = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Savings Plan</h2>
          <Badge className="bg-[#26732d]">{activePlans.length} Active Plan{activePlans.length !== 1 ? 's' : ''}</Badge>
        </div>

        {/* Active Plans */}
        {activePlans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#26732d]" />
              Your Active Plans
            </h3>
            <div className="space-y-4">
              {activePlans.map((plan) => (
                <Card key={plan.id} className="border-2 border-[#26732d]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#26732d]/10 p-3 rounded-lg">
                          <Package className="h-8 w-8 text-[#26732d]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{plan.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{plan.product}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {plan.frequency}
                            </Badge>
                            <Badge className="bg-green-600">
                              {plan.discount}% OFF
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Regular Price</p>
                        <p className="font-semibold line-through text-gray-400">{format(plan.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Your Price</p>
                        <p className="font-semibold text-[#26732d] text-lg">{format(plan.price * (1 - plan.discount / 100))}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Next Delivery</p>
                        <p className="font-semibold">{new Date(plan.nextDelivery).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Modify Plan
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Cancel Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Card */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6" />
              Savings Plan Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Save 10-20% on every delivery</p>
                  <p className="text-sm opacity-90">Automatic subscription discounts</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Stackable with membership</p>
                  <p className="text-sm opacity-90">Combine with Privilege Club for max savings</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Flexible scheduling</p>
                  <p className="text-sm opacity-90">Skip, pause, or cancel anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Bonus rewards</p>
                  <p className="text-sm opacity-90">Earn 2x points on subscriptions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Bonus Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2">💎 Members Get Even More!</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Combine your Privilege Club membership with Savings Plans for maximum savings!
                </p>
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span><strong>Stack discounts:</strong> Membership discount + Subscription discount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span><strong>Example:</strong> Golden Paw (10%) + Subscription (10%) = 19% total savings!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span><strong>Bonus:</strong> Members earn 3x points on subscription deliveries</span>
                  </div>
                </div>
                {!(user as any)?.membership?.tier && (
                  <Button 
                    onClick={() => setLocation('/privilege-club')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    Join Privilege Club <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Savings Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlans.map((plan) => {
              const IconComponent = plan.icon
              return (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-[#26732d]/10 p-3 rounded-lg w-fit mb-4">
                      <IconComponent className="h-8 w-8 text-[#26732d]" />
                    </div>
                    <Badge className="mb-3 bg-green-600">{plan.discount}% OFF</Badge>
                    <h4 className="font-semibold text-lg mb-2">{plan.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Starting from {format(plan.minPrice)}/month
                    </p>
                    <Button 
                      className="w-full bg-[#26732d] hover:bg-[#1e5d26]"
                      onClick={() => {
                        toast({
                          title: "Plan Selected!",
                          description: `Browse ${plan.category} products to start your savings plan.`,
                        })
                        setLocation('/products')
                      }}
                    >
                      Start Plan
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#26732d]" />
              How Savings Plans Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-[#26732d]/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#26732d]">1</span>
                </div>
                <h5 className="font-semibold mb-2">Choose Products</h5>
                <p className="text-sm text-gray-600">Select items you buy regularly</p>
              </div>
              <div className="text-center">
                <div className="bg-[#26732d]/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#26732d]">2</span>
                </div>
                <h5 className="font-semibold mb-2">Set Frequency</h5>
                <p className="text-sm text-gray-600">Choose delivery schedule</p>
              </div>
              <div className="text-center">
                <div className="bg-[#26732d]/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#26732d]">3</span>
                </div>
                <h5 className="font-semibold mb-2">Save & Relax</h5>
                <p className="text-sm text-gray-600">Automatic delivery with discounts</p>
              </div>
              <div className="text-center">
                <div className="bg-[#26732d]/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#26732d]">4</span>
                </div>
                <h5 className="font-semibold mb-2">Earn More</h5>
                <p className="text-sm text-gray-600">Get 2x points on every delivery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'orders':
        return renderOrders()
      case 'profile':
        return renderProfile()
      case 'wishlist':
        return renderWishlist()
      case 'requests':
        return renderRequests()
      case 'address':
        return renderAddress()
      case 'wallet':
        return renderWallet()
      case 'pets':
        return renderPets()
      case 'coupons':
        return renderCoupons()
      case 'rewards':
        return renderRewards()
      case 'refer':
        return renderRefer()
      case 'newsletter':
        return renderNewsletters()
      case 'savings':
        return renderSavings()
      default:
        return <div><h2 className="text-2xl font-bold">Coming Soon</h2><p>This feature is under development.</p></div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-1">
          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <Card className="p-4 sm:p-6 shadow-xl border-0 bg-gradient-to-br from-white via-gray-50/80 to-white backdrop-blur-sm">
              {/* Back to Home Button */}
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full mb-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              
              {/* User Info */}
              <div className="relative mb-3 pb-2 border-b border-gradient-to-r from-transparent via-gray-200 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
                <div className="relative flex items-center space-x-4 p-4 bg-gradient-to-br from-white/80 to-gray-50/50 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-60 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                        <AvatarImage src={(user as any).profilePicture} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-xl font-bold">
                          {user.firstName?.[0] || user.name?.[0] || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {user.firstName || user.name || 'User'}
                    </h3>
                    <div className="flex items-center space-x-1 mb-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <p className="text-sm text-gray-600 truncate">{user.email || ''}</p>
                    </div>
                    {(user as any)?.membership?.tier && (
                      <Badge className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-amber-900 text-[10px] px-2.5 py-1 font-semibold shadow-sm border border-amber-300/50">
                        <Crown className="h-2.5 w-2.5 mr-1" />
                        {(user as any).membership.tier}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-1">
                <div className="px-3 mb-1">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mr-3"></div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Account</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent ml-3"></div>
                  </h4>
                </div>
                {menuItems.map((item) => {
                  const isActive = activeSection === item.key;
                  const colorMap: Record<string, { active: string; inactive: string; iconBgActive: string; iconBgInactive: string; iconColorActive: string; iconColorInactive: string; borderActive: string; borderInactive: string }> = {
                    purple: {
                      active: 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-300 text-purple-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-purple-100/30 text-gray-700 border-transparent hover:border-purple-200',
                      iconBgActive: 'bg-gradient-to-br from-purple-500 to-purple-600',
                      iconBgInactive: 'bg-purple-50 group-hover:bg-purple-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-purple-500',
                      borderActive: 'border-purple-300',
                      borderInactive: 'border-transparent'
                    },
                    blue: {
                      active: 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-300 text-blue-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30 text-gray-700 border-transparent hover:border-blue-200',
                      iconBgActive: 'bg-gradient-to-br from-blue-500 to-blue-600',
                      iconBgInactive: 'bg-blue-50 group-hover:bg-blue-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-blue-500',
                      borderActive: 'border-blue-300',
                      borderInactive: 'border-transparent'
                    },
                    orange: {
                      active: 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-300 text-orange-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-orange-100/30 text-gray-700 border-transparent hover:border-orange-200',
                      iconBgActive: 'bg-gradient-to-br from-orange-500 to-orange-600',
                      iconBgInactive: 'bg-orange-50 group-hover:bg-orange-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-orange-500',
                      borderActive: 'border-orange-300',
                      borderInactive: 'border-transparent'
                    },
                    pink: {
                      active: 'bg-gradient-to-r from-pink-50 to-pink-100/50 border-pink-300 text-pink-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-pink-100/30 text-gray-700 border-transparent hover:border-pink-200',
                      iconBgActive: 'bg-gradient-to-br from-pink-500 to-pink-600',
                      iconBgInactive: 'bg-pink-50 group-hover:bg-pink-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-pink-500',
                      borderActive: 'border-pink-300',
                      borderInactive: 'border-transparent'
                    },
                    indigo: {
                      active: 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-indigo-300 text-indigo-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-indigo-100/30 text-gray-700 border-transparent hover:border-indigo-200',
                      iconBgActive: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
                      iconBgInactive: 'bg-indigo-50 group-hover:bg-indigo-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-indigo-500',
                      borderActive: 'border-indigo-300',
                      borderInactive: 'border-transparent'
                    },
                    teal: {
                      active: 'bg-gradient-to-r from-teal-50 to-teal-100/50 border-teal-300 text-teal-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-teal-100/30 text-gray-700 border-transparent hover:border-teal-200',
                      iconBgActive: 'bg-gradient-to-br from-teal-500 to-teal-600',
                      iconBgInactive: 'bg-teal-50 group-hover:bg-teal-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-teal-500',
                      borderActive: 'border-teal-300',
                      borderInactive: 'border-transparent'
                    },
                    green: {
                      active: 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-300 text-green-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-100/30 text-gray-700 border-transparent hover:border-green-200',
                      iconBgActive: 'bg-gradient-to-br from-green-500 to-green-600',
                      iconBgInactive: 'bg-green-50 group-hover:bg-green-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-green-500',
                      borderActive: 'border-green-300',
                      borderInactive: 'border-transparent'
                    },
                    red: {
                      active: 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-300 text-red-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-100/30 text-gray-700 border-transparent hover:border-red-200',
                      iconBgActive: 'bg-gradient-to-br from-red-500 to-red-600',
                      iconBgInactive: 'bg-red-50 group-hover:bg-red-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-red-500',
                      borderActive: 'border-red-300',
                      borderInactive: 'border-transparent'
                    },
                    yellow: {
                      active: 'bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-yellow-300 text-yellow-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-yellow-50/50 hover:to-yellow-100/30 text-gray-700 border-transparent hover:border-yellow-200',
                      iconBgActive: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
                      iconBgInactive: 'bg-yellow-50 group-hover:bg-yellow-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-yellow-500',
                      borderActive: 'border-yellow-300',
                      borderInactive: 'border-transparent'
                    },
                    cyan: {
                      active: 'bg-gradient-to-r from-cyan-50 to-cyan-100/50 border-cyan-300 text-cyan-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-cyan-100/30 text-gray-700 border-transparent hover:border-cyan-200',
                      iconBgActive: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
                      iconBgInactive: 'bg-cyan-50 group-hover:bg-cyan-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-cyan-500',
                      borderActive: 'border-cyan-300',
                      borderInactive: 'border-transparent'
                    },
                    violet: {
                      active: 'bg-gradient-to-r from-violet-50 to-violet-100/50 border-violet-300 text-violet-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-violet-100/30 text-gray-700 border-transparent hover:border-violet-200',
                      iconBgActive: 'bg-gradient-to-br from-violet-500 to-violet-600',
                      iconBgInactive: 'bg-violet-50 group-hover:bg-violet-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-violet-500',
                      borderActive: 'border-violet-300',
                      borderInactive: 'border-transparent'
                    },
                    emerald: {
                      active: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-300 text-emerald-700 shadow-md',
                      inactive: 'hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-emerald-100/30 text-gray-700 border-transparent hover:border-emerald-200',
                      iconBgActive: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                      iconBgInactive: 'bg-emerald-50 group-hover:bg-emerald-100',
                      iconColorActive: 'text-white',
                      iconColorInactive: 'text-emerald-500',
                      borderActive: 'border-emerald-300',
                      borderInactive: 'border-transparent'
                    },
                  };
                  
                  const colors = colorMap[item.color || 'gray'] || colorMap.blue;
                  
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleSectionChange(item.key);
                      }}
                      className={`group w-full flex items-center space-x-3 p-2.5 rounded-lg text-left transition-all duration-300 border-2 ${
                        isActive ? colors.active : colors.inactive
                      }`}
                    >
                      <div className={`${isActive ? colors.iconBgActive : colors.iconBgInactive} p-2 rounded-lg transition-all duration-300 shadow-sm`}>
                        <div className={isActive ? colors.iconColorActive : colors.iconColorInactive}>
                          {item.icon}
                        </div>
                      </div>
                      <span className={`text-sm font-medium flex-1 ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                      {(item as any).highlight && (
                        <Badge className="ml-auto bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-[10px] px-2.5 py-1 font-semibold shadow-md animate-pulse">
                          NEW
                        </Badge>
                      )}
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-current shadow-lg"></div>
                      )}
                    </button>
                  );
                })}

                <Separator className="my-3 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                <div className="px-3 mb-2">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mr-3"></div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Help & Support</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent ml-3"></div>
                  </h4>
                </div>
                {helpItems.map((item) => {
                  const helpColorMap: Record<string, { hover: string; iconBg: string; iconColor: string }> = {
                    slate: {
                      hover: 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 text-gray-700 hover:border-slate-200',
                      iconBg: 'bg-slate-50 group-hover:bg-slate-100',
                      iconColor: 'text-slate-500'
                    },
                    blue: {
                      hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 text-gray-700 hover:border-blue-200',
                      iconBg: 'bg-blue-50 group-hover:bg-blue-100',
                      iconColor: 'text-blue-500'
                    },
                    green: {
                      hover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 text-gray-700 hover:border-green-200',
                      iconBg: 'bg-green-50 group-hover:bg-green-100',
                      iconColor: 'text-green-500'
                    },
                    purple: {
                      hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 text-gray-700 hover:border-purple-200',
                      iconBg: 'bg-purple-50 group-hover:bg-purple-100',
                      iconColor: 'text-purple-500'
                    },
                  };
                  
                  const colors = helpColorMap[item.color || 'slate'] || helpColorMap.slate;
                  
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        if (item.key === 'faq') {
                          setLocation('/help-center');
                        } else if (item.key === 'call') {
                          setLocation('/call-to-order');
                        } else if (item.key === 'support') {
                          setLocation('/customer-support');
                        } else if (item.key === 'chat') {
                          setLocation('/messenger');
                        }
                      }}
                      className={`group w-full flex items-center space-x-3 p-2.5 rounded-lg text-left transition-all duration-300 border-2 border-transparent ${colors.hover}`}
                    >
                      <div className={`${colors.iconBg} p-2 rounded-lg transition-all duration-300 shadow-sm`}>
                        <div className={colors.iconColor}>
                          {item.icon}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}

                <Separator className="my-3 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                <button
                  onClick={handleSignOut}
                  className="group w-full flex items-center space-x-3 p-2.5 rounded-lg text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 text-red-600 border-2 border-transparent hover:border-red-200"
                >
                  <div className="bg-red-50 p-2 rounded-lg group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300 shadow-sm">
                    <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600" />
                  </div>
                  <span className="text-sm font-semibold">Sign Out</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card className="p-3 sm:p-6">
              {renderContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}