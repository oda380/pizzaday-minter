import { useAccount } from 'wagmi';
import {
  readContract,
  simulateContract,
  writeContract,
} from '@wagmi/core';
import { useState } from 'react';
import { toast } from 'sonner'; // or any toast lib you use
import rewardClaimAbi from '../abis/rewardClaimAbi'; // replace with your actual ABI

const CLAIM_CONTRACT_ADDRESS = '0x64eD5e16DDd06Cd9431f8Fca006b94331F682500'; // replace

export default function ClaimButton({ tokenId }) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    try {
      setLoading(true);

      if (!address) throw new Error('Wallet not connected');

      // Step 1: Verify eligibility
      const [isWinner, hasClaimed, owner] = await Promise.all([
        readContract({
          address: CLAIM_CONTRACT_ADDRESS,
          abi: rewardClaimAbi,
          functionName: 'isWinner',
          args: [tokenId],
        }),
        readContract({
          address: CLAIM_CONTRACT_ADDRESS,
          abi: rewardClaimAbi,
          functionName: 'hasClaimed',
          args: [tokenId],
        }),
        readContract({
          address: CLAIM_CONTRACT_ADDRESS,
          abi: rewardClaimAbi,
          functionName: 'rewardNFT',
        }).then(async (nftAddress) => {
          return readContract({
            address: nftAddress,
            abi: [
              {
                name: 'ownerOf',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'tokenId', type: 'uint256' }],
                outputs: [{ name: 'owner', type: 'address' }],
              },
            ],
            functionName: 'ownerOf',
            args: [tokenId],
          });
        }),
      ]);

      if (!isWinner) throw new Error('❌ Not a winner.');
      if (hasClaimed) throw new Error('❗ Already claimed.');
      if (owner.toLowerCase() !== address.toLowerCase()) {
        throw new Error('❌ You are not the owner of this NFT.');
      }

      // Step 2: Simulate claim
      const { request } = await simulateContract({
        address: CLAIM_CONTRACT_ADDRESS,
        abi: rewardClaimAbi,
        functionName: 'claim',
        args: [tokenId],
        account: address,
      });

      // Step 3: Send transaction
      const tx = await writeContract(request);
      toast.success('🎉 Claim sent! Waiting for confirmation...');

      console.log('TX:', tx.hash);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 disabled:opacity-50"
    >
      {loading ? 'Claiming...' : 'Claim 50 USDC'}
    </button>
  );
}
