import { useState, useMemo, useCallback, useOptimistic } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookmarkCheck } from "lucide-react";
import {
  useGetBookmarks,
  useRemoveBookmark,
} from "@/api/bookmarks/bookmarks.query";
import { CSVImport } from "@/components/CSVImport";
import { BookmarkCard } from "@/components/BookmarkCard";
import { BookmarkCardSkeleton } from "@/components/BookmarkCardSkeleton";
import { DeleteBookmarkDialog } from "@/components/DeleteBookmarkDialog";
import { DashboardStats } from "@/components/DashboardStats";
import { SearchPagination } from "@/components/SearchPagination";
import { toast } from "sonner";
import type { BackendBookmark } from "@/api/bookmarks/bookmarks.type";

export default function Dashboard() {
  const [showImport, setShowImport] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const { data: bookmarkList, isLoading } = useGetBookmarks(page, perPage);
  const bookmarks = useMemo(() => bookmarkList?.items || [], [bookmarkList?.items]);
  const [optimisticBookmarks, setOptimisticBookmarks] = useOptimistic(
    bookmarks,
    (state, deletedId: string) => state.filter((bookmark) => bookmark.id !== deletedId)
  );
  const removeBookmark = useRemoveBookmark();

  const handleRemoveBookmark = useCallback((id: string) => {
    setBookmarkToDelete(id);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setBookmarkToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!bookmarkToDelete) return;

    setOptimisticBookmarks(bookmarkToDelete);
    setBookmarkToDelete(null);

    removeBookmark.mutate(bookmarkToDelete, {
      onSuccess: () => {
        toast.success("Bookmark removed successfully");
      },
      onError: (error) => {
        toast.error(
          `Failed to remove bookmark: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      },
    });
  }, [bookmarkToDelete, removeBookmark, setOptimisticBookmarks]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Git Marker</title>
        <meta name="description" content="View and manage your bookmarked GitHub repositories. Track your activity and organize your saved projects." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => setShowImport(!showImport)}>
            {showImport ? "Hide Import" : "Import CSV"}
          </Button>
        </div>

        {/* CSV Import Section */}
        {showImport && (
          <div className="mb-6">
            <CSVImport />
          </div>
        )}

        {/* Stats Cards and Chart */}
        <DashboardStats />

        {/* Added Bookmarks */}
        <div className="mt-">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Added Bookmarks
            </h2>
            {(bookmarkList?.total || 0) > perPage && (
              <span>
                 {/* Pagination Controls */}
                <SearchPagination
                  currentPage={page}
                  onPageChange={setPage}
                  isLoading={isLoading}
                  totalPages={Math.ceil((bookmarkList?.total || 0) / perPage)}
                  showPageNumbers={true}
                  hasPrev={bookmarkList?.has_prev}
                  hasNext={bookmarkList?.has_next}
                />
              </span>
            )}
          </div>

          {optimisticBookmarks.length > 0 || isLoading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 min-h-[400px]">
                {isLoading ? (
                  Array.from({ length: perPage }).map((_, index) => (
                    <BookmarkCardSkeleton key={`skeleton-${index}`} />
                  ))
                ) : (
                  optimisticBookmarks.map((bookmark: BackendBookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onRemove={handleRemoveBookmark}
                      isRemoving={removeBookmark.isPending}
                    />
                  ))
                )}
              </div>

           
            </>
          ) : (
            <Card className="p-8 text-center">
              <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Bookmarks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start bookmarking repositories to see them here.
              </p>
              <Button onClick={() => (window.location.href = "/app/search")}>
                Go to Search
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteBookmarkDialog
        content='Are you sure you want to remove this bookmark? This action cannot be undone.'
        isOpen={!!bookmarkToDelete}
        onClose={handleCloseDialog}
        onConfirm={confirmDelete}
        isDeleting={removeBookmark.isPending}
      />
    </div>
    </>
  );
}
