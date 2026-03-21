import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import InstallPrompt from "@/components/InstallPrompt";
import { initBilling } from "@/services/billing";

import Index from "./pages/Index";
import Monthly from "./pages/Monthly";
import Accounts from "./pages/Accounts";
import Archive from "./pages/Archive";
import Options from "./pages/Options";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initBilling().then((ok) => {
      if (ok) console.log('[App] Billing initialized');
    });
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <AuthProvider>
            <PremiumProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                
                <BrowserRouter>
                  <InstallPrompt />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/monthly" element={<Monthly />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/archive" element={<Archive />} />
                    <Route path="/options" element={<Options />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </PremiumProvider>
          </AuthProvider>
        </LanguageProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
