import { useReadContract } from 'wagmi';
import { rewardClaimAbi } from '../abis/rewardClaimAbi';

const REWARD_CLAIM_ADDRESS = import.meta.env.VITE_REWARD_CLAIM_ADDRESS;

export function useClaimStatus(tokenId) {
  const isValidTokenId = typeof tokenId === 'number' && tokenId >= 0;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: REWARD_CLAIM_ADDRESS,
    abi: rewardClaimAbi,
    functionName: 'hasClaimed',
    args: [isValidTokenId ? tokenId : 0], // avoid undefined
    query: {
      enabled: isValidTokenId,
    },
  });

  return {
    hasClaimed: data === true,
    isLoading,
    error,
    refetch,
  };
}
