import type { UUID, ISODateTime, SnapshotEnvelopeDTO } from './shared';

export interface AuditLogDTO {
  id: UUID;
  tenantId?: UUID;
  actorId: UUID;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  payload?: any;
  createdAt: ISODateTime;
}

export interface SystemBackupDTO {
  id: UUID;
  backupName: string;
  tenantId?: UUID;
  status: 'in_progress' | 'completed' | 'failed' | 'restored';
  sizeBytes?: number;
  completedAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface DeadLetterQueueDTO {
  id: UUID;
  sourceQueue: string;
  tenantId?: UUID;
  payload: any;
  errorMessage: string;
  retryCount: number;
  status: 'unresolved' | 'retried_success' | 'discarded';
  failedAt: ISODateTime;
}

export type TriageSnapshotDTO = SnapshotEnvelopeDTO<{
  recentAudits: AuditLogDTO[];
  systemBackups: SystemBackupDTO[];
  dlqEntries: DeadLetterQueueDTO[];
}>;
