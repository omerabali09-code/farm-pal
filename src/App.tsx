import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import Vaccinations from "./pages/Vaccinations";
import Pregnancy from "./pages/Pregnancy";
import CalendarPage from "./pages/Calendar";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Assistant from "./pages/Assistant";
import Finance from "./pages/Finance";
import Profile from "./pages/Profile";
import ExitedAnimals from "./pages/ExitedAnimals";
import HealthRecords from "./pages/HealthRecords";
import MilkProduction from "./pages/MilkProduction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/hayvanlar" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
            <Route path="/cikis-yapan" element={<ProtectedRoute><ExitedAnimals /></ProtectedRoute>} />
            <Route path="/hayvan/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
            <Route path="/asilar" element={<ProtectedRoute><Vaccinations /></ProtectedRoute>} />
            <Route path="/gebelik" element={<ProtectedRoute><Pregnancy /></ProtectedRoute>} />
            <Route path="/takvim" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/raporlar" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/bildirimler" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/asistan" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/finans" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
            <Route path="/saglik" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
            <Route path="/sut-uretimi" element={<ProtectedRoute><MilkProduction /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
