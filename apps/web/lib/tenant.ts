export function resolveAdminTenantId(slugOrId: string | null | undefined): string {
  if (!slugOrId) return 'SYSTEM';

  if (slugOrId === 'dr-oracle') {
    return '00000000-0000-0000-0000-000000000001';
  }
  if (slugOrId === 'vegan-root') {
    return '00000000-0000-0000-0000-000000000002';
  }

  return slugOrId; // Return as-is if it's already a UUID or unknown
}
