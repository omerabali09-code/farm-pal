// Predefined vaccination types for combobox
export const VACCINATION_TYPES = [
  { value: 'sap', label: 'Şap Aşısı', description: 'Şap hastalığına karşı' },
  { value: 'brusella', label: 'Brusella Aşısı', description: 'Bruselloza karşı' },
  { value: 'anthrax', label: 'Şarbon Aşısı', description: 'Şarbon hastalığına karşı' },
  { value: 'clostridial', label: 'Klostridyal Aşı', description: 'Enterotoksemi vb.' },
  { value: 'pasteurella', label: 'Pasteurella Aşısı', description: 'Solunum yolu enfeksiyonları' },
  { value: 'leptospirosis', label: 'Leptospiroz Aşısı', description: 'Leptospiroza karşı' },
  { value: 'ibr', label: 'IBR Aşısı', description: 'Enfeksiyöz Bovine Rhinotracheitis' },
  { value: 'bvd', label: 'BVD Aşısı', description: 'Bovine Viral Diyare' },
  { value: 'rotavirüs', label: 'Rotavirüs Aşısı', description: 'Buzağı ishali' },
  { value: 'koronavirüs', label: 'Koronavirüs Aşısı', description: 'Buzağı ishali' },
  { value: 'kuduz', label: 'Kuduz Aşısı', description: 'Kuduza karşı' },
  { value: 'ppd', label: 'PPD (Tüberkülin) Testi', description: 'Tüberküloz kontrolü' },
  { value: 'theileriosis', label: 'Theileriosis Aşısı', description: 'Kan paraziti' },
  { value: 'ecthyma', label: 'Ektima Aşısı', description: 'Orf/Ektima hastalığı' },
  { value: 'pox', label: 'Çiçek Aşısı', description: 'Koyun/Keçi çiçeği' },
  { value: 'enterotoksemi', label: 'Enterotoksemi Aşısı', description: 'Bağırsak zehirlenmesi' },
  { value: 'yanıkara', label: 'Yanıkara Aşısı', description: 'Clostridium chauvoei' },
  { value: 'agalaksi', label: 'Agalaksi Aşısı', description: 'Sütsüzlük hastalığı' },
  { value: 'mastitis', label: 'Mastitis Aşısı', description: 'Meme iltihabı' },
  { value: 'diger', label: 'Diğer', description: 'Diğer aşılar' },
];

export const HEALTH_RECORD_TYPES = [
  { value: 'vet_visit', label: 'Veteriner Ziyareti', icon: '🩺' },
  { value: 'treatment', label: 'Tedavi', icon: '💊' },
  { value: 'illness', label: 'Hastalık', icon: '🤒' },
  { value: 'injury', label: 'Yaralanma', icon: '🩹' },
  { value: 'surgery', label: 'Ameliyat', icon: '⚕️' },
  { value: 'deworming', label: 'İç/Dış Parazit', icon: '🐛' },
  { value: 'pregnancy_check', label: 'Gebelik Kontrolü', icon: '🤰' },
  { value: 'hoof_care', label: 'Tırnak Bakımı', icon: '🦶' },
  { value: 'other', label: 'Diğer', icon: '📋' },
];

export const MILK_QUALITY_OPTIONS = [
  { value: 'iyi', label: 'İyi', color: 'bg-green-100 text-green-800' },
  { value: 'orta', label: 'Orta', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'zayif', label: 'Zayıf', color: 'bg-red-100 text-red-800' },
];
