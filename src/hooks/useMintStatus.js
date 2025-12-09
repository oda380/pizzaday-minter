import { useReadContract } from 'wagmi';
import { pizzaDayNftAbi } from '../abis/pizzaDayNftAbi';
import { CONTRACT_ADDRESS } from '../config';

export function useMintStatus(account) {
  const maxSupplyCall = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: pizzaDayNftAbi,
    functionName: 'MAX_SUPPLY'
  });

  const totalSupplyCall = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: pizzaDayNftAbi,
    functionName: 'totalSupply'
  });

  const hasMintedCall = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: pizzaDayNftAbi,
    functionName: 'hasMinted',
    args: [account],
    query: {
      enabled: !!account
    }
  });

  return {
    maxSupply: maxSupplyCall.data ? Number(maxSupplyCall.data) : 0,
    totalSupply: totalSupplyCall.data ? Number(totalSupplyCall.data) : 0,
    hasMinted: hasMintedCall.data === true,
    isLoading:
      maxSupplyCall.isLoading || totalSupplyCall.isLoading || hasMintedCall.isLoading,
    refetch: {
      totalSupply: totalSupplyCall.refetch,
      hasMinted: hasMintedCall.refetch
    }
  };
}
