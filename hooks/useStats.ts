/**
 * useStats.ts
 * -----------
 * React hook that loads and exposes user stats from statsStorage.
 * Automatically reloads when the signed-in user changes.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  UserStats,
  loadStats,
  calcSuccessRate,
} from "@/utils/statsStorage";

export function useStats() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    if (!uid) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await loadStats(uid);
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [uid]);

  const successRate = stats ? calcSuccessRate(stats) : 0;

  return { stats, loading, successRate, refreshStats };
}
