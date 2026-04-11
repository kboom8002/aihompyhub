const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, 'lib', 'i18n.ts');
let content = fs.readFileSync(dictPath, 'utf8');

const additions = {
  ko: {
    '공식 답변 허브': '공식 답변 허브',
    '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.': '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.',
    '미디어 & 리뷰 허브': '미디어 & 리뷰 허브',
    '인증된 크리에이터와 고객들의 생생한 리뷰입니다.': '인증된 크리에이터와 고객들의 생생한 리뷰입니다.',
    '비교 & 대조 SSoT': '비교 & 대조 SSoT',
    '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.': '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.',
    '루틴 허브': '루틴 허브',
    '상황별 최적의 순서와 사용법을 제안합니다.': '상황별 최적의 순서와 사용법을 제안합니다.',
    '제품/번들 허브': '제품/번들 허브',
    '검증된 공식 제품과 혜택을 확인하세요.': '검증된 공식 제품과 혜택을 확인하세요.',
    '신뢰 및 품질 정책': '신뢰 및 품질 정책',
    '브랜드가 보장하는 안전과 신뢰 데이터입니다.': '브랜드가 보장하는 안전과 신뢰 데이터입니다.',
    '업데이트됨': '업데이트됨',
    '신뢰 허브 홈': '신뢰 허브 홈',
    '포트폴리오 허브': '포트폴리오 허브',
    '사전 상담/문의': '사전 상담/문의',
    '문의 양식을 작성해주시면 신속하게 답변해 드립니다.': '문의 양식을 작성해주시면 신속하게 답변해 드립니다.',
    '카카오톡 연동 대기중': '카카오톡 연동 대기중'
  },
  en: {
    '공식 답변 허브': 'Official Answers Hub',
    '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.': 'Verified canonical answers and SSoT directly from the brand.',
    '미디어 & 리뷰 허브': 'Media & Reviews Hub',
    '인증된 크리에이터와 고객들의 생생한 리뷰입니다.': 'Authentic reviews from verified creators and customers.',
    '비교 & 대조 SSoT': 'Compare & Contrast SSoT',
    '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.': 'Clear comparison criteria for the most frequently asked options.',
    '루틴 허브': 'Routine Hub',
    '상황별 최적의 순서와 사용법을 제안합니다.': 'Optimal routines and usage guides tailored for specific situations.',
    '제품/번들 허브': 'Products & Bundles Hub',
    '검증된 공식 제품과 혜택을 확인하세요.': 'Check out verified official products and benefits.',
    '신뢰 및 품질 정책': 'Trust & Quality Policy',
    '브랜드가 보장하는 안전과 신뢰 데이터입니다.': 'Safety and trust data guaranteed by the brand.',
    '업데이트됨': 'Updated',
    '신뢰 허브 홈': 'Trust Hub Home',
    '포트폴리오 허브': 'Portfolio Hub',
    '사전 상담/문의': 'Consultation & Inquiry',
    '문의 양식을 작성해주시면 신속하게 답변해 드립니다.': 'Fill out the form and we will get back to you promptly.',
    '카카오톡 연동 대기중': 'KakaoTalk Integration Pending'
  },
  ja: {
    '공식 답변 허브': '公式回答ハブ',
    '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.': 'ブランドが直接検証・署名したCanonical Answerリストです。',
    '미디어 & 리뷰 허브': 'メディア＆レビューハブ',
    '인증된 크리에이터와 고객들의 생생한 리뷰입니다.': '認証されたクリエイターとお客様のリアルなレビューです。',
    '비교 & 대조 SSoT': '比較・対照 SSoT',
    '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.': '最もよくある質問やオプション別の明確な比較基準を提供します。',
    '루틴 허브': 'ルーティンハブ',
    '상황별 최적의 순서와 사용법을 제안합니다.': '状況に合わせた最適な手順と使用法を提案します。',
    '제품/번들 허브': '製品・バンドルハブ',
    '검증된 공식 제품과 혜택을 확인하세요.': '検証済みの公式製品と特典をご確認ください。',
    '신뢰 및 품질 정책': '信頼と品質ポリシー',
    '브랜드가 보장하는 안전과 신뢰 데이터입니다.': 'ブランドが保証する安全と信頼のデータです。',
    '업데이트됨': '更新済み',
    '신뢰 허브 홈': '信頼ハブ ホーム',
    '포트폴리오 허브': 'ポートフォリオハブ',
    '사전 상담/문의': '事前相談・お問い合わせ',
    '문의 양식을 작성해주시면 신속하게 답변해 드립니다.': 'フォームにご記入いただければ、迅速に回答いたします。',
    '카카오톡 연동 대기중': 'KakaoTalk連携待機中'
  },
  zh: {
    '공식 답변 허브': '官方回答中心',
    '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.': '品牌直接验证和签署的规范回答列表。',
    '미디어 & 리뷰 허브': '媒体与评论中心',
    '인증된 크리에이터와 고객들의 생생한 리뷰입니다.': '经过认证的创作者和客户的真实评价。',
    '비교 & 대조 SSoT': '对比 SSoT',
    '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.': '为最常被问及的选项提供明确的对比标准。',
    '루틴 허브': '护理方案中心',
    '상황별 최적의 순서와 사용법을 제안합니다.': '针对不同情况提供最佳的顺序和使用方法。',
    '제품/번들 허브': '产品与套装中心',
    '검증된 공식 제품과 혜택을 확인하세요.': '查看经过验证的官方产品和优惠。',
    '신뢰 및 품질 정책': '信任与质量政策',
    '브랜드가 보장하는 안전과 신뢰 데이터입니다.': '品牌保证的安全和信任数据。',
    '업데이트됨': '已更新',
    '신뢰 허브 홈': '信任中心 主页',
    '포트폴리오 허브': '案例集锦中心',
    '사전 상담/문의': '售前咨询/询问',
    '문의 양식을 작성해주시면 신속하게 답변해 드립니다.': '请填写询问表，我们将尽快回复。',
    '카카오톡 연동 대기중': '等待 KakaoTalk 互连'
  },
  es: {
    '공식 답변 허브': 'Centro de Respuestas Oficiales',
    '브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.': 'Respuestas canónicas verificadas y firmadas directamente por la marca.',
    '미디어 & 리뷰 허브': 'Centro de Medios y Reseñas',
    '인증된 크리에이터와 고객들의 생생한 리뷰입니다.': 'Reseñas auténticas de creadores verificados y clientes.',
    '비교 & 대조 SSoT': 'SSoT de Comparación',
    '가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.': 'Proporciona criterios claros de comparación para las opciones más consultadas.',
    '루틴 허브': 'Centro de Rutinas',
    '상황별 최적의 순서와 사용법을 제안합니다.': 'Propone la secuencia y el uso óptimos para cada situación.',
    '제품/번들 허브': 'Centro de Productos y Paquetes',
    '검증된 공식 제품과 혜택을 확인하세요.': 'Consulta los productos oficiales verificados y sus beneficios.',
    '신뢰 및 품질 정책': 'Política de Confianza y Calidad',
    '브랜드가 보장하는 안전과 신뢰 데이터입니다.': 'Datos de seguridad y confianza garantizados por la marca.',
    '업데이트됨': 'Actualizado',
    '신뢰 허브 홈': 'Inicio del Centro de Confianza',
    '포트폴리오 허브': 'Centro de Portafolio',
    '사전 상담/문의': 'Consulta Previa / Solicitud',
    '문의 양식을 작성해주시면 신속하게 답변해 드립니다.': 'Complete el formulario de consulta y le responderemos rápidamente.',
    '카카오톡 연동 대기중': 'Integración de KakaoTalk Pendiente'
  }
};

let output = content;

Object.keys(additions).forEach(lang => {
  // Find where the `  en: {` or similar block begins and ends.
  // Easiest is to append right before the next language block `}, \n  <lang>:` or the end `  }\n};`
  const dict = additions[lang];
  let injectedStrs = Object.entries(dict).map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
  
  // Replace `    '아직 작성된 항목이 없습니다.': 'XXX',` with itself + new lines
  const regex = new RegExp(`('아직 작성된 항목이 없습니다\\.':\\s*'.*?',?)`, 'g');
  output = output.replace(regex, (match, p1, offset, string) => {
    // Only replace inside the target language block
    // We can do this safely if we just find the specific localized string.
    const lookbehindMatch = string.substring(0, offset).match(new RegExp(`\\b${lang}:\\s*\\{`));
    if (lookbehindMatch) {
        // Unfortunately standard regex replace might replace all if they match, but they all have different values for "아직 작성된 항목이 없습니다." across languages
        return `${match}\n${injectedStrs}`;
    }
    return match;
  });
});

fs.writeFileSync(dictPath, output, 'utf8');
console.log('Done injecting translations');
