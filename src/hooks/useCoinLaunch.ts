import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

const DEGEN_PHRASES = [
  'wagmi ser', 'lfg to the moon', 'ape in or cry later', 'diamond hands only',
  'ngmi if you skip this', 'touch grass after this bag', 'ser this is a Wendy\'s',
  'flipping burgers to flipping bags', 'minimum wage maximum gains',
  'from fry cook to whale', 'burger flipper billionaire', 'cash register to crypto',
];

export interface CoinLaunch {
  id: string;
  application_id: string;
  job_id: string;
  wallet_address: string;
  coin_name: string;
  coin_phrase: string;
  status: 'pending' | 'approved' | 'rejected';
  contract_address?: string;
  created_at: string;
}

export function useCoinLaunch() {
  const queryClient = useQueryClient();

  const createCoinMetadata = useMutation({
    mutationFn: async (params: { applicationId: string; jobId: string; walletAddress: string; employerName: string }) => {
      const shortAddr = params.walletAddress.slice(0, 6);
      const phrase = DEGEN_PHRASES[Math.floor(Math.random() * DEGEN_PHRASES.length)];
      const coinName = `${params.employerName.split(' ')[0]}x${shortAddr}`;

      const { data, error } = await supabase
        .from('coin_launches')
        .insert({
          application_id: params.applicationId,
          job_id: params.jobId,
          wallet_address: params.walletAddress,
          coin_name: coinName,
          coin_phrase: phrase,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data as CoinLaunch;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coin-launches'] }),
  });

  return { createCoinMetadata };
}

export function useCoinForJob(jobId: string, walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['coin-launch', jobId, walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const { data, error } = await supabase
        .from('coin_launches')
        .select('*')
        .eq('job_id', jobId)
        .eq('wallet_address', walletAddress)
        .maybeSingle();
      if (error) throw error;
      return data as CoinLaunch | null;
    },
    enabled: !!walletAddress,
  });
}
