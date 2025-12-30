export const PLAN_LIMITS: Record<string, { max_users: number; max_projects: number }> = {
  free: { max_users: 5, max_projects: 3 },
  pro: { max_users: 25, max_projects: 15 },
  enterprise: { max_users: 100, max_projects: 50 }
};

export const getPlanDefaults = (plan = 'free') => PLAN_LIMITS[plan] || PLAN_LIMITS.free;