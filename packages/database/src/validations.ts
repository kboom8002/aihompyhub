import { z } from 'zod';

export const SaveBrandProfileSchema = z.object({
  brandId: z.string().uuid(),
  positioningSummary: z.string().min(10, 'Positioning summary is too short'),
  brandVoice: z.string().min(1)
});

export const CreateTopicSchema = z.object({
  clusterId: z.string().uuid(),
  title: z.string().min(3)
});

export const CreateAnswerDraftSchema = z.object({
  topicId: z.string().uuid(),
  structuredBody: z.any()
});

export const SubmitReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'changes_requested']),
  note: z.string().optional()
});

// Phase 2 Validators
export const AssignTemplateProfileSchema = z.object({
  familyType: z.enum(['GenericCore', 'HighTrustVariant', 'YMYLLiteSkincare']),
  overrides: z.object({
    navEmphasis: z.enum(['product', 'routine', 'editorial']).optional(),
    skinTheme: z.string().optional(),
    ctaWording: z.string().optional()
  }).optional()
});

export const CreatePublishBundleSchema = z.object({
  templateProfileId: z.string().uuid(),
  targetLocale: z.string().min(2),
  targetMarket: z.string().min(2)
});

export const UpdateGeoRulesSchema = z.object({
  targetRef: z.object({
    type: z.string(),
    id: z.string().uuid()
  }),
  excludeRegions: z.array(z.string())
});
