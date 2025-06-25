import { keycloak } from "@/keycloak";

export function authHeaders(): Record<string, string> {
  return keycloak.token ? { Authorization: `Bearer ${keycloak.token}` } : {};
}
