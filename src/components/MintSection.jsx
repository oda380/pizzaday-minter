// src/components/MintSection.jsx

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

const REWARD_CLAIM_ADDRESS = import.meta.env.REWARD_CLAIM_ADDRESS;

const MintSection = () => {
  const { address: currentAccount, isConnected } = useAccount();
  const { feedback, success, error, info } = useFeedback();
  const [claimProof, setClaimProof] = useState(null);

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

  // useEffect for merkle proofs (this was already in a good spot)
  useEffect(() => {
    if (!userNFT?.tokenId) return;
    fetch('/merkle-proofs.json')
      .then(res => res.json())
      .then(data => setClaimProof(data.proofs[userNFT.tokenId] || null))
      .catch(() => setClaimProof(null));
  }, [userNFT]);

  // ✅ MOVED THIS useEffect UP & ADDED ALL DEPENDENCIES
  useEffect(() => {
    if (isMintConfirmed) {
      success("Mint successful! Fetching NFT...");
      refetch.totalSupply();
      refetch.hasMinted();
      refetchNFT();
    }
  // It's good practice to include all external values used by the effect in the dependency array.
  }, [isMintConfirmed, success, refetch, refetchNFT]);

  // Now, the conditional return is fine because all Hooks have been called
  if (!isConnected) {
    return <DisconnectedMintInfo />;
  }

  // Helper functions are not Hooks, so they are fine here
  const handleClaim = async () => {
    if (!claimProof || !Array.isArray(claimProof)) {
      error("No valid Merkle proof for this token.");
      return;
    }
    try {
      info("Claiming reward...");
      await claimReward({
        address: REWARD_CLAIM_ADDRESS, // Ensure REWARD_CLAIM_ADDRESS is defined
        abi: rewardClaimAbi,
        functionName: "claim",
        args: [parseInt(userNFT.tokenId), claimProof],
      });
      success("Reward claimed successfully!");
      refetchHasClaimed();
    } catch (err) {
      // It's often better to log the full error for debugging
      console.error("Claim failed:", err);
      error(`Claim failed: ${err.message || "Unknown error"}`);
    }
  };

  const handleMint = async () => {
    if (!currentAccount) {
      error("Please connect your wallet first.");
      return;
    }
    if (hasMinted) {
      error("You have already minted your Pizza Day NFT!");
      return;
    }
    if (maxSupply > 0 && totalSupply >= maxSupply) {
      error("Sorry, all NFTs have been minted!");
      return;
    }
    try {
      info("Preparing to mint...");
      await mintNFTAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS, // Ensure this env var is correctly loaded
        abi: pizzaDayNftAbi,
        functionName: 'mintNFT',
        args: [currentAccount],
      });
      // Success message for minting is handled by the isMintConfirmed useEffect
    } catch (e) {
      console.error("Minting failed:", e);
      error(`Minting failed: ${e.message || "Could not send transaction."}`);
    }
  };

  // The rest of your component's JSX for the connected state
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
        {/* You might want to display feedback more prominently or clear it */}
        {feedback && <p className={`p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{feedback.message}</p>}

        <button
          onClick={handleMint}
          disabled={isMintingWrite || isConfirmingMint || hasMinted || (maxSupply > 0 && totalSupply >= maxSupply) || !currentAccount}
          className="w-full sm:w-auto bg-pizza-tomato-red hover:bg-pizza-tomato-dark disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pizza-cheese-yellow focus:ring-opacity-50"
        >
          {isMintingWrite || isConfirmingMint ? 'Processing Mint...' : hasMinted ? 'Already Minted!' : (maxSupply > 0 && totalSupply >= maxSupply) ? 'Sold Out!' : 'Mint Your Pizza NFT'}
        </button>

        {/* Consider showing loading/error states more explicitly for NFTDetails if it handles async ops */}
        <NFTDetails
          userNFT={userNFT}
          hasUserClaimed={hasUserClaimed}
          isClaiming={isClaiming}
          onClaim={handleClaim}
          claimProof={claimProof} // claimProof being null initially is fine
          isLoading={isLoadingNFT || isMintLoading} // Combine loading states if appropriate
          error={null} // Placeholder: Pass any relevant error for NFTDetails if available
        />
      </main>
    </div>
  );
};

export default MintSection;