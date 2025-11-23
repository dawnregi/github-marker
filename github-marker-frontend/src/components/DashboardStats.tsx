import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, Calendar } from "lucide-react";
import { useGetBookmarkStats } from "@/api/bookmarks/bookmarks.query";
import { BookmarkChart } from "./BookmarkChart";

export function DashboardStats() {
  const [filter, setFilter] = useState<number>(0);
  const { data: statsResponse, isLoading } = useGetBookmarkStats(filter);

  return (
    <section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Total Bookmarks
              </p>
              <p className="text-2xl font-bold text-foreground">
                {statsResponse?.total_bookmarks || 0}
              </p>
            </div>
            <BookmarkCheck className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Today</p>
              <p className="text-2xl font-bold text-foreground">
                {statsResponse?.today_count || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Chart */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          size="sm"
          variant={filter === 0 ? "default" : "outline"}
          onClick={() => setFilter(0)}
          className="rounded-full"
          disabled={isLoading}
        >
          Today
        </Button>
        <Button
          size="sm"
          variant={filter === 7 ? "default" : "outline"}
          onClick={() => setFilter(7)}
          className="rounded-full"
          disabled={isLoading}
        >
          Last 7 Days
        </Button>
      </div>
      <div className="mb-4 min-h-[280px]">
        <BookmarkChart 
          data={statsResponse?.data || []} 
          title="Bookmark Activity" 
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
