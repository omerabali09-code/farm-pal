export type AnimalType = 'inek' | 'koyun' | 'keçi' | 'manda' | 'at' | 'diğer';
export type Gender = 'dişi' | 'erkek';
export type InseminationType = 'doğal' | 'suni';

export interface Animal {
  id: string;
  earTag: string; // Küpe numarası
  type: AnimalType;
  breed: string; // Irk
  birthDate: string;
  gender: Gender;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vaccination {
  id: string;
  animalId: string;
  name: string;
  date: string;
  nextDate?: string;
  completed: boolean;
  notes?: string;
}

export interface Insemination {
  id: string;
  animalId: string;
  date: string;
  type: InseminationType;
  expectedBirthDate: string;
  actualBirthDate?: string;
  notes?: string;
  isPregnant: boolean;
}

export interface Notification {
  id: string;
  type: 'birth' | 'vaccination' | 'insemination';
  animalId: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Ortalama gebelik süreleri (gün)
export const GESTATION_PERIODS: Record<AnimalType, number> = {
  'inek': 283,
  'koyun': 150,
  'keçi': 150,
  'manda': 310,
  'at': 340,
  'diğer': 200,
};

export const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export const ANIMAL_TYPE_ICONS: Record<AnimalType, string> = {
  'inek': '🐄',
  'koyun': '🐑',
  'keçi': '🐐',
  'manda': '🐃',
  'at': '🐴',
  'diğer': '🐾',
};
