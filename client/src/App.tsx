import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Anasayfa } from "@/pages/Anasayfa";
import { Ogren } from "@/pages/Ogren";
import { Donustur } from "@/pages/Donustur";
import { Profil } from "@/pages/Profil";
import { Kullan } from "@/pages/Kullan";
import { Giris } from "@/pages/Giris";
import { Kayit } from "@/pages/Kayit";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function LoadingShell() {
  return (
    <main className="app-shell flex flex-1 items-center justify-center">
      <p className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]">
        Yükleniyor...
      </p>
    </main>
  );
}

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingShell />;
  if (!user) return <Redirect to="/giris" />;
  return <Component />;
}

function PublicOnlyRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingShell />;
  if (user) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  const [location] = useLocation();
  // /kullan/:code is public so merchants can validate without an account
  if (location.startsWith("/kullan/")) {
    return (
      <Switch>
        <Route path="/kullan/:code" component={Kullan} />
      </Switch>
    );
  }
  return (
    <Switch>
      <Route path="/giris">
        {() => <PublicOnlyRoute component={Giris} />}
      </Route>
      <Route path="/kayit">
        {() => <PublicOnlyRoute component={Kayit} />}
      </Route>
      <Route path="/">
        {() => <ProtectedRoute component={Anasayfa} />}
      </Route>
      <Route path="/ogren">
        {() => <ProtectedRoute component={Ogren} />}
      </Route>
      <Route path="/donustur">
        {() => <ProtectedRoute component={Donustur} />}
      </Route>
      <Route path="/profil">
        {() => <ProtectedRoute component={Profil} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
