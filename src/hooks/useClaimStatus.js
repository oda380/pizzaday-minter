// src/hooks/useClaimStatus.js

import { useReadContract } from 'wagmi';
import { rewardClaimAbi } from '../abis/rewardClaimAbi';

const REWARD_CLAIM_ADDRESS = import.meta.env.VITE_REWARD_CLAIM_ADDRESS;

export function useClaimStatus(tokenId) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useReadContract({
    address: REWARD_CLAIM_ADDRESS,
    abi: rewardClaimAbi,
    functionName: 'hasClaimed',
    args: [tokenId],
    query: {
      enabled: !!tokenId
    }
  });

  return {
    hasClaimed: data === true,
    isLoading,
    error,
    refetch
  };
}
