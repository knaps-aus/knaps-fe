import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from "./keycloak";

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider authClient={keycloak}>
    <App />
  </ReactKeycloakProvider>
);
