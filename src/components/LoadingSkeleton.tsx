// ============================================
// LOADING SKELETON COMPONENT
// ============================================

interface SkeletonProps {
    variant?: 'card' | 'text' | 'circle' | 'rect';
    className?: string;
    count?: number;
}

function SkeletonLine({ className = '' }: { className?: string }) {
    return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

export function IdeaCardSkeleton() {
    return (
        <div className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <SkeletonLine className="h-5 w-3/4" />
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-2/3" />
                </div>
                <SkeletonLine className="h-8 w-16 rounded-full ml-4" />
            </div>
            <div className="flex items-center gap-3 pt-2">
                <SkeletonLine className="h-6 w-6 rounded-full" />
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-3 w-16" />
            </div>
        </div>
    );
}

export function KudosCardSkeleton() {
    return (
        <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
                <SkeletonLine className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                    <SkeletonLine className="h-4 w-1/2" />
                    <SkeletonLine className="h-3 w-1/3" />
                </div>
            </div>
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-3/4" />
            <div className="flex items-center gap-2 pt-1">
                <SkeletonLine className="h-6 w-20 rounded-full" />
                <SkeletonLine className="h-6 w-14 rounded-full" />
            </div>
        </div>
    );
}

export default function LoadingSkeleton({ variant = 'card', className = '', count = 3 }: SkeletonProps) {
    if (variant === 'circle') return <SkeletonLine className={`rounded-full ${className}`} />;
    if (variant === 'text') return <SkeletonLine className={`h-4 ${className}`} />;
    if (variant === 'rect') return <SkeletonLine className={className} />;

    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <IdeaCardSkeleton key={i} />
            ))}
        </div>
    );
}
