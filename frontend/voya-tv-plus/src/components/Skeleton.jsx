export function Skeleton({ className = '' }) {
    return <div className={`animate-pulse bg-ink-700/40 rounded ${className}`} />
}

export function PosterSkeleton() {
    return (
        <div className="w-[180px]">
            <Skeleton className="h-[270px] w-[180px] rounded-xl2" />
            <Skeleton className="h-3 mt-2 w-3/4" />
            <Skeleton className="h-2 mt-1 w-1/3" />
        </div>
    )
}