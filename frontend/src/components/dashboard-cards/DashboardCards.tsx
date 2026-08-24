/**
 * DashboardCards — Summary KPI cards for the analytics dashboard.
 */

import { cn } from "@/lib/utils";

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
}

export function StatCard({ id, title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div
      id={id}
      className={cn(
        "bg-card border rounded-xl p-6 flex items-start justify-between transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-600",
            )}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
            <span className="text-muted-foreground font-normal">vs last week</span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
    </div>
  );
}

interface DashboardCardsProps {
  stats: {
    total_complaints: number;
    open_complaints: number;
    resolved_today: number;
    average_resolution_hours: number;
    sla_compliance_rate: number;
  };
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-cards">
      <StatCard
        id="total-complaints-card"
        title="Total Complaints"
        value={stats.total_complaints.toLocaleString()}
        icon={<span className="text-xl">📋</span>}
      />
      <StatCard
        id="open-complaints-card"
        title="Open Complaints"
        value={stats.open_complaints.toLocaleString()}
        subtitle="Requiring attention"
        icon={<span className="text-xl">🔔</span>}
      />
      <StatCard
        id="resolved-today-card"
        title="Resolved Today"
        value={stats.resolved_today}
        icon={<span className="text-xl">✅</span>}
        trend={{ value: 12, direction: "up" }}
      />
      <StatCard
        id="sla-compliance-card"
        title="SLA Compliance"
        value={`${stats.sla_compliance_rate}%`}
        subtitle={`Avg ${stats.average_resolution_hours.toFixed(1)}h resolution`}
        icon={<span className="text-xl">📊</span>}
      />
    </div>
  );
}
