import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import InstallPrompt from "@/components/InstallPrompt";
import { AdMobBanner } from "@/components/AdMobBanner";

import Index from "./pages/Index";
import Monthly from "./pages/Monthly";
import Accounts from "./pages/Accounts";
import Archive from "./pages/Archive";
import Options from "./pages/Options";
import Install from "./pages/Install";
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
              <InstallPrompt />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/monthly" element={<Monthly />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/options" element={<Options />} />
                <Route path="/install" element={<Install />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
