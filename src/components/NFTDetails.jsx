// src/components/NFTDetails.jsx

import React from 'react';

const fallbackImages = {
  winner: "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/winner.png",
  loser: "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/lost.png"
};

const NFTDetails = ({
  userNFT,
  hasUserClaimed,
  isClaiming,
  isLoading,
  error,
  onClaim,
}) => {
  if (isLoading) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Loading your NFT details...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-600 dark:text-red-400">
        {error.message || "Failed to load NFT."}
      </p>
    );
  }

  if (!userNFT) {
    return (
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        You don’t own a Pizza NFT yet. Mint one to check if you're a winner 🍕
      </p>
    );
  }

  const { name, tokenId, image, description, attributes, isWinner } = userNFT;
  const fallbackImage = isWinner ? fallbackImages.winner : fallbackImages.loser;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your NFT</h2>

      <img
        src={image || fallbackImage}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
        alt={name || "Pizza NFT"}
        className="mx-auto rounded-lg border border-gray-300 dark:border-slate-600 max-w-xs object-contain"
      />

      <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400">Token ID: {tokenId}</p>

      {description && (
        <p className="mt-4 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line">
          {description}
        </p>
      )}

      {attributes && attributes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Attributes</h4>
          <ul className="flex flex-wrap justify-center gap-2">
            {attributes.map((attr, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded text-sm text-gray-800 dark:text-gray-100"
              >
                {attr.trait_type}: {attr.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isWinner && !hasUserClaimed && (
        <button
          onClick={onClaim}
          disabled={isClaiming}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow hover:scale-105 transition disabled:opacity-60"
        >
          {isClaiming ? "Claiming..." : "🎁 Claim 50 USDC"}
        </button>
      )}

      {isWinner && hasUserClaimed && (
        <p className="mt-4 text-green-600 dark:text-green-300 font-medium">
          ✅ You have already claimed your reward.
        </p>
      )}

      {!isWinner && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          This NFT is not a winner.
        </p>
      )}
    </div>
  );
};

export default NFTDetails;
