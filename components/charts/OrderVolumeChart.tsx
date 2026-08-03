"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MonthlyStat } from "@/types/analytics";
import { ChartTooltip } from "./ChartTooltip";
import { ChartSkeleton, ChartError } from "./ChartStates";

interface OrderVolumeChartProps {
  data: MonthlyStat[];
  isLoading?: boolean;
  isError?: boolean;
}

const formatCount = (value: number) => `${value} order${value === 1 ? "" : "s"}`;

export function OrderVolumeChart({ data, isLoading, isError }: OrderVolumeChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError />;

  const hasActivity = data.some((point) => point.orderCount > 0);

  return (
    <div
      className="relative h-64 w-full"
      role="img"
      aria-label={`Bar chart of monthly order volume over the last ${data.length} months`}
    >
      {!hasActivity && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-sm text-muted-foreground bg-card/80 px-3 py-1.5 rounded-full border border-border">
            No orders yet this period
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => value.split(" ")[0]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={formatCount} />}
            cursor={{ fill: "hsl(var(--secondary))", opacity: 0.1 }}
          />
          <Bar dataKey="orderCount" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}