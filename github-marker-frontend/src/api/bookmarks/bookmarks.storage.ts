import axiosClient from '@/lib/axiosclient';
import type { BookmarkStats } from '../github/github.type';

// Backend API types
export interface BackendBookmark {
  id: string;
  repo_name: string;
  repo_url: string;
  owner_name: string;
  owner_id: number;
  owner_avatar_url: string | null;
  owner_url: string;
  description: string | null;
  full_name: string;
  github_repo_id?: number;
}

export interface BookmarkListResponse {
  items: BackendBookmark[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BookmarkStatsResponse {
  data: { date: string; count: number }[];
}

export interface ImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: string[];
}

export const bookmarkApi = {
  // Get all bookmarks with pagination
  getAll: async (page = 1, perPage = 100): Promise<BookmarkListResponse> => {
    const response = await axiosClient.get<BookmarkListResponse>('/bookmark/list', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Add a bookmark
  add: async (repoId: number): Promise<BackendBookmark> => {
    const response = await axiosClient.post<BackendBookmark>('/bookmark/add', null, {
      params: { repo_id: repoId },
    });
    return response.data;
  },

  // Remove a bookmark
  remove: async (bookmarkId: string): Promise<void> => {
    await axiosClient.delete(`/bookmark/${bookmarkId}`);
  },

  // Get bookmark statistics
  getStats: async (startDate?: string, endDate?: string): Promise<BookmarkStats[]> => {
    const response = await axiosClient.get<BookmarkStatsResponse>('/bookmark/stats', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  },

  // Import bookmarks from CSV
  importCSV: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<ImportResult>('/bookmark/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
