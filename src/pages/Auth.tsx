import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: '',
    farmName: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast({
        title: "Giriş başarısız",
        description: "E-posta veya şifre hatalı.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Şifreler eşleşmiyor",
        description: "Lütfen şifreleri kontrol edin.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Şifre çok kısa",
        description: "Şifre en az 6 karakter olmalı.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await signUp(
      signupData.email, 
      signupData.password,
      signupData.fullName,
      signupData.farmName
    );
    
    if (error) {
      toast({
        title: "Kayıt başarısız",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Hoş geldiniz! 🎉",
        description: "Hesabınız oluşturuldu.",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-farm flex items-center justify-center shadow-farm-lg mx-auto mb-4">
            <Leaf className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ÇiftlikTakip</h1>
          <p className="text-muted-foreground">Akıllı Çiftlik Yönetim Sistemi</p>
        </div>

        <Card className="border-2">
          <Tabs defaultValue="login">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="farm" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Giriş Yap'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Ad Soyad</Label>
                      <Input
                        id="fullName"
                        placeholder="Ahmet Yılmaz"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmName">Çiftlik Adı</Label>
                      <Input
                        id="farmName"
                        placeholder="Yıldız Çiftliği"
                        value={signupData.farmName}
                        onChange={(e) => setSignupData({ ...signupData, farmName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="En az 6 karakter"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Şifreyi tekrar girin"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="farm" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Kayıt Ol'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
