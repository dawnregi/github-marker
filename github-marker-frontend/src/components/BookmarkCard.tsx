import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BackendBookmark } from '@/api/bookmarks/bookmarks.type';
import { Calendar, ExternalLink, Trash2 } from 'lucide-react';

type BookmarkCardProps = {
  bookmark: BackendBookmark;
  onRemove?: (id: string) => void;
  isRemoving?: boolean;
}

export function BookmarkCard({ bookmark, onRemove, isRemoving }: BookmarkCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(bookmark.id);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow relative gap-1">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {bookmark.owner_avatar_url && (
              <img 
                src={bookmark.owner_avatar_url} 
                alt={bookmark.owner_name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-primary">{bookmark.owner_name}</span>
          </div>
          <h3 className="text-lg font-semibold text-primary">
            {bookmark.repo_name}
          </h3>
        </div>
        {onRemove && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove bookmark</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {bookmark.description && (
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {bookmark.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">{bookmark.full_name}</span>
        </div>
        <a 
          href={bookmark.repo_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="View repository on GitHub"
        >
          <span>View on GitHub</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}
