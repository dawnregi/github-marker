import axiosClient from '@/lib/axiosclient';
import type { 
  GitHubUser, 
  GitHubRepository, 
  GitHubSearchUsersResponse, 
  GitHubSearchReposResponse,
  SearchParams,
  GetUserRepositoriesParams
} from './github.type';

export const GITHUB_API_BASE = '/github';

// Search for GitHub users via backend
export async function searchUsers(params: SearchParams): Promise<GitHubSearchUsersResponse> {
  const { query, page = 1, perPage = 30 } = params;
  const response = await axiosClient.get(`${GITHUB_API_BASE}/search`, {
    params: {
      search_type: 'user',
      text: query,
      page,
      per_page: perPage,
    },
  });
  return {
    total_count: response.data.total_count,
    incomplete_results: false,
    items: response.data.items as GitHubUser[],
  };
}

// Search for GitHub repositories via backend
export async function searchRepositories(params: SearchParams): Promise<GitHubSearchReposResponse> {
  const { query, page = 1, perPage = 30 } = params;
  const response = await axiosClient.get(`${GITHUB_API_BASE}/search`, {
    params: {
      search_type: 'repo',
      text: query,
      page,
      per_page: perPage,
    },
  });
  return {
    total_count: response.data.total_count,
    incomplete_results: false,
    items: response.data.items as GitHubRepository[],
  };
}

// Get repositories for a specific user
export async function getUserRepositories(params: GetUserRepositoriesParams): Promise<GitHubRepository[]> {
  const { username, page = 1, perPage = 30 } = params;
  const response = await axiosClient.get(`${GITHUB_API_BASE}/search`, {
    params: {
      search_type: 'repo',
      text: `user:${username}`,
      page,
      per_page: perPage,
    },
  });
  return response.data.items as GitHubRepository[];
}

// Get a specific user
export async function getUser(username: string): Promise<GitHubUser> {
  const response = await axiosClient.get(`${GITHUB_API_BASE}/search`, {
    params: {
      search_type: 'user',
      text: username,
      page: 1,
      per_page: 1,
    },
  });
  const users = response.data.items as GitHubUser[];
  if (users.length === 0 || users[0].login !== username) {
    throw new Error('User not found');
  }
  return users[0];
}

// Get a specific repository
export async function getRepository(owner: string, repo: string): Promise<GitHubRepository> {
  const response = await axiosClient.get(`${GITHUB_API_BASE}/search`, {
    params: {
      search_type: 'repo',
      text: `${owner}/${repo}`,
      page: 1,
      per_page: 1,
    },
  });
  const repos = response.data.items as GitHubRepository[];
  if (repos.length === 0) {
    throw new Error('Repository not found');
  }
  return repos[0];
}

