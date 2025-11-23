export type BackendBookmark = {
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

export type BookmarkListResponse = {
  items: BackendBookmark[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export type BookmarkStatsResponse = {
  total_bookmarks: number;
  today_count: number;
  data: { date: string; count: number }[];
}

export type BookmarkStats = {
  date: string;
  count: number;
}

export type ImportResult = {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: string[];
}

export type GetBookmarksParams = {
  page?: number;
  perPage?: number;
}

export type GetStatsParams = {
  startDate?: string;
  endDate?: string;
}
