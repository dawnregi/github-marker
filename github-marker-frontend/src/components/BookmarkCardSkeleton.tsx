import { Card } from '@/components/ui/card';

export function BookmarkCardSkeleton() {
  return (
    <Card className="p-4 gap-2 flex flex-col animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="h-6 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-4 w-24 bg-muted rounded mt-auto" />
    </Card>
  );
}
