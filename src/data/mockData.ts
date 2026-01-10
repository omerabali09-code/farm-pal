import { Animal, Vaccination, Insemination, Notification } from '@/types/animal';
import { addDays, subDays, format } from 'date-fns';

const today = new Date();

export const mockAnimals: Animal[] = [
  {
    id: '1',
    earTag: 'TR-2024-001',
    type: 'inek',
    breed: 'Simental',
    birthDate: '2021-03-15',
    gender: 'dişi',
    notes: 'Sağlıklı, günlük süt verimi 25 litre',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    earTag: 'TR-2024-002',
    type: 'inek',
    breed: 'Holstein',
    birthDate: '2020-06-20',
    gender: 'dişi',
    notes: 'İkinci buzağısına gebe',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    earTag: 'TR-2024-003',
    type: 'koyun',
    breed: 'Merinos',
    birthDate: '2022-02-10',
    gender: 'dişi',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    earTag: 'TR-2024-004',
    type: 'keçi',
    breed: 'Saanen',
    birthDate: '2023-01-05',
    gender: 'dişi',
    notes: 'Yüksek süt verimi',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '5',
    earTag: 'TR-2024-005',
    type: 'inek',
    breed: 'Montofon',
    birthDate: '2019-11-22',
    gender: 'dişi',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockVaccinations: Vaccination[] = [
  {
    id: 'v1',
    animalId: '1',
    name: 'Şap Aşısı',
    date: format(subDays(today, 30), 'yyyy-MM-dd'),
    nextDate: format(addDays(today, 150), 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: 'v2',
    animalId: '1',
    name: 'Brusella Aşısı',
    date: format(subDays(today, 60), 'yyyy-MM-dd'),
    nextDate: format(subDays(today, 5), 'yyyy-MM-dd'), // Gecikmiş
    completed: true,
  },
  {
    id: 'v3',
    animalId: '2',
    name: 'Şap Aşısı',
    date: format(subDays(today, 45), 'yyyy-MM-dd'),
    nextDate: format(addDays(today, 5), 'yyyy-MM-dd'), // Yaklaşan
    completed: true,
  },
  {
    id: 'v4',
    animalId: '3',
    name: 'Enterotoksemi Aşısı',
    date: format(subDays(today, 90), 'yyyy-MM-dd'),
    nextDate: format(addDays(today, 90), 'yyyy-MM-dd'),
    completed: true,
  },
];

export const mockInseminations: Insemination[] = [
  {
    id: 'i1',
    animalId: '1',
    date: format(subDays(today, 200), 'yyyy-MM-dd'),
    type: 'suni',
    expectedBirthDate: format(addDays(today, 83), 'yyyy-MM-dd'),
    isPregnant: true,
    notes: 'Suni tohumlama başarılı',
  },
  {
    id: 'i2',
    animalId: '2',
    date: format(subDays(today, 270), 'yyyy-MM-dd'),
    type: 'doğal',
    expectedBirthDate: format(addDays(today, 13), 'yyyy-MM-dd'),
    isPregnant: true,
    notes: 'Doğum yaklaşıyor',
  },
  {
    id: 'i3',
    animalId: '4',
    date: format(subDays(today, 100), 'yyyy-MM-dd'),
    type: 'doğal',
    expectedBirthDate: format(addDays(today, 50), 'yyyy-MM-dd'),
    isPregnant: true,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'birth',
    animalId: '2',
    message: 'TR-2024-002 numaralı ineğin doğumu 13 gün içinde bekleniyor',
    date: format(today, 'yyyy-MM-dd'),
    isRead: false,
    priority: 'high',
  },
  {
    id: 'n2',
    type: 'vaccination',
    animalId: '1',
    message: 'TR-2024-001 numaralı ineğin Brusella aşısı 5 gün gecikti',
    date: format(today, 'yyyy-MM-dd'),
    isRead: false,
    priority: 'high',
  },
  {
    id: 'n3',
    type: 'vaccination',
    animalId: '2',
    message: 'TR-2024-002 numaralı ineğin Şap aşısı 5 gün içinde yapılmalı',
    date: format(today, 'yyyy-MM-dd'),
    isRead: false,
    priority: 'medium',
  },
  {
    id: 'n4',
    type: 'birth',
    animalId: '4',
    message: 'TR-2024-004 numaralı keçinin doğumu 50 gün içinde bekleniyor',
    date: format(today, 'yyyy-MM-dd'),
    isRead: true,
    priority: 'low',
  },
];
