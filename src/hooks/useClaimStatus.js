import { useReadContract } from 'wagmi';
import { rewardClaimAbi } from '../abis/rewardClaimAbi';
import { REWARD_CLAIM_ADDRESS } from '../config';

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
