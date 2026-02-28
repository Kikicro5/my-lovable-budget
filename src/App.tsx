import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import InstallPrompt from "@/components/InstallPrompt";
import { AdMobBanner } from "@/components/AdMobBanner";
import { GlobalActivateCodeDialog } from "@/components/GlobalActivateCodeDialog";
import { PremiumToastBridge } from "@/components/PremiumToastBridge";

import Index from "./pages/Index";
import Monthly from "./pages/Monthly";
import Accounts from "./pages/Accounts";
import Archive from "./pages/Archive";
import Options from "./pages/Options";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AdMobBanner />
            <BrowserRouter>
              <PremiumProvider>
                <PremiumToastBridge />
                <GlobalActivateCodeDialog />
                <InstallPrompt />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/monthly" element={<Monthly />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="/options" element={<Options />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PremiumProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
