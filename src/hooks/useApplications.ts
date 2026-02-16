import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface Application {
  id: string;
  job_id: string;
  wallet_address: string;
  status: 'in_progress' | 'applied';
  applicant_name?: string;
  applicant_age?: string;
  applicant_availability?: string;
  applicant_girth_size?: string;
  created_at: string;
}

export function useApplications(walletAddress: string | undefined) {
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('wallet_address', walletAddress);
      if (error) throw error;
      return data as Application[];
    },
    enabled: !!walletAddress,
  });

  const quickApply = useMutation({
    mutationFn: async ({ jobId, walletAddr }: { jobId: string; walletAddr: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .upsert({ job_id: jobId, wallet_address: walletAddr, status: 'in_progress' }, { onConflict: 'job_id,wallet_address' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const submitApplication = useMutation({
    mutationFn: async (params: {
      jobId: string;
      walletAddr: string;
      name: string;
      age: string;
      availability: string;
      girthSize: string;
    }) => {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'applied',
          applicant_name: params.name,
          applicant_age: params.age,
          applicant_availability: params.availability,
          applicant_girth_size: params.girthSize,
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', params.jobId)
        .eq('wallet_address', params.walletAddr)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const getStatus = (jobId: string): 'none' | 'in_progress' | 'applied' => {
    const app = applications.find(a => a.job_id === jobId);
    return app?.status ?? 'none';
  };

  return { applications, quickApply, submitApplication, getStatus };
}
