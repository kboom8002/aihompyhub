import type { UUID, ISODateTime, SnapshotEnvelopeDTO } from './shared';

export interface CommercialPlanDTO {
  id: UUID;
  planCode: string;
  displayName: string;
  monthlyPriceUsd: number;
  featuresAllowed: string[];
  limitsDefinition: Record<string, number>;
  status: 'active' | 'legacy' | 'deprecated';
}

export interface TenantSubscriptionDTO {
  id: UUID;
  tenantId: UUID;
  tenantName: string;
  planId: UUID;
  planCode?: string; // Hydrated via JOIN for UI convenience
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd: ISODateTime;
}

export interface PackCatalogDTO {
  id: UUID;
  packName: string;
  description: string;
  packType: 'website_template' | 'prompt_bundle' | 'ops_dashboard';
  minimumPlanCode: string;
  isPublished: boolean;
  payloadManifest: any; 
}

export type CommercialSnapshotDTO = SnapshotEnvelopeDTO<{
  availablePlans: CommercialPlanDTO[];
  activeSubscriptions: TenantSubscriptionDTO[];
  catalogPacks: PackCatalogDTO[];
}>;
