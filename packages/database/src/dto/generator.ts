import type { UUID, ISODateTime, ObjectRef, NextActionDTO, SnapshotEnvelopeDTO } from './shared';

export interface PromptVersionDTO {
  id: UUID;
  registryId: UUID;
  versionTag: string;
  status: 'draft' | 'active' | 'deprecated' | 'experimental';
}

export interface GeneratorRunDTO {
  id: UUID;
  runType: 'brand_foundation' | 'content_draft' | 'trust_placeholder';
  promptVersion: PromptVersionDTO | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'blocked_missing_inputs';
  inputPackHash: string; // Provenance
  rawInputState: Record<string, unknown>;
  startedAt?: ISODateTime;
  finishedAt?: ISODateTime;
}

export interface GenerationOutputDTO {
  id: UUID;
  runId: UUID;
  targetObjectType: string;
  proposedContent: Record<string, unknown>;
  trustPlaceholders: Array<{ type: string; required: boolean; hint: string }>;
  acceptanceStatus: 'pending' | 'accepted' | 'rejected' | 'partially_accepted';
  acceptedAsCanonicalId?: UUID | null;
}

// Minimal DTOs to fetch pending outputs for the Studio Assisted UI
export interface StudioAssistSnapshotDTO {
  availableRuns: GeneratorRunDTO[];
  pendingOutputs: GenerationOutputDTO[];
  suggestedPromptVersions: PromptVersionDTO[];
  actions: NextActionDTO[];
}

export type TemplateProfilesSnapshotDTO = SnapshotEnvelopeDTO<{
  profiles: Array<{
    id: UUID;
    familyId: string;
    name: string;
    overrides: Record<string, unknown>;
    assignedBrands: UUID[];
  }>;
  families: Array<{
    id: string;
    name: string;
  }>;
}>;

export type GeneratorRunsSnapshotDTO = SnapshotEnvelopeDTO<{
  runs: GeneratorRunDTO[];
  totalRunning: number;
  totalFailed: number;
}>;
