"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Video,
  Heart,
  MessageCircle,
  UserPlus,
  TrendingUp,
  Trophy,
  Hash,
  Briefcase,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getTotalUsers,
  getTotalVideos,
  getTotalLikes,
  getTotalComments,
  getTotalFollows,
  getTotalOpportunities,
  getUserTypeBreakdown,
  getUserGrowth,
  getVideoGrowth,
  getDailyLikes,
  getTopVideos,
  getTopUsers,
  getEngagementMetrics,
  getRecentSignups,
  getRecentVideos,
  getTopHashtags,
} from "@/lib/queries";

// ---- Types ----

interface DashboardData {
  totalUsers: number;
  totalVideos: number;
  totalLikes: number;
  totalComments: number;
  totalFollows: number;
  totalOpportunities: number;
  userTypes: { players: number; coaches: number };
  userGrowth: { date: string; total: number }[];
  videoGrowth: { date: string; total: number }[];
  dailyLikes: { date: string; count: number }[];
  topVideos: {
    id: string;
    caption: string;
    views_count: number;
    likes_count: number;
    comments_count: number;
  }[];
  topUsers: {
    username: string;
    full_name: string;
    followers_count: number;
    videos_count: number;
    user_type: string;
  }[];
  engagement: {
    avgLikesPerVideo: number;
    avgCommentsPerVideo: number;
    avgFollowsPerUser: number;
    avgVideosPerUser: number;
  };
  recentSignups: number;
  recentVideos: number;
  topHashtags: { name: string; usage_count: number }[];
}

// ---- Components ----

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "text-accent-light",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 hover:border-accent/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-accent/10 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-muted text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {subtitle && <div className="text-muted text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

const COLORS = ["#6366f1", "#22c55e", "#eab308", "#ef4444", "#06b6d4", "#f97316", "#8b5cf6", "#ec4899"];

function formatDate(label: unknown) {
  const d = new Date(String(label));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---- Main page ----

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [
        totalUsers,
        totalVideos,
        totalLikes,
        totalComments,
        totalFollows,
        totalOpportunities,
        userTypes,
        userGrowth,
        videoGrowth,
        dailyLikes,
        topVideos,
        topUsers,
        engagement,
        recentSignups,
        recentVideos,
        topHashtags,
      ] = await Promise.all([
        getTotalUsers(),
        getTotalVideos(),
        getTotalLikes(),
        getTotalComments(),
        getTotalFollows(),
        getTotalOpportunities(),
        getUserTypeBreakdown(),
        getUserGrowth(),
        getVideoGrowth(),
        getDailyLikes(),
        getTopVideos(),
        getTopUsers(),
        getEngagementMetrics(),
        getRecentSignups(),
        getRecentVideos(),
        getTopHashtags(),
      ]);

      setData({
        totalUsers,
        totalVideos,
        totalLikes,
        totalComments,
        totalFollows,
        totalOpportunities,
        userTypes,
        userGrowth,
        videoGrowth,
        dailyLikes,
        topVideos,
        topUsers,
        engagement,
        recentSignups,
        recentVideos,
        topHashtags,
      });
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch dashboard data:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-muted">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red text-lg font-semibold mb-2">Failed to load dashboard</p>
          {error && <p className="text-muted text-sm mb-4 max-w-md">{error}</p>}
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-accent/10 text-accent-light rounded-lg hover:bg-accent/20 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Players", value: data.userTypes.players },
    { name: "Coaches", value: data.userTypes.coaches },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LinXtart Dashboard</h1>
          <p className="text-muted text-sm mt-1">Platform performance overview</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent-light rounded-lg hover:bg-accent/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data.totalUsers}
          subtitle={`+${data.recentSignups} last 7 days`}
        />
        <StatCard
          icon={Video}
          label="Videos"
          value={data.totalVideos}
          subtitle={`+${data.recentVideos} last 7 days`}
          color="text-green"
        />
        <StatCard
          icon={Heart}
          label="Likes"
          value={data.totalLikes}
          color="text-red"
        />
        <StatCard
          icon={MessageCircle}
          label="Comments"
          value={data.totalComments}
          color="text-yellow"
        />
        <StatCard
          icon={UserPlus}
          label="Follows"
          value={data.totalFollows}
          color="text-[#06b6d4]"
        />
        <StatCard
          icon={Briefcase}
          label="Opportunities"
          value={data.totalOpportunities}
          color="text-[#f97316]"
        />
      </div>

      {/* Engagement Averages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-light">{data.engagement.avgLikesPerVideo}</div>
          <div className="text-xs text-muted mt-1">Avg likes / video</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green">{data.engagement.avgCommentsPerVideo}</div>
          <div className="text-xs text-muted mt-1">Avg comments / video</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow">{data.engagement.avgFollowsPerUser}</div>
          <div className="text-xs text-muted mt-1">Avg follows / user</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#06b6d4]">{data.engagement.avgVideosPerUser}</div>
          <div className="text-xs text-muted mt-1">Avg videos / user</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="User Growth (cumulative)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                  labelFormatter={formatDate}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Video Uploads (cumulative)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.videoGrowth}>
                <defs>
                  <linearGradient id="videoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                  labelFormatter={formatDate}
                />
                <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#videoGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Daily Likes (last 30 days)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyLikes.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                  labelFormatter={formatDate}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="User Types">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Hashtags">
          <div className="h-64 overflow-y-auto">
            {data.topHashtags.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">No hashtags yet</div>
            ) : (
              <div className="space-y-2">
                {data.topHashtags.map((tag, i) => (
                  <div key={tag.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-5 text-right">{i + 1}</span>
                    <Hash className="w-3.5 h-3.5 text-accent-light" />
                    <span className="text-sm font-medium flex-1">{tag.name}</span>
                    <span className="text-xs text-muted bg-card-border/50 px-2 py-0.5 rounded-full">
                      {tag.usage_count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Videos */}
        <ChartCard title="Top Videos by Views">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase border-b border-card-border">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Caption</th>
                  <th className="text-right py-2 pr-4">Views</th>
                  <th className="text-right py-2 pr-4">Likes</th>
                  <th className="text-right py-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {data.topVideos.map((v, i) => (
                  <tr key={v.id} className="border-b border-card-border/50 hover:bg-card-border/20">
                    <td className="py-2 pr-4 text-muted">{i + 1}</td>
                    <td className="py-2 pr-4 max-w-[200px] truncate">
                      {v.caption || "Untitled"}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">{v.views_count?.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right font-mono text-red">{v.likes_count?.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-yellow">{v.comments_count?.toLocaleString()}</td>
                  </tr>
                ))}
                {data.topVideos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">No videos yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Top Users */}
        <ChartCard title="Top Users by Followers">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase border-b border-card-border">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">User</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-right py-2 pr-4">Followers</th>
                  <th className="text-right py-2">Videos</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u, i) => (
                  <tr key={u.username ?? i} className="border-b border-card-border/50 hover:bg-card-border/20">
                    <td className="py-2 pr-4 text-muted">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">{u.full_name || u.username}</div>
                      {u.full_name && (
                        <div className="text-xs text-muted">@{u.username}</div>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          u.user_type === "Coach"
                            ? "bg-green/10 text-green"
                            : "bg-accent/10 text-accent-light"
                        }`}
                      >
                        {u.user_type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">{u.followers_count?.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">{u.videos_count?.toLocaleString()}</td>
                  </tr>
                ))}
                {data.topUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted py-4 border-t border-card-border">
        LinXtart Platform Dashboard
      </div>
    </div>
  );
}
