
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Calculator } from "@/pages/Calculator";
import { Recipes } from "@/pages/Recipes";
import { Plants } from "@/pages/Plants";
import NotFound from "./pages/NotFound";
import './i18n';

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
