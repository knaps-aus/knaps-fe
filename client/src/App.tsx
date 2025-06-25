import React, { useEffect } from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProductManagement from "@/pages/product-management";
import NotFound from "@/pages/not-found";
import { keycloak } from "./keycloak";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProductManagement} />
      <Route path="/products" component={ProductManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Keycloak on mount and set up token refresh
  useEffect(() => {
    keycloak.init({ onLoad: "login-required", checkLoginIframe: false });
    const refreshInterval = setInterval(() => {
      keycloak.updateToken(70);
    }, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={{ onLoad: "login-required", checkLoginIframe: false }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
