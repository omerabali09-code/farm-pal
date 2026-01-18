import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MilkProductionData {
  date: string;
  animal_ear_tag: string;
  morning_amount: number;
  evening_amount: number;
  total_amount: number;
  quality: string | null;
}

interface HealthExpenseData {
  date: string;
  animal_ear_tag: string;
  record_type: string;
  title: string;
  cost: number;
  vet_name: string | null;
}

interface ReportSummary {
  totalMilk: number;
  totalMilkIncome: number;
  totalHealthExpenses: number;
  animalCount: number;
  vaccinationCount: number;
  pregnantCount: number;
}

export function exportMonthlyMilkReport(
  milkData: MilkProductionData[],
  summary: {
    totalProduction: number;
    totalIncome: number;
    avgDaily: number;
    pricePerLiter: number;
    month: string;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(45, 106, 79); // Primary green
  doc.text('Aylık Süt Üretim Raporu', pageWidth / 2, 20, { align: 'center' });
  
  // Month
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(summary.month, pageWidth / 2, 28, { align: 'center' });
  
  // Summary Cards
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  const startY = 40;
  const cardWidth = 45;
  const cardHeight = 25;
  const cardGap = 5;
  
  // Card 1 - Total Production
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(15, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.text('Toplam Üretim', 20, startY + 8);
  doc.setFontSize(14);
  doc.setTextColor(45, 106, 79);
  doc.text(`${summary.totalProduction.toFixed(1)} L`, 20, startY + 18);
  
  // Card 2 - Total Income
  doc.setTextColor(0);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(15 + cardWidth + cardGap, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.text('Toplam Gelir', 20 + cardWidth + cardGap, startY + 8);
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text(`₺${summary.totalIncome.toLocaleString('tr-TR')}`, 20 + cardWidth + cardGap, startY + 18);
  
  // Card 3 - Daily Average
  doc.setTextColor(0);
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(15 + (cardWidth + cardGap) * 2, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.text('Günlük Ortalama', 20 + (cardWidth + cardGap) * 2, startY + 8);
  doc.setFontSize(14);
  doc.setTextColor(202, 138, 4);
  doc.text(`${summary.avgDaily.toFixed(1)} L`, 20 + (cardWidth + cardGap) * 2, startY + 18);
  
  // Card 4 - Price
  doc.setTextColor(0);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15 + (cardWidth + cardGap) * 3, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.text('Litre Fiyatı', 20 + (cardWidth + cardGap) * 3, startY + 8);
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(`₺${summary.pricePerLiter}`, 20 + (cardWidth + cardGap) * 3, startY + 18);
  
  // Table
  doc.setTextColor(0);
  autoTable(doc, {
    startY: startY + cardHeight + 15,
    head: [['Tarih', 'Hayvan', 'Sabah (L)', 'Akşam (L)', 'Toplam (L)', 'Kalite']],
    body: milkData.map(row => [
      format(new Date(row.date), 'dd.MM.yyyy'),
      row.animal_ear_tag,
      row.morning_amount?.toFixed(1) || '0',
      row.evening_amount?.toFixed(1) || '0',
      row.total_amount?.toFixed(1) || '0',
      row.quality || '-'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [45, 106, 79] },
    styles: { fontSize: 9 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Oluşturulma: ${format(new Date(), 'dd.MM.yyyy HH:mm')} | Sayfa ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`sut-raporu-${format(new Date(), 'yyyy-MM')}.pdf`);
}

export function exportHealthExpensesReport(
  healthData: HealthExpenseData[],
  summary: {
    totalCost: number;
    recordCount: number;
    month: string;
    byType: { type: string; count: number; cost: number }[];
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Red
  doc.text('Sağlık Harcamaları Raporu', pageWidth / 2, 20, { align: 'center' });
  
  // Month
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(summary.month, pageWidth / 2, 28, { align: 'center' });
  
  // Summary
  const startY = 40;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Toplam Harcama: ₺${summary.totalCost.toLocaleString('tr-TR')}`, 15, startY);
  doc.text(`Kayıt Sayısı: ${summary.recordCount}`, 15, startY + 8);
  
  // Type breakdown
  let typeY = startY + 20;
  doc.setFontSize(11);
  doc.text('Türe Göre Dağılım:', 15, typeY);
  typeY += 8;
  
  summary.byType.forEach(item => {
    doc.setFontSize(9);
    doc.text(`• ${item.type}: ${item.count} kayıt - ₺${item.cost.toLocaleString('tr-TR')}`, 20, typeY);
    typeY += 6;
  });
  
  // Table
  autoTable(doc, {
    startY: typeY + 10,
    head: [['Tarih', 'Hayvan', 'Tür', 'Başlık', 'Maliyet', 'Veteriner']],
    body: healthData.map(row => [
      format(new Date(row.date), 'dd.MM.yyyy'),
      row.animal_ear_tag,
      row.record_type,
      row.title,
      row.cost ? `₺${row.cost.toLocaleString('tr-TR')}` : '-',
      row.vet_name || '-'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 9 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Oluşturulma: ${format(new Date(), 'dd.MM.yyyy HH:mm')} | Sayfa ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`saglik-harcamalari-${format(new Date(), 'yyyy-MM')}.pdf`);
}

export function exportFullReport(
  summary: ReportSummary,
  farmName: string = 'Çiftlik'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(45, 106, 79);
  doc.text(farmName, pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text('Aylık Genel Rapor', pageWidth / 2, 35, { align: 'center' });
  doc.text(format(new Date(), 'MMMM yyyy', { locale: tr }), pageWidth / 2, 43, { align: 'center' });
  
  // Line
  doc.setDrawColor(200);
  doc.line(15, 50, pageWidth - 15, 50);
  
  // Stats
  let y = 65;
  const leftCol = 25;
  const rightCol = pageWidth / 2 + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  
  // Left column
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('HAYVAN İSTATİSTİKLERİ', leftCol, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Toplam Hayvan: ${summary.animalCount}`, leftCol, y);
  y += 8;
  doc.text(`Gebe Hayvan: ${summary.pregnantCount}`, leftCol, y);
  y += 8;
  doc.text(`Yapılan Aşı: ${summary.vaccinationCount}`, leftCol, y);
  
  // Right column - Financial
  y = 65;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('FİNANSAL ÖZET', rightCol, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text(`Süt Geliri: ₺${summary.totalMilkIncome.toLocaleString('tr-TR')}`, rightCol, y);
  y += 8;
  doc.setTextColor(220, 38, 38);
  doc.text(`Sağlık Gideri: ₺${summary.totalHealthExpenses.toLocaleString('tr-TR')}`, rightCol, y);
  y += 8;
  const net = summary.totalMilkIncome - summary.totalHealthExpenses;
  doc.setTextColor(net >= 0 ? 22 : 220, net >= 0 ? 163 : 38, net >= 0 ? 74 : 38);
  doc.text(`Net: ₺${net.toLocaleString('tr-TR')}`, rightCol, y);
  
  // Production
  y += 25;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('SÜT ÜRETİMİ', leftCol, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Toplam Üretim: ${summary.totalMilk.toFixed(1)} litre`, leftCol, y);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Oluşturulma: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );
  
  doc.save(`ciftlik-raporu-${format(new Date(), 'yyyy-MM')}.pdf`);
}
