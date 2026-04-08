import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { supabaseAdmin } from './supabase';
import { resolveTenantId } from './tenant';

export interface DesignConfig {
  brand_name: string;
  visual_thesis?: string;
  base_neutral_palette: {
    bg: string;
    surface: string;
    text: string;
    border: string;
  };
  primary_color: string;
  font_family: string;
  radius: string;
  layout?: {
    homepage?: { type: string; props?: any }[];
  };
  hero?: {
    heroImage?: string;
    summary?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  };
}

export async function getTenantDesignConfig(tenantSlug: string): Promise<DesignConfig> {
  // 1. Fetch Master Override from DB
  let themeName = 'clinical_premium'; // Default fallback theme
  let overrides: any = {};

  try {
         const tenantId = await resolveTenantId(tenantSlug);
         if (tenantId) {
            const { data } = await supabaseAdmin
               .from('universal_content_assets')
               .select('json_payload')
               .eq('tenant_id', tenantId)
               .eq('type', 'design_config')
               .eq('category', 'system')
               .single();
               
            if (data && data.json_payload) {
               themeName = data.json_payload.base_theme || themeName;
               overrides = data.json_payload.overrides || {};
            }
         }
  } catch (e) {
     console.warn('No active DB theme mapping found for tenant, falling back to defaults.');
  }

  // Default Fallback 토큰
  const defaultTheme: DesignConfig = {
    brand_name: tenantSlug,
    base_neutral_palette: {
      bg: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      border: "#e2e8f0"
    },
    primary_color: "#3b82f6",
    font_family: "inherit",
    radius: "0.5rem"
  };

  try {
     // 2. Read YAML from the master theme repository
     const themePath = path.join(process.cwd(), 'themes', `${themeName}.yaml`);
     if (fs.existsSync(themePath)) {
        const fileStr = fs.readFileSync(themePath, 'utf8');
        const parsed = YAML.parse(fileStr); // 파싱!
        
        // 3. Map YAML Data Schema -> apply DB Overrides!
        return {
           brand_name: tenantSlug.toUpperCase(),
           visual_thesis: parsed.description,
           base_neutral_palette: {
              bg: overrides.bg || parsed.colors?.bg || '#ffffff',
              surface: parsed.colors?.surface || '#ffffff',
              text: parsed.colors?.text || '#000000',
              border: parsed.colors?.border || '#eaeaea',
           },
           primary_color: overrides.primary_color || parsed.colors?.primary || '#000000',
           font_family: parsed.fonts?.heading || 'inherit',
           radius: overrides.radius || parsed.radii?.md || '8px',
           layout: overrides.layout || parsed.layout || undefined,
           hero: overrides.hero || undefined
        };
     }
  } catch (err) {
     console.error('Master Theme Configuration Parse Failed:', err);
  }

  return defaultTheme;
}
