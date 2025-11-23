import { useOptimistic } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GitHubRepository } from '@/api/github/github.type';
import {  Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { useAddBookmark, useRemoveBookmark } from '@/api/bookmarks/bookmarks.query';
import { toast } from 'sonner';

type RepositoryCardProps = {
  repository: GitHubRepository;
  showBookmarkButton?: boolean;
}

export function RepositoryCard({ 
  repository, 
  showBookmarkButton = true
}: RepositoryCardProps) {
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  
  const [optimisticRepository, setOptimisticRepository] = useOptimistic(
    repository,
    (state, newIsAdded: boolean) => ({
      ...state,
      isAdded: newIsAdded
    })
  );
  
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (optimisticRepository.isAdded && optimisticRepository.bookmarkId) {
      setOptimisticRepository(false);
      removeBookmark.mutate(optimisticRepository.bookmarkId, {
        onSuccess: () => {
          toast.success('Bookmark removed');
        },
        onError: (error) => {
          setOptimisticRepository(true);
          toast.error(`Failed to remove bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
      });
    } else {
      setOptimisticRepository(true);
      addBookmark.mutate(optimisticRepository.id, {
        onSuccess: () => {
          toast.success('Repository bookmarked');
        },
        onError: (error) => {
          setOptimisticRepository(false);
          toast.error(`Failed to bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
      });
    }
  };


  return (
    <Card 
      className="p-4 gap-2 hover:shadow-lg transition-shadow flex flex-col"
    >
      <div className="flex justify-between items-start ">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <img 
              src={optimisticRepository.owner.avatar_url} 
              alt={optimisticRepository.owner.login}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-primary">{optimisticRepository.owner.login}</span>
          </div>
          <h3 className="text-lg font-semibold ">
            {optimisticRepository.name}
          </h3>
        </div>
        {showBookmarkButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            disabled={addBookmark.isPending || removeBookmark.isPending}
          >
            {optimisticRepository.isAdded  ? (
              <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {optimisticRepository.description && (
        <p className="text-sm text-primary line-clamp-2">
          {optimisticRepository.description}
        </p>
      )}

      <div className="text-sm mt-auto pt-2">
        <a 
          href={optimisticRepository.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View on GitHub</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

    </Card>
  );
}
