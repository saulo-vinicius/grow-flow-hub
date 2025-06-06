
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Calculator } from "@/pages/Calculator";
import { Recipes } from "@/pages/Recipes";
import { Plants } from "@/pages/Plants";
import { Account } from "@/pages/Account";
import { Auth } from "@/pages/Auth";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/NotFound";
import './i18n';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/plants" element={<Plants />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
