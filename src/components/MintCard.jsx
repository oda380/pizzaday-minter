// src/components/MintCard.jsx
// Premium NFT Minting Card - Clean aesthetic, no emojis

import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { rewardClaimAbi } from '../abis/rewardClaimAbi';
import { pizzaDayNftAbi } from '../abis/pizzaDayNftAbi';
import { useMintStatus } from '../hooks/useMintStatus';
import { useNFTDetails } from '../hooks/useNFTDetails';
import { useClaimStatus } from '../hooks/useClaimStatus';
import { useFeedback } from '../context/FeedbackContext';
import { COLLECTION_IMAGES, CONTRACT_ADDRESS } from '../config';

const REWARD_CLAIM_ADDRESS = import.meta.env.VITE_REWARD_CLAIM_ADDRESS;

// Image with Loading State
const NFTImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!loaded && !error && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '14px',
                }} />
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                style={{
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

// Sold Out Banner - minimal, no emoji
const SoldOutBanner = () => (
    <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center',
        marginBottom: '1rem',
    }}>
        <div style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#f87171',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
        }}>
            Collection
        </div>
        <div style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#fca5a5',
            marginTop: '0.25rem',
        }}>
            SOLD OUT
        </div>
    </div>
);

// Winner Badge - clean, minimal
const WinnerBadge = () => (
    <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(135deg, #f7c53f, #ff6b35)',
        color: '#0a0a0a',
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        fontWeight: '700',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
    }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        WINNER
    </div>
);

// Holder Actions - cleaner icons
const HolderActions = ({ tokenId }) => {
    const openSeaUrl = `https://opensea.io/assets/base/${CONTRACT_ADDRESS}/${tokenId}`;

    const handleShare = () => {
        const text = `I own a ₿PIZZA NFT from the Bitcoin Pizza Day 2025 collection!`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1rem',
            justifyContent: 'center',
        }}>
            <a
                href={openSeaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '10px',
                    color: '#60a5fa',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                }}
            >
                View on OpenSea
            </a>
            <button
                onClick={handleShare}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    background: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid rgba(255, 107, 53, 0.25)',
                    borderRadius: '10px',
                    color: '#ff6b35',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                Share
            </button>
        </div>
    );
};

// Network Badge - minimal
const NetworkBadge = () => (
    <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.5rem',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '6px',
        fontSize: '0.65rem',
        color: 'rgba(96, 165, 250, 0.8)',
        fontWeight: '500',
    }}>
        <span style={{
            width: '4px',
            height: '4px',
            background: '#22c55e',
            borderRadius: '50%',
        }} />
        Base
    </span>
);

const MintCard = () => {
    const { address: currentAccount, isConnected } = useAccount();
    const { feedback, success, error, info } = useFeedback();
    const [claimProof, setClaimProof] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const nftDetails = useNFTDetails(currentAccount, isConnected);
    // Only use NFT data when wallet is connected
    const userNFT = isConnected ? (nftDetails?.userNFT || null) : null;
    const isLoadingNFT = isConnected ? (nftDetails?.isLoadingNFT || false) : false;
    const refetchNFT = nftDetails?.refetchNFT || (() => { });

    const mintStatus = useMintStatus(currentAccount);
    const maxSupply = mintStatus?.maxSupply || 0;
    const totalSupply = mintStatus?.totalSupply || 0;
    const hasMinted = mintStatus?.hasMinted || false;
    const isMintLoading = mintStatus?.isLoading || false;
    const refetch = mintStatus?.refetch || { totalSupply: () => { }, hasMinted: () => { } };

    const { writeContractAsync: mintNFTAsync, data: mintTxHash, isPending: isMintingWrite } = useWriteContract();
    const { isLoading: isConfirmingMint, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });

    const { writeContractAsync: claimReward, isPending: isClaiming } = useWriteContract();

    const claimStatus = useClaimStatus(userNFT?.tokenId);
    const hasUserClaimed = claimStatus?.hasClaimed || false;
    const refetchHasClaimed = claimStatus?.refetch || (() => { });

    useEffect(() => {
        if (!userNFT?.tokenId) return;
        fetch('/merkle-proofs.json')
            .then(res => res.ok ? res.json() : null)
            .then(data => setClaimProof(data?.proofs?.[userNFT.tokenId] || null))
            .catch(() => setClaimProof(null));
    }, [userNFT?.tokenId]);

    useEffect(() => {
        if (isMintConfirmed) {
            success("Pizza minted successfully!");
            if (refetch?.totalSupply) refetch.totalSupply();
            if (refetch?.hasMinted) refetch.hasMinted();
            refetchNFT();
        }
    }, [isMintConfirmed]);

    const handleMint = async () => {
        if (!currentAccount) return error("Connect your wallet first");
        if (hasMinted) return error("You already own a Pizza");
        if (maxSupply > 0 && totalSupply >= maxSupply) return error("Collection sold out");

        try {
            info("Opening wallet...");
            await mintNFTAsync({
                address: import.meta.env.VITE_CONTRACT_ADDRESS,
                abi: pizzaDayNftAbi,
                functionName: 'mintNFT',
                args: [currentAccount],
            });
        } catch (e) {
            error(`Mint failed: ${e.message || "Unknown error"}`);
        }
    };

    const handleClaim = async () => {
        if (!userNFT?.tokenId || !claimProof?.length) return error("No valid proof");

        try {
            info("Processing claim...");
            await claimReward({
                address: REWARD_CLAIM_ADDRESS,
                abi: rewardClaimAbi,
                functionName: "claim",
                args: [BigInt(userNFT.tokenId), claimProof],
            });
            success("Claim submitted!");
            refetchHasClaimed();
        } catch (e) {
            error(`Claim failed: ${e.shortMessage || e.message}`);
        }
    };

    const isProcessing = isMintingWrite || isConfirmingMint || isLoadingNFT || isMintLoading;
    const isSoldOut = maxSupply > 0 && totalSupply >= maxSupply;

    return (
        <div className="mint-card">
            {isMobile && <div className="drag-handle" />}

            {/* NFT Preview */}
            <div className="nft-preview">
                {userNFT?.carouselImages?.length > 0 ? (
                    <Carousel showArrows={false} showThumbs={false} autoPlay infiniteLoop showStatus={false}>
                        {userNFT.carouselImages.map((src, i) => (
                            <NFTImage key={i} src={src} alt={`NFT view ${i + 1}`} />
                        ))}
                    </Carousel>
                ) : (
                    <NFTImage
                        src={COLLECTION_IMAGES?.placeholder || '/pizza-preview.png'}
                        alt="Pizza Day NFT Preview"
                    />
                )}
            </div>

            {/* Winner Badge */}
            {userNFT?.isWinner && (
                <div style={{ textAlign: 'center' }}>
                    <WinnerBadge />
                </div>
            )}

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: 0 }}>
                    {userNFT ? userNFT.name : '₿PIZZA'}
                </h2>
                <NetworkBadge />
            </div>

            <p className="card-subtitle" style={{ opacity: 0.6 }}>
                {userNFT ? `#${userNFT.tokenId}` : 'Bitcoin Pizza Day 2025'}
            </p>

            {/* Sold Out Banner */}
            {!userNFT && isSoldOut && <SoldOutBanner />}

            {/* Supply Counter */}
            {!userNFT && maxSupply > 0 && !isSoldOut && (
                <div className="supply-counter" style={{ opacity: 0.5 }}>
                    <span className="current">{totalSupply}</span>
                    <span>/</span>
                    <span>{maxSupply}</span>
                </div>
            )}

            {/* Attributes */}
            {userNFT?.attributes?.length > 0 && (
                <div className="nft-attributes">
                    {userNFT.attributes.slice(0, 3).map((attr, i) => (
                        <span key={i} className="attribute-pill">
                            <span className="label">{attr.trait_type}:</span> {attr.value}
                        </span>
                    ))}
                </div>
            )}

            {/* Status Messages */}
            {feedback?.message && (
                <div className={`status-message ${feedback.type}`}>
                    {feedback.message}
                </div>
            )}

            {/* Action Buttons */}
            {!isConnected ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <ConnectButton />
                    {isSoldOut && (
                        <a
                            href="https://opensea.io/collection/pizza-box-nft"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '10px',
                                color: '#60a5fa',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                textDecoration: 'none',
                            }}
                        >
                            View on OpenSea
                        </a>
                    )}
                </div>
            ) : userNFT?.isWinner && claimProof && !hasUserClaimed ? (
                <button className="btn-mint-premium" onClick={handleClaim} disabled={isClaiming}>
                    {isClaiming ? 'Claiming...' : 'Claim $50 USDC'}
                </button>
            ) : hasUserClaimed ? (
                <div className="status-message success">
                    Reward claimed successfully
                </div>
            ) : userNFT ? (
                <>
                    <div className="status-message success">
                        You own this NFT
                    </div>
                    <HolderActions tokenId={userNFT.tokenId} />
                </>
            ) : isSoldOut ? (
                <div style={{ textAlign: 'center' }}>
                    <a
                        href={`https://opensea.io/collection/pizza-box-nft`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '10px',
                            color: '#60a5fa',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        View Collection on OpenSea
                    </a>
                </div>
            ) : (
                <button className="btn-mint-premium" onClick={handleMint} disabled={isProcessing || hasMinted}>
                    {isProcessing ? 'Processing...' : hasMinted ? 'Already Minted' : 'Mint'}
                </button>
            )}
        </div>
    );
};

export default MintCard;
