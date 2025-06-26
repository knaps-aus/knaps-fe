// Utility to clear Keycloak cache and force fresh authentication
export function clearKeycloakCache() {
  console.log('Starting Keycloak cache clear...');
  
  // Clear localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('keycloak') || key.includes('kc_') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('Removed localStorage key:', key);
  });

  // Clear sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('keycloak') || key.includes('kc_') || key.includes('auth'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log('Removed sessionStorage key:', key);
  });

  // Clear all cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });

  console.log('Keycloak cache cleared');
}

// Force logout and redirect to login
export function forceKeycloakRelogin() {
  console.log('Force relogin initiated...');
  clearKeycloakCache();
  
  // Force a hard redirect to clear any cached state
  window.location.href = '/';
}

// Manual login function
export function manualKeycloakLogin() {
  console.log('Manual login initiated...');
  clearKeycloakCache();
  
  // Construct the Keycloak login URL manually
  const keycloakUrl = 'http://localhost:8080';
  const realm = 'master';
  const clientId = 'react-app';
  const redirectUri = encodeURIComponent(window.location.origin);
  const responseType = 'code';
  const scope = 'openid';
  
  const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  
  console.log('Redirecting to login URL:', loginUrl);
  window.location.href = loginUrl;
} 