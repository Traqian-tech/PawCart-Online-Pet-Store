import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Stethoscope, Weight, Activity } from 'lucide-react';

export interface PetCardProps {
  pet: {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: 'male' | 'female' | 'unknown';
    photo?: string;
    healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  speciesEmojis: Record<string, string>;
  speciesLabels: Record<string, string>;
  healthStatusLabels: Record<string, { label: string; color: string }>;
  onEdit: () => void;
  onAddHealthRecord: () => void;
  onDelete: () => void;
}

export function PetCard({
  pet,
  speciesEmojis,
  speciesLabels,
  healthStatusLabels,
  onEdit,
  onAddHealthRecord,
  onDelete,
}: PetCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow min-w-[380px] w-full">
      <div className="relative h-72 bg-gradient-to-br from-green-100 to-blue-100">
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-7xl">
            {speciesEmojis[pet.species]}
          </div>
        )}
        <div className="absolute top-3 right-3">
          {pet.healthStatus && (
            <Badge className={healthStatusLabels[pet.healthStatus].color}>
              {healthStatusLabels[pet.healthStatus].label}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-2xl mb-2 break-words">{pet.name}</CardTitle>
            <CardDescription className="text-base break-words">
              {speciesEmojis[pet.species]} {speciesLabels[pet.species]}
              {pet.breed && ` • ${pet.breed}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-5">
          {typeof pet.age === 'number' && (
            <div className="flex items-center text-base text-gray-600">
              Age: {pet.age} months
            </div>
          )}
          {typeof pet.weight === 'number' && pet.weight > 0 && (
            <div className="flex items-center text-base text-gray-600">
              <Weight className="h-5 w-5 mr-2 flex-shrink-0" />
              Weight: {pet.weight} kg
            </div>
          )}
          {pet.gender && pet.gender !== 'unknown' && (
            <div className="flex items-center text-base text-gray-600">
              <Activity className="h-5 w-5 mr-2 flex-shrink-0" />
              {pet.gender === 'male' ? '♂ Male' : '♀ Female'}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 min-w-0">
            <Edit className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">Edit</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onAddHealthRecord} className="flex-1 min-w-0">
            <Stethoscope className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">Health</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 flex-shrink-0">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}



