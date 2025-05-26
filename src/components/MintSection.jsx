// src/components/MintSection.jsx

import React, { useEffect, useState } from 'react';
// ConnectButton import is removed as per previous request
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
    totalSupply, // This is your currentTotalSupply
    hasMinted,   // This is your userHasAlreadyMinted
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
    if (!userNFT?.tokenId) {
        // console.log("MintSection: No userNFT.tokenId yet for fetching proofs.");
        return;
    }
    // console.log("MintSection: Fetching proofs for tokenId:", userNFT.tokenId);
    fetch('/merkle-proofs.json')
      .then(res => {
        // console.log("MintSection: fetch response status for merkle-proofs.json:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // console.log("MintSection: Fetched merkle data:", data);
        const proof = data && data.proofs && data.proofs[userNFT.tokenId] ? data.proofs[userNFT.tokenId] : null;
        // console.log("MintSection: Proof for current token ID " + userNFT.tokenId + ":", proof);
        setClaimProof(proof);
      })
      .catch(err => {
        console.error("MintSection: Error fetching or processing merkle proofs:", err);
        setClaimProof(null);
      });
  }, [userNFT]);

  useEffect(() => {
    if (isMintConfirmed) {
      success("Mint successful! Fetching NFT...");
      refetch.totalSupply();
      refetch.hasMinted();
      refetchNFT();
    }
  }, [isMintConfirmed, success, refetch, refetchNFT]);

  if (!isConnected) {
    return <DisconnectedMintInfo />;
  }

  const handleClaim = async () => {
    if (!claimProof || !Array.isArray(claimProof)) {
      error("No valid Merkle proof for this token.");
      return;
    }
    try {
      info("Claiming reward...");
      await claimReward({
        address: REWARD_CLAIM_ADDRESS,
        abi: rewardClaimAbi,
        functionName: "claim",
        args: [parseInt(userNFT.tokenId), claimProof],
      });
      success("Reward claimed successfully!");
      refetchHasClaimed();
    } catch (err) {
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
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        abi: pizzaDayNftAbi,
        functionName: 'mintNFT',
        args: [currentAccount],
      });
    } catch (e) {
      console.error("Minting failed:", e);
      error(`Minting failed: ${e.message || "Could not send transaction."}`);
    }
  };

  // For debugging props passed to NFTDetails
  // console.log("MintSection: Props being sent to NFTDetails ->", {
  //     userNFT: userNFT,
  //     hasUserClaimed: hasUserClaimed,
  //     claimProof: claimProof,
  //     isClaiming: isClaiming,
  //     isLoading: isLoadingNFT || isMintLoading
  // });

  return (
    <div className="w-full max-w-3xl xl:max-w-4xl bg-gradient-to-br from-pizza-dough-light via-white to-pizza-parchment dark:from-pizza-oven-dark dark:via-pizza-night-dark dark:to-pizza-oven-dark rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
      
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          NFT Minting &amp; Rewards
        </h2>
      </div>

      <main className="space-y-8 sm:space-y-10">
        {feedback && feedback.message && (
            <p 
              className={`p-3 rounded-md text-sm font-medium
                ${feedback.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 
                  feedback.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 
                  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}
            >
              {feedback.message}
            </p>
        )}

        {/* 👇 ADDED "SOLD OUT" MESSAGE BLOCK HERE 👇 */}
        {maxSupply > 0 && totalSupply >= maxSupply && !userNFT && !isLoadingNFT && !isMintLoading && (
          <p className="mt-6 text-lg font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border-2 border-pizza-tomato-red/30 dark:border-pizza-cheese-yellow/30 text-center shadow-md">
            All Pizza Day NFTs have been minted out!
            {hasMinted && " Check yours below if loaded."} {/* Using 'hasMinted' state */}
          </p>
        )}

        <button
          onClick={handleMint}
          disabled={isMintingWrite || isConfirmingMint || hasMinted || (maxSupply > 0 && totalSupply >= maxSupply && !currentAccount) || (maxSupply > 0 && totalSupply >= maxSupply)} // Simplified disabled logic for sold out
          className="w-full sm:w-auto bg-pizza-tomato-red hover:bg-pizza-tomato-dark disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pizza-cheese-yellow focus:ring-opacity-50"
        >
          {isMintingWrite || isConfirmingMint ? 'Processing Mint...' 
            : (maxSupply > 0 && totalSupply >= maxSupply) ? 'Sold Out!' 
            : hasMinted ? 'Already Minted!' 
            : 'Mint Your Pizza NFT'}
        </button>

        <NFTDetails
          userNFT={userNFT}
          hasUserClaimed={hasUserClaimed}
          isClaiming={isClaiming}
          onClaim={handleClaim}
          claimProof={claimProof}
          isLoading={isLoadingNFT || isMintLoading}
          error={null} 
        />
      </main>
    </div>
  );
};

export default MintSection;