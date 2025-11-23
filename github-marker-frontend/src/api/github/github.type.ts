export type GitHubUser = {
  login: string;
  id: number;
  avatar_url?: string;
  html_url: string;
  followers_url: string;
}

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  isAdded: boolean;
  bookmarkId?: string;
  owner: {
    login: string;
    id: number;
    avatar_url?: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
}

export type GitHubSearchUsersResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export type GitHubSearchReposResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

// Backend API types
export type BackendSearchResponse = {
  search_type: 'user' | 'repo';
  search_text: string;
  page: number;
  per_page: number;
  total_count: number;
  has_next: boolean;
  has_prev: boolean;
  items: (GitHubUser | GitHubRepository)[];
}

export type BookmarkedRepository = GitHubRepository & {
  bookmarkedAt: string;
}

export type BookmarkStats = {
  date: string;
  count: number;
}

export type CSVRepositoryRow = {
  owner: string;
  repo: string;
  url?: string;
}

export type SearchParams = {
  query: string;
  page?: number;
  perPage?: number;
}


export type GetUserRepositoriesParams = {
  username: string;
  page?: number;
  perPage?: number;
}
