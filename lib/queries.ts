import { supabase } from "./supabase";

// ---- Totals ----

export async function getTotalUsers() {
  const { count } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getTotalVideos() {
  const { count } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}

export async function getTotalLikes() {
  const { count } = await supabase
    .from("video_likes")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getTotalComments() {
  const { count } = await supabase
    .from("video_comments")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getTotalFollows() {
  const { count } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getTotalOpportunities() {
  const { count } = await supabase
    .from("opportunities")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

// ---- User type breakdown ----

export async function getUserTypeBreakdown() {
  const { data: players } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "Player");

  const { data: coaches } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "Coach");

  // Use count from headers isn't available with head:true in data,
  // so let's do it differently
  const { count: playerCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "Player");

  const { count: coachCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "Coach");

  return { players: playerCount ?? 0, coaches: coachCount ?? 0 };
}

// ---- Growth over time (users by created_at, grouped by day) ----

export async function getUserGrowth() {
  const { data } = await supabase
    .from("user_profiles")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  let cumulative = 0;
  for (const row of data) {
    const day = row.created_at?.slice(0, 10);
    if (!day) continue;
    cumulative++;
    grouped[day] = cumulative;
  }

  return Object.entries(grouped).map(([date, total]) => ({ date, total }));
}

// ---- Video uploads over time ----

export async function getVideoGrowth() {
  const { data } = await supabase
    .from("videos")
    .select("created_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  let cumulative = 0;
  for (const row of data) {
    const day = row.created_at?.slice(0, 10);
    if (!day) continue;
    cumulative++;
    grouped[day] = cumulative;
  }

  return Object.entries(grouped).map(([date, total]) => ({ date, total }));
}

// ---- Engagement over time (likes per day) ----

export async function getDailyLikes() {
  const { data } = await supabase
    .from("video_likes")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  for (const row of data) {
    const day = row.created_at?.slice(0, 10);
    if (!day) continue;
    grouped[day] = (grouped[day] || 0) + 1;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

// ---- Top videos by engagement ----

export async function getTopVideos() {
  const { data } = await supabase
    .from("videos")
    .select("id, caption, views_count, likes_count, comments_count, created_at, user_id")
    .eq("status", "published")
    .order("views_count", { ascending: false })
    .limit(10);

  return data ?? [];
}

// ---- Top users by followers ----

export async function getTopUsers() {
  const { data } = await supabase
    .from("user_profiles")
    .select("username, full_name, followers_count, videos_count, user_type")
    .order("followers_count", { ascending: false })
    .limit(10);

  return data ?? [];
}

// ---- Engagement rate (likes + comments per video) ----

export async function getEngagementMetrics() {
  const totalVideos = await getTotalVideos();
  const totalLikes = await getTotalLikes();
  const totalComments = await getTotalComments();
  const totalFollows = await getTotalFollows();
  const totalUsers = await getTotalUsers();

  return {
    avgLikesPerVideo: totalVideos > 0 ? +(totalLikes / totalVideos).toFixed(1) : 0,
    avgCommentsPerVideo: totalVideos > 0 ? +(totalComments / totalVideos).toFixed(1) : 0,
    avgFollowsPerUser: totalUsers > 0 ? +(totalFollows / totalUsers).toFixed(1) : 0,
    avgVideosPerUser: totalUsers > 0 ? +(totalVideos / totalUsers).toFixed(1) : 0,
  };
}

// ---- Recent signups (last 7 days count) ----

export async function getRecentSignups() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);
  return count ?? 0;
}

export async function getRecentVideos() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gte("created_at", sevenDaysAgo);
  return count ?? 0;
}

// ---- Top hashtags ----

export async function getTopHashtags() {
  const { data } = await supabase
    .from("hashtags")
    .select("name, usage_count")
    .order("usage_count", { ascending: false })
    .limit(10);

  return data ?? [];
}
