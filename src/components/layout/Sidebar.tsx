import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PawPrint, 
  Syringe, 
  Baby, 
  Bell, 
  MessageCircle,
  Menu,
  X,
  Leaf,
  Calendar,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Ana Panel', icon: LayoutDashboard },
  { path: '/hayvanlar', label: 'Hayvanlar', icon: PawPrint },
  { path: '/asilar', label: 'Aşı Takibi', icon: Syringe },
  { path: '/gebelik', label: 'Gebelik Takibi', icon: Baby },
  { path: '/takvim', label: 'Takvim', icon: Calendar },
  { path: '/raporlar', label: 'Raporlar', icon: BarChart3 },
  { path: '/bildirimler', label: 'Bildirimler', icon: Bell },
  { path: '/asistan', label: 'Çiftlik Asistanı', icon: MessageCircle },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="w-12 h-12 rounded-xl gradient-farm flex items-center justify-center shadow-farm-md">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">ÇiftlikTakip</h1>
              <p className="text-xs text-muted-foreground">Akıllı Çiftlik Yönetimi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-farm-sm" 
                      : "text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
            {user && (
              <div className="px-4 py-3 rounded-xl bg-sidebar-accent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
