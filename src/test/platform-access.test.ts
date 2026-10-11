import { describe, expect, it } from 'vitest';
import { canManagePlatform, type VerifiedConnection } from '@/lib/platform-access';
const verified: VerifiedConnection = { platform: 'whatsapp', verified_at: '2026-10-10T00:00:00Z', revoked_at: null, provider_account_id: 'account-1', account_name: 'business' };
describe('Only actually connected platforms have management access', () => {
  it('denies WhatsApp without a verified connection and allows its verified account', () => { expect(canManagePlatform('whatsapp', [])).toBe(false); expect(canManagePlatform('whatsapp', [verified])).toBe(true); });
  it('does not unlock Facebook from a WhatsApp connection', () => { expect(canManagePlatform('facebook', [verified])).toBe(false); expect(canManagePlatform('facebook', [{ ...verified, platform: 'facebook' }])).toBe(true); });
  it('does not unlock Instagram from a WhatsApp connection', () => { expect(canManagePlatform('instagram', [verified])).toBe(false); expect(canManagePlatform('instagram', [{ ...verified, platform: 'instagram' }])).toBe(true); });
  it('denies unverified and revoked connections', () => { expect(canManagePlatform('whatsapp', [{ ...verified, verified_at: null }])).toBe(false); expect(canManagePlatform('whatsapp', [{ ...verified, revoked_at: '2026-10-11' }])).toBe(false); });
});