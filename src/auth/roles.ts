// Parse client roles from a Keycloak JWT (resource_access.<clientId>.roles)
export function hasClientRole(token: string, clientId: string, role: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.resource_access?.[clientId]?.roles?.includes(role) ?? false;
  } catch {
    return false;
  }
}
