import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe, Baby, CalendarIcon } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'vaccination' | 'birth';
  title: string;
  animalId: string;
  animalEarTag: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { animals } = useAnimals();
  const { vaccinations } = useVaccinations();
  const { inseminations } = useInseminations();

  // Collect all events
  const events: CalendarEvent[] = [];

  // Add vaccination events
  vaccinations.forEach(v => {
    if (v.next_date) {
      const animal = animals.find(a => a.id === v.animal_id);
      if (animal) {
        events.push({
          id: `vac-${v.id}`,
          date: new Date(v.next_date),
          type: 'vaccination',
          title: v.name,
          animalId: animal.id,
          animalEarTag: animal.ear_tag,
        });
      }
    }
  });

  // Add birth events
  inseminations.forEach(i => {
    if (i.is_pregnant) {
      const animal = animals.find(a => a.id === i.animal_id);
      if (animal) {
        events.push({
          id: `birth-${i.id}`,
          date: new Date(i.expected_birth_date),
          type: 'birth',
          title: 'Tahmini Doğum',
          animalId: animal.id,
          animalEarTag: animal.ear_tag,
        });
      }
    }
  });

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? events.filter(e => isSameDay(e.date, selectedDate))
    : [];

  // Get all dates that have events
  const eventDates = events.map(e => e.date);

  // Custom day renderer to show dots for events
  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
    },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Takvim</h1>
          <p className="text-muted-foreground mt-1">
            Yaklaşan aşılar ve doğumları takip edin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={tr}
                className="rounded-md border-0 w-full"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-lg font-semibold",
                  nav: "space-x-1 flex items-center",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                    "[&:has([aria-selected])]:bg-accent"
                  ),
                  day: cn(
                    "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-lg transition-colors"
                  ),
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-bold",
                  day_outside: "text-muted-foreground opacity-50",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = events.filter(e => isSameDay(e.date, date));
                    const hasVaccination = dayEvents.some(e => e.type === 'vaccination');
                    const hasBirth = dayEvents.some(e => e.type === 'birth');
                    
                    return (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <span>{date.getDate()}</span>
                        {(hasVaccination || hasBirth) && (
                          <div className="flex gap-1 mt-0.5">
                            {hasVaccination && (
                              <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                            )}
                            {hasBirth && (
                              <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {selectedDate 
                    ? format(selectedDate, 'd MMMM yyyy', { locale: tr })
                    : 'Tarih Seçin'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Bu tarihte etkinlik yok
                  </p>
                ) : (
                  selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-3 rounded-xl border-2",
                        event.type === 'vaccination' 
                          ? 'bg-warning/10 border-warning/30' 
                          : 'bg-success/10 border-success/30'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {event.type === 'vaccination' ? (
                          <Syringe className="w-4 h-4 text-warning" />
                        ) : (
                          <Baby className="w-4 h-4 text-success" />
                        )}
                        <span className="font-semibold text-sm">{event.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.animalEarTag}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent className="py-4">
                <p className="text-sm font-medium mb-3">Gösterge</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm text-muted-foreground">Aşı</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Doğum</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
