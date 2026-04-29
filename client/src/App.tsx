import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Anasayfa} />
      <Route path="/ogren" component={Ogren} />
      <Route path="/donustur" component={Donustur} />
      <Route path="/profil" component={Profil} />
      <Route path="/kullan/:code" component={Kullan} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
