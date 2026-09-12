"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { deploysPerDay as localDeploysPerDay } from "@/data/landing";
import { useMemo } from "react";

type DeployEntry = { project?: string; createdAt?: string; time?: string };

function toWeekdayAbbr(date: Date) {
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return names[date.getDay()];
}

export function DeployChart({ data }: { data?: any[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return localDeploysPerDay;
    // If data already in {day, deploys} format
    if (data[0] && Object.prototype.hasOwnProperty.call(data[0], 'day') && Object.prototype.hasOwnProperty.call(data[0], 'deploys')) {
      return data;
    }
    // Otherwise try to aggregate by createdAt/time
    try {
      const counts: Record<string, number> = {};
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        counts[toWeekdayAbbr(d)] = 0;
      }
      data.forEach((item: DeployEntry) => {
        const t = item.createdAt ?? item.time ?? item.timestamp;
        const parsed = t ? new Date(t) : null;
        if (parsed && !isNaN(parsed.getTime())) {
          const key = toWeekdayAbbr(parsed);
          if (counts[key] !== undefined) counts[key]++;
        }
      });
      // return in weekday order (Seg..Dom) prefer starting from Seg
      const order = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      return order.map((k) => ({ day: k, deploys: counts[k] ?? 0 }));
      } catch (e) {
      return localDeploysPerDay;
    }
  }, [data]);

  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-3">
      <h4 className="mb-2 text-[11px] font-medium text-slate-300">Deploys por dia</h4>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Area type="monotone" dataKey="deploys" stroke="#7c3aed" strokeWidth={2} fill="url(#deployGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
