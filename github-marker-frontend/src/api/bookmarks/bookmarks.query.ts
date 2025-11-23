import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarkStats,
  importBookmarksFromCSV,
} from "./bookmarks.api";
import type {
  BackendBookmark,
  BookmarkListResponse,
  BookmarkStatsResponse,
  ImportResult,
} from "./bookmarks.type";
import type {
  GitHubRepository,
  GitHubSearchReposResponse,
} from "@/api/github/github.type";
import { toLocalDateString } from "@/utils/helper";

export function useGetBookmarks(
  page = 1,
  perPage = 100,
  enabled = true
): UseQueryResult<BookmarkListResponse, Error> {
  return useQuery({
    queryKey: ["bookmarks", "list", page, perPage],
    queryFn: () => getBookmarks({ page, perPage }),
    enabled,
  });
}

export function useGetBookmark(
  repoId: number,
  enabled = true
): UseQueryResult<BackendBookmark | undefined, Error> {
  const { data: bookmarkList } = useGetBookmarks(1, 100, enabled);
  return useQuery({
    queryKey: ["bookmarks", "single", repoId],
    queryFn: () => {
      return bookmarkList?.items.find((b) => b.github_repo_id === repoId);
    },
    enabled: enabled && !!bookmarkList,
  });
}

export function useIsBookmarked(
  repoId: number,
  enabled = true
): UseQueryResult<boolean, Error> {
  const { data: bookmarkList } = useGetBookmarks(1, 100, enabled);
  return useQuery({
    queryKey: ["bookmarks", "check", repoId],
    queryFn: () => {
      return (
        bookmarkList?.items.some((b) => b.github_repo_id === repoId) ?? false
      );
    },
    enabled: enabled && !!bookmarkList,
  });
}

export function useGetBookmarkStats(
  days = 30,
  enabled = true
): UseQueryResult<BookmarkStatsResponse, Error> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return useQuery({
    queryKey: ["bookmarks", "stats", days],
    queryFn: () =>
      getBookmarkStats({
        startDate: toLocalDateString(startDate),
        endDate: toLocalDateString(endDate),
      }),
    enabled,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoId: number) => addBookmark(repoId),
    onSuccess: (data, repoId) => {
      // Invalidate bookmarks to refetch
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      // Update GitHub search results cache without refetching
      queryClient.setQueriesData<GitHubSearchReposResponse>(
        { queryKey: ["github", "search", "repositories"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((repo) =>
              repo.id === repoId
                ? { ...repo, isAdded: true, bookmarkId: data.id }
                : repo
            ),
          };
        }
      );

      // Update user repositories cache
      queryClient.setQueriesData<GitHubRepository[]>(
        { queryKey: ["github", "user"] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((repo) =>
            repo.id === repoId
              ? { ...repo, isAdded: true, bookmarkId: data.id }
              : repo
          );
        }
      );
    },
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: string) => removeBookmark(bookmarkId),
    onSuccess: (_, bookmarkId) => {
      // Invalidate bookmarks to refetch
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      // Update GitHub search results cache without refetching
      queryClient.setQueriesData<GitHubSearchReposResponse>(
        { queryKey: ["github", "search", "repositories"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((repo) =>
              repo.bookmarkId === bookmarkId
                ? { ...repo, isAdded: false, bookmarkId: undefined }
                : repo
            ),
          };
        }
      );

      // Update user repositories cache
      queryClient.setQueriesData<GitHubRepository[]>(
        { queryKey: ["github", "user"] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((repo) =>
            repo.bookmarkId === bookmarkId
              ? { ...repo, isAdded: false, bookmarkId: undefined }
              : repo
          );
        }
      );
    },
  });
}

export function useImportBookmarks() {
  const queryClient = useQueryClient();

  return useMutation<ImportResult, Error, File>({
    mutationFn: (file: File) => importBookmarksFromCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
