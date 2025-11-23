import axiosClient from "@/lib/axiosclient";
import type {
  BackendBookmark,
  BookmarkListResponse,
  BookmarkStatsResponse,
  ImportResult,
  GetBookmarksParams,
  GetStatsParams,
} from "./bookmarks.type";

export const BOOKMARKS_API_BASE = "/bookmark";

// Get all bookmarks with pagination
export async function getBookmarks(
  params?: GetBookmarksParams
): Promise<BookmarkListResponse> {
  const { page = 1, perPage = 100 } = params || {};
  const response = await axiosClient.get(`${BOOKMARKS_API_BASE}/list`, {
    params: { page, per_page: perPage },
  });
  return response.data;
}

// Add a bookmark
export async function addBookmark(repoId: number): Promise<BackendBookmark> {
  const response = await axiosClient.post(`${BOOKMARKS_API_BASE}/add`, null, {
    params: { repo_id: repoId },
  });
  return response.data;
}

// Remove a bookmark
export async function removeBookmark(bookmarkId: string): Promise<void> {
  await axiosClient.delete(`${BOOKMARKS_API_BASE}/${bookmarkId}`);
}

// Get bookmark statistics
export async function getBookmarkStats(
  params?: GetStatsParams
): Promise<BookmarkStatsResponse> {
  const { startDate, endDate } = params || {};
  const response = await axiosClient.get(`${BOOKMARKS_API_BASE}/stats`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
}

// Import bookmarks from CSV
export async function importBookmarksFromCSV(
  file: File
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post<ImportResult>(
    `${BOOKMARKS_API_BASE}/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}
