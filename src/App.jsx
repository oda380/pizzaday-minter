import React, { useState, useEffect, useCallback } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
// Import RainbowKit and Wagmi hooks
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseAbi } from 'viem'; 
import { readContract as wagmiReadContractAction } from '@wagmi/core'; 

// --- Configuration ---
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x76ad239af96466ed88617929a5eea54c388baebc";
const RAW_IPFS_GATEWAY_PREFIX = import.meta.env.VITE_IPFS_GATEWAY_PREFIX || "https://ipfs.io/ipfs/";
console.log("RAW VITE_IPFS_GATEWAY_PREFIX from .env (or default):", RAW_IPFS_GATEWAY_PREFIX);

// Human-readable ABI strings
const PIZZADAY_NFT_ABI_STRINGS = [
  "function mintNFT(address recipient) public payable",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function hasMinted(address account) public view returns (bool)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function MAX_SUPPLY() public view returns (uint256)",
  "event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI)"
];

const PIZZADAY_NFT_ABI = parseAbi(PIZZADAY_NFT_ABI_STRINGS); 

const prizeImageUrls = [
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/lost.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/winner.png",
];

const collectionDescription = `Welcome to the Bitcoin Pizza Day 2025 NFT Minter! \n🍕 Celebrate the Bitcoin Pizza Day with our unique, 
random pizza box NFTs.
\nMint yours for a chance to get a slie of history and a chance to win a rare "Winner" slice with special traits to win a prize!`;

// --- Utility Functions ---
const convertIpfsUriToHttpUrl = (ipfsUri) => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) return ipfsUri;
  const cidAndPath = ipfsUri.substring(7); // e.g., "QmFoo/bar.json" or "bafy.../1.json"
  
  let gatewayPrefix = RAW_IPFS_GATEWAY_PREFIX;

  // Ensure the gateway prefix ends with a slash
  if (!gatewayPrefix.endsWith('/')) {
    gatewayPrefix += '/';
  }

  // Check if the gateway prefix already contains '/ipfs/'. If not, add it.
  // This is common for dedicated gateways where you provide the base domain.
  if (!gatewayPrefix.includes('/ipfs/')) {
    // Check if the part after the domain is the CID itself or if /ipfs/ is missing
    // A simple check: if the part after the last '/' is not 'ipfs', then append 'ipfs/'
    // This is a heuristic; a more robust solution might involve URL parsing if gateway structures vary wildly.
    const parts = gatewayPrefix.split('/');
    if (parts.length >= 3 && parts[parts.length - 2] !== 'ipfs') { // e.g. https://my.domain.com/
        gatewayPrefix += 'ipfs/';
    } else if (parts.length < 3) { // e.g. https://my.domain.com (no trailing slash originally)
        gatewayPrefix += 'ipfs/';
    }
    // If it was https://my.domain.com/ipfs/ already, this logic won't double-add.
  }
  
  // Final check to ensure no double slashes if cidAndPath starts with one (unlikely from ipfs://)
  const finalUrl = `${gatewayPrefix}${cidAndPath.startsWith('/') ? cidAndPath.substring(1) : cidAndPath}`;
  // console.log("Constructed HTTP URL:", finalUrl); // For debugging the constructed URL
  return finalUrl;
};
console.log("EFFECTIVE IPFS_GATEWAY_PREFIX for URL construction (after logic):", convertIpfsUriToHttpUrl("ipfs://test")); // Logs how the base would be formed


function App() {
  const { address: currentAccount, isConnected, chain } = useAccount();
  const wagmiConfig = useConfig(); 

  const [feedback, setFeedback] = useState("");
  const [userNFT, setUserNFT] = useState(null);
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const { data: maxSupplyData, isLoading: isLoadingMaxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PIZZADAY_NFT_ABI, 
    functionName: 'MAX_SUPPLY',
  });
  const maxSupply = maxSupplyData ? Number(maxSupplyData) : 0;

  const { data: totalSupplyData, isLoading: isLoadingTotalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PIZZADAY_NFT_ABI, 
    functionName: 'totalSupply',
  });
  const currentTotalSupply = totalSupplyData ? Number(totalSupplyData) : 0;

  const { data: hasMintedData, isLoading: isLoadingHasMinted, refetch: refetchHasMinted, error: hasMintedError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PIZZADAY_NFT_ABI, 
    functionName: 'hasMinted',
    args: [currentAccount], 
    query: {
      enabled: !!currentAccount, 
    },
  });
  const userHasAlreadyMinted = hasMintedData === true;

  const { data: mintTxHash, writeContractAsync: mintNFTAsync, isPending: isMintingWrite, error: mintError } = useWriteContract();

  const { isLoading: isConfirmingMint, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  useEffect(() => {
    // console.log("[hasMintedData Effect] hasMintedData raw value:", hasMintedData, "isLoadingHasMinted:", isLoadingHasMinted, "Error:", hasMintedError);
    // console.log("[hasMintedData Effect] Derived userHasAlreadyMinted:", userHasAlreadyMinted);
    if (hasMintedError) {
        console.error("[hasMintedData Effect] Error fetching hasMinted status:", hasMintedError);
        setFeedback(`Error checking mint status: ${hasMintedError.shortMessage || hasMintedError.message}`);
    }
  }, [hasMintedData, isLoadingHasMinted, userHasAlreadyMinted, hasMintedError]);
  
  const fetchUserNFTDetails = useCallback(async () => {
    // console.log("[fetchUserNFTDetails] Called. Current account:", currentAccount, "Condition 'userHasAlreadyMinted':", userHasAlreadyMinted);
    if (!currentAccount || !userHasAlreadyMinted) { 
      // console.log("[fetchUserNFTDetails] Guard hit: No account or 'userHasAlreadyMinted' is false.");
      setUserNFT(null); 
      setIsLoadingNFT(false); 
      return;
    }
    
    setIsLoadingNFT(true);
    setFeedback("Fetching your NFT details...");
    setUserNFT(null); 

    try {
      const balanceResult = await wagmiReadContractAction(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: PIZZADAY_NFT_ABI, 
        functionName: 'balanceOf',
        args: [currentAccount],
      });

      if (Number(balanceResult) === 0) {
        setFeedback("You've minted previously, but don't currently own this NFT or balance not updated on chain yet.");
        setIsLoadingNFT(false);
        setUserNFT(null); 
        return;
      }
      
      const tokenIdResult = await wagmiReadContractAction(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: PIZZADAY_NFT_ABI, 
        functionName: 'tokenOfOwnerByIndex',
        args: [currentAccount, 0n], 
      });
      const tokenIDString = tokenIdResult.toString();
      setFeedback(`Fetching details for your NFT (Token ID: ${tokenIDString})...`);

      const metadataUriResult = await wagmiReadContractAction(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: PIZZADAY_NFT_ABI, 
        functionName: 'tokenURI',
        args: [tokenIdResult],
      });
      // console.log("[fetchUserNFTDetails] Raw metadataUriResult:", metadataUriResult); 
      
      const httpMetadataUrl = convertIpfsUriToHttpUrl(metadataUriResult);
      if (!httpMetadataUrl || typeof httpMetadataUrl !== 'string') throw new Error("Invalid metadata URI format.");
      console.log("[fetchUserNFTDetails] Attempting to fetch metadata from URL:", httpMetadataUrl); 
      
      const metadataResponse = await fetch(httpMetadataUrl);
      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error("Metadata fetch failed. Status:", metadataResponse.status, "Response text:", errorText, "URL:", httpMetadataUrl);
        throw new Error(`Failed to fetch metadata (status: ${metadataResponse.status}) from ${httpMetadataUrl}`);
      }
      const metadata = await metadataResponse.json();

      const primaryImageUrl = convertIpfsUriToHttpUrl(metadata.image);
      let imagesForCarousel = metadata.images?.map(imgUri => convertIpfsUriToHttpUrl(imgUri)) || (primaryImageUrl ? [primaryImageUrl] : []);
      let isWinner = metadata.attributes?.find(attr => attr.trait_type === "Status" && attr.value === "Winner") ? true : false;

      setUserNFT({
        tokenId: tokenIDString,
        name: metadata.name || "Unnamed NFT",
        image: primaryImageUrl,
        carouselImages: imagesForCarousel,
        description: metadata.description || "No description available.",
        attributes: metadata.attributes || [],
        isWinner: isWinner,
      });
      setFeedback(isWinner ? "🎉 Congratulations! You minted a Winner! 🎉" : "Your Pizza Day NFT details loaded.");
    } catch (error) {
      console.error("[fetchUserNFTDetails] Error fetching user NFT details:", error);
      setFeedback(`Error fetching your NFT: ${error.message}.`);
      setUserNFT(null);
    } finally {
      setIsLoadingNFT(false);
    }
  }, [currentAccount, userHasAlreadyMinted, wagmiConfig]);


  useEffect(() => {
    if (!isConnected || !currentAccount) {
      setUserNFT(null); 
      if (!isConnected) setFeedback("Please connect your wallet to get started.");
      return;
    }

    if (isLoadingHasMinted) {
      return; 
    }

    if (userHasAlreadyMinted) {
      if (!userNFT && !isLoadingNFT) { 
        fetchUserNFTDetails();
      } else if (userNFT) {
        if(!feedback.toLowerCase().includes("congratulations") && !feedback.toLowerCase().includes("error") && !feedback.toLowerCase().includes("fetching")) {
            setFeedback("Your Pizza Day NFT details are loaded.");
        }
      }
    } else {
      setUserNFT(null);
      const isLoadingInitialContractData = isLoadingMaxSupply || isLoadingTotalSupply; 
      if (!isLoadingInitialContractData && !feedback.toLowerCase().includes("failed") && !feedback.toLowerCase().includes("minting")) { 
        setFeedback("Ready to mint your Pizza Day NFT!");
      }
    }
  }, [isConnected, currentAccount, isLoadingHasMinted, userHasAlreadyMinted, userNFT, isLoadingNFT, fetchUserNFTDetails, chain, feedback, isLoadingMaxSupply, isLoadingTotalSupply]);

  useEffect(() => {
    if (isMintConfirmed) {
      setFeedback("Mint successful! Fetching your NFT details...");
      refetchTotalSupply(); 
      refetchHasMinted();   
    }
    if (mintError) {
      let errMsg = mintError.shortMessage || mintError.message || "An unknown error occurred during minting.";
      if (errMsg.includes("rejected")) errMsg = "Transaction rejected by user.";
      if (errMsg.includes("Address has already minted")) errMsg = "You have already minted your Pizza Day NFT!";
      if ((mintError).cause?.code === 4001) errMsg = "Transaction rejected by user.";

      setFeedback(`Minting failed: ${errMsg}`);
      console.error("Minting Error full object:", mintError);
    }
  }, [isMintConfirmed, mintError, refetchTotalSupply, refetchHasMinted]);
  
  const isLoadingInitialData = isLoadingMaxSupply || isLoadingTotalSupply || (isConnected && isLoadingHasMinted);

  const handleMint = async () => {
    if (!currentAccount) {
      setFeedback("Please connect your wallet first.");
      return;
    }
    if (userHasAlreadyMinted) {
      setFeedback("You have already minted your Pizza Day NFT!");
      return;
    }
    if (maxSupply > 0 && currentTotalSupply >= maxSupply) {
      setFeedback("Sorry, all Pizza Day NFTs have been minted!");
      return;
    }

    setFeedback("Preparing to mint...");
    try {
      await mintNFTAsync({
        address: CONTRACT_ADDRESS,
        abi: PIZZADAY_NFT_ABI, 
        functionName: 'mintNFT',
        args: [currentAccount],
      });
    } catch (e) {
      if (!feedback.toLowerCase().includes("failed")) { 
        setFeedback(`Minting failed: ${e.message || "Could not send transaction."}`);
      }
    }
  };
  
  return (
    // JSX remains the same as your provided version for styling
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-['Inter',_sans-serif] antialiased">
      <div className="flex justify-center px-4 sm:px-6 lg:px-12 py-6 md:py-8">
        <div className="w-full max-w-[840px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 md:p-5 border border-gray-200 dark:border-slate-700">
          <header className="mb-8 p-5 bg-white dark:bg-slate-700/50 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-amber-400">
              <span role="img" aria-label="pizza" className="mr-2 text-3xl">🍕</span>
              Pizza Day NFT Minter
            </h1>
            <div className="flex flex-col items-center sm:items-end">
              <ConnectButton 
                accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
                showBalance={{ smallScreen: false, largeScreen: true }}
              />
            </div>
          </header>

          <main className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
            {feedback && (
              <div role="alert" aria-live="polite" className={`my-4 p-3 rounded-md text-sm font-medium border flex items-start gap-2
                ${feedback.toLowerCase().includes("error") || feedback.toLowerCase().includes("failed") || feedback.toLowerCase().includes("rejected")
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                  : feedback.toLowerCase().includes("success") || feedback.toLowerCase().includes("congratulations") || feedback.toLowerCase().includes("loaded")
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'}`}>
                <span aria-hidden="true">{feedback.toLowerCase().includes("error") || feedback.toLowerCase().includes("failed") || feedback.toLowerCase().includes("rejected") ? '❗️' : feedback.toLowerCase().includes("success") || feedback.toLowerCase().includes("congratulations") || feedback.toLowerCase().includes("loaded") ? '✅' : '🔔'}</span>
                <span>{feedback}</span>
              </div>
            )}

            {!isConnected && (
              <section aria-labelledby="collection-info-heading" className="mt-2 p-5 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <h2 id="collection-info-heading" className="text-xl font-bold text-blue-600 dark:text-amber-400 mb-3">
                  Discover the Pizza Day Collection!
                </h2>
                 <div className="my-4 sm:my-5">
                  <img
                    src="https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/placeholder.png"
                    alt="Pizza Day Collection Preview"
                    className="w-full max-w-sm mx-auto rounded-lg shadow-md border border-gray-200 dark:border-slate-600 object-contain"
                    style={{ maxHeight: '350px' }}
                    onError={(e) => {
                      (e.target).style.display = 'none';
                      const fallbackText = (e.target).parentNode?.querySelector('.img-fallback-text');
                      if (fallbackText) (fallbackText).style.display = 'block';
                    }}
                  />
                  <p className="img-fallback-text text-gray-500 dark:text-slate-400 text-xs mt-2" style={{ display: 'none' }}>
                    Collection preview image is currently unavailable.
                  </p>
                </div>
                <p className="text-gray-700 dark:text-slate-300 mb-4 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto whitespace-pre-line">
                  {collectionDescription}
                </p>
                {prizeImageUrls.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-amber-300 mb-3 text-center">
                      🏆 What's in the box? 🏆
                    </h3>
                    <div className="flex flex-wrap justify-center items-center gap-5 py-4">
                      {prizeImageUrls.map((src, index) => (
                        <div key={index} className="w-[75%] max-w-[240px] aspect-square bg-white dark:bg-slate-700 rounded-md shadow border border-gray-200 dark:border-slate-600 overflow-hidden transition-transform hover:scale-105 flex items-center justify-center">
                          <img
                            src={src}
                            alt={`Prize outcome ${index + 1} example`}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target).parentElement.style.display = 'none'; }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <p className="mt-6 text-gray-600 dark:text-slate-400 font-semibold text-sm">
                  Connect your wallet to mint your free Pizza Day NFT!
                </p>
              </section>
            )}

            {isConnected && (
              <section aria-labelledby="minting-section-heading">
                {isLoadingInitialData ? (
                    <div className="mt-6 flex flex-col items-center space-y-2 py-6" role="status" aria-live="polite">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-amber-500"></div>
                        <p id="minting-section-heading" className="text-sm text-blue-600 dark:text-amber-400 font-medium">Loading Contract Info...</p>
                    </div>
                ) : (
                    <>
                        <h2 id="minting-section-heading" className="sr-only">NFT Minting Section</h2> {/* For screen readers */}
                        {maxSupply > 0 && (
                        <div className="mb-4 p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600 text-center">
                            <p className="text-base font-semibold text-gray-700 dark:text-amber-300">
                            Supply: {currentTotalSupply} / {maxSupply}
                            </p>
                        </div>
                        )}
                        {!userHasAlreadyMinted && maxSupply > 0 && currentTotalSupply < maxSupply && (
                        <button
                            onClick={handleMint}
                            disabled={isMintingWrite || isConfirmingMint || isLoadingNFT} 
                            className={`w-full font-semibold py-2.5 px-5 rounded-md text-base transition duration-150 shadow-lg hover:scale-[1.02]
                            ${isMintingWrite || isConfirmingMint || isLoadingNFT
                                ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed opacity-60'
                                : 'bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 dark:bg-emerald-500 dark:hover:bg-emerald-600'}`}
                        >
                            {isMintingWrite ? 'Sending...' : isConfirmingMint ? 'Confirming Mint...' : isLoadingNFT ? 'Loading...' : 'Mint Your Pizza Day NFT!'}
                        </button>
                        )}
                        {userHasAlreadyMinted && !isLoadingNFT && !userNFT && ( 
                            <button 
                                onClick={fetchUserNFTDetails} 
                                className="mt-4 w-full font-semibold py-2.5 px-5 rounded-md text-base transition duration-150 shadow-lg hover:scale-[1.02] bg-blue-500 hover:bg-blue-600 text-white dark:bg-sky-500 dark:hover:bg-sky-600"
                            >
                                View Your Minted NFT
                            </button>
                        )}
                        {maxSupply > 0 && currentTotalSupply >= maxSupply && !userNFT && !isLoadingNFT && (
                            <p className="mt-4 text-base font-semibold text-gray-700 dark:text-amber-400 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600 text-center">
                                All Pizza Day NFTs have been minted out!
                                {userHasAlreadyMinted && " Check yours below if loaded."}
                            </p>
                        )}
                    </>
                )}

                {isLoadingNFT && (
                  <div className="mt-6 flex flex-col items-center space-y-2 py-6" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-amber-500"></div>
                    <p className="text-sm text-blue-600 dark:text-amber-400 font-medium">Loading Your NFT...</p>
                  </div>
                )}

                {userNFT && (
                  <section aria-labelledby="user-nft-details-heading" className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h2 id="user-nft-details-heading" className="text-xl font-bold mb-3 text-gray-700 dark:text-amber-400 text-center">Your Pizza Day NFT</h2>
                    {userNFT.isWinner && (
                      <p className="my-3 p-2.5 bg-yellow-100 dark:bg-yellow-500/30 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 font-semibold rounded-md text-sm shadow text-center">
                        🎉 Congratulations! You're a WINNER! 🏆
                      </p>
                    )}
                    <div className="md:flex md:flex-row md:items-start md:space-x-4 mt-3 bg-white dark:bg-slate-700/30 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                        <div className="w-full md:w-1/3 mx-auto md:mx-0 mb-4 md:mb-0">
                            {userNFT.carouselImages && userNFT.carouselImages.length > 0 ? (
                                <Carousel
                                    showArrows={userNFT.carouselImages.length > 1}
                                    showThumbs={false}
                                    autoPlay={userNFT.carouselImages.length > 1}
                                    infiniteLoop={userNFT.carouselImages.length > 1}
                                    className="rounded-md overflow-hidden border-2 border-gray-300 dark:border-slate-500 shadow bg-gray-50 dark:bg-slate-600"
                                    aria-label="NFT Images Carousel"
                                >
                                    {userNFT.carouselImages.map((src, index) => (
                                    <div key={index} className="aspect-square flex items-center justify-center bg-white dark:bg-slate-500">
                                        <img
                                            src={src || 'https://placehold.co/200x200/cccccc/999999?text=Pizza'}
                                            alt={`${userNFT.name || 'NFT Image'} - view ${index + 1}`}
                                            className="object-contain h-full w-full"
                                            onError={(e) => {
                                                (e.target).onerror = null; 
                                                (e.target).src = "https://placehold.co/200x200/ef4444/FFFFFF?text=Error";
                                            }}
                                        />
                                    </div>
                                    ))}
                                </Carousel>
                            ) : (
                                <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-slate-600 rounded-md border-2 border-gray-300 dark:border-slate-500 shadow">
                                    <img
                                    src={userNFT.image || 'https://placehold.co/200x200/cccccc/999999?text=N/A'}
                                    alt={userNFT.name || 'NFT Image'}
                                    className="object-contain h-full w-full rounded-sm"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-2/3 p-1 text-center md:text-left">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-slate-100 break-words mb-1">{userNFT.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                                Token ID: <span className="font-semibold text-blue-600 dark:text-purple-400">{userNFT.tokenId}</span>
                            </p>
                            {userNFT.description && (
                            <p className="text-xs sm:text-sm mb-3 text-gray-600 dark:text-slate-300 whitespace-pre-line">
                                {userNFT.description}
                            </p>
                            )}
                            {userNFT.attributes && userNFT.attributes.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-sm lg:text-base font-semibold mb-1.5 text-gray-700 dark:text-slate-200">Attributes</h4>
                                <ul className="flex flex-col items-center md:items-start space-y-1.5" aria-label="NFT Attributes">
                                {userNFT.attributes.map((attr, index) => (
                                    <li key={index} className="bg-gray-100 dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-700 dark:text-slate-200 px-2.5 py-1.5 rounded shadow-sm w-full max-w-[220px] sm:max-w-xs text-xs">
                                    <span className="font-semibold text-gray-600 dark:text-slate-300">{attr.trait_type}:</span> {attr.value}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}
                        </div>
                    </div>
                  </section>
                )}
              </section>
            )}
          </main>

          <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-400 space-y-1">
            <p>Pizza Day NFT Minter · Ensure you're on Base Mainnet</p>
            <p>
              Contract:{" "}
              <a
                href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 hover:underline dark:text-purple-400 dark:hover:text-purple-300 break-all"
              >
                {CONTRACT_ADDRESS}
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
