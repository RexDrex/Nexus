import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrafficData {
  congestionLevel: number;
  currentSpeed: number;
  freeFlowSpeed: number;
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    from: string;
    to: string;
    delay: number;
    magnitude: number;
    coordinates: number[][];
  }>;
  timestamp: string;
}

export const useTraffic = (lat?: number, lon?: number) => {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraffic = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('traffic', {
        body: { lat: lat || 6.5244, lon: lon || 3.3792 },
      });

      if (fnError) throw fnError;
      setTraffic(data);
    } catch (err) {
      console.error('Traffic fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic');
      // Return fallback data
      setTraffic({
        congestionLevel: 45,
        currentSpeed: 35,
        freeFlowSpeed: 60,
        incidents: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchTraffic();
    // Refresh every 2 minutes
    const interval = setInterval(fetchTraffic, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTraffic]);

  return { traffic, loading, error, refetch: fetchTraffic };
};
