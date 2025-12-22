import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Incident {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: string;
  severity_score: number;
  title: string;
  description: string | null;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  media_urls: string[];
  impact_notes: string | null;
  ai_confidence: number | null;
  ai_analysis: string | null;
  status: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('incidents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setIncidents(data || []);
    } catch (err) {
      console.error('Incidents fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('incidents')
        .insert({
          ...incident,
          user_id: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setIncidents(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Incident create error:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create incident') };
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchIncidents();

    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncidents(prev => [payload.new as Incident, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents(prev => prev.map(i => i.id === payload.new.id ? payload.new as Incident : i));
          } else if (payload.eventType === 'DELETE') {
            setIncidents(prev => prev.filter(i => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents]);

  return { incidents, loading, error, createIncident, refetch: fetchIncidents };
};
