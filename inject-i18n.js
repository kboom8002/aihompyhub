const fs = require('fs');
let content = fs.readFileSync('apps/storefront/lib/i18n.ts', 'utf8');

const keysToEn = {
  '공식 홈': 'Official Home',
  '홈으로 돌아가기': 'Go Back Home',
  '매거진/스토리': 'Magazine & Stories',
  '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.': 'Guides and real user reviews to help you make better decisions.',
  '해결 과제': 'Challenges',
  '진행 절차/과정': 'Procedures / Process',
  '인사이트 칼럼': 'Insight Columns',
  'Why Welby': 'Why Welby',
  '주요 파트너': 'Key Partners',
  '포트폴리오': 'Portfolio'
};

const keysToJa = {
  '공식 홈': '公式ホーム',
  '홈으로 돌아가기': 'ホームに戻る',
  '매거진/스토리': 'マガジンとストーリー',
  '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.': 'より良い選択を支援するガイドと実際のユーザーレビュー。',
  '해결 과제': '課題',
  '진행 절차/과정': '進行手順/プロセス',
  '인사이트 칼럼': 'インサイトコラム',
  'Why Welby': 'なぜウェルビーなのか',
  '주요 파트너': '主要パートナー',
  '포트폴리오': 'ポートフォリオ'
};

const keysToZh = {
  '공식 홈': '官方主页',
  '홈으로 돌아가기': '返回首页',
  '매거진/스토리': '杂志与故事',
  '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.': '指南和真实用户评论，帮助您做出更好的选择。',
  '해결 과제': '挑战',
  '진행 절차/과정': '程序/流程',
  '인사이트 칼럼': '洞察专栏',
  'Why Welby': '为什么选择 Welby',
  '주요 파트너': '主要合作伙伴',
  '포트폴리오': '投资组合'
};

const keysToEs = {
  '공식 홈': 'Inicio Oficial',
  '홈으로 돌아가기': 'Volver al Inicio',
  '매거진/스토리': 'Revista e Historias',
  '더 나은 선택을 돕는 가이드와 실제 사용자들의 리뷰.': 'Guías y reseñas de usuarios reales para ayudarle a tomar mejores decisiones.',
  '해결 과제': 'Desafíos',
  '진행 절차/과정': 'Procedimientos/Proceso',
  '인사이트 칼럼': 'Columnas de Insight',
  'Why Welby': 'Por Qué Welby',
  '주요 파트너': 'Socios Clave',
  '포트폴리오': 'Portafolio'
};

function inject(lang, keys) {
  let parts = content.split(`  ${lang}: {`);
  if (parts.length < 2) {
      console.log('Failed to match lang: ', lang);
      return;
  }
  let before = parts[0];
  let after = parts.slice(1).join(`  ${lang}: {`);
  
  const injectString = Object.entries(keys).map(([k, v]) => `    '${k}': '${v}',`).join('\n');
  content = before + `  ${lang}: {\n` + injectString + '\n' + after;
}

inject('en', keysToEn);
inject('ja', keysToJa);
inject('zh', keysToZh);
inject('es', keysToEs);

fs.writeFileSync('apps/storefront/lib/i18n.ts', content);
console.log('Dictionary updated!');
