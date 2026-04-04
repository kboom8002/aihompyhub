---
title: Command Query DTO Spec v1
status: reconstructed_repo_entrypoint
canonical: true
---
# Command / Query DTO Spec v1

## 1. 목적

이 문서는 **Skincare & Premium B2C AI Homepage Factory SaaS**의 MVP 구현에 필요한 핵심 API payload를 TypeScript 중심 DTO 계약으로 고정한다.

이 문서의 목표는 아래 4가지를 동시에 만족시키는 것이다.

1. backend handler가 request/response shape를 일관되게 구현할 수 있게 한다.
2. frontend가 snapshot query와 command body를 타입 안전하게 사용할 수 있게 한다.
3. seed / mock / fixture / contract test가 같은 payload shape를 재사용하게 한다.
4. ai-pair가 path, DDL, screen contract를 읽고도 가장 자주 헷갈리는 **field shape / nullable / enum / nested object 구조**를 명확히 한다.

이 문서는 다음 문서들과 함께 읽는다.

- `04_backend/03_api-contract.md`
- `04_backend/06_read-model-snapshot-spec.md`
- `05_frontend/02_frontend-screen-contract-pack.md`
- `08_delivery/02_seed-data-pack-spec.md`

---

## 2. 설계 원칙

### 2.1 DTO는 page가 아니라 object와 workflow를 표현해야 한다
`page`, `post`, `article` 같은 용어보다 `QuestionCluster`, `Topic`, `AnswerCard`, `Routine`, `Compare`, `ProductFit`, `ReviewTask`, `PublishBundle`, `Alert`, `RCA`, `FixIt`, `Incident` 같은 canonical object와 운영 객체를 기준으로 DTO를 설계한다.

### 2.2 Query DTO와 Command DTO를 분리한다
- Query DTO는 read model / snapshot shape를 표현한다.
- Command DTO는 aggregate state change에 필요한 최소 입력을 표현한다.

### 2.3 Frontend는 snapshot DTO를 우선 사용한다
패널별로 원시 엔티티를 조립하지 않고, 화면 단위 snapshot DTO를 우선 사용한다.

### 2.4 enum은 string literal로 유지한다
초기 MVP에서는 enum registry보다 string literal union이 더 빠르고 실용적이다.

### 2.5 approval-sensitive DTO는 reason / approver context / idempotency를 요구한다
review, publish, restriction, mitigation, rollback 계열 command는 auditability를 위해 설명 필드와 context를 포함한다.

---

## 3. 공통 타입

## 3.1 Primitive aliases

```ts
export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;
export type LocaleCode = string;      // e.g. "ko-KR"
export type MarketCode = string;      // e.g. "KR"
export type Cursor = string;
```

## 3.2 Scope / Ref 타입

```ts
export type ObjectType =
  | "Topic"
  | "AnswerCard"
  | "Routine"
  | "Compare"
  | "Product"
  | "ProductFit"
  | "TrustBlock"
  | "Evidence"
  | "BoundaryRule"
  | "ReviewTask"
  | "PublishBundle"
  | "Alert"
  | "RCA"
  | "FixIt"
  | "Incident"
  | "QuestionCluster";

export type ObjectRef = {
  type: ObjectType;
  id: UUID;
  versionId?: UUID | null;
  title?: string | null;
};

export type ScopeRef = {
  scopeType: string;
  scopeRef?: UUID | null;
};
```

## 3.3 Context / Envelope 타입

```ts
export type RequestContextDTO = {
  tenantId: UUID;
  brandId?: UUID | null;
  marketCode?: MarketCode | null;
  locale?: LocaleCode | null;
  actorId?: UUID | null;
  activeRole?: string | null;
  requestId?: string | null;
};

export type CommandMetaDTO = {
  requestId: string;
  actorId: UUID;
  activeRole: string;
  idempotencyKey?: string | null;
  reason?: string | null;
};

export type PageInfoDTO = {
  nextCursor?: Cursor | null;
  hasNext: boolean;
};

export type QueryMetaDTO = {
  requestId: string;
  snapshotAt?: ISODateTime | null;
  tenantId: UUID;
  brandId?: UUID | null;
  locale?: LocaleCode | null;
  marketCode?: MarketCode | null;
};

export type QueryResponseDTO<T> = {
  data: T;
  meta: QueryMetaDTO;
};

export type ListResponseDTO<T> = {
  data: {
    items: T[];
    pageInfo: PageInfoDTO;
  };
  meta: QueryMetaDTO;
};

export type CommandAcceptedDTO<TTarget = ObjectRef> = {
  data: {
    commandId: string;
    status: "accepted" | "completed";
    targetRef?: TTarget | null;
  };
  meta: QueryMetaDTO;
};

export type ErrorResponseDTO = {
  error: {
    code:
      | "PERMISSION_DENIED"
      | "TENANT_SCOPE_MISMATCH"
      | "BRAND_SCOPE_MISMATCH"
      | "NOT_FOUND"
      | "INVALID_STATE"
      | "VALIDATION_FAILED"
      | "REVIEW_REQUIRED"
      | "RESTRICTION_ACTIVE"
      | "PUBLISH_BLOCKED"
      | "IDEMPOTENCY_CONFLICT"
      | "WORKER_UNAVAILABLE"
      | "SNAPSHOT_STALE"
      | "RUNTIME_LANE_PAUSED";
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    requestId: string;
  };
};
```

---

## 4. 공통 상태 DTO

```ts
export type ContentStatus =
  | "draft"
  | "ready_for_review"
  | "approved"
  | "published"
  | "deprecated"
  | "archived";

export type ReviewStatus =
  | "not_required"
  | "required"
  | "queued"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export type PublishStatus =
  | "unpublished"
  | "scheduled"
  | "live"
  | "limited_live"
  | "suspended"
  | "retired";

export type OpsStatus =
  | "unmeasured"
  | "monitored"
  | "healthy"
  | "at_risk"
  | "issue_detected"
  | "fix_in_progress"
  | "revalidation_pending";

export type RiskClass = "low" | "medium" | "high" | "critical";

export type StatusQuartetDTO = {
  contentStatus: ContentStatus;
  reviewStatus: ReviewStatus;
  publishStatus: PublishStatus;
  opsStatus: OpsStatus;
  riskClass: RiskClass;
  gateProfile: string;
  restrictedFlag: boolean;
  revalidationRequired: boolean;
};

export type TrustStateDTO = {
  trustCompletenessScore: number;
  evidenceFreshnessStatus: "ok" | "stale_risk" | "stale" | "missing";
  boundaryCompletenessStatus: "ok" | "partial" | "missing";
  reviewerTraceStatus: "present" | "missing";
  restrictionStatus: "none" | "candidate" | "limited_live" | "restricted" | "suspended";
  trustBadges: string[];
};

export type ProjectionStateDTO = {
  routeStatus: "missing" | "draft" | "ready" | "live" | "stale" | "failed";
  pageProjectionStatus: "missing" | "draft" | "ready" | "live" | "stale" | "failed";
  searchDocStatus: "missing" | "draft" | "synced" | "stale" | "excluded" | "failed";
  geoStatus: "missing" | "eligible" | "excluded" | "restricted" | "failed";
  schemaStatus: "missing" | "valid" | "invalid";
  staleProjection: boolean;
};

export type ObservabilityStateDTO = {
  openAlertCount: number;
  openRcaCount: number;
  openFixitCount: number;
  latestSignalTypes: string[];
  latestMetricDelta?: {
    metricId: string;
    delta: number;
  } | null;
};

export type NextActionDTO = {
  actionCode: string;
  label: string;
  enabled: boolean;
  reasonIfDisabled?: string | null;
};
```

---

## 5. 공통 리스트 아이템 DTO

```ts
export type ClusterListItemDTO = {
  clusterId: UUID;
  clusterName: string;
  intentType: string;
  journeyStage: string;
  riskClass: RiskClass;
  priorityScore: number;
  coverageStatus: "uncovered" | "partial" | "covered";
  linkedTopic?: ObjectRef | null;
  linkedObjectsCount: number;
  zeroResultStatus?: "normal" | "watch" | "spike" | null;
  nextAction?: NextActionDTO | null;
};

export type ReviewTaskListItemDTO = {
  reviewTaskId: UUID;
  targetRef: ObjectRef;
  reviewType: "standard" | "expert" | "locale" | "revalidation";
  severity: "AL-1" | "AL-2" | "AL-3" | "AL-4" | "low" | "medium" | "high" | "critical";
  riskClass: RiskClass;
  assignedTo?: { userId: UUID; displayName: string } | null;
  dueAt?: ISODateTime | null;
  blockerFlags: string[];
};

export type AlertListItemDTO = {
  alertId: UUID;
  severity: "AL-1" | "AL-2" | "AL-3" | "AL-4";
  alertRuleId: string;
  scopeType: string;
  scopeRef?: UUID | null;
  currentOwner?: string | null;
  detectedAt: ISODateTime;
  slaAt?: ISODateTime | null;
  suggestedRcaCodes: string[];
  incidentLinked: boolean;
  recommendedNextActions: NextActionDTO[];
};

export type FixItListItemDTO = {
  fixitId: UUID;
  fixitType: string;
  ownerRole: string;
  status:
    | "open"
    | "accepted"
    | "in_progress"
    | "review_pending"
    | "republish_pending"
    | "verification_pending"
    | "closed";
  dueAt?: ISODateTime | null;
  reviewRequired: boolean;
  republishRequired: boolean;
  targetRefs: ObjectRef[];
};
```

---

## 6. Snapshot DTO 세트

## 6.1 공통 Snapshot Envelope

```ts
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
```

## 6.2 Tenant Home Snapshot DTO

```ts
export type TenantHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  criticalStrip: {
    highPriorityUncoveredCount: number;
    reviewPendingCount: number;
    publishReadyCount: number;
    liveTrustIssueCount: number;
    openFixitCount: number;
    noDeadEndRiskCount: number;
  };
  priorityClusterGaps: {
    items: ClusterListItemDTO[];
  };
  canonicalWorkQueue: {
    items: Array<{
      objectRef: ObjectRef;
      statusQuartet: StatusQuartetDTO;
      blockerFlags: string[];
      nextAction?: NextActionDTO | null;
    }>;
  };
  liveTrustWatch: {
    items: Array<{
      objectRef: ObjectRef;
      statusQuartet: StatusQuartetDTO;
      trustState: TrustStateDTO;
      nextAction?: NextActionDTO | null;
    }>;
  };
  publishReadiness: {
    items: Array<{
      bundleId: UUID;
      bundleType: string;
      status: string;
      validationSummary: {
        readyItemCount: number;
        blockedItemCount: number;
      };
      nextAction?: NextActionDTO | null;
    }>;
  };
  searchGeoSummary: {
    searchResolutionRate: number;
    zeroResultRate: number;
    geoCoverageRate: number;
    citationObservedRate: number;
  };
  openFixits: {
    items: FixItListItemDTO[];
  };
}>;
```

## 6.3 Reviewer Home Snapshot DTO

```ts
export type ReviewerHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  criticalStrip: {
    highRiskReviewQueueCount: number;
    liveTrustCriticalCount: number;
    evidenceFreshnessLapseCount: number;
    boundaryMissingCount: number;
    revalidationPendingCount: number;
    overdueExpertReviewsCount: number;
  };
  reviewInbox: { items: ReviewTaskListItemDTO[] };
  liveTrustRisk: {
    items: Array<{
      objectRef: ObjectRef;
      statusQuartet: StatusQuartetDTO;
      trustState: TrustStateDTO;
    }>;
  };
  evidenceFreshnessWatch: {
    items: Array<{
      evidenceId: UUID;
      title?: string | null;
      freshnessDate?: ISODate | null;
      publicUseStatus: "pending" | "approved" | "restricted" | "stale";
      linkedLiveObjectCount: number;
    }>;
  };
  boundaryGapQueue: {
    items: Array<{
      boundaryRuleId?: UUID | null;
      targetRef: ObjectRef;
      severity: string;
      gapType: "missing" | "partial" | "locale_mismatch";
    }>;
  };
  revalidationBoard: {
    items: Array<{
      revalidationTaskId: UUID;
      targetRef: ObjectRef;
      requiredLevel: string;
      status: string;
      dueAt?: ISODateTime | null;
    }>;
  };
}>;
```

## 6.4 Factory Home Snapshot DTO

```ts
export type FactoryHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  criticalStrip: {
    unhealthyTenantCount: number;
    openCriticalIncidentCount: number;
    criticalDlqLaneCount: number;
    systemicRcaCandidateCount: number;
    rolloutFreezeCount: number;
    crossTenantTrustAlertCount: number;
  };
  tenantHealthOverview: {
    items: Array<{
      tenantId: UUID;
      tenantName: string;
      healthScore: number;
      trustIssueCount: number;
      publishBlockedCount: number;
      runtimeRiskCount: number;
    }>;
  };
  runtimeHealth: {
    unhealthyLanes: Array<{
      laneName: string;
      queueDepth: number;
      dlqVolume: number;
      status: string;
    }>;
  };
  systemicRcaRadar: {
    items: Array<{
      rcaCode: string;
      affectedTenantCount: number;
      affectedObjectCount: number;
      likelyCorrelatedTemplateProfiles: string[];
      likelyCorrelatedPromptVersions: string[];
    }>;
  };
  rolloutImpact: {
    items: Array<{
      rolloutId: string;
      rolloutType: "template" | "prompt" | "policy";
      impactStatus: "normal" | "watch" | "degraded";
    }>;
  };
}>;
```

## 6.5 Ops Home Snapshot DTO

```ts
export type OpsHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  criticalStrip: {
    openAL4Count: number;
    openIncidentCount: number;
    openRcaWithoutOwnerCount: number;
    overdueFixitCount: number;
    recoveryFailureCount: number;
    repeatedAlertCount: number;
  };
  criticalAlertQueue: { items: AlertListItemDTO[] };
  rcaIntake: {
    items: Array<{
      rcaId: UUID;
      targetRefs: ObjectRef[];
      status: string;
      severity: string;
      suggestedFixitTypes: string[];
    }>;
  };
  fixitDelivery: { items: FixItListItemDTO[] };
  recoveryVerification: {
    items: Array<{
      fixitId: UUID;
      result: "recovered" | "partial" | "not_recovered" | "recurring";
      measuredAt: ISODateTime;
    }>;
  };
  searchGeoWatch: {
    searchResolutionRate: number;
    zeroResultRate: number;
    geoCoverageRate: number;
    priorityIssues: Array<{ label: string; targetRef?: ObjectRef | null }>;
  };
  trustIncidentWatch: {
    items: Array<{
      alertId: UUID;
      targetRef: ObjectRef;
      trustBadges: string[];
    }>;
  };
}>;
```

## 6.6 Object Detail Snapshot DTO

```ts
export type ObjectDetailSnapshotDTO = SnapshotEnvelopeDTO<{
  header: {
    objectRef: ObjectRef;
    linkedTopicRef?: ObjectRef | null;
  };
  statusQuartet: StatusQuartetDTO;
  trustState: TrustStateDTO;
  projectionState: ProjectionStateDTO;
  observabilityState: ObservabilityStateDTO;
  canonical: {
    currentVersionId?: UUID | null;
    summary?: string | null;
    structuredBody?: Record<string, unknown> | null;
  };
  workflow: {
    latestReviewTaskId?: UUID | null;
    latestPublishBundleId?: UUID | null;
    latestRestrictionId?: UUID | null;
  };
  relatedGraph: {
    precedingObjects: ObjectRef[];
    followingObjects: ObjectRef[];
    linkedProducts: ObjectRef[];
    linkedEvidence: ObjectRef[];
    linkedBoundaries: ObjectRef[];
  };
  history: {
    latestChanges: Array<{ at: ISODateTime; summary: string }>;
    latestReviews: Array<{ at: ISODateTime; decision: string }>;
    latestPublishes: Array<{ at: ISODateTime; status: string }>;
  };
}>;
```

## 6.7 Review Workspace Snapshot DTO

```ts
export type ReviewWorkspaceSnapshotDTO = SnapshotEnvelopeDTO<{
  reviewTask: {
    reviewTaskId: UUID;
    reviewType: "standard" | "expert" | "locale" | "revalidation";
    severity: string;
    dueAt?: ISODateTime | null;
    assignedTo?: { userId: UUID; displayName: string } | null;
  };
  targetObject: ObjectDetailSnapshotDTO["data"];
  trustContext: {
    trustState: TrustStateDTO;
    reviewChecklist: Array<{
      code: string;
      label: string;
      passed: boolean;
    }>;
  };
  evidencePanel: {
    items: Array<{
      evidenceId: UUID;
      title?: string | null;
      evidenceLevel: string;
      freshnessDate?: ISODate | null;
      publicUseStatus: string;
    }>;
  };
  boundaryPanel: {
    items: Array<{
      boundaryRuleId: UUID;
      severity: string;
      displayMode: string;
      appliesToCurrentLocale: boolean;
    }>;
  };
  projectionPreview: {
    route?: string | null;
    searchExcerpt?: string | null;
    geoPreview?: string | null;
  };
  decisionHistory: Array<{
    at: ISODateTime;
    decision: string;
    by?: string | null;
    note?: string | null;
  }>;
}>;
```

## 6.8 Publish Bundle Snapshot DTO

```ts
export type PublishBundleSnapshotDTO = SnapshotEnvelopeDTO<{
  bundleHeader: {
    bundleId: UUID;
    bundleType: string;
    status: string;
    marketCodes: string[];
    locale?: string | null;
  };
  bundleItems: Array<{
    targetRef: ObjectRef;
    statusQuartet: StatusQuartetDTO;
  }>;
  validationSummary: {
    readyItemCount: number;
    blockedItemCount: number;
    blockers: string[];
  };
  projectionMatrix: Array<{
    targetRef: ObjectRef;
    projectionState: ProjectionStateDTO;
  }>;
  approvalGates: Array<{
    gateCode: string;
    passed: boolean;
    reasonIfFailed?: string | null;
  }>;
  executionHistory: Array<{
    at: ISODateTime;
    action: string;
    status: string;
  }>;
  rollbackContext?: {
    rollbackCandidateVersionRefs: ObjectRef[];
  } | null;
}>;
```

## 6.9 Incident Bridge Snapshot DTO

```ts
export type IncidentBridgeSnapshotDTO = SnapshotEnvelopeDTO<{
  incidentSummary: {
    incidentId: UUID;
    incidentFamily: string;
    severity: string;
    status: string;
    primaryOwnerRole?: string | null;
  };
  timeline: Array<{
    at: ISODateTime;
    event: string;
    actor?: string | null;
  }>;
  impactedScope: {
    targetRefs: ObjectRef[];
    affectedTenantCount: number;
    affectedBrandCount: number;
  };
  currentMitigation?: {
    mitigationType: string;
    status: string;
    expiresAt?: ISODateTime | null;
  } | null;
  linkedAlerts: AlertListItemDTO[];
  linkedRcas: Array<{
    rcaId: UUID;
    rcaCode: string;
    status: string;
  }>;
  linkedFixits: FixItListItemDTO[];
  followUpItems: Array<{
    label: string;
    status: string;
    dueAt?: ISODateTime | null;
  }>;
  requiredApprovals: Array<{
    roleCode: string;
    status: "required" | "granted" | "pending";
  }>;
}>;
```

## 6.10 Runtime Health Snapshot DTO

```ts
export type RuntimeHealthSnapshotDTO = SnapshotEnvelopeDTO<{
  criticalStrip: {
    unhealthyLaneCount: number;
    pausedLaneCount: number;
    dlqCount: number;
    retryStormCount: number;
  };
  queueHealth: Array<{
    laneName: string;
    queueDepth: number;
    status: string;
  }>;
  laneHealth: Array<{
    laneName: string;
    workerHealth: string;
    queueDepth: number;
    retryVolume: number;
    dlqVolume: number;
  }>;
  dlqSummary: Array<{
    dlqRecordId: UUID;
    laneName: string;
    severity: string;
    triageStatus: string;
  }>;
  recentFailures: Array<{
    jobRunId: UUID;
    laneName: string;
    jobType: string;
    failureReason?: string | null;
    finishedAt?: ISODateTime | null;
  }>;
  pausedLanes: Array<{
    laneName: string;
    pausedAt: ISODateTime;
  }>;
}>;
```

---

## 7. Command DTO 세트

## 7.1 Brand Foundation Commands

```ts
export type SaveBrandFoundationProfileCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    positioningSummary?: string | null;
    brandVoice: Record<string, unknown>;
    trustPosture?: string | null;
    conversionPosture?: string | null;
  };
};

export type UpsertProductsBatchCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    products: Array<{
      sku: string;
      name: string;
      category: string;
      summary?: string | null;
      benefitTags?: string[];
    }>;
  };
};

export type UpsertClaimsBatchCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    claims: Array<{
      claimText: string;
      claimType: string;
      approvedScope: Record<string, unknown>;
    }>;
  };
};
```

## 7.2 Question Capital Commands

```ts
export type CaptureRawQuestionCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    sourceType: string;
    rawText: string;
    language: string;
    marketCode?: string | null;
    channelMetadata?: Record<string, unknown>;
  };
};

export type CreateQuestionClusterCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    clusterName: string;
    intentType: string;
    journeyStage: string;
    riskClass: RiskClass;
    canonicalQuestionIds: UUID[];
  };
};

export type ReprioritizeQuestionClusterCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    priorityScore: number;
    rationale?: Record<string, unknown>;
  };
};
```

## 7.3 Canonical Content Commands

```ts
export type CreateTopicCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    title: string;
    summary?: string | null;
    topicType: string;
    linkedClusterIds?: UUID[];
  };
};

export type CreateAnswerDraftCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    title: string;
    summary?: string | null;
    bodyStruct: Record<string, unknown>;
    linkedTopicId?: UUID | null;
    linkedClusterIds?: UUID[];
  };
};

export type CreateRoutineDraftCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    title: string;
    objective?: string | null;
    stepsStruct: Array<Record<string, unknown>>;
    suitabilityStruct?: Record<string, unknown>;
    linkedTopicId?: UUID | null;
    linkedClusterIds?: UUID[];
  };
};

export type CreateCompareDraftCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    title: string;
    compareType: string;
    criteriaStruct: Array<Record<string, unknown>>;
    matrixStruct: Array<Record<string, unknown>>;
    decisionGuidanceStruct?: Record<string, unknown>;
    linkedTopicId?: UUID | null;
  };
};

export type CreateProductFitDraftCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    title: string;
    fitReasonStruct: Record<string, unknown>;
    audienceContext?: Record<string, unknown>;
    concernContext?: Record<string, unknown>;
    linkedProductId?: UUID | null;
  };
};

export type PatchObjectCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    patch: Record<string, unknown>;
    changeReason: string;
  };
};
```

## 7.4 Review / Trust Commands

```ts
export type RequestReviewCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reviewType: "standard" | "expert" | "locale" | "revalidation";
    severity: string;
    dueAt?: ISODateTime | null;
    reviewerPoolId?: UUID | null;
  };
};

export type RecordReviewDecisionCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    decision: "approve" | "approve_with_restrictions" | "changes_requested" | "reject";
    restrictionFlags?: string[];
    requiredChanges?: Array<Record<string, unknown>>;
    reviewerNote?: string | null;
    revalidationLevel?: string | null;
  };
};

export type CreateEvidenceCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    sourceType: string;
    sourceRef?: string | null;
    title?: string | null;
    evidenceLevel: string;
    freshnessDate?: ISODate | null;
  };
};

export type LinkEvidenceUseCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    evidenceId: UUID;
    targetType: ObjectType;
    targetId: UUID;
    usageType: string;
  };
};

export type CreateBoundaryRuleCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    ruleType: string;
    severity: string;
    displayMode: string;
    marketCodes?: string[];
    locale?: string | null;
  };
};

export type AttachBoundaryRuleCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    targetType: ObjectType;
    targetId: UUID;
  };
};

export type ApplyRestrictionCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    targetType: ObjectType;
    targetId: UUID;
    restrictionType: "limited_live" | "restricted" | "suspended" | "geo_excluded";
    reason: string;
    expiresAt?: ISODateTime | null;
  };
};
```

## 7.5 Template / Generator Commands

```ts
export type AssignTemplateProfileCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    brandId: UUID;
    templateProfileId: UUID;
    marketCodes?: string[];
    locales?: string[];
  };
};

export type StartGeneratorRunCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    generatorUnit: string;
    inputPackRef?: UUID | null;
    templateProfileRef?: UUID | null;
    targetScope: "brand_foundation" | "question_clusters" | "canonical_draft_bundle";
    runMode: "manual" | "seed" | "repair";
  };
};

export type AcceptGeneratorOutputCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    generationOutputIds: UUID[];
  };
};
```

## 7.6 Publish / Projection Commands

```ts
export type CreatePublishBundleCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    bundleType: string;
    marketCodes?: string[];
    locale?: string | null;
    items: Array<{
      targetType: ObjectType;
      targetId: UUID;
      targetVersionId: UUID;
    }>;
  };
};

export type ValidatePublishBundleCommandDTO = {
  meta: CommandMetaDTO;
  body: {};
};

export type ExecutePublishBundleCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    executionMode: "immediate" | "scheduled";
    scheduledAt?: ISODateTime | null;
  };
};

export type RollbackPublishBundleCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
  };
};

export type RegenerateProjectionCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    targetType: ObjectType;
    targetId: UUID;
    projectionTypes: Array<"route" | "page" | "search_doc" | "geo" | "schema">;
  };
};
```

## 7.7 Search / GEO Commands

```ts
export type GenerateSearchDocumentCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    targetType: ObjectType;
    targetId: UUID;
    targetVersionId: UUID;
  };
};

export type SyncSearchDocumentCommandDTO = {
  meta: CommandMetaDTO;
  body: {};
};

export type UnindexSearchDocumentCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
  };
};

export type GenerateGeoBlockCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    targetType: ObjectType;
    targetId: UUID;
    targetVersionId: UUID;
  };
};

export type ExcludeGeoBlockCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
    expiresAt?: ISODateTime | null;
  };
};
```

## 7.8 Ops Commands

```ts
export type AcknowledgeAlertCommandDTO = {
  meta: CommandMetaDTO;
  body: {};
};

export type SuppressAlertCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
    expiresAt?: ISODateTime | null;
  };
};

export type ConfirmRcaCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    rootCauseCode: string;
    rootCauseDomain: string;
    targetScope: string;
    targetRefs: ObjectRef[];
    severity: string;
    primaryAlertRef?: UUID | null;
  };
};

export type CreateFixItCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    rcaId: UUID;
    fixitType: string;
    targetScope: string;
    targetRefs: ObjectRef[];
    ownerRole: string;
    reviewRequired: boolean;
    republishRequired: boolean;
    dueAt?: ISODateTime | null;
  };
};

export type VerifyRecoveryCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    result: "recovered" | "partial" | "not_recovered" | "recurring";
    targetMetricRefs: string[];
    residualRisk?: Record<string, unknown>;
  };
};

export type OpenIncidentCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    incidentFamily: string;
    severity: string;
    tenantScope?: UUID[];
    brandScope?: UUID[];
    primaryOwnerRole?: string | null;
    linkedAlertIds?: UUID[];
  };
};

export type ApplyMitigationCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    mitigationType:
      | "monitor_only"
      | "limited_live"
      | "trust_restriction"
      | "geo_exclusion"
      | "search_unindex"
      | "publish_block"
      | "rollback"
      | "suspend"
      | "lane_pause";
    targetScope: string;
    targetRefs?: ObjectRef[];
    reason: string;
    expiry?: ISODateTime | null;
    approverContext?: {
      requiredRoles?: string[];
      providedBy?: string[];
    };
  };
};
```

## 7.9 Runtime Commands

```ts
export type PauseLaneCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
    expiresAt?: ISODateTime | null;
  };
};

export type ResumeLaneCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason?: string | null;
  };
};

export type RerunDlqRecordCommandDTO = {
  meta: CommandMetaDTO;
  body: {
    reason: string;
  };
};
```

---

## 8. Query DTO 세트

## 8.1 Context Queries

```ts
export type CurrentContextQueryDTO = {
  tenantId?: UUID | null;
  brandId?: UUID | null;
  locale?: LocaleCode | null;
  marketCode?: MarketCode | null;
};

export type CurrentContextResponseDTO = QueryResponseDTO<{
  user: {
    userId: UUID;
    email: string;
    displayName?: string | null;
  };
  activeContext: {
    tenantId: UUID;
    brandId?: UUID | null;
    locale?: LocaleCode | null;
    marketCode?: MarketCode | null;
    activeRole?: string | null;
  };
  permissions: string[];
}>;
```

## 8.2 List Query Filter DTO

```ts
export type CommonListFilterDTO = {
  cursor?: Cursor | null;
  limit?: number;
  locale?: LocaleCode | null;
  marketCode?: MarketCode | null;
};

export type QuestionClusterListFilterDTO = CommonListFilterDTO & {
  intentType?: string | null;
  journeyStage?: string | null;
  riskClass?: RiskClass | null;
  uncoveredOnly?: boolean;
  priorityOnly?: boolean;
};

export type ReviewTaskListFilterDTO = CommonListFilterDTO & {
  status?: string | null;
  reviewType?: string | null;
  overdue?: boolean;
  assignedToMe?: boolean;
  riskClass?: RiskClass | null;
};

export type AlertListFilterDTO = CommonListFilterDTO & {
  severity?: string | null;
  status?: string | null;
  trustCriticalOnly?: boolean;
  priorityOnly?: boolean;
};
```

---

## 9. DTO validation 규칙

### 9.1 field naming
- JSON payload는 camelCase
- DB column은 snake_case
- OpenAPI schema도 camelCase 기준으로 명세

### 9.2 nullable 규칙
- optional + nullable은 의도를 구분한다.
- `field?: string | null`은
  - omitted: 유지 또는 기본값 사용
  - null: 명시적으로 비움 또는 없음

### 9.3 enum 규칙
- MVP는 string literal union
- 서버는 unknown value를 `VALIDATION_FAILED`로 거절

### 9.4 version ref 규칙
다음 command는 가능하면 `targetVersionId`를 받는다.
- publish bundle item 추가
- search / GEO artifact 생성
- review task create
- mitigation-sensitive review / publish 명령 일부

### 9.5 idempotency 규칙
다음 command는 `idempotencyKey`를 강하게 권장한다.
- batch upsert
- generator run start
- create publish bundle
- execute publish
- apply mitigation
- pause lane / resume lane

---

## 10. MVP 우선 DTO 세트

최초 구현에서는 아래 DTO부터 먼저 타입으로 만들면 된다.

### Query DTO 우선순위
1. `TenantHomeSnapshotDTO`
2. `ReviewerHomeSnapshotDTO`
3. `FactoryHomeSnapshotDTO`
4. `OpsHomeSnapshotDTO`
5. `ObjectDetailSnapshotDTO`
6. `ReviewWorkspaceSnapshotDTO`
7. `PublishBundleSnapshotDTO`
8. `IncidentBridgeSnapshotDTO`
9. `RuntimeHealthSnapshotDTO`
10. `ClusterListItemDTO`, `ReviewTaskListItemDTO`, `AlertListItemDTO`, `FixItListItemDTO`

### Command DTO 우선순위
1. `CreateTopicCommandDTO`
2. `CreateAnswerDraftCommandDTO`
3. `CreateRoutineDraftCommandDTO`
4. `CreateCompareDraftCommandDTO`
5. `PatchObjectCommandDTO`
6. `RequestReviewCommandDTO`
7. `RecordReviewDecisionCommandDTO`
8. `ApplyRestrictionCommandDTO`
9. `CreatePublishBundleCommandDTO`
10. `ValidatePublishBundleCommandDTO`
11. `ExecutePublishBundleCommandDTO`
12. `ConfirmRcaCommandDTO`
13. `CreateFixItCommandDTO`
14. `VerifyRecoveryCommandDTO`
15. `OpenIncidentCommandDTO`
16. `ApplyMitigationCommandDTO`
17. `StartGeneratorRunCommandDTO`

---

## 11. 권장 코드 배치

```text
/shared/contracts
  /common
    context.ts
    envelope.ts
    status.ts
    refs.ts
  /queries
    snapshots.ts
    lists.ts
  /commands
    brand-foundation.ts
    question-capital.ts
    canonical-content.ts
    trust-review.ts
    template-generator.ts
    publish-projection.ts
    search-geo.ts
    ops.ts
    runtime.ts
```

### 규칙
- query DTO와 command DTO는 파일을 분리한다.
- snapshot DTO는 frontend와 backend가 같은 계약을 공유한다.
- server-only field를 DTO에 섞지 않는다.

---

## 12. 불변 규칙

1. DTO는 page가 아니라 object와 workflow를 표현해야 한다.
2. Query DTO와 Command DTO는 분리해야 한다.
3. snapshot DTO는 frontend의 기본 read contract여야 한다.
4. approval-sensitive command는 `meta.reason` 또는 body의 reason을 가져야 한다.
5. generator DTO는 draft output만 표현하고 publish-ready truth를 직접 만들면 안 된다.
6. search/GEO/trust/ops DTO는 별도 1급 계약으로 유지해야 한다.
7. Product DTO는 Answer / Routine / Compare 문맥과 연결 가능한 형태여야 한다.
8. DTO는 seed / fixture / test에서도 그대로 재사용 가능해야 한다.
9. DDL/API/snapshot 문서와 충돌 시, DTO는 payload shape의 source of truth가 된다.
10. MVP에서는 이 문서의 우선 DTO 세트만 먼저 엄격히 구현해도 충분하다.
