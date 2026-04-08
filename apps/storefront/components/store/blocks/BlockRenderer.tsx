import React from 'react';
import { BrandHero } from '../BrandHero';
import { AnswerCardGrid } from '../AnswerCardGrid';
import { BlockHeading } from './BlockHeading';
import { CompareQuickDecision } from '../CompareQuickDecision';
import { RoutineStepCard } from '../RoutineStepCard';

interface BlockRendererProps {
  layoutSettings: { type: string; props?: any }[];
  context: {
    tenantSlug: string;
    brandProfile: any;
    answerCards: any[];
  };
}

export function BlockRenderer({ layoutSettings, context }: BlockRendererProps) {
  if (!layoutSettings || layoutSettings.length === 0) {
     return <div className="p-8 text-center text-muted-foreground">No layout schema defined for this template.</div>;
  }

  return (
    <div className="flex flex-col w-full gap-0">
      {layoutSettings.map((block, index) => {
        const { type, props } = block;
        
        switch (type) {
          case 'BrandHero': {
            let voiceStr = 'Authentic';
            const dbVoice = context.brandProfile?.brand_voice;
            if (typeof dbVoice === 'string') {
               voiceStr = dbVoice;
            } else if (typeof dbVoice === 'object' && dbVoice !== null) {
               voiceStr = dbVoice.tone || 'Authentic';
            }
            return (
              <BrandHero 
                key={index}
                summary={context.brandProfile?.positioning_summary || 'Global Aesthetics Foundation'} 
                voice={voiceStr} 
                tenantSlug={context.tenantSlug}
                // future-proofing: passing alignment via props
                {...props}
              />
            );
          }
          case 'BlockHeading':
            return (
              <main key={`heading-${index}`} className="container mx-auto px-4 mt-16">
                 <BlockHeading title={props?.title} subtitle={props?.subtitle} />
              </main>
            );
            case 'AnswerCardGrid':
            return (
              <main key={`grid-${index}`} className="container mx-auto px-4 mb-16">
                 <AnswerCardGrid cards={context.answerCards || []} tenantSlug={context.tenantSlug} />
              </main>
            );
          case 'CompareQuickDecision':
            if(!props?.profileA || !props?.profileB) return null;
            return (
              <main key={`compare-${index}`} className="container mx-auto px-4 mb-16">
                 <CompareQuickDecision profileA={props.profileA} profileB={props.profileB} />
              </main>
            );
          case 'RoutineStepCard':
            if(!props?.steps) return null;
            return (
              <main key={`routine-${index}`} className="container mx-auto px-4 mb-16 max-w-5xl">
                 <RoutineStepCard steps={props.steps} />
              </main>
            );
          default:
            return (
              <div key={index} className="p-4 border border-dashed border-red-500 m-4 flex justify-center items-center">
                ⚠️ Unknown Block Type: {type}
              </div>
            );
        }
      })}
    </div>
  );
}
