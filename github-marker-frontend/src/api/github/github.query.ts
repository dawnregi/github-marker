import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { 
  searchUsers, 
  searchRepositories, 
  getUserRepositories, 
  getRepository, 
} from './github.api';
import type {
  GitHubRepository,
  GitHubSearchUsersResponse,
  GitHubSearchReposResponse,
} from './github.type';

export function useSearchUsers(
  query: string,
  page = 1,
  perPage = 10,
  enabled = true
): UseQueryResult<GitHubSearchUsersResponse, Error> {
  return useQuery({
    queryKey: ['github', 'search', 'users', query, page, perPage],
    queryFn: () => searchUsers({ query, page, perPage }),
    enabled: enabled && query.length > 0,
  });
}

export function useSearchRepositories(
  query: string,
  page = 1,
  perPage = 10,
  enabled = true
): UseQueryResult<GitHubSearchReposResponse, Error> {
  return useQuery({
    queryKey: ['github', 'search', 'repositories', query, page, perPage],
    queryFn: () => searchRepositories({ query, page, perPage }),
    enabled: enabled && query.length > 0,
  });
}



export function useGetUserRepositories(
  username: string,
  page = 1,
  perPage = 10,
  enabled = true
): UseQueryResult<GitHubRepository[], Error> {
  return useQuery({
    queryKey: ['github', 'user', username, 'repositories', page, perPage],
    queryFn: () => getUserRepositories({ username, page, perPage }),
    enabled: enabled && username.length > 0,
  });
}

export function useGetRepository(
  owner: string, 
  repo: string, 
  enabled = true
): UseQueryResult<GitHubRepository, Error> {
  return useQuery({
    queryKey: ['github', 'repository', owner, repo],
    queryFn: () => getRepository(owner, repo),
    enabled: enabled && owner.length > 0 && repo.length > 0,
  });
}

