import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { pizzaDayNftAbi } from '../abis/pizzaDayNftAbi';

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useLeaderboardFromWinners(tokenIds) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const results = await Promise.allSettled(
          tokenIds.map(async (tokenId) => {
            const owner = await publicClient.readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: pizzaDayNftAbi,
              functionName: 'ownerOf',
              args: [tokenId],
            });
            return { tokenId, wallet: owner };
          })
        );

        const parsed = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => ({
            tokenId: r.value.tokenId,
            wallet: r.value.wallet,
            prize: '50 USDC',
          }));

        setWinners(parsed);
      } catch (err) {
        console.error('Failed to fetch token holders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [tokenIds, publicClient]);

  return { winners, loading };
}
