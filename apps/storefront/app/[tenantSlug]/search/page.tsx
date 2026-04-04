import Link from 'next/link';

export default async function SearchPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-16 px-4">
      <Link href={`/${params.tenantSlug}`} className="text-blue-600 mb-4 inline-block">&larr; 홈으로 돌아가기</Link>
      <h1 className="text-3xl font-bold mb-4">SEARCH 허브</h1>
      <p className="text-muted-foreground">이곳은 다이내믹 라우팅으로 연결된 search 상세 도메인입니다. 진입된 테넌트: {params.tenantSlug}</p>
    </div>
  );
}