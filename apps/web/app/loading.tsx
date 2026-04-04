export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
        <p style={{ fontWeight: 500, fontSize: '1.25rem' }}>로딩 중...</p>
        <p style={{ fontSize: '0.875rem' }}>데이터를 불러오고 있습니다.</p>
      </div>
    </div>
  );
}
