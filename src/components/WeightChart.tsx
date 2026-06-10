"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// ChartContainer injects `--color-<key>` from this config (mapped to the
// DESIGN.md sticker palette via our --chart-* tokens) and themes the axes,
// grid and tooltip — so the series resolve to design tokens, not literals.
const chartConfig = {
  weightKg: { label: "Bodyweight", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function WeightChart({
  data,
  target,
}: {
  data: { date: string; weightKg: number }[];
  target: number | null;
}) {
  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
        />
        <YAxis
          domain={["dataMin - 1", "dataMax + 1"]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        {target !== null && (
          <ReferenceLine
            y={target}
            stroke="var(--color-target)"
            strokeDasharray="4 4"
          />
        )}
        <Line
          dataKey="weightKg"
          type="monotone"
          stroke="var(--color-weightKg)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
