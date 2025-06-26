import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clearKeycloakCache, forceKeycloakRelogin, manualKeycloakLogin } from '@/lib/keycloak-cache-clear';

export function KeycloakDebug() {
  const { keycloak, initialized } = useKeycloak();

  const debugInfo = {
    initialized,
    authenticated: keycloak?.authenticated,
    token: keycloak?.token ? 'Present' : 'Not present',
    realm: keycloak?.realm,
    clientId: keycloak?.clientId,
    url: keycloak?.authServerUrl,
    tokenParsed: keycloak?.tokenParsed ? {
      realm_access: keycloak.tokenParsed.realm_access,
      resource_access: keycloak.tokenParsed.resource_access,
      iss: keycloak.tokenParsed.iss,
    } : null,
  };

  const handleManualLogin = () => {
    console.log('Current window location:', window.location.href);
    console.log('Current origin:', window.location.origin);
    manualKeycloakLogin();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Keycloak Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Initialized:</strong> {String(debugInfo.initialized)}</p>
          <p><strong>Authenticated:</strong> {String(debugInfo.authenticated)}</p>
          <p><strong>Realm:</strong> {debugInfo.realm || 'Not set'}</p>
          <p><strong>Client ID:</strong> {debugInfo.clientId || 'Not set'}</p>
          <p><strong>Server URL:</strong> {debugInfo.url || 'Not set'}</p>
          <p><strong>Token:</strong> {debugInfo.token}</p>
          <p><strong>Current URL:</strong> {window.location.href}</p>
        </div>
        
        {debugInfo.tokenParsed && (
          <div className="space-y-2">
            <p><strong>Token Issuer:</strong> {debugInfo.tokenParsed.iss}</p>
            <p><strong>Realm Access:</strong> {JSON.stringify(debugInfo.tokenParsed.realm_access)}</p>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Button onClick={clearKeycloakCache} variant="outline">
            Clear Cache
          </Button>
          <Button onClick={forceKeycloakRelogin} variant="outline">
            Force Relogin
          </Button>
          <Button onClick={handleManualLogin} variant="destructive">
            Manual Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 