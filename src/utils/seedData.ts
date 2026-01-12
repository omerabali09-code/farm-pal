import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, subDays, addDays } from 'date-fns';

export async function seedSampleData(userId: string) {
  // Check if data already exists
  const { data: existingAnimals } = await supabase
    .from('animals')
    .select('id')
    .limit(1);

  if (existingAnimals && existingAnimals.length > 0) {
    console.log('Sample data already exists');
    return false;
  }

  const now = new Date();

  // Insert sample animals
  const animalsToInsert = [
    {
      user_id: userId,
      ear_tag: 'TR-2024-001',
      type: 'inek',
      breed: 'Holstein',
      birth_date: format(subMonths(now, 48), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'Süt verimi yüksek, sağlıklı. Ana sürü hayvanı.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-002',
      type: 'inek',
      breed: 'Simental',
      birth_date: format(subMonths(now, 36), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'İyi damızlık potansiyeli var.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-003',
      type: 'inek',
      breed: 'Montofon',
      birth_date: format(subMonths(now, 24), 'yyyy-MM-dd'),
      gender: 'erkek',
      notes: 'Besi için uygun, sağlıklı.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-004',
      type: 'koyun',
      breed: 'Merinos',
      birth_date: format(subMonths(now, 30), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'Yapağı kalitesi yüksek.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-005',
      type: 'keçi',
      breed: 'Saanen',
      birth_date: format(subMonths(now, 28), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'Süt keçisi, günlük 3-4 litre süt.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-006',
      type: 'inek',
      breed: 'Jersey',
      birth_date: format(subMonths(now, 6), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'Buzağı - 6 aylık, sağlıklı gelişiyor.',
      mother_ear_tag: 'TR-2024-002',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-007',
      type: 'inek',
      breed: 'Holstein',
      birth_date: format(subMonths(now, 19), 'yyyy-MM-dd'),
      gender: 'erkek',
      notes: 'Dana - satışa hazır.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-008',
      type: 'inek',
      breed: 'Simental',
      birth_date: format(subMonths(now, 20), 'yyyy-MM-dd'),
      gender: 'dişi',
      notes: 'Düve - tohumlamaya hazır.',
      mother_ear_tag: 'TR-2024-002',
      status: 'aktif',
    },
  ];

  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .insert(animalsToInsert)
    .select();

  if (animalsError) {
    console.error('Error inserting animals:', animalsError);
    return false;
  }

  // Insert sample vaccinations
  const vaccinationsToInsert = [
    {
      user_id: userId,
      animal_id: animals[0].id,
      name: 'Şap Aşısı',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 120), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[0].id,
      name: 'Brucella Aşısı',
      date: format(subMonths(now, 6), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 180), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[1].id,
      name: 'Şap Aşısı',
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
      next_date: format(subDays(now, 10), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[2].id,
      name: 'Kuduz Aşısı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 335), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[3].id,
      name: 'Enterotoksemi Aşısı',
      date: format(subDays(now, 45), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 45), 'yyyy-MM-dd'),
      completed: true,
    },
  ];

  const { error: vaccinationsError } = await supabase
    .from('vaccinations')
    .insert(vaccinationsToInsert);

  if (vaccinationsError) {
    console.error('Error inserting vaccinations:', vaccinationsError);
  }

  // Insert sample inseminations (some pregnant, some not)
  const inseminationsToInsert = [
    {
      user_id: userId,
      animal_id: animals[0].id,
      date: format(subMonths(now, 7), 'yyyy-MM-dd'),
      type: 'suni',
      expected_birth_date: format(addDays(subMonths(now, 7), 283), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: '7. ayda, süt kesimi yaklaşıyor.',
    },
    {
      user_id: userId,
      animal_id: animals[1].id,
      date: format(subMonths(now, 5), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 5), 283), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: '5. ayda, sağlıklı ilerliyor.',
    },
    {
      user_id: userId,
      animal_id: animals[4].id,
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 3), 150), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: 'Keçi gebeliği, normal seyrediyor.',
    },
  ];

  const { error: inseminationsError } = await supabase
    .from('inseminations')
    .insert(inseminationsToInsert);

  if (inseminationsError) {
    console.error('Error inserting inseminations:', inseminationsError);
  }

  // Insert sample transactions
  const transactionsToInsert = [
    // Income
    {
      user_id: userId,
      type: 'gelir',
      category: 'Süt Satışı',
      amount: 15000,
      description: 'Ocak ayı süt satışı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'Süt Satışı',
      amount: 18000,
      description: 'Şubat ayı süt satışı',
      date: format(now, 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'Hayvan Satışı',
      amount: 45000,
      description: 'Dana satışı',
      date: format(subDays(now, 20), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'Devlet Desteği',
      amount: 8000,
      description: 'Hayvancılık desteği',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
    },
    // Expenses
    {
      user_id: userId,
      type: 'gider',
      category: 'Yem',
      amount: 12000,
      description: 'Aylık yem alımı',
      date: format(subDays(now, 5), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'Yem',
      amount: 11500,
      description: 'Önceki ay yem alımı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'Veteriner',
      amount: 2500,
      description: 'Aşı ve muayene masrafları',
      date: format(subDays(now, 15), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'İlaç',
      amount: 800,
      description: 'Vitamin ve mineral takviyeleri',
      date: format(subDays(now, 10), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'Ekipman',
      amount: 5000,
      description: 'Süt sağım makinesi bakımı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'İşçilik',
      amount: 8000,
      description: 'Aylık işçi ücreti',
      date: format(now, 'yyyy-MM-dd'),
    },
  ];

  const { error: transactionsError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (transactionsError) {
    console.error('Error inserting transactions:', transactionsError);
  }

  console.log('Sample data seeded successfully');
  return true;
}
