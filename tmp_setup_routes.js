const fs = require('fs');
const paths = ['solutions', 'answers', 'routines', 'compare', 'products', 'media', 'trust', 'search'];
paths.forEach(p => {
  const dir = `apps/storefront/app/[tenantSlug]/${p}`;
  fs.mkdirSync(dir, { recursive: true });
  const content = `import Link from 'next/link';

export default async function ${p.charAt(0).toUpperCase() + p.slice(1)}Page(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-16 px-4">
      <Link href={\`/\${params.tenantSlug}\`} className="text-blue-600 mb-4 inline-block">&larr; 홈으로 돌아가기</Link>
      <h1 className="text-3xl font-bold mb-4">${p.toUpperCase()} 허브</h1>
      <p className="text-muted-foreground">이곳은 다이내믹 라우팅으로 연결된 ${p} 상세 도메인입니다. 진입된 테넌트: {params.tenantSlug}</p>\n    </div>
  );
}`;
  fs.writeFileSync(`${dir}/page.tsx`, content);
});
console.log('Created routes successfully.');
