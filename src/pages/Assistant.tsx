import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAnimals, mockInseminations, mockVaccinations } from '@/data/mockData';
import { differenceInDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  "Bu ay doğum yapacak hayvanlar hangileri?",
  "Aşısı geciken hayvan var mı?",
  "Kaç tane gebe hayvanım var?",
  "Toplam hayvan sayısı nedir?",
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Merhaba! 👋 Ben çiftlik asistanınızım. Size hayvanlarınız, aşılar ve gebelik takibi hakkında yardımcı olabilirim. Sormak istediğiniz bir şey var mı?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();
    const today = new Date();

    // Bu ay doğum yapacak hayvanlar
    if (q.includes('doğum') && (q.includes('bu ay') || q.includes('yaklaşan'))) {
      const upcomingBirths = mockInseminations.filter(i => {
        if (!i.isPregnant) return false;
        const days = differenceInDays(new Date(i.expectedBirthDate), today);
        return days >= 0 && days <= 30;
      });

      if (upcomingBirths.length === 0) {
        return 'Bu ay içinde doğum beklenen hayvan bulunmuyor. 🎉';
      }

      const details = upcomingBirths.map(i => {
        const animal = mockAnimals.find(a => a.id === i.animalId);
        const days = differenceInDays(new Date(i.expectedBirthDate), today);
        return `• ${animal?.earTag} (${animal?.breed}) - ${days} gün sonra (${format(new Date(i.expectedBirthDate), 'd MMMM', { locale: tr })})`;
      }).join('\n');

      return `📅 Bu ay doğum beklenen ${upcomingBirths.length} hayvan var:\n\n${details}`;
    }

    // Geciken aşılar
    if (q.includes('aşı') && (q.includes('gecik') || q.includes('geçmiş'))) {
      const overdueVaccinations = mockVaccinations.filter(v => {
        if (!v.nextDate) return false;
        return differenceInDays(new Date(v.nextDate), today) < 0;
      });

      if (overdueVaccinations.length === 0) {
        return 'Harika haber! Gecikmiş aşı bulunmuyor. Tüm aşılar güncel. ✅';
      }

      const details = overdueVaccinations.map(v => {
        const animal = mockAnimals.find(a => a.id === v.animalId);
        const days = Math.abs(differenceInDays(new Date(v.nextDate!), today));
        return `• ${animal?.earTag}: ${v.name} - ${days} gün gecikti ⚠️`;
      }).join('\n');

      return `⚠️ Dikkat! ${overdueVaccinations.length} gecikmiş aşı var:\n\n${details}\n\nBu aşıları en kısa sürede yaptırmanızı öneririm.`;
    }

    // Gebe hayvan sayısı
    if (q.includes('gebe') || q.includes('hamile')) {
      const pregnantCount = mockInseminations.filter(i => i.isPregnant).length;
      return `🤰 Şu anda ${pregnantCount} gebe hayvanınız var. Detaylı bilgi için Gebelik Takibi sayfasını ziyaret edebilirsiniz.`;
    }

    // Toplam hayvan
    if (q.includes('toplam') || q.includes('kaç hayvan') || q.includes('sayı')) {
      const byType: Record<string, number> = {};
      mockAnimals.forEach(a => {
        byType[a.type] = (byType[a.type] || 0) + 1;
      });

      const typeText = Object.entries(byType)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');

      return `🐄 Toplam ${mockAnimals.length} hayvanınız var:\n${typeText}`;
    }

    // Belirli bir hayvan hakkında soru
    const earTagMatch = question.match(/TR-\d{4}-\d{3}/i);
    if (earTagMatch) {
      const animal = mockAnimals.find(a => a.earTag.toLowerCase() === earTagMatch[0].toLowerCase());
      if (animal) {
        const insemination = mockInseminations.find(i => i.animalId === animal.id && i.isPregnant);
        const vaccinations = mockVaccinations.filter(v => v.animalId === animal.id);
        
        let response = `📋 ${animal.earTag} hakkında bilgiler:\n`;
        response += `• Tür: ${animal.type}, Irk: ${animal.breed}\n`;
        response += `• Cinsiyet: ${animal.gender}\n`;
        
        if (insemination) {
          response += `• Gebe - Tahmini doğum: ${format(new Date(insemination.expectedBirthDate), 'd MMMM yyyy', { locale: tr })}\n`;
        }
        
        if (vaccinations.length > 0) {
          response += `• ${vaccinations.length} aşı kaydı mevcut`;
        }
        
        return response;
      }
      return `❌ ${earTagMatch[0]} numaralı hayvan bulunamadı.`;
    }

    return '🤔 Bu soruyu tam anlayamadım. Şu konularda yardımcı olabilirim:\n• Doğum takibi\n• Aşı durumları\n• Hayvan sayıları\n• Belirli bir hayvan hakkında bilgi (küpe numarası ile)';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const response = generateResponse(input);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };

      const response = generateResponse(question);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setInput('');
    }, 100);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-farm flex items-center justify-center shadow-farm-md">
              <Bot className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Çiftlik Asistanı</h1>
              <p className="text-sm text-muted-foreground">Size yardımcı olmak için buradayım</p>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(q)}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {q}
            </Button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-card rounded-2xl border-2 border-border p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-4 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir soru sorun..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} variant="farm" size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
