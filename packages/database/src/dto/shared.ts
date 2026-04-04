// packages/database/src/dto/shared.ts
export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;
export type LocaleCode = string;
export type MarketCode = string;
export type Cursor = string;

export type ObjectType =
  | "Topic"
  | "AnswerCard"
  | "Routine"
  | "Compare"
  | "Product"
  | "ProductFit"
  | "ReviewTask"
  | "QuestionCluster"
  | "Alert"
  | "RcaRecord"
  | "FixItTask"
  | "Incident";

export type ObjectRef = {
  type: ObjectType;
  id: UUID;
  versionId?: UUID | null;
  title?: string | null;
};

export type RequestContextDTO = {
  tenantId: UUID;
  brandId?: UUID | null;
  marketCode?: MarketCode | null;
  locale?: LocaleCode | null;
  actorId?: UUID | null;
  activeRole?: string | null;
  requestId?: string | null;
};

export type QueryMetaDTO = {
  requestId: string;
  snapshotAt?: ISODateTime | null;
  tenantId: UUID;
  brandId?: UUID | null;
  locale?: LocaleCode | null;
  marketCode?: MarketCode | null;
};

export type CommandMetaDTO = {
  requestId: string;
  actorId: UUID;
  activeRole: string;
  idempotencyKey?: string | null;
  reason?: string | null;
};

export type ErrorResponseDTO = {
  error: {
    code:
      | "PERMISSION_DENIED"
      | "TENANT_SCOPE_MISMATCH"
      | "BRAND_SCOPE_MISMATCH"
      | "NOT_FOUND"
      | "INVALID_STATE"
      | "VALIDATION_FAILED";
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    requestId: string;
  };
};

export type CommandAcceptedDTO<TTarget = ObjectRef> = {
  data: {
    commandId: string;
    status: "accepted" | "completed";
    targetRef?: TTarget | null;
  };
  meta: QueryMetaDTO;
};

export type QueryResponseDTO<T> = {
  data: T;
  meta: QueryMetaDTO;
};

export type ContentStatus =
  | "draft"
  | "ready_for_review"
  | "approved"
  | "published"
  | "deprecated"
  | "archived";

// ----------------------------------------------------
// PHASE 2 (Sprint 2): Publish, Projection, Search, GEO
// ----------------------------------------------------

export interface TemplateProfileDTO {
  templateProfileId: UUID;
  familyType: 'GenericCore' | 'HighTrustVariant' | 'YMYLLiteSkincare';
  overrides: Record<string, string>;
}

export interface PublishBundleDTO {
  bundleId: UUID;
  templateProfileId: UUID;
  status: 'draft' | 'validating' | 'published' | 'rolled_back' | 'failed';
  targetLocale: string;
  targetMarket: string;
  createdAt: ISODateTime;
}

export interface RouteProjectionDTO {
  routePath: string;
  targetRef: ObjectRef;
  versionRef: UUID;
}

export interface ObjectDetailSnapshotDTO {
  targetObject: ObjectRef;
  projectionStatus: 'not_published' | 'published' | 'stale';
  searchStatus: 'pending' | 'synced' | 'failed' | 'removed';
  geoExclusions: string[]; // e.g. ["EU", "CN"]
  canonicalData: any; // Raw document content stub
}

export interface PublishBundleSnapshotDTO {
  totalBundles: number;
  bundles: PublishBundleDTO[];
  healthStatus: 'healthy' | 'degraded' | 'stale';
}

export interface SearchGeoSnapshotDTO {
  totalTargetDocs: number;
  syncedDocs: number;
  excludedGeoRules: number;
  searchItems: Array<{ targetRef: ObjectRef; versionRef: UUID; syncStatus: string }>;
  geoItems: Array<{ targetRef: ObjectRef; versionRef: UUID; excludedRegions: string[] }>;
}

export interface BuilderStudioSnapshotDTO {
  currentProfile: TemplateProfileDTO;
  assignedBundlesCount: number;
}

// ----------------------------------------------------
// COMMON SSoT SNAPSHOT ENVELOPE (Doc v1 6.1)
// ----------------------------------------------------

export type NextActionDTO = {
  actionCode: string;
  label: string;
  enabled: boolean;
  reasonIfDisabled?: string | null;
};

export type SnapshotEnvelopeDTO<TData> = {
  snapshotId: string;
  snapshotType: string;
  snapshotVersion: string;
  context: {
    tenantId: UUID;
    brandId?: UUID | null;
    marketCode?: MarketCode | null;
    locale?: LocaleCode | null;
    viewerRole?: string | null;
  };
  asOf: ISODateTime;
  freshness: {
    status: "fresh" | "stale" | "degraded";
    sourceLagSeconds: number;
  };
  data: TData;
  actions: NextActionDTO[];
  warnings: Array<{ code: string; message: string }>;
  criticalFlags: string[];
};
