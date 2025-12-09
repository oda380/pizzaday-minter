// src/config/index.js
// Centralized configuration for the Pizza Day NFT Minter

// Contract addresses from environment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const REWARD_CLAIM_ADDRESS = import.meta.env.VITE_REWARD_CLAIM_ADDRESS;
export const IPFS_GATEWAY_PREFIX = import.meta.env.VITE_IPFS_GATEWAY_PREFIX;

// IPFS URLs for collection preview images
export const COLLECTION_IMAGES = {
    placeholder: "/pizza-preview.png",  // Premium local preview image
    lost: "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/lost.png",
    winner: "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/winner.png",
};

// Prize outcome images for "What's in the Box" section
export const PRIZE_IMAGE_URLS = [
    COLLECTION_IMAGES.lost,
    COLLECTION_IMAGES.winner,
];

// Collection description
export const COLLECTION_DESCRIPTION = `Welcome to the Bitcoin Pizza Day 2025 NFT Minter! 
🍕 Celebrate the Bitcoin Pizza Day with our unique, random pizza box NFTs.
Mint yours for a chance to get a slice of history and win a rare "Winner" slice with special traits to claim a $50 USDC reward!`;

// Validate required environment variables
export function validateEnv() {
    const required = [
        'VITE_CONTRACT_ADDRESS',
        'VITE_REWARD_CLAIM_ADDRESS',
        'VITE_WALLETCONNECT_PROJECT_ID',
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        return false;
    }
    return true;
}
