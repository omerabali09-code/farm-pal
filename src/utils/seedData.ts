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

  // Insert sample animals - Her tür için farklı yaş kategorileri
  const animalsToInsert = [
    // === SIĞIRLAR (inek tipi) ===
    // İnek (4+ yaş dişi)
    {
      user_id: userId,
      ear_tag: 'TR-2024-001',
      type: 'inek',
      breed: 'Holstein',
      birth_date: format(subMonths(now, 60), 'yyyy-MM-dd'), // 5 yaş - İnek
      gender: 'dişi',
      notes: 'Ana sürü ineği, süt verimi yüksek. Günlük 25-30 litre.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-002',
      type: 'inek',
      breed: 'Simental',
      birth_date: format(subMonths(now, 54), 'yyyy-MM-dd'), // 4.5 yaş - İnek
      gender: 'dişi',
      notes: 'Damızlık inek, 3 kez doğum yapmış.',
      status: 'aktif',
    },
    // Boğa (4+ yaş erkek)
    {
      user_id: userId,
      ear_tag: 'TR-2024-003',
      type: 'inek',
      breed: 'Montofon',
      birth_date: format(subMonths(now, 50), 'yyyy-MM-dd'), // 4+ yaş - Boğa
      gender: 'erkek',
      notes: 'Damızlık boğa, güçlü genetik.',
      status: 'aktif',
    },
    // Düve (2-4 yaş dişi)
    {
      user_id: userId,
      ear_tag: 'TR-2024-004',
      type: 'inek',
      breed: 'Jersey',
      birth_date: format(subMonths(now, 30), 'yyyy-MM-dd'), // 2.5 yaş - Düve
      gender: 'dişi',
      notes: 'Düve, tohumlamaya hazır.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-005',
      type: 'inek',
      breed: 'Holstein',
      birth_date: format(subMonths(now, 26), 'yyyy-MM-dd'), // 26 ay - Düve
      gender: 'dişi',
      notes: 'Genç düve, ilk tohumlama bekleniyor.',
      mother_ear_tag: 'TR-2024-002',
      status: 'aktif',
    },
    // Dana (2-4 yaş erkek)
    {
      user_id: userId,
      ear_tag: 'TR-2024-006',
      type: 'inek',
      breed: 'Simental',
      birth_date: format(subMonths(now, 28), 'yyyy-MM-dd'), // 28 ay - Dana
      gender: 'erkek',
      notes: 'Besi danası, satışa hazır.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    // Buzağı (0-2 yaş)
    {
      user_id: userId,
      ear_tag: 'TR-2024-007',
      type: 'inek',
      breed: 'Holstein',
      birth_date: format(subMonths(now, 6), 'yyyy-MM-dd'), // 6 ay - Buzağı
      gender: 'dişi',
      notes: 'Dişi buzağı, sağlıklı gelişiyor.',
      mother_ear_tag: 'TR-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-008',
      type: 'inek',
      breed: 'Simental',
      birth_date: format(subMonths(now, 3), 'yyyy-MM-dd'), // 3 ay - Buzağı
      gender: 'erkek',
      notes: 'Erkek buzağı, sütten kesilmedi.',
      mother_ear_tag: 'TR-2024-002',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'TR-2024-009',
      type: 'inek',
      breed: 'Jersey',
      birth_date: format(subMonths(now, 12), 'yyyy-MM-dd'), // 12 ay - Buzağı
      gender: 'dişi',
      notes: '1 yaşında dişi buzağı.',
      mother_ear_tag: 'TR-2024-004',
      status: 'aktif',
    },

    // === KOYUNLAR ===
    // Koyun (1+ yaş dişi)
    {
      user_id: userId,
      ear_tag: 'KY-2024-001',
      type: 'koyun',
      breed: 'Merinos',
      birth_date: format(subMonths(now, 36), 'yyyy-MM-dd'), // 3 yaş - Koyun
      gender: 'dişi',
      notes: 'Damızlık koyun, yapağı kalitesi yüksek.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'KY-2024-002',
      type: 'koyun',
      breed: 'Akkaraman',
      birth_date: format(subMonths(now, 24), 'yyyy-MM-dd'), // 2 yaş - Koyun
      gender: 'dişi',
      notes: 'İkiz doğum yapmış, verimli.',
      status: 'aktif',
    },
    // Koç (1+ yaş erkek)
    {
      user_id: userId,
      ear_tag: 'KY-2024-003',
      type: 'koyun',
      breed: 'Merinos',
      birth_date: format(subMonths(now, 30), 'yyyy-MM-dd'), // 2.5 yaş - Koç
      gender: 'erkek',
      notes: 'Damızlık koç, güçlü yapılı.',
      status: 'aktif',
    },
    // Kuzu (0-1 yaş)
    {
      user_id: userId,
      ear_tag: 'KY-2024-004',
      type: 'koyun',
      breed: 'Akkaraman',
      birth_date: format(subMonths(now, 4), 'yyyy-MM-dd'), // 4 ay - Kuzu
      gender: 'dişi',
      notes: 'Dişi kuzu, anne yanında.',
      mother_ear_tag: 'KY-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'KY-2024-005',
      type: 'koyun',
      breed: 'Merinos',
      birth_date: format(subMonths(now, 6), 'yyyy-MM-dd'), // 6 ay - Kuzu
      gender: 'erkek',
      notes: 'Erkek kuzu, besi için ayrıldı.',
      mother_ear_tag: 'KY-2024-002',
      status: 'aktif',
    },

    // === KEÇİLER ===
    // Keçi (1+ yaş dişi)
    {
      user_id: userId,
      ear_tag: 'KC-2024-001',
      type: 'keçi',
      breed: 'Saanen',
      birth_date: format(subMonths(now, 30), 'yyyy-MM-dd'), // 2.5 yaş - Keçi
      gender: 'dişi',
      notes: 'Süt keçisi, günlük 4 litre süt.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'KC-2024-002',
      type: 'keçi',
      breed: 'Kıl Keçisi',
      birth_date: format(subMonths(now, 20), 'yyyy-MM-dd'), // 20 ay - Keçi
      gender: 'dişi',
      notes: 'Kıl keçisi, dayanıklı.',
      status: 'aktif',
    },
    // Teke (1+ yaş erkek)
    {
      user_id: userId,
      ear_tag: 'KC-2024-003',
      type: 'keçi',
      breed: 'Saanen',
      birth_date: format(subMonths(now, 24), 'yyyy-MM-dd'), // 2 yaş - Teke
      gender: 'erkek',
      notes: 'Damızlık teke.',
      status: 'aktif',
    },
    // Oğlak (0-1 yaş)
    {
      user_id: userId,
      ear_tag: 'KC-2024-004',
      type: 'keçi',
      breed: 'Saanen',
      birth_date: format(subMonths(now, 5), 'yyyy-MM-dd'), // 5 ay - Oğlak
      gender: 'dişi',
      notes: 'Dişi oğlak, sütten kesildi.',
      mother_ear_tag: 'KC-2024-001',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'KC-2024-005',
      type: 'keçi',
      breed: 'Kıl Keçisi',
      birth_date: format(subMonths(now, 3), 'yyyy-MM-dd'), // 3 ay - Oğlak
      gender: 'erkek',
      notes: 'Erkek oğlak.',
      mother_ear_tag: 'KC-2024-002',
      status: 'aktif',
    },

    // === MANDALAR ===
    // Manda (4+ yaş)
    {
      user_id: userId,
      ear_tag: 'MD-2024-001',
      type: 'manda',
      breed: 'Anadolu Mandası',
      birth_date: format(subMonths(now, 60), 'yyyy-MM-dd'), // 5 yaş - Manda
      gender: 'dişi',
      notes: 'Süt mandası, kaymak kalitesi yüksek.',
      status: 'aktif',
    },
    // Düğe (2-4 yaş dişi manda)
    {
      user_id: userId,
      ear_tag: 'MD-2024-002',
      type: 'manda',
      breed: 'Anadolu Mandası',
      birth_date: format(subMonths(now, 30), 'yyyy-MM-dd'), // 2.5 yaş - Düğe
      gender: 'dişi',
      notes: 'Genç düğe, ilk gebelik bekleniyor.',
      mother_ear_tag: 'MD-2024-001',
      status: 'aktif',
    },
    // Malak (0-2 yaş)
    {
      user_id: userId,
      ear_tag: 'MD-2024-003',
      type: 'manda',
      breed: 'Anadolu Mandası',
      birth_date: format(subMonths(now, 8), 'yyyy-MM-dd'), // 8 ay - Malak
      gender: 'erkek',
      notes: 'Erkek malak, sağlıklı.',
      mother_ear_tag: 'MD-2024-001',
      status: 'aktif',
    },

    // === ATLAR ===
    // At/Kısrak (4+ yaş)
    {
      user_id: userId,
      ear_tag: 'AT-2024-001',
      type: 'at',
      breed: 'Arap Atı',
      birth_date: format(subMonths(now, 72), 'yyyy-MM-dd'), // 6 yaş - Kısrak
      gender: 'dişi',
      notes: 'Damızlık kısrak, yarış kökenli.',
      status: 'aktif',
    },
    {
      user_id: userId,
      ear_tag: 'AT-2024-002',
      type: 'at',
      breed: 'Arap Atı',
      birth_date: format(subMonths(now, 60), 'yyyy-MM-dd'), // 5 yaş - At
      gender: 'erkek',
      notes: 'Aygır, iş atı olarak kullanılıyor.',
      status: 'aktif',
    },
    // Genç At (1-4 yaş)
    {
      user_id: userId,
      ear_tag: 'AT-2024-003',
      type: 'at',
      breed: 'Arap Atı',
      birth_date: format(subMonths(now, 24), 'yyyy-MM-dd'), // 2 yaş - Genç At
      gender: 'dişi',
      notes: 'Genç kısrak, eğitim aşamasında.',
      mother_ear_tag: 'AT-2024-001',
      status: 'aktif',
    },
    // Tay (0-1 yaş)
    {
      user_id: userId,
      ear_tag: 'AT-2024-004',
      type: 'at',
      breed: 'Arap Atı',
      birth_date: format(subMonths(now, 6), 'yyyy-MM-dd'), // 6 ay - Tay
      gender: 'erkek',
      notes: 'Erkek tay, anne yanında.',
      mother_ear_tag: 'AT-2024-001',
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
    // Sığır aşıları
    {
      user_id: userId,
      animal_id: animals[0].id, // İnek
      name: 'Şap Aşısı',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 120), 'yyyy-MM-dd'),
      completed: true,
      notes: 'Yıllık şap aşısı yapıldı.',
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
      animal_id: animals[1].id, // İnek 2
      name: 'Şap Aşısı',
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
      next_date: format(subDays(now, 10), 'yyyy-MM-dd'), // Gecikmiş
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[3].id, // Düve
      name: 'IBR Aşısı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 335), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[6].id, // Buzağı
      name: 'BVD Aşısı',
      date: format(subDays(now, 30), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 150), 'yyyy-MM-dd'),
      completed: true,
    },
    // Koyun aşıları
    {
      user_id: userId,
      animal_id: animals[9].id, // Koyun
      name: 'Enterotoksemi Aşısı',
      date: format(subDays(now, 45), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 45), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[10].id, // Koyun 2
      name: 'Çiçek Aşısı',
      date: format(subMonths(now, 4), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 240), 'yyyy-MM-dd'),
      completed: true,
    },
    // Keçi aşıları
    {
      user_id: userId,
      animal_id: animals[15].id, // Keçi
      name: 'Enterotoksemi Aşısı',
      date: format(subDays(now, 60), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 30), 'yyyy-MM-dd'),
      completed: true,
    },
    // Manda aşıları
    {
      user_id: userId,
      animal_id: animals[20].id, // Manda
      name: 'Şap Aşısı',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 120), 'yyyy-MM-dd'),
      completed: true,
    },
    // At aşıları
    {
      user_id: userId,
      animal_id: animals[23].id, // At
      name: 'Tetanoz Aşısı',
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 270), 'yyyy-MM-dd'),
      completed: true,
    },
    {
      user_id: userId,
      animal_id: animals[24].id, // At 2
      name: 'Influenza Aşısı',
      date: format(subDays(now, 90), 'yyyy-MM-dd'),
      next_date: format(addDays(now, 90), 'yyyy-MM-dd'),
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
    // 7. ayda gebe - süt kesimi yaklaşıyor
    {
      user_id: userId,
      animal_id: animals[0].id, // İnek
      date: format(subMonths(now, 7), 'yyyy-MM-dd'),
      type: 'suni',
      expected_birth_date: format(addDays(subMonths(now, 7), 283), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: '7. ayda, süt kesimi yaklaşıyor. 6. ay kontrolü yapıldı.',
    },
    // 6. ayda gebe
    {
      user_id: userId,
      animal_id: animals[1].id, // İnek 2
      date: format(subMonths(now, 6), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 6), 283), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: '6. ayda, sağlıklı ilerliyor.',
    },
    // 4. ayda gebe - düve
    {
      user_id: userId,
      animal_id: animals[3].id, // Düve
      date: format(subMonths(now, 4), 'yyyy-MM-dd'),
      type: 'suni',
      expected_birth_date: format(addDays(subMonths(now, 4), 283), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: 'İlk gebelik, dikkatli takip.',
    },
    // Keçi gebeliği
    {
      user_id: userId,
      animal_id: animals[15].id, // Keçi
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 3), 150), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: 'Keçi gebeliği, normal seyrediyor.',
    },
    // Koyun gebeliği
    {
      user_id: userId,
      animal_id: animals[9].id, // Koyun
      date: format(subMonths(now, 4), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 4), 150), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: 'İkiz gebelik muhtemel.',
    },
    // Manda gebeliği
    {
      user_id: userId,
      animal_id: animals[20].id, // Manda
      date: format(subMonths(now, 5), 'yyyy-MM-dd'),
      type: 'doğal',
      expected_birth_date: format(addDays(subMonths(now, 5), 310), 'yyyy-MM-dd'),
      is_pregnant: true,
      notes: 'Manda gebeliği, uzun süre (10-11 ay).',
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
    // Gelirler
    {
      user_id: userId,
      type: 'gelir',
      category: 'sut',
      amount: 15000,
      description: 'Ocak ayı süt satışı - 500 litre',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'sut',
      amount: 18000,
      description: 'Şubat ayı süt satışı - 600 litre',
      date: format(now, 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'sut',
      amount: 12000,
      description: 'Aralık ayı süt satışı',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'hayvan-satis',
      amount: 45000,
      description: 'Dana satışı - TR-2023-015',
      date: format(subDays(now, 20), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'hayvan-satis',
      amount: 8000,
      description: 'Kuzu satışı (3 adet)',
      date: format(subDays(now, 35), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'destek',
      amount: 8000,
      description: 'Hayvancılık desteği - 1. taksit',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'destek',
      amount: 5000,
      description: 'Yem desteği',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gelir',
      category: 'deri',
      amount: 2500,
      description: 'Yapağı satışı - Merinos',
      date: format(subMonths(now, 3), 'yyyy-MM-dd'),
    },
    // Giderler
    {
      user_id: userId,
      type: 'gider',
      category: 'yem',
      amount: 12000,
      description: 'Aylık yem alımı - karma yem 2 ton',
      date: format(subDays(now, 5), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'yem',
      amount: 11500,
      description: 'Önceki ay yem alımı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'yem',
      amount: 10000,
      description: 'Saman alımı - 50 balya',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'veteriner',
      amount: 2500,
      description: 'Aşı ve muayene masrafları',
      date: format(subDays(now, 15), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'veteriner',
      amount: 1800,
      description: 'Gebelik kontrolleri',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'ilac',
      amount: 800,
      description: 'Vitamin ve mineral takviyeleri',
      date: format(subDays(now, 10), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'ilac',
      amount: 1200,
      description: 'Parazit ilaçları',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'ekipman',
      amount: 5000,
      description: 'Süt sağım makinesi bakımı',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'ekipman',
      amount: 3500,
      description: 'Yem karma makinesi tamiri',
      date: format(subMonths(now, 2), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'iscilik',
      amount: 8000,
      description: 'Aylık işçi ücreti',
      date: format(now, 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'iscilik',
      amount: 8000,
      description: 'Önceki ay işçi ücreti',
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'elektrik',
      amount: 2200,
      description: 'Elektrik faturası',
      date: format(subDays(now, 7), 'yyyy-MM-dd'),
    },
    {
      user_id: userId,
      type: 'gider',
      category: 'yakit',
      amount: 3000,
      description: 'Traktör yakıt',
      date: format(subDays(now, 12), 'yyyy-MM-dd'),
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
