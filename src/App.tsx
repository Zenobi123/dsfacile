import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Login = lazy(() => import("./pages/Login"));
const DsfHome = lazy(() => import("./pages/DsfHome"));
const DsfWorkspace = lazy(() => import("./pages/DsfWorkspace"));

// Le tableau de bord d'administration n'a aucune authentification et n'affiche que des
// données factices : il reste accessible en développement, jamais dans un build de production.
// Le ternaire est évalué au build, ce qui retire aussi son chunk du bundle publié.
const AdminDashboard = import.meta.env.DEV ? lazy(() => import("./pages/admin/AdminDashboard")) : null;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-gray-50 p-8 text-primary">Chargement de DSFacile…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<DsfHome />} />
            <Route path="/app/normal" element={<DsfWorkspace mode="normal" />} />
            <Route path="/app/smt" element={<DsfWorkspace mode="smt" />} />
            {AdminDashboard ? <Route path="/admin" element={<AdminDashboard />} /> : null}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
