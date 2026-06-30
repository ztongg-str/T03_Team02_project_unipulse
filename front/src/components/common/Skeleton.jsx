export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img skeleton-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-line w-20 skeleton-pulse" />
        <div className="skeleton-line w-full skeleton-pulse" />
        <div className="skeleton-line w-3/4 skeleton-pulse" />
        <div className="skeleton-line w-1/2 skeleton-pulse" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = "100%" }) {
  return <div className="skeleton-line skeleton-pulse" style={{ width }} />;
}

export function SkeletonBlock({ height = "200px" }) {
  return <div className="skeleton-block skeleton-pulse" style={{ height }} />;
}
