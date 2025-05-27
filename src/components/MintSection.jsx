// src/components/MintSection.jsx (updated for RewardClaimV4 — no Merkle proof)

import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { rewardClaimAbi } from '../abis/rewardClaimAbi';
import { pizzaDayNftAbi } from '../abis/pizzaDayNftAbi';
import NFTDetails from './NFTDetails';
import { useMintStatus } from '../hooks/useMintStatus';
import { useNFTDetails } from '../hooks/useNFTDetails';
import { useClaimStatus } from '../hooks/useClaimStatus';
import { useFeedback } from '../context/FeedbackContext';
import DisconnectedMintInfo from './DisconnectedMintInfo';

const REWARD_CLAIM_ADDRESS = import.meta.env.VITE_REWARD_CLAIM_ADDRESS;

const MintSection = () => {
  const { address: currentAccount, isConnected } = useAccount();
  const { feedback, success, error, info } = useFeedback();

  const { userNFT, isLoadingNFT, refetchNFT } = useNFTDetails(currentAccount, true);
  const {
    maxSupply,
    totalSupply,
    hasMinted,
    isLoading: isMintLoading,
    refetch,
  } = useMintStatus(currentAccount);

  const {
    writeContractAsync: mintNFTAsync,
    data: mintTxHash,
    isPending: isMintingWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirmingMint,
    isSuccess: isMintConfirmed,
  } = useWaitForTransactionReceipt({ hash: mintTxHash });

  const {
    writeContractAsync: claimReward,
    isPending: isClaiming,
  } = useWriteContract();

  const {
    hasClaimed: hasUserClaimed,
    refetch: refetchHasClaimed,
  } = useClaimStatus(userNFT?.tokenId);

  useEffect(() => {
    if (isMintConfirmed) {
      success("Mint successful! Fetching NFT...");
      refetch.totalSupply();
      refetch.hasMinted();
      refetchNFT();
    }
  }, [isMintConfirmed]);

  if (!isConnected) return <DisconnectedMintInfo />;

  const handleClaim = async () => {
    try {
      info("Claiming reward...");
      await claimReward({
        address: REWARD_CLAIM_ADDRESS,
        abi: rewardClaimAbi,
        functionName: "claim",
        args: [parseInt(userNFT.tokenId)],
      });
      success("Reward claimed successfully!");
      refetchHasClaimed();
    } catch (err) {
      error(`Claim failed: ${err?.message || "Unknown error"}`);
    }
  };

  const handleMint = async () => {
    if (!currentAccount) return error("Please connect your wallet first.");
    if (hasMinted) return error("You have already minted your Pizza Day NFT!");
    if (maxSupply > 0 && totalSupply >= maxSupply) return error("Sorry, all NFTs have been minted!");

    try {
      info("Preparing to mint...");
      await mintNFTAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        abi: pizzaDayNftAbi,
        functionName: 'mintNFT',
        args: [currentAccount],
      });
    } catch (e) {
      error(`Minting failed: ${e.message || "Could not send transaction."}`);
    }
  };

  return (
    <div className="w-full max-w-3xl xl:max-w-4xl bg-gradient-to-br from-pizza-dough-light via-white to-pizza-parchment dark:from-pizza-oven-dark dark:via-pizza-night-dark dark:to-pizza-oven-dark rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30 flex flex-col sm:flex-row justify-between items-center gap-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow tracking-wide flex items-center gap-2.5">
          <span role="img" aria-label="pizza" className="text-3xl sm:text-4xl transform group-hover:rotate-12 transition-transform">🍕</span>
          <span>Pizza Day NFT Minter</span>
        </h1>
        <ConnectButton accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} showBalance={{ smallScreen: false, largeScreen: true }} />
      </header>

      <main className="space-y-8 sm:space-y-10">
        {feedback && <p>{feedback}</p>}
        <button onClick={handleMint} disabled={isMintingWrite}>Mint</button>

        <NFTDetails
          userNFT={userNFT}
          hasUserClaimed={hasUserClaimed}
          isClaiming={isClaiming}
          onClaim={handleClaim}
          isLoading={isLoadingNFT}
          error={null}
        />
      </main>
    </div>
  );
};

export default MintSection;
