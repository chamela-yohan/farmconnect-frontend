"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MonthlyStat } from "@/types/analytics";
import { ChartTooltip } from "./ChartTooltip";
import { ChartSkeleton, ChartError } from "./ChartStates";

interface RevenueChartProps {
  data: MonthlyStat[];
  isLoading?: boolean;
  isError?: boolean;
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatFull = (value: number) => `LKR ${value.toLocaleString()}`;

export function RevenueChart({ data, isLoading, isError }: RevenueChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError />;

  const hasActivity = data.some((point) => point.revenue > 0);

  return (
    <div
      className="relative h-64 w-full"
      role="img"
      aria-label={`Line chart of monthly revenue over the last ${data.length} months`}
    >
      {!hasActivity && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-sm text-muted-foreground bg-card/80 px-3 py-1.5 rounded-full border border-border">
            No revenue yet — your first sale will show up here
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => value.split(" ")[0]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={formatFull} />}
            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}