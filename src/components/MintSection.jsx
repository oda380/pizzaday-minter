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
import Leaderboard from './LeaderBoard';

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

  const soldOut =
    typeof maxSupply === 'number' &&
    typeof totalSupply === 'number' &&
    maxSupply > 0 &&
    totalSupply >= maxSupply;

  const showSoldOutMessage = soldOut && !userNFT;

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

  const tokenId = userNFT?.tokenId ?? -1;
  const { hasClaimed: hasUserClaimed, isLoading: isClaimStatusLoading, refetch: refetchHasClaimed } = useClaimStatus(tokenId);




    useEffect(() => {
      console.log({
        tokenId,
        hasUserClaimed,
        envAddress: import.meta.env.VITE_REWARD_CLAIM_ADDRESS,
        rpc: import.meta.env.VITE_BASE_MAINNET_RPC_URL,
      });
    }, [tokenId, hasUserClaimed]);
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
    
    <div className="w-full max-w-3xl xl:max-w-4xl bg-gradient-to-br from-pizza-dough-light via-white to-pizza-parchment dark:from-pizza-oven-dark dark:via-pizza-night-dark dark:to-pizza-oven-dark rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 space-y-10">
      <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-pizza-tomato-red dark:text-pizza-cheese-yellow">
        🍕 Your Pizza NFT & Reward Status
      </h2>

      {feedback && (
        <p className="text-center text-sm text-pizza-tomato-red dark:text-pizza-cheese-yellow">
          {feedback}
        </p>
      )}
      {showSoldOutMessage && (
        <div className="text-center bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-300 mb-2">All NFTs Minted</h3>
          <p className="text-sm text-red-500 dark:text-red-400">
            Sorry, all Pizza Day NFTs have been minted. Better luck next year! 🍕
          </p>
        </div>
      )}

      {!showSoldOutMessage && (<NFTDetails
        userNFT={userNFT}
        hasUserClaimed={hasUserClaimed}
        isClaiming={isClaiming}
        onClaim={handleClaim}
        isLoading={isLoadingNFT || isClaimStatusLoading}
        error={null}
      />
      )}
      
    <Leaderboard />
    </div>
  );
};

export default MintSection;

