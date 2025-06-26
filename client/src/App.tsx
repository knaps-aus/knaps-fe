import React, { useEffect } from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProductManagement from "@/pages/product-management";
import NotFound from "@/pages/not-found";
import { keycloak, keycloakConfig } from "./keycloak";
import { clearKeycloakCache } from "./lib/keycloak-cache-clear";
import { KeycloakDebug } from "./components/keycloak-debug";

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
  // Clear Keycloak cache on app initialization
  useEffect(() => {
    console.log('App initializing...');
    clearKeycloakCache();
  }, []);

  const handleKeycloakEvent = (event: any, error: any) => {
    console.log('Keycloak event:', event, error);
  };

  const handleKeycloakTokens = (tokens: any) => {
    console.log('Keycloak tokens received:', tokens);
  };

  return (
    <ReactKeycloakProvider 
      authClient={keycloak} 
      initOptions={keycloakConfig}
      onEvent={handleKeycloakEvent}
      onTokens={handleKeycloakTokens}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="flex">
            <div className="flex-1">
              <Router />
            </div>
            <div className="p-4">
              <KeycloakDebug />
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
