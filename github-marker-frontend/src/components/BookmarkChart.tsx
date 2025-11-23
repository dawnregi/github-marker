"use client"


import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import type { BookmarkStats } from '@/api/github/github.type';
import { memo, useMemo, useState } from "react"

type BookmarkChartProps = {
  data: BookmarkStats[];
  title?: string;
  description?: string;
  isLoading?: boolean;
}

const chartConfig = {
  views: {
    label: "Bookmarks",
  },
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export const BookmarkChart = memo(function BookmarkChart({ 
  data, 
  title = 'Bookmark Activity',
  isLoading = false,
}: BookmarkChartProps) {
  const [activeChart] = useState<keyof typeof chartConfig>("count")

  // Format data for the chart - memoized
  const chartData = useMemo(() => 
    data.map(item => ({
      date: item.date,
      count: item.count,
    })),
    [data]
  );


  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 pt-3 pb-2 sm:py-4">
          <CardTitle className="text-base">{title}</CardTitle>
        </div>

      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        {isLoading ? (
          <div className="aspect-auto h-[180px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="aspect-auto h-[180px] w-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[180px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 8,
                right: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                minTickGap={24}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[130px] text-xs"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value as string | number | Date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
});
