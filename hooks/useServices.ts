import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Service = Database['public']['Tables']['services']['Row'] & {
  churches?: Database['public']['Tables']['churches']['Row'];
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    loadServices();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('services')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'services' },
        () => {
          loadServices();
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadServices = async () => {
    if (mounted.current) {
      setLoading(true);
    }
    
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        churches (
          id,
          name,
          slug,
          location
        )
      `)
      .order('starts_at', { ascending: true });

    if (data && !error && mounted.current) {
      const now = new Date();
      const live = data.filter(service => service.is_live);
      const upcoming = data.filter(service => 
        !service.is_live && new Date(service.starts_at) > now
      );

      setServices(data);
      setLiveServices(live);
      setUpcomingServices(upcoming);
    }
    
    if (mounted.current) {
      setLoading(false);
    }
  };

  const getServicesByChurch = async (churchId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        churches (
          id,
          name,
          slug,
          location
        )
      `)
      .eq('church_id', churchId)
      .order('starts_at', { ascending: true });

    return !error && data ? data : [];
  };

  const joinLiveService = async (serviceId: string) => {
    // Increment attendees count
    const { error } = await supabase.rpc('increment_service_attendees', {
      service_id: serviceId
    });

    if (!error) {
      // Reload services to get updated count
      loadServices();
    }

    return { error };
  };

  const createService = async (serviceData: Database['public']['Tables']['services']['Insert']) => {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (!error && data) {
      loadServices();
    }

    return { data, error };
  };

  const updateService = async (serviceId: string, updates: Database['public']['Tables']['services']['Update']) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (!error && data) {
      loadServices();
    }

    return { data, error };
  };

  const startLiveService = async (serviceId: string) => {
    return await updateService(serviceId, { is_live: true });
  };

  const endLiveService = async (serviceId: string) => {
    return await updateService(serviceId, { is_live: false });
  };

  return {
    services,
    liveServices,
    upcomingServices,
    loading,
    loadServices,
    getServicesByChurch,
    joinLiveService,
    createService,
    updateService,
    startLiveService,
    endLiveService,
  };
}