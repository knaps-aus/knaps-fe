import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "master",
  clientId: "react-app",
});

// Configure Keycloak with proper redirect settings and force fresh auth
export const keycloakConfig = {
  onLoad: "login-required",
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
  pkceMethod: "S256", // Use PKCE for better security
  enableLogging: true, // Enable logging to debug issues
  flow: "standard", // Use standard flow
  redirectUri: window.location.origin, // Explicitly set redirect URI
};

// Add event listeners for debugging
keycloak.onTokenExpired = () => {
  console.log('Token expired, attempting refresh...');
  keycloak.updateToken(70).catch(() => {
    console.log('Token refresh failed, redirecting to login...');
    keycloak.logout();
  });
};

keycloak.onAuthSuccess = () => {
  console.log('Authentication successful');
};

keycloak.onAuthError = () => {
  console.log('Authentication error occurred');
};

keycloak.onAuthRefreshSuccess = () => {
  console.log('Token refresh successful');
};

keycloak.onAuthRefreshError = () => {
  console.log('Token refresh error');
};

keycloak.onAuthLogout = () => {
  console.log('User logged out');
};

