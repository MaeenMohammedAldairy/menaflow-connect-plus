export type PlatformName = 'whatsapp' | 'facebook' | 'instagram';
export type VerifiedConnection = { platform: string; verified_at: string | null; revoked_at: string | null; account_name: string; provider_account_id: string };
export const platformLabels: Record<PlatformName, string> = { whatsapp: 'واتساب', facebook: 'فيسبوك', instagram: 'إنستغرام' };
export const connectionPaths = { whatsapp: '/connect/whatsapp', facebook: '/connect/facebook', instagram: '/connect/instagram' } as const;
export function canManagePlatform(platform: PlatformName, connections: VerifiedConnection[]) {
  return connections.some(c => c.platform === platform && Boolean(c.verified_at) && !c.revoked_at && Boolean(c.provider_account_id));
}