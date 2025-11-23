import { Card } from "@/components/ui/card";
import type { GitHubUser } from "@/api/github/github.type";
import { ExternalLink } from "lucide-react";

type UserCardProps = {
  user: GitHubUser;
  onUserClick?: (user: GitHubUser) => void;
}

export function UserCard({ user, onUserClick }: UserCardProps) {
  const handleClick = () => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex flex-col justify-center gap-y-2.5 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-600 hover:underline">
              {user.login}
            </h3>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
              View Repositories
            </span>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs hover:text-blue-600 transition-colors "
            onClick={(e) => e.stopPropagation()}
          >
            <span>View on GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
