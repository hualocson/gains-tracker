"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

export function WeightChart({
  data,
  target,
}: {
  data: { date: string; weightKg: number }[];
  target: number | null;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} />
        <Tooltip />
        {target !== null && <ReferenceLine y={target} stroke="#16a34a" strokeDasharray="4 4" />}
        <Line type="monotone" dataKey="weightKg" stroke="#000" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
