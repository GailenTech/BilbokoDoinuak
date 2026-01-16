import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface UserStats {
  total_users: number;
  users_this_month: number;
  users_last_month: number;
  growth_percent: number;
}

export interface DistributionItem {
  age_range?: string;
  gender?: string;
  barrio?: string;
  count: number;
}

export interface RecentRegistration {
  fecha: string;
  age_range: string;
  gender: string;
  barrio: string;
}

export interface AllStats {
  user_stats: UserStats;
  age_distribution: DistributionItem[];
  gender_distribution: DistributionItem[];
  barrio_distribution: DistributionItem[];
  recent_registrations: RecentRegistration[];
}

/**
 * Fetch all statistics from Supabase
 */
export async function fetchAllStats(): Promise<AllStats | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[StatsService] Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_all_stats');

    if (error) {
      console.error('[StatsService] Error fetching stats:', error);
      throw error;
    }

    return data as AllStats;
  } catch (err) {
    console.error('[StatsService] Exception:', err);
    throw err;
  }
}

/**
 * Fetch user stats only
 */
export async function fetchUserStats(): Promise<UserStats | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_user_stats');
    if (error) throw error;
    return data as UserStats;
  } catch (err) {
    console.error('[StatsService] Error fetching user stats:', err);
    throw err;
  }
}

/**
 * Fetch age distribution
 */
export async function fetchAgeDistribution(): Promise<DistributionItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_age_distribution');
    if (error) throw error;
    return (data as DistributionItem[]) || [];
  } catch (err) {
    console.error('[StatsService] Error fetching age distribution:', err);
    throw err;
  }
}

/**
 * Fetch gender distribution
 */
export async function fetchGenderDistribution(): Promise<DistributionItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_gender_distribution');
    if (error) throw error;
    return (data as DistributionItem[]) || [];
  } catch (err) {
    console.error('[StatsService] Error fetching gender distribution:', err);
    throw err;
  }
}

/**
 * Fetch barrio distribution
 */
export async function fetchBarrioDistribution(): Promise<DistributionItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_barrio_distribution');
    if (error) throw error;
    return (data as DistributionItem[]) || [];
  } catch (err) {
    console.error('[StatsService] Error fetching barrio distribution:', err);
    throw err;
  }
}

/**
 * Fetch recent registrations
 */
export async function fetchRecentRegistrations(limit = 10): Promise<RecentRegistration[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_recent_registrations', { limit_count: limit });
    if (error) throw error;
    return (data as RecentRegistration[]) || [];
  } catch (err) {
    console.error('[StatsService] Error fetching recent registrations:', err);
    throw err;
  }
}

/**
 * Export stats as CSV
 */
export function exportToCSV(registrations: RecentRegistration[]): void {
  const headers = ['Fecha', 'Edad', 'Género', 'Barrio'];
  const rows = registrations.map(r => [
    r.fecha,
    r.age_range,
    r.gender,
    r.barrio
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `bilboko-doinuak-stats-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
