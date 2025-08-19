import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Church = Database['public']['Tables']['churches']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type ChurchFollower = Database['public']['Tables']['church_followers']['Row'];

export function useChurches() {
  const { user } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [followedChurches, setFollowedChurches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    if (user) {
      loadChurches();
      loadFollowedChurches();
    } else {
      loadChurches();
    }
    return () => {
      mounted.current = false;
    };
  }, [user]);

  const loadChurches = async () => {
    if (mounted.current) {
      setLoading(true);
    }
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .order('name');

    if (data && !error && mounted.current) {
      setChurches(data);
    }
    if (mounted.current) {
      setLoading(false);
    }
  };

  const loadFollowedChurches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('church_followers')
      .select('church_id')
      .eq('user_id', user.id);

    if (data && !error && mounted.current) {
      setFollowedChurches(data.map(f => f.church_id));
    }
  };

  const searchChurches = async (query: string): Promise<Church[]> => {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .order('name');

    return !error && data ? data : [];
  };

  const followChurch = async (churchId: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('church_followers')
      .insert({ user_id: user.id, church_id: churchId });

    if (!error && mounted.current) {
      setFollowedChurches(prev => [...prev, churchId]);
    }

    return { error };
  };

  const unfollowChurch = async (churchId: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('church_followers')
      .delete()
      .eq('user_id', user.id)
      .eq('church_id', churchId);

    if (!error && mounted.current) {
      setFollowedChurches(prev => prev.filter(id => id !== churchId));
    }

    return { error };
  };

  const toggleFollow = async (churchId: string) => {
    const isFollowing = followedChurches.includes(churchId);
    
    if (isFollowing) {
      return await unfollowChurch(churchId);
    } else {
      return await followChurch(churchId);
    }
  };

  const isFollowing = (churchId: string) => {
    return followedChurches.includes(churchId);
  };

  return {
    churches,
    followedChurches,
    loading,
    searchChurches,
    followChurch,
    unfollowChurch,
    toggleFollow,
    isFollowing,
    loadChurches,
  };
}