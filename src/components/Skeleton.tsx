// Komponen Skeleton dasar
export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        animation: 'pulse 1.5s ease-in-out infinite',
        minHeight: '20px',
        width: '100%',
        ...style,
      }}
    />
  );
}

// Skeleton untuk Card Jurnal
export function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      className="skeleton-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Skeleton style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
        <Skeleton style={{ width: '60%', height: '24px' }} />
      </div>
      <Skeleton style={{ height: '16px', marginBottom: '8px' }} />
      <Skeleton style={{ height: '16px', width: '80%', marginBottom: '12px' }} />
      <Skeleton style={{ height: '14px', width: '40%' }} />
      <Skeleton style={{ height: '12px', width: '30%', marginTop: '8px' }} />
    </div>
  );
}

// Skeleton untuk List (banyak card)
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

// Tambahkan CSS animation di global (cukup 1 kali)
if (typeof document !== 'undefined') {
  const skeletonStyle = document.createElement('style');
  skeletonStyle.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    html.dark .skeleton {
      background-color: #334155 !important;
    }
    
    html.dark .skeleton-card {
      background-color: #1e293b !important;
    }
  `;
  document.head.appendChild(skeletonStyle);
}