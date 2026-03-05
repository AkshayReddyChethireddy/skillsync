// Auth
export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

// Skills
export interface SkillMetrics {
  id: string;
  skill_id: string;
  total_hours: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  momentum_score: number;
  progress_percent: number;
  is_stagnant: boolean;
  stagnant_since: string | null;
  avg_session_minutes: number;
  weekly_hours: number;
  monthly_hours: number;
  computed_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  target_hours: number;
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillWithMetrics extends Skill {
  metrics: SkillMetrics | null;
}

export interface SkillDetail extends SkillWithMetrics {
  recent_logs: ProgressLog[];
}

export interface CreateSkillData {
  name: string;
  description?: string;
  category?: string;
  target_hours?: number;
  color?: string;
  icon?: string;
}

export interface UpdateSkillData {
  name?: string;
  description?: string;
  category?: string;
  target_hours?: number;
  color?: string;
  icon?: string;
}

// Progress Logs
export interface ProgressLog {
  id: string;
  skill_id: string;
  user_id: string;
  session_date: string;
  duration_minutes: number;
  notes: string | null;
  difficulty: number | null;
  mood: number | null;
  created_at: string;
  skill_name?: string | null;
  skill_color?: string | null;
}

export interface LogSessionData {
  skill_id: string;
  session_date: string;
  duration_minutes: number;
  notes?: string;
  difficulty?: number;
  mood?: number;
}

export interface ProgressLogList {
  logs: ProgressLog[];
  total: number;
  has_more: boolean;
}

// Dashboard
export interface TopSkill {
  id: string;
  name: string;
  momentum_score: number;
  total_hours: number;
  color: string;
}

export interface DashboardSummary {
  total_skills: number;
  active_skills: number;
  total_hours: number;
  weekly_hours: number;
  monthly_hours: number;
  current_streak: number;
  longest_streak: number;
  avg_momentum_score: number;
  stagnant_skills_count: number;
  top_skill: TopSkill | null;
  today_logged: boolean;
  today_minutes: number;
}

export interface HeatmapCell {
  date: string;
  count: number;
  total_minutes: number;
  intensity: number;
}

export interface HeatmapData {
  year: number;
  data: HeatmapCell[];
  max_minutes_in_day: number;
  total_active_days: number;
}

export interface SkillHoursItem {
  skill_id: string;
  name: string;
  color: string;
  total_hours: number;
}

export interface WeeklyHoursItem {
  week_start: string;
  hours: number;
}

export interface DayOfWeekItem {
  day: string;
  avg_minutes: number;
}

export interface MomentumPoint {
  date: string;
  avg_momentum: number;
}

export interface SkillProgressItem {
  skill_id: string;
  name: string;
  progress_percent: number;
  target_hours: number;
  actual_hours: number;
  color: string;
}

export interface AnalyticsData {
  hours_by_skill: SkillHoursItem[];
  hours_by_week: WeeklyHoursItem[];
  hours_by_day_of_week: DayOfWeekItem[];
  momentum_over_time: MomentumPoint[];
  skill_progress_comparison: SkillProgressItem[];
}

export interface MomentumHistoryPoint {
  date: string;
  score: number;
}

export interface StreakCalendarDay {
  date: string;
  had_session: boolean;
}

export interface SkillMetricsDetail {
  skill_id: string;
  name: string;
  color: string;
  total_hours: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  momentum_score: number;
  progress_percent: number;
  is_stagnant: boolean;
  stagnant_since: string | null;
  avg_session_minutes: number;
  weekly_hours: number;
  monthly_hours: number;
  momentum_history: MomentumHistoryPoint[];
  streak_calendar: StreakCalendarDay[];
}

export interface LeaderboardEntry {
  skill_id: string;
  name: string;
  color: string;
  momentum_score: number;
  total_hours: number;
  current_streak: number;
  progress_percent: number;
  is_stagnant: boolean;
}

// API Error
export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>;
}
