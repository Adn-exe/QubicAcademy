// ============================================================
// QuantumLearn AI — Supabase Database Layer & Migration
// Replaces localStorage with Postgres while retaining client fallback
// ============================================================

import { supabase } from './supabase';
import type { UserProfileData } from '../core/profileStore';
import { DEFAULT_PROFILE_DATA, PROFILE_STORAGE_KEY } from '../core/profileStore';
import type { UserProgress, QuantumCircuit, ChallengeResult } from '../core/types';
import type { QuantumProblem, ProblemsProgress, ProblemStatus } from '../data/problems/problemsData';
import {
  INITIAL_PROBLEMS,
  INITIAL_PROGRESS,
  PROBLEMS_STORAGE_KEY,
  PROBLEMS_PROGRESS_KEY,
} from '../data/problems/problemsData';

// --- Profile & Settings Operations ---

export async function fetchUserProfile(userId: string): Promise<UserProfileData> {
  try {
    // 1. Fetch Profile info
    const { data: profileRow, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (pErr) console.warn('Error fetching profile from Supabase:', pErr);

    // 2. Fetch Progress info
    const { data: progressRow, error: progErr } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (progErr) console.warn('Error fetching progress:', progErr);

    // 3. Fetch Badges
    const { data: badgeRows, error: bErr } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (bErr) console.warn('Error fetching badges:', bErr);

    // 4. Fetch Activity
    const { data: activityRows, error: aErr } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (aErr) console.warn('Error fetching activity:', aErr);

    // 5. Fetch Saved Circuits
    const { data: circuitRows, error: cErr } = await supabase
      .from('saved_circuits')
      .select('*')
      .eq('user_id', userId)
      .order('last_edited', { ascending: false });

    if (cErr) console.warn('Error fetching circuits:', cErr);

    // 6. Fetch Solved Problems count from problem_status table
    const { count: solvedProblemsCount, error: spErr } = await supabase
      .from('problem_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Solved');

    if (spErr) console.warn('Error fetching solved problems count:', spErr);

    // Calculate modules completed & challenges passed
    const completedModules = progressRow?.completed_modules || [];
    const completedChallenges = (progressRow?.completed_challenges as ChallengeResult[]) || [];

    // Map badges or use defaults
    const badges = (badgeRows && badgeRows.length > 0)
      ? badgeRows.map((b) => ({
          id: b.badge_id,
          name: b.name,
          description: b.description,
          earned: b.earned,
          earnedDate: b.earned_date,
        }))
      : DEFAULT_PROFILE_DATA.badges;

    // Map activity or empty array (filter out any legacy template mock items)
    const activity = (activityRows && activityRows.length > 0)
      ? activityRows
          .filter((a) => !a.id.match(/^act_[1-6]$/))
          .map((a) => ({
            id: a.id,
            type: a.type as 'module_complete' | 'circuit_saved' | 'challenge_passed',
            label: a.label,
            timestamp: a.timestamp,
          }))
      : [];

    // Map circuits or empty array (filter out any legacy template mock items)
    const savedCircuits = (circuitRows && circuitRows.length > 0)
      ? circuitRows
          .filter((c) => !c.id.match(/^sc_[1-2]$/))
          .map((c) => ({
            id: c.id,
            name: c.name,
            circuitJson: c.circuit_json as QuantumCircuit,
            lastEdited: c.last_edited,
          }))
      : [];

    // Calculate Tracks (Foundations, Circuits, Algorithms)
    // Foundations: superposition-single-qubit (mod 1), quantum-measurement (mod 2)
    // Circuits: entanglement-bell-states (mod 3), quantum-teleportation (mod 4)
    // Algorithms: grovers-search (mod 5), deutsch-jozsa (mod 6)
    const foundationsCount = completedModules.filter((id: string) =>
      ['superposition-single-qubit', 'quantum-measurement'].includes(id)
    ).length;
    const circuitsCount = completedModules.filter((id: string) =>
      ['entanglement-bell-states', 'quantum-teleportation'].includes(id)
    ).length;
    const algorithmsCount = completedModules.filter((id: string) =>
      ['grovers-search', 'deutsch-jozsa'].includes(id)
    ).length;

    const tracks = [
      { name: 'Foundations', completed: foundationsCount, total: 2 },
      { name: 'Circuits', completed: circuitsCount, total: 2 },
      { name: 'Algorithms', completed: algorithmsCount, total: 2 },
    ];

    // Real challenges passed combines verification challenge passes + solved problem passes
    const realChallengesPassed = (solvedProblemsCount || 0) +
      completedChallenges.filter((c: ChallengeResult) => c.passed && c.challengeId === 'bell-state').length;

    const rawBio = profileRow?.bio;
    const userBio =
      rawBio === 'Exploring quantum algorithms, superposition, and entanglement protocols.'
        ? ''
        : (rawBio || '');

    const result: UserProfileData = {
      profile: {
        name: profileRow?.name || DEFAULT_PROFILE_DATA.profile.name,
        bio: userBio,
        role: profileRow?.role || DEFAULT_PROFILE_DATA.profile.role,
        avatarInitials: profileRow?.avatar_initials || DEFAULT_PROFILE_DATA.profile.avatarInitials,
        memberSince: profileRow?.member_since || DEFAULT_PROFILE_DATA.profile.memberSince,
        theme: (profileRow?.theme as 'light' | 'dark' | 'system') || 'dark',
      },
      stats: {
        modulesCompleted: completedModules.length,
        modulesTotal: 6,
        circuitsBuilt: savedCircuits.length,
        challengesPassed: realChallengesPassed,
        challengesTotal: 17,
        currentStreak: progressRow?.streak_days || 0,
      },
      tracks,
      badges,
      activity,
      savedCircuits,
      settings: {
        notifyStreak: profileRow?.notify_streak ?? true,
        notifyNewModules: profileRow?.notify_new_modules ?? true,
      },
    };

    return result;
  } catch (err) {
    console.error('Failed to fetch user profile from Supabase:', err);
    return DEFAULT_PROFILE_DATA;
  }
}

export async function updateUserProfileHeader(
  userId: string,
  fields: Partial<UserProfileData['profile']>
): Promise<void> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (fields.name !== undefined) {
      updatePayload.name = fields.name;
      updatePayload.avatar_initials = fields.avatarInitials ||
        fields.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'QL';
    }
    if (fields.bio !== undefined) updatePayload.bio = fields.bio;
    if (fields.role !== undefined) updatePayload.role = fields.role;
    if (fields.theme !== undefined) updatePayload.theme = fields.theme;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating user profile:', err);
  }
}

export async function updateProfile(
  fields: Partial<UserProfileData['profile']>
): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return;

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (fields.name !== undefined) {
    updatePayload.name = fields.name;
    if (fields.avatarInitials === undefined) {
      updatePayload.avatar_initials = fields.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'QL';
    }
  }
  if (fields.avatarInitials !== undefined) {
    updatePayload.avatar_initials = fields.avatarInitials;
  }
  if (fields.bio !== undefined) updatePayload.bio = fields.bio;
  if (fields.role !== undefined) updatePayload.role = fields.role;
  if (fields.theme !== undefined) updatePayload.theme = fields.theme;

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id);

  if (error) throw error;
}


export async function updateUserSettings(
  userId: string,
  settings: Partial<UserProfileData['settings']>
): Promise<void> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (settings.notifyStreak !== undefined) updatePayload.notify_streak = settings.notifyStreak;
    if (settings.notifyNewModules !== undefined) updatePayload.notify_new_modules = settings.notifyNewModules;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating settings:', err);
  }
}

// --- Circuit Operations ---

export async function saveUserCircuit(
  userId: string,
  circuitId: string,
  name: string,
  circuit: QuantumCircuit
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase.from('saved_circuits').upsert({
      id: circuitId,
      user_id: userId,
      name,
      circuit_json: circuit,
      last_edited: now,
    });

    if (error) throw error;

    // Also record activity
    await logUserActivity(userId, 'circuit_saved', `Saved circuit: '${name}'`);
  } catch (err) {
    console.error('Error saving circuit to Supabase:', err);
  }
}

export async function deleteUserCircuit(userId: string, circuitId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('saved_circuits')
      .delete()
      .match({ id: circuitId, user_id: userId });

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting circuit:', err);
  }
}

// --- Activity Log Operations ---

export async function logUserActivity(
  userId: string,
  type: 'module_complete' | 'circuit_saved' | 'challenge_passed',
  label: string
): Promise<void> {
  try {
    const activityId = `act_${Date.now()}`;
    await supabase.from('activity_log').insert({
      id: activityId,
      user_id: userId,
      type,
      label,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error logging user activity:', err);
  }
}

// --- Learning Progress Operations ---

export async function fetchUserProgress(userId: string): Promise<UserProgress> {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        completedModules: [],
        completedChallenges: [],
        lastActiveModule: null,
        totalTimeSpent: 0,
        streakDays: 0,
        lastActiveDate: '',
      };
    }

    return {
      completedModules: data.completed_modules || [],
      completedChallenges: data.completed_challenges || [],
      lastActiveModule: data.last_active_module || null,
      totalTimeSpent: data.total_time_spent || 0,
      streakDays: data.streak_days || 0,
      lastActiveDate: data.last_active_date || '',
    };
  } catch (err) {
    console.error('Error fetching progress from Supabase:', err);
    return {
      completedModules: [],
      completedChallenges: [],
      lastActiveModule: null,
      totalTimeSpent: 0,
      streakDays: 0,
      lastActiveDate: '',
    };
  }
}

export async function saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
  try {
    const { error } = await supabase.from('progress').upsert({
      user_id: userId,
      completed_modules: progress.completedModules,
      completed_challenges: progress.completedChallenges,
      last_active_module: progress.lastActiveModule,
      total_time_spent: progress.totalTimeSpent,
      streak_days: progress.streakDays,
      last_active_date: progress.lastActiveDate || null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error saving progress to Supabase:', err);
  }
}

// --- Quantum Problems Operations ---

export async function fetchUserProblems(userId: string): Promise<QuantumProblem[]> {
  try {
    const { data: statusRows, error } = await supabase
      .from('problem_status')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (!statusRows || statusRows.length === 0) {
      return INITIAL_PROBLEMS.map((initial) => ({
        ...initial,
        status: 'Unsolved' as ProblemStatus,
        solvedDate: undefined,
      }));
    }

    const statusMap = new Map(statusRows.map((r) => [r.problem_id, r]));

    return INITIAL_PROBLEMS.map((initial) => {
      const match = statusMap.get(initial.id);
      if (match) {
        // Ignore any legacy mock dates from 2026-03-05/2026-03-06
        const isLegacyMock = match.solved_date && /^2026-03-0[56]/.test(match.solved_date);
        const resolvedStatus = isLegacyMock ? 'Unsolved' : ((match.status as ProblemStatus) || 'Unsolved');
        return {
          ...initial,
          status: resolvedStatus,
          solvedDate: isLegacyMock ? undefined : (match.solved_date || undefined),
        };
      }
      return {
        ...initial,
        status: 'Unsolved' as ProblemStatus,
        solvedDate: undefined,
      };
    });
  } catch (err) {
    console.error('Error fetching user problems:', err);
    return INITIAL_PROBLEMS.map((p) => ({
      ...p,
      status: 'Unsolved' as ProblemStatus,
      solvedDate: undefined,
    }));
  }
}

export async function upsertUserProblemStatus(
  userId: string,
  problemId: string,
  status: ProblemStatus,
  solvedDate?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('problem_status').upsert(
      {
        user_id: userId,
        problem_id: problemId,
        status,
        solved_date: solvedDate || (status === 'Solved' ? new Date().toISOString() : null),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,problem_id' }
    );

    if (error) throw error;
  } catch (err) {
    console.error('Error updating problem status in Supabase:', err);
  }
}

export async function fetchUserProblemsProgress(userId: string): Promise<ProblemsProgress> {
  try {
    const { data, error } = await supabase
      .from('problems_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return INITIAL_PROGRESS;
    }

    return {
      currentStreak: data.current_streak || 0,
      maxStreak: data.max_streak || 0,
      recentActivity: Array.isArray(data.recent_activity) ? data.recent_activity : [],
    };
  } catch (err) {
    console.error('Error fetching problems progress:', err);
    return INITIAL_PROGRESS;
  }
}

export async function saveUserProblemsProgress(
  userId: string,
  progress: ProblemsProgress
): Promise<void> {
  try {
    const { error } = await supabase.from('problems_progress').upsert(
      {
        user_id: userId,
        current_streak: progress.currentStreak,
        max_streak: progress.maxStreak,
        recent_activity: progress.recentActivity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) throw error;
  } catch (err) {
    console.error('Error updating problems progress in Supabase:', err);
  }
}

// --- Announcements Operations ---

export async function fetchUserReadAnnouncements(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('announcements_read')
      .select('announcement_id')
      .eq('user_id', userId);

    if (error) throw error;
    if (!data || data.length === 0) return ['ann-3', 'ann-4'];
    return data.map((d) => d.announcement_id);
  } catch (err) {
    console.error('Error fetching read announcements:', err);
    return ['ann-3', 'ann-4'];
  }
}

export async function markUserAnnouncementRead(userId: string, announcementId: string): Promise<void> {
  try {
    const { error } = await supabase.from('announcements_read').upsert(
      {
        user_id: userId,
        announcement_id: announcementId,
        read_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,announcement_id' }
    );

    if (error) throw error;
  } catch (err) {
    console.error('Error marking announcement read in Supabase:', err);
  }
}

// --- Auto-Migration from LocalStorage on First Login ---

export async function autoMigrateLocalStorageToSupabase(userId: string): Promise<void> {
  const migrationKey = `quantumlearn:migrated_${userId}`;
  if (localStorage.getItem(migrationKey)) {
    return; // Already migrated for this user
  }

  try {
    console.info(`Starting auto-migration of localStorage for user: ${userId}`);

    // 1. Profile Data Migration
    const localProfileRaw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (localProfileRaw) {
      try {
        const localProfile = JSON.parse(localProfileRaw) as UserProfileData;

        // Sync profile fields
        if (localProfile.profile) {
          await supabase.from('profiles').update({
            name: localProfile.profile.name || 'Quantum Explorer',
            bio: localProfile.profile.bio || '',
            role: localProfile.profile.role || 'Quantum Computing Student',
            avatar_initials: localProfile.profile.avatarInitials || 'QE',
            theme: localProfile.profile.theme || 'dark',
            notify_streak: localProfile.settings?.notifyStreak ?? true,
            notify_new_modules: localProfile.settings?.notifyNewModules ?? true,
          }).eq('id', userId);
        }

        // Migrate saved circuits (ignoring legacy mock template items)
        if (Array.isArray(localProfile.savedCircuits) && localProfile.savedCircuits.length > 0) {
          for (const circuit of localProfile.savedCircuits) {
            if (circuit.id.match(/^sc_[1-2]$/)) continue;
            await supabase.from('saved_circuits').upsert({
              id: circuit.id,
              user_id: userId,
              name: circuit.name,
              circuit_json: circuit.circuitJson,
              last_edited: circuit.lastEdited || new Date().toISOString(),
            });
          }
        }

        // Migrate activity logs (ignoring legacy mock template items)
        if (Array.isArray(localProfile.activity) && localProfile.activity.length > 0) {
          for (const act of localProfile.activity) {
            if (act.id.match(/^act_[1-6]$/)) continue;
            await supabase.from('activity_log').upsert({
              id: act.id,
              user_id: userId,
              type: act.type,
              label: act.label,
              timestamp: act.timestamp,
            });
          }
        }

        // Migrate badges
        if (Array.isArray(localProfile.badges) && localProfile.badges.length > 0) {
          for (const badge of localProfile.badges) {
            await supabase.from('user_badges').upsert(
              {
                user_id: userId,
                badge_id: badge.id,
                name: badge.name,
                description: badge.description,
                earned: badge.earned,
                earned_date: badge.earnedDate,
              },
              { onConflict: 'user_id,badge_id' }
            );
          }
        }
      } catch (err) {
        console.warn('Failed migrating local profile data:', err);
      }
    }

    // 2. Learning Progress Migration
    const localProgressRaw = localStorage.getItem('quantumlearn-progress');
    if (localProgressRaw) {
      try {
        const prog = JSON.parse(localProgressRaw) as UserProgress;
        await supabase.from('progress').upsert(
          {
            user_id: userId,
            completed_modules: prog.completedModules || [],
            completed_challenges: prog.completedChallenges || [],
            last_active_module: prog.lastActiveModule || null,
            total_time_spent: prog.totalTimeSpent || 0,
            streak_days: prog.streakDays || 0,
            last_active_date: prog.lastActiveDate || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      } catch (err) {
        console.warn('Failed migrating learning progress:', err);
      }
    }

    // 3. Quantum Problems Migration
    const localProblemsRaw = localStorage.getItem(PROBLEMS_STORAGE_KEY);
    if (localProblemsRaw) {
      try {
        const problems = JSON.parse(localProblemsRaw) as QuantumProblem[];
        if (Array.isArray(problems)) {
          for (const p of problems) {
            if (p.status === 'Solved' || p.status === 'Attempted') {
              await supabase.from('problem_status').upsert(
                {
                  user_id: userId,
                  problem_id: p.id,
                  status: p.status,
                  solved_date: p.solvedDate || null,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,problem_id' }
              );
            }
          }
        }
      } catch (err) {
        console.warn('Failed migrating problem statuses:', err);
      }
    }

    // 4. Problems Progress Migration
    const localProgStreakRaw = localStorage.getItem(PROBLEMS_PROGRESS_KEY);
    if (localProgStreakRaw) {
      try {
        const pProg = JSON.parse(localProgStreakRaw) as ProblemsProgress;
        await supabase.from('problems_progress').upsert(
          {
            user_id: userId,
            current_streak: pProg.currentStreak || 0,
            max_streak: pProg.maxStreak || 0,
            recent_activity: pProg.recentActivity || [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      } catch (err) {
        console.warn('Failed migrating problems progress:', err);
      }
    }

    // Mark as migrated successfully
    localStorage.setItem(migrationKey, 'true');
    console.info(`Auto-migration to Supabase completed successfully for user: ${userId}`);
  } catch (globalErr) {
    console.error('Error during auto-migration to Supabase:', globalErr);
  }
}

/**
 * Purges any legacy mock data (e.g. template solved dates 2026-03-05/2026-03-06 or mock recent activity ra1-ra6)
 * from Supabase tables for the authenticated user so progress is 100% genuine.
 */
export async function purgeLegacyMockData(userId: string): Promise<void> {
  try {
    // 1. Delete any problem_status rows that have the hardcoded mock template dates
    await supabase
      .from('problem_status')
      .delete()
      .eq('user_id', userId)
      .gte('solved_date', '2026-03-05T00:00:00')
      .lte('solved_date', '2026-03-06T23:59:59');

    // 2. Fetch real solved problems
    const { data: realSolvedRows } = await supabase
      .from('problem_status')
      .select('problem_id')
      .eq('user_id', userId)
      .eq('status', 'Solved');

    const solvedIds = new Set((realSolvedRows || []).map((r) => r.problem_id));

    // 3. Fetch problems_progress and sanitize recent_activity & streak
    const { data: progRow } = await supabase
      .from('problems_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (progRow && Array.isArray(progRow.recent_activity)) {
      const cleanedActivity = progRow.recent_activity.filter(
        (a: any) =>
          !a.id?.match(/^ra[1-6]$/) &&
          !a.timestamp?.match(/^2026-03-0[56]/) &&
          a.action === 'solved' &&
          solvedIds.has(a.problemId)
      );

      const hasSpurious =
        cleanedActivity.length !== progRow.recent_activity.length ||
        (cleanedActivity.length === 0 && (progRow.current_streak > 0 || progRow.max_streak > 0));

      if (hasSpurious) {
        await supabase
          .from('problems_progress')
          .update({
            current_streak: cleanedActivity.length === 0 ? 0 : progRow.current_streak,
            max_streak: cleanedActivity.length === 0 ? 0 : progRow.max_streak,
            recent_activity: cleanedActivity,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    }

    // 4. Sanitize activity_log for unearned actions
    const { data: progressRow } = await supabase
      .from('progress')
      .select('completed_modules, completed_challenges')
      .eq('user_id', userId)
      .maybeSingle();

    const compMods = progressRow?.completed_modules || [];
    const compChalls = progressRow?.completed_challenges || [];

    const { data: actRows } = await supabase
      .from('activity_log')
      .select('id, type, timestamp')
      .eq('user_id', userId);

    if (actRows && actRows.length > 0) {
      for (const act of actRows) {
        let shouldDelete = false;
        if (act.id.match(/^act_[1-6]$/) || act.timestamp?.match(/^2026-03-0[56]/)) {
          shouldDelete = true;
        } else if (act.type === 'challenge_passed' && solvedIds.size === 0 && compChalls.length === 0) {
          shouldDelete = true;
        } else if (act.type === 'module_complete' && compMods.length === 0) {
          shouldDelete = true;
        }

        if (shouldDelete) {
          await supabase.from('activity_log').delete().eq('id', act.id);
        }
      }
    }
  } catch (err) {
    console.warn('Error purging legacy mock data in Supabase:', err);
  }
}
