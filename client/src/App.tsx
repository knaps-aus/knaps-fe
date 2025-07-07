import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProductManagement from "@/pages/product-management";
import DistributorsPage from "@/pages/distributors";
import CTCHierarchyPage from "@/pages/ctc-hierarchy";
import NotFound from "@/pages/not-found";
import { keycloak, keycloakConfig } from "./keycloak";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProductManagement} />
      <Route path="/products" component={ProductManagement} />
      <Route path="/distributors" component={DistributorsPage} />
      <Route path="/ctc" component={CTCHierarchyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakConfig}>
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
