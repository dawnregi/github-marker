import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Users, BookOpen, Loader2 } from 'lucide-react';
import { useSearchUsers, useSearchRepositories, useGetUserRepositories } from '@/api/github/github.query';
import { UserCard } from '@/components/UserCard';
import { RepositoryCard } from '@/components/RepositoryCard';
import { SearchPagination } from '@/components/SearchPagination';
import type { GitHubUser } from '@/api/github/github.type';

type SearchMode = 'users' | 'repositories';

export default function Searchpage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('repositories');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [reposTotalCount, setReposTotalCount] = useState(0);

  const { data: usersData, isLoading: isLoadingUsers } = useSearchUsers(
    activeSearch,
    page,
    perPage,
    searchMode === 'users' && activeSearch.length > 0
  );
  
  const { data: reposData, isLoading: isLoadingRepos } = useSearchRepositories(
    activeSearch,
    page,
    perPage,
    searchMode === 'repositories' && activeSearch.length > 0 && !selectedUser
  );

  const { data: userRepos, isLoading: isLoadingUserRepos } = useGetUserRepositories(
    selectedUser || '',
    page,
    perPage,
    !!selectedUser
  );

  // Update total counts when data is fetched
  if (usersData && usersData.total_count !== usersTotalCount) {
    setUsersTotalCount(usersData.total_count);
  }
  if (reposData && reposData.total_count !== reposTotalCount) {
    setReposTotalCount(reposData.total_count);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setSelectedUser(null);
      setPage(1);
    }
  };

  const handleUserClick = (user: GitHubUser) => {
    setSelectedUser(user.login);
    setPage(1);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <Helmet>
        <title>Search Repositories | Git Marker</title>
        <meta name="description" content="Search and discover GitHub repositories and users. Bookmark your favorite projects and manage your collections." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search GitHub</h1>

        {/* Search Form */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder={
                  searchMode === 'users'
                    ? 'Search for users...'
                    : 'Search for repositories...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant={searchMode === 'repositories' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchMode('repositories');
                  setSelectedUser(null);
                  setPage(1);
                }}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Repositories
              </Button>
              <Button
                type="button"
                variant={searchMode === 'users' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchMode('users');
                  setSelectedUser(null);
                  setPage(1);
                }}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            </div>
          </form>
        </Card>

        {/* User Repositories View */}
        {selectedUser && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Repositories by {selectedUser}
              </h2>
              <div className="flex items-center gap-3">
                <SearchPagination
                  currentPage={page}
                  onPageChange={setPage}
                  isLoading={isLoadingUserRepos}
                />
                <Button variant="outline" onClick={handleBackToUsers}>
                  Back to Search
                </Button>
              </div>
            </div>
            {isLoadingUserRepos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading repositories...</span>
              </div>
            ) : userRepos && userRepos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No repositories found for this user.</p>
              </Card>
            ) : userRepos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRepos.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} showBookmarkButton={false} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Users Results */}
        {!selectedUser && searchMode === 'users' && activeSearch && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Users ({usersTotalCount.toLocaleString()} results)
              </h2>
              <span>
                <SearchPagination
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoadingUsers}
              />
              </span>
            </div>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Searching users...</span>
              </div>
            ) : usersData && usersData.items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No users found. Try a different search query.</p>
              </Card>
            ) : usersData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usersData.items.map((user) => (
                  <UserCard key={user.id} user={user} onUserClick={handleUserClick} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Repositories Results */}
        {!selectedUser && searchMode === 'repositories' && activeSearch && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Repositories ({reposTotalCount.toLocaleString()} results)
              </h2>
              <span>
                <SearchPagination
                currentPage={page}
                onPageChange={setPage}
                isLoading={isLoadingRepos}
              />
              </span>
            </div>
            {isLoadingRepos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Searching repositories...</span>
              </div>
            ) : reposData && reposData.items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-primary">No repositories found. Try a different search query.</p>
              </Card>
            ) : reposData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reposData.items.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!activeSearch && !selectedUser && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Start Searching</h3>
            <p className="text-primary">
              Search for GitHub users or repositories to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
