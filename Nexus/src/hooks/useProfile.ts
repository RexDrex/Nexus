import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  primary_location: string;
  push_notifications: boolean;
  email_alerts: boolean;
  high_severity_only: boolean;
  severity_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setSavedLocations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [{ data: profileData, error: profileError }, { data: locationsData, error: locationsError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_locations').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      ]);

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (locationsError) throw locationsError;

      setProfile(profileData);
      setSavedLocations(locationsData || []);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Profile update error:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update profile') };
    }
  };

  const addLocation = async (location: { name: string; address: string; latitude?: number; longitude?: number }) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error: insertError } = await supabase
        .from('saved_locations')
        .insert({
          user_id: user.id,
          ...location,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setSavedLocations(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Location add error:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Failed to add location') };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSavedLocations(prev => prev.filter(l => l.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Location delete error:', err);
      return { error: err instanceof Error ? err : new Error('Failed to delete location') };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, savedLocations, loading, error, updateProfile, addLocation, deleteLocation, refetch: fetchProfile };
};
