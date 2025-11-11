import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  Heart, 
  Weight, 
  Activity,
  FileText,
  AlertCircle,
  Stethoscope,
  X,
  Save,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PetCard } from '@/components/pets/PetCard';
import { PetForm } from '@/components/pets/PetForm';

// Pet form schema
const petFormSchema = z.object({
  name: z.string().trim().min(1, 'Pet name is required'),
  species: z.enum(['cat', 'dog', 'rabbit', 'bird', 'hamster', 'other'], {
    required_error: 'Species is required',
  }),
  breed: z
    .string()
    .trim()
    .max(80, 'Breed must be at most 80 characters')
    .optional()
    .or(z.literal('')),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(0, 'Age cannot be negative')
    .max(360, 'Age seems too large (max 360 months)')
    .optional(),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(0, 'Weight cannot be negative')
    .max(200, 'Weight seems too large (max 200 kg)')
    .optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  photo: z
    .string()
    .trim()
    .url('Photo must be a valid URL')
    .optional()
    .or(z.literal('')),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  healthNotes: z.string().trim().max(1000, 'Health notes must be at most 1000 characters').optional().or(z.literal('')),
  specialNeeds: z.string().trim().max(300, 'Special needs must be at most 300 characters').optional().or(z.literal('')),
});

// Health record form schema
const healthRecordFormSchema = z.object({
  recordType: z.enum(['vaccination', 'checkup', 'medication', 'surgery', 'grooming', 'other'], {
    required_error: 'Record type is required',
  }),
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  description: z.string().trim().max(1000, 'Description must be at most 1000 characters').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  veterinarian: z.string().trim().max(120, 'Veterinarian must be at most 120 characters').optional().or(z.literal('')),
  location: z.string().trim().max(200, 'Location must be at most 200 characters').optional().or(z.literal('')),
  cost: z
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative')
    .max(1000000, 'Cost seems too large')
    .optional(),
  nextDueDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes must be at most 1000 characters').optional().or(z.literal('')),
});

type PetFormData = z.infer<typeof petFormSchema>;
type HealthRecordFormData = z.infer<typeof healthRecordFormSchema>;

interface Pet {
  _id: string;
  userId: string;
  name: string;
  species: 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'unknown';
  photo?: string;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  healthNotes?: string;
  specialNeeds?: string[];
  preferences?: {
    foodType?: string[];
    activityLevel?: 'low' | 'medium' | 'high';
    favoriteToys?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HealthRecord {
  _id: string;
  petId: string;
  userId: string;
  recordType: 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'grooming' | 'other';
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  location?: string;
  cost?: number;
  attachments?: string[];
  nextDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const speciesEmojis: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🦜',
  hamster: '🐹',
  other: '🐾',
};

const speciesLabels: Record<string, string> = {
  cat: 'Cat',
  dog: 'Dog',
  rabbit: 'Rabbit',
  bird: 'Bird',
  hamster: 'Hamster',
  other: 'Other',
};

const healthStatusLabels: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'bg-green-500' },
  good: { label: 'Good', color: 'bg-blue-500' },
  fair: { label: 'Fair', color: 'bg-yellow-500' },
  poor: { label: 'Poor', color: 'bg-red-500' },
};

const recordTypeLabels: Record<string, { label: string; icon: any }> = {
  vaccination: { label: 'Vaccination', icon: Stethoscope },
  checkup: { label: 'Checkup', icon: Activity },
  medication: { label: 'Medication', icon: FileText },
  surgery: { label: 'Surgery', icon: Stethoscope },
  grooming: { label: 'Grooming', icon: Heart },
  other: { label: 'Other', icon: FileText },
};

export default function PetsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHealthRecordDialogOpen, setIsHealthRecordDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState('pets');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/sign-in');
    }
  }, [user, setLocation]);

  // Fetch pets
  const { data: petsData, isLoading: isLoadingPets } = useQuery({
    queryKey: ['/api/pets'],
    enabled: !!user,
    retry: 1,
  });

  const pets: Pet[] = petsData?.pets || [];

  // Fetch health reminders
  const { data: remindersData } = useQuery({
    queryKey: ['/api/pets/health-reminders?days=30'],
    enabled: !!user && pets.length > 0,
  });

  const healthReminders: any[] = remindersData?.reminders || [];

  const groupedReminders = useMemo(() => {
    const result: Record<'overdue' | 'due_soon' | 'upcoming' | 'unscheduled', any[]> = {
      overdue: [],
      due_soon: [],
      upcoming: [],
      unscheduled: [],
    };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (const r of healthReminders) {
      if (!r.nextDueDate) {
        result.unscheduled.push(r);
        continue;
      }
      const due = new Date(r.nextDueDate);
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysUntil = Math.floor((due.getTime() - startOfToday.getTime()) / msPerDay);
      if (due < startOfToday) {
        result.overdue.push({ ...r, daysUntil });
      } else if (daysUntil <= 7) {
        result.due_soon.push({ ...r, daysUntil });
      } else {
        result.upcoming.push({ ...r, daysUntil });
      }
    }
    const sortByDateAsc = (a: any, b: any) =>
      new Date(a.nextDueDate || 0).getTime() - new Date(b.nextDueDate || 0).getTime();
    result.overdue.sort(sortByDateAsc);
    result.due_soon.sort(sortByDateAsc);
    result.upcoming.sort(sortByDateAsc);
    // unscheduled left as is
    return result;
  }, [healthReminders]);

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
      healthStatus: 'good',
      healthNotes: '',
      specialNeeds: '',
    },
  });

  // Health record form
  const healthRecordForm = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordFormSchema),
    defaultValues: {
      recordType: 'checkup',
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      veterinarian: '',
      location: '',
      cost: undefined,
      nextDueDate: '',
      notes: '',
    },
  });

  // Create pet mutation
  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          specialNeeds: data.specialNeeds ? data.specialNeeds.split(',').map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create pet');
      return response.json();
    },
    onMutate: async (newPet) => {
      await queryClient.cancelQueries({ queryKey: ['/api/pets'] });
      const previous = queryClient.getQueryData<any>(['/api/pets']);
      const optimisticId = `temp-${Date.now()}`;
      const optimisticPet = {
        _id: optimisticId,
        userId: user?.id ?? '',
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed || '',
        age: newPet.age,
        weight: newPet.weight,
        gender: newPet.gender || 'unknown',
        photo: newPet.photo || '',
        healthStatus: (newPet as any).healthStatus || 'good',
        healthNotes: (newPet as any).healthNotes || '',
        specialNeeds: (newPet as any).specialNeeds ? String((newPet as any).specialNeeds).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<any>(['/api/pets'], (old) => {
        const oldPets = old?.pets ?? [];
        return { ...(old || {}), pets: [optimisticPet, ...oldPets] };
      });
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['/api/pets'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      toast({
        title: 'Success! 🎉',
        description: 'Pet profile created successfully',
      });
      setIsAddDialogOpen(false);
      petForm.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create pet profile',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
    },
  });

  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: PetFormData }) => {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          specialNeeds: data.specialNeeds ? data.specialNeeds.split(',').map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      if (!response.ok) throw new Error('Failed to update pet');
      return response.json();
    },
    onMutate: async ({ petId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/pets'] });
      const previous = queryClient.getQueryData<any>(['/api/pets']);
      queryClient.setQueryData<any>(['/api/pets'], (old) => {
        const oldPets: any[] = old?.pets ?? [];
        const updated = oldPets.map((p) =>
          p._id === petId
            ? {
                ...p,
                ...data,
                specialNeeds: data.specialNeeds
                  ? data.specialNeeds.split(',').map(s => s.trim()).filter(Boolean)
                  : [],
                updatedAt: new Date().toISOString(),
              }
            : p
        );
        return { ...(old || {}), pets: updated };
      });
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['/api/pets'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      toast({
        title: 'Success! 🎉',
        description: 'Pet profile updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedPet(null);
      petForm.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update pet profile',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
    },
  });

  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete pet');
      return response.json();
    },
    onMutate: async (petId: string) => {
      await queryClient.cancelQueries({ queryKey: ['/api/pets'] });
      const previous = queryClient.getQueryData<any>(['/api/pets']);
      queryClient.setQueryData<any>(['/api/pets'], (old) => {
        const oldPets: any[] = old?.pets ?? [];
        const filtered = oldPets.filter((p) => p._id !== petId);
        return { ...(old || {}), pets: filtered };
      });
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['/api/pets'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      toast({
        title: 'Success',
        description: 'Pet profile deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete pet profile',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
    },
  });

  // Create health record mutation
  const createHealthRecordMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: HealthRecordFormData }) => {
      const response = await fetch(`/api/pets/${petId}/health-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create health record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pets/health-reminders?days=30'] });
      if (selectedPet) {
        queryClient.invalidateQueries({ queryKey: [`/api/pets/${selectedPet._id}/health-records`] });
      }
      toast({
        title: 'Success! 🎉',
        description: 'Health record created successfully',
      });
      setIsHealthRecordDialogOpen(false);
      healthRecordForm.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create health record',
        variant: 'destructive',
      });
    },
  });

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    petForm.reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age,
      weight: pet.weight,
      gender: pet.gender || 'unknown',
      photo: pet.photo || '',
      healthStatus: pet.healthStatus || 'good',
      healthNotes: pet.healthNotes || '',
      specialNeeds: pet.specialNeeds?.join(', ') || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleAddHealthRecord = (pet: Pet) => {
    setSelectedPet(pet);
    healthRecordForm.reset({
      recordType: 'checkup',
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      veterinarian: '',
      location: '',
      cost: undefined,
      nextDueDate: '',
      notes: '',
    });
    setIsHealthRecordDialogOpen(true);
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('Are you sure you want to delete this pet profile?')) {
      deletePetMutation.mutate(petId);
    }
  };

  const onPetSubmit = (data: PetFormData) => {
    if (selectedPet) {
      updatePetMutation.mutate({ petId: selectedPet._id, data });
    } else {
      createPetMutation.mutate(data);
    }
  };

  const onHealthRecordSubmit = (data: HealthRecordFormData) => {
    if (selectedPet) {
      createHealthRecordMutation.mutate({ petId: selectedPet._id, data });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Pets 🐾</h1>
          <p className="text-gray-600 mt-1">Manage pet profiles and health records</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#26732d] hover:bg-[#1e5d26]">
          <Plus className="h-4 w-4 mr-2" />
          Add Pet
        </Button>
      </div>

      {/* Alerts */}

      {healthReminders.length > 0 && (
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle>Health Reminders</AlertTitle>
          <AlertDescription>
            You have {healthReminders.length} upcoming health items that need to be scheduled.
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
                  Add First Pet
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

        {/* Birthdays tab removed in redesign */}

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
            <div className="space-y-6">
              {(['overdue','due_soon','upcoming','unscheduled'] as const).map((groupKey) => {
                const group = groupedReminders[groupKey];
                if (!group || group.length === 0) return null;
                const groupTitle =
                  groupKey === 'overdue' ? 'Overdue' :
                  groupKey === 'due_soon' ? 'Due Soon (within 7 days)' :
                  groupKey === 'upcoming' ? 'Upcoming' : 'Unscheduled';
                const badgeClasses =
                  groupKey === 'overdue' ? 'text-red-700 border-red-600 bg-red-50' :
                  groupKey === 'due_soon' ? 'text-amber-700 border-amber-600 bg-amber-50' :
                  groupKey === 'upcoming' ? 'text-green-700 border-green-600 bg-green-50' :
                  'text-gray-700 border-gray-400 bg-gray-50';
                return (
                  <div key={groupKey} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{groupTitle}</h4>
                      <Badge variant="outline" className="text-gray-700 border-gray-300">{group.length}</Badge>
                    </div>
                    <div className="space-y-4">
                      {group.map((reminder: any) => {
                        const RecordIcon = recordTypeLabels[reminder.recordType]?.icon || FileText;
                        return (
                          <Card key={reminder._id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <RecordIcon className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle>{reminder.title}</CardTitle>
                                    <CardDescription>
                                      {recordTypeLabels[reminder.recordType]?.label || reminder.recordType}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge variant="outline" className={badgeClasses}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {reminder.nextDueDate
                                    ? format(new Date(reminder.nextDueDate), 'MMM d, yyyy')
                                    : 'No date set'}
                                </Badge>
                              </div>
                            </CardHeader>
                            {reminder.description && (
                              <CardContent>
                                <p className="text-sm text-gray-600">{reminder.description}</p>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
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
          <PetForm
            form={petForm}
            onSubmit={onPetSubmit}
            submitLabel="Save Pet"
            cancelLabel="Cancel"
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Pet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet Profile</DialogTitle>
            <DialogDescription>Update your pet information</DialogDescription>
          </DialogHeader>
          <PetForm
            form={petForm}
            onSubmit={onPetSubmit}
            submitLabel="Update Pet"
            cancelLabel="Cancel"
            onCancel={() => setIsEditDialogOpen(false)}
          />
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
                      <Input placeholder="e.g., Annual checkup, Rabies vaccine" {...field} />
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
                      <Textarea placeholder="More details..." {...field} />
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
                      <Input placeholder="Veterinarian name" {...field} />
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
                      <Textarea placeholder="More notes..." {...field} />
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
  );
}



