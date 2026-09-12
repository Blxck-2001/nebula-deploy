"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { resourceUsage as localResourceUsage } from "@/data/landing";

export function ResourceChart({ data }: { data?: any[] }) {
  const list = data && data.length ? data : localResourceUsage;
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-3">
      <h4 className="mb-2 text-[11px] font-medium text-slate-300">Uso de recursos</h4>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={list}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "9px" }} iconType="circle" iconSize={6} />
          <Line type="monotone" dataKey="cpu" name="CPU" stroke="#38bdf8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="memory" name="Memória" stroke="#a78bfa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
