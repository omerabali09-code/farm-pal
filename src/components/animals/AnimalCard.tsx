import { Animal, ANIMAL_TYPE_ICONS, ANIMAL_TYPE_LABELS } from '@/types/animal';
import { Calendar, Tag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AnimalCardProps {
  animal: Animal;
  onClick?: (animal: Animal) => void;
  isPregnant?: boolean;
}

export function AnimalCard({ animal, onClick, isPregnant }: AnimalCardProps) {
  const birthDate = new Date(animal.birthDate);
  const years = differenceInYears(new Date(), birthDate);
  const months = differenceInMonths(new Date(), birthDate) % 12;
  
  const ageText = years > 0 
    ? `${years} yıl ${months > 0 ? `${months} ay` : ''}` 
    : `${months} ay`;

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl border-2 border-border p-5 shadow-farm-sm transition-all duration-200",
        "hover:shadow-farm-md hover:border-primary/30 cursor-pointer",
        "animate-fade-in"
      )}
      onClick={() => onClick?.(animal)}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl shadow-farm-sm">
          {ANIMAL_TYPE_ICONS[animal.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{animal.earTag}</h3>
            {isPregnant && (
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-semibold">
                Gebe
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {ANIMAL_TYPE_LABELS[animal.type]} • {animal.breed}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Yaş:</span>
          <span className="font-medium text-foreground">{ageText}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cinsiyet:</span>
          <span className="font-medium text-foreground capitalize">{animal.gender}</span>
        </div>

        {animal.notes && (
          <div className="flex items-start gap-2 text-sm mt-3 pt-3 border-t border-border">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-muted-foreground line-clamp-2">{animal.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
