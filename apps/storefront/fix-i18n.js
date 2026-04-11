const fs = require('fs');
const path = require('path');

const targetDirs = [
    'answers', 'compare', 'consultation', 'media', 
    'portfolio', 'products', 'routines', 'solutions', 
    'trust', path.join('trust', 'experts')
];

const basePath = path.join(__dirname, 'app', '[locale]', '[tenantSlug]');

function injectImport(content) {
    if (!content.includes("@/lib/i18n")) {
        return "import { t } from '@/lib/i18n';\n" + content;
    }
    return content;
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix .select
    content = content.replace(/\.select\('id, title, updated_at, created_at, json_payload'\)/g, 
                             ".select('id, title, updated_at, created_at, json_payload, translations')");

    // 2. Inject import
    content = injectImport(content);

    // 3. Fix Link to root (replace `/${params.tenantSlug}` with `/${locale}/${params.tenantSlug}`)
    content = content.replace(/href=\{`\/\$\{params\.tenantSlug\}`\}/g, "href={`/${locale}/${params.tenantSlug}`}");

    // 4. Wrap Korean texts with t(locale, '...')
    // Note: This is an aggressive but safe string match tailored to our storefront templates
    
    // Breadcrumb
    content = content.replace(/(&larr;\s*)홈으로 돌아가기/g, "$1{t(locale, '홈으로 돌아가기')}");
    
    // Dates/Updates
    content = content.replace(/toLocaleDateString\(\)\}\s*업데이트됨/g, "toLocaleDateString()} {t(locale, '업데이트됨')}");

    // "아직 작성된... 없습니다"
    content = content.replace(/>아직 작성된 (.*?) 없습니다\.</g, ">{t(locale, '아직 작성된 항목이 없습니다.')}<");

    // Headings and subs (specific matches)
    const matches = [
        "공식 답변 허브",
        "브랜드에서 직접 검증하고 서명한 Canonical Answer 리스트입니다.",
        "미디어 & 리뷰 허브",
        "인증된 크리에이터와 고객들의 생생한 리뷰입니다.",
        "비교 & 대조 SSoT",
        "가장 많이 묻는 옵션별 명확한 비교 기준을 제공합니다.",
        "루틴 허브",
        "상황별 최적의 순서와 사용법을 제안합니다.",
        "제품/번들 허브",
        "검증된 공식 제품과 혜택을 확인하세요.",
        "신뢰 및 품질 정책",
        "브랜드가 보장하는 안전과 신뢰 데이터입니다.",
        "전문가 위원회",
        "객관적 정보 제공을 위해 함께하는 전문가들입니다.",
    ];

    matches.forEach(m => {
        // Find text nodes like >Text<
        const reg1 = new RegExp(`>\\s*${m}\\s*<`, "g");
        content = content.replace(reg1, `>{t(locale, '${m}')}<`);
        
        // Find inside quotes like "{...} Text"
        // Actually, they are purely standalone like `>{m}<` in our UI components.
    });

    // 5. Ensure `locale` is extracted from params
    // If not extracted, inject `const locale = params.locale || 'ko';` after `const params = await props.params;`
    if (!content.includes("const locale =")) {
        content = content.replace(/const params = await props\.params;\n/g, 
            "const params = await props.params;\n  const locale = params.locale || 'ko';\n");
    }

    // 6. Fix Link routes inside loops: `/${params.tenantSlug}/...` -> `/${locale}/${params.tenantSlug}/...`
    content = content.replace(/href=\{`\/\$\{params\.tenantSlug\}\/([^`]+)`\}/g, "href={`/${locale}/${params.tenantSlug}/$1`}");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Processed:", filePath);
}

targetDirs.forEach(dir => {
    const pagePath = path.join(basePath, dir, 'page.tsx');
    processFile(pagePath);
});

// Update i18n variables for these new matches
const i18nPath = path.join(__dirname, 'apps', 'storefront', 'lib', 'i18n.ts');
if (fs.existsSync(i18nPath)) {
    let i18nContent = fs.readFileSync(i18nPath, 'utf8');
    
    // Missing keys mapping (we can manually patch `i18n.ts` instead if it's too complex to regex here)
    // To be safe, I'm just parsing it manually since the user wants it flawlessly translated.
}
