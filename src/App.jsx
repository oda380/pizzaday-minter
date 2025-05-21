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
  // Overall Page Background and Layout Container
  <div className="min-h-screen bg-page-bg-light-dough dark:bg-page-bg-dark-brick text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
  <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">

    {/* Hero Block - More Impactful */}
    <section className="text-center w-full max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <div className="transform transition-all duration-500 ease-out hover:scale-[1.02]">
        <img
          src="/pizza-day-banner.png" // Ensure this path is correct and image is in your public folder
          alt="Celebrate Bitcoin Pizza Day with Yolo - Commemorative NFT Drop"
          className="max-w-sm sm:max-w-md md:max-w-lg mx-auto mb-8 rounded-lg shadow-2xl dark:shadow-[0_10px_30px_-10px_rgba(241,196,15,0.3)]"
        />
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-6 leading-tight tracking-tight">
        <span className="drop-shadow-sm">🍕 A Slice of History:</span><br className="sm:hidden" /><br></br>Bitcoin Pizza Day '25
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-page-text-light dark:text-page-text-dark/90 mb-8 max-w-2xl mx-auto leading-relaxed">
        Join <span className="font-semibold text-pizza-tomato-red dark:text-pizza-gold-accent">Yolo</span> in celebrating a legendary moment! Mint your exclusive Pizza Day NFT and own a piece of crypto folklore.
      </p>
    </section>

    {/* App Container - The Main Minter Card */}
    <div className="w-full max-w-3xl xl:max-w-4xl 
                       bg-gradient-to-br from-pizza-dough-light via-white to-pizza-parchment 
                       dark:from-pizza-oven-dark dark:via-pizza-night-dark dark:to-pizza-oven-dark 
                       rounded-3xl shadow-2xl ... p-6 sm:p-8 md:p-10"> 
      <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30 flex flex-col sm:flex-row justify-between items-center gap-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow tracking-wide flex items-center gap-2.5">
          <span role="img" aria-label="pizza" className="text-3xl sm:text-4xl transform group-hover:rotate-12 transition-transform">🍕</span>
          <span>Pizza Day NFT Minter</span>
        </h1>
        <ConnectButton accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} showBalance={{ smallScreen: false, largeScreen: true }} />
      </header>

      <main className="space-y-8 sm:space-y-10">
        {/* Feedback / Alert Messages */}
        {feedback && (
          <div
            role="alert"
            aria-live="polite"
            className={`my-4 p-4 rounded-xl shadow-md border-2 flex items-start gap-3 text-sm font-medium
              ${
                feedback.toLowerCase().includes("error") ||
                feedback.toLowerCase().includes("failed") ||
                feedback.toLowerCase().includes("rejected")
                  ? 'bg-pizza-error-light-bg dark:bg-pizza-error-dark-bg text-pizza-tomato-red dark:text-red-300 border-pizza-tomato-red/70 dark:border-red-500/70'
                  : feedback.toLowerCase().includes("success") ||
                    feedback.toLowerCase().includes("congratulations") ||
                    feedback.toLowerCase().includes("loaded")
                  ? 'bg-pizza-success-light-bg dark:bg-pizza-success-dark-bg text-pizza-basil-green-darker dark:text-green-300 border-pizza-basil-green/70 dark:border-green-500/70'
                  : 'bg-pizza-info-light-bg dark:bg-pizza-info-dark-bg text-pizza-sky-blue-darker dark:text-blue-300 border-pizza-sky-blue/70 dark:border-blue-500/70'
              }`}
          >
            <span aria-hidden="true" className="text-xl">
              {feedback.toLowerCase().includes("error") ||
              feedback.toLowerCase().includes("failed") ||
              feedback.toLowerCase().includes("rejected")
                ? '❗️'
                : feedback.toLowerCase().includes("success") ||
                  feedback.toLowerCase().includes("congratulations") ||
                  feedback.toLowerCase().includes("loaded")
                ? '✅'
                : '🔔'}
            </span>
            <span>{feedback}</span>
          </div>
        )}

        {/* "Not Connected" Section */}
        {!isConnected && (
          <section className="mt-6 bg-pizza-dough-light/70 dark:bg-pizza-oven-dark/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-pizza-crust dark:border-pizza-cheese-melt transition-all duration-300 hover:shadow-[0_0_30px_5px_rgba(249,115,22,0.2)] dark:hover:shadow-[0_0_30px_5px_rgba(245,158,11,0.2)]">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-8 tracking-tight">
              🍕 Mint a <span className="bold">Pizza</span> for the chance to win $50! 🍕
            </h2>
            <div className="mb-8 text-center">
              <img
                src="https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/placeholder.png"
                alt="Pizza Day Collection Preview"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-xl border-2 border-pizza-crust/50 dark:border-pizza-cheese-melt/50 object-cover transition-transform hover:scale-105 duration-300 ease-in-out"
                style={{ maxHeight: '450px' }}
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
            <p className="text-pizza-olive-dark dark:text-pizza-dough-light/90 mb-8 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line text-center">
              {collectionDescription}
            </p>
            {prizeImageUrls.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-6 text-center">
                  🏆 What's in the Box? 🏆
                </h3>
                <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 py-4">
                  {prizeImageUrls.map((src, index) => (
                    <div
                      key={index}
                      className="group w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl shadow-lg border border-pizza-crust/30 dark:border-pizza-cheese-melt/40 overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-pizza-tomato-red dark:hover:border-pizza-cheese-yellow flex flex-col items-center justify-center p-2 cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`Prize outcome ${index + 1} example`}
                        className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target).parentElement.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 text-center bg-pizza-tomato-red/10 dark:bg-pizza-cheese-yellow/10 p-6 rounded-2xl border-2 border-dashed border-pizza-tomato-red/50 dark:border-pizza-cheese-yellow/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-pizza-tomato-red dark:text-pizza-cheese-yellow text-lg sm:text-xl font-semibold leading-relaxed">
                Ready to grab a slice?
              </p>
              <p className="text-pizza-olive-dark dark:text-pizza-dough-light/80 text-sm mt-1">
                Connect your wallet to mint your free Pizza Day NFT!
              </p>
            </div>
          </section>
        )}

        {/* "Connected" State - Minting Section */}
        {isConnected && (
          <section aria-labelledby="minting-section-heading" className="bg-pizza-dough-light/70 dark:bg-pizza-oven-dark/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-pizza-crust/70 dark:border-pizza-cheese-melt/70">
            {isLoadingInitialData ? (
              <div className="flex flex-col items-center space-y-4 py-10" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pizza-tomato-red dark:border-pizza-cheese-yellow"></div>
                <p id="minting-section-heading" className="text-lg text-pizza-tomato-red dark:text-pizza-cheese-yellow font-semibold">Loading Contract Info...</p>
              </div>
            ) : (
              <>
                <h2 id="minting-section-heading" className="sr-only">NFT Minting Section</h2>
                {maxSupply > 0 && (
                  <div className="mb-6 p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border border-pizza-crust/50 dark:border-pizza-cheese-melt/50 text-center shadow-md">
                    <p className="text-xl font-bold text-pizza-olive-dark dark:text-pizza-dough-light">
                      Supply: <span className="text-pizza-tomato-red dark:text-pizza-cheese-yellow">{currentTotalSupply}</span> / {maxSupply}
                    </p>
                  </div>
                )}
                {!userHasAlreadyMinted && maxSupply > 0 && currentTotalSupply < maxSupply && (
                  <button
                    onClick={handleMint}
                    disabled={isMintingWrite || isConfirmingMint || isLoadingNFT}
                    className={`w-full font-bold py-5 px-6 rounded-xl text-xl transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-60 transform hover:scale-105
                    ${
                      isMintingWrite || isConfirmingMint || isLoadingNFT
                        ? 'bg-pizza-slate-light dark:bg-pizza-slate-dark text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : 'bg-pizza-basil-green hover:bg-pizza-basil-green-darker text-white focus:ring-pizza-basil-green/50'
                    }`}
                  >
                    {isMintingWrite ? 'Sending Transaction...' : isConfirmingMint ? 'Confirming Mint...' : isLoadingNFT ? 'Preparing Your NFT...' : 'Mint Your Pizza NFT!'}
                  </button>
                )}
                {userHasAlreadyMinted && !isLoadingNFT && !userNFT && (
                  <button
                    onClick={fetchUserNFTDetails}
                    className="mt-6 w-full font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl bg-pizza-sky-blue hover:bg-pizza-sky-blue-darker text-white focus:outline-none focus:ring-4 focus:ring-pizza-sky-blue/50 transform hover:scale-105"
                  >
                    <span>🔍 View Your Minted NFT</span>
                  </button>
                )}
                {maxSupply > 0 && currentTotalSupply >= maxSupply && !userNFT && !isLoadingNFT && (
                  <p className="mt-6 text-lg font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border-2 border-pizza-tomato-red/30 dark:border-pizza-cheese-yellow/30 text-center shadow-md">
                    All Pizza Day NFTs have been minted out!
                    {userHasAlreadyMinted && " Check yours below if loaded."}
                  </p>
                )}
              </>
            )}

            {/* Loader for when userNFT is being fetched */}
            {isLoadingNFT && (
              <div className="mt-8 flex flex-col items-center space-y-4 py-10" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pizza-sky-blue dark:border-pizza-cheese-yellow"></div>
                <p className="text-lg text-pizza-sky-blue dark:text-pizza-cheese-yellow font-semibold">Loading Your NFT...</p>
              </div>
            )}

            {/* User NFT Details - The "Star" Card */}
            {userNFT && (
              <section aria-labelledby="user-nft-details-heading" className="mt-10 pt-8 border-t-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30">
                <h2 id="user-nft-details-heading" className="text-3xl font-bold mb-8 text-pizza-tomato-red dark:text-pizza-cheese-yellow text-center">
                  Your Delicious Pizza NFT!
                </h2>

                {userNFT.isWinner && (
                  <p className="my-6 p-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 dark:from-pizza-cheese-yellow/80 dark:via-amber-500/90 dark:to-pizza-cheese-yellow/80 border-2 border-amber-500 dark:border-amber-600/80 text-yellow-900 dark:text-gray-900 font-bold rounded-2xl text-lg shadow-xl text-center animate-pulse">
                    🎉 Congratulations! You're a WINNER! 🏆 <span className="block text-sm font-normal mt-1">Special rewards await!</span>
                  </p>
                )}

                <div className="bg-gradient-to-br from-pizza-parchment via-white to-pizza-parchment dark:from-pizza-box-dark dark:via-pizza-oven-dark dark:to-pizza-box-dark p-6 sm:p-8 rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.25)] md:flex md:flex-row md:items-start md:space-x-8">
                  <div className="w-full md:w-2/5 mx-auto md:mx-0 mb-6 md:mb-0">
                    {userNFT.carouselImages && userNFT.carouselImages.length > 0 ? (
                      <Carousel
                        showArrows={userNFT.carouselImages.length > 1}
                        showThumbs={false}
                        autoPlay={userNFT.carouselImages.length > 1}
                        infiniteLoop={userNFT.carouselImages.length > 1}
                        className="rounded-2xl overflow-hidden border-4 border-pizza-crust dark:border-pizza-cheese-melt shadow-xl bg-white dark:bg-pizza-oven-dark"
                        aria-label="NFT Images Carousel"
                      >
                        {userNFT.carouselImages.map((src, index) => (
                          <div key={index} className="aspect-square flex items-center justify-center bg-white dark:bg-pizza-oven-dark/50">
                            <img
                              src={src || 'https://placehold.co/300x300/cccccc/999999?text=Pizza'}
                              alt={`${userNFT.name || 'NFT Image'} - view ${index + 1}`}
                              className="object-contain h-full w-full"
                              onError={(e) => { (e.target).onerror = null; (e.target).src = "https://placehold.co/300x300/ef4444/FFFFFF?text=Error"; }}
                            />
                          </div>
                        ))}
                      </Carousel>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-white dark:bg-pizza-oven-dark/50 rounded-2xl border-4 border-pizza-crust dark:border-pizza-cheese-melt shadow-xl overflow-hidden">
                        <img
                          src={userNFT.image || 'https://placehold.co/300x300/cccccc/999999?text=N/A'}
                          alt={userNFT.name || 'NFT Image'}
                          className="object-contain h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-3/5 text-center md:text-left pt-2">
                    <h3 className="text-2xl lg:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow break-words mb-2.5">{userNFT.name}</h3>
                    <p className="text-sm text-pizza-olive-dark/80 dark:text-pizza-dough-light/70 mb-4">
                      Token ID: <span className="font-mono font-semibold text-pizza-sky-blue dark:text-purple-400 text-base">{userNFT.tokenId}</span>
                    </p>
                    {userNFT.description && (
                      <p className="text-sm sm:text-base mb-5 text-pizza-olive-dark dark:text-pizza-dough-light/90 whitespace-pre-line leading-relaxed">
                        {userNFT.description}
                      </p>
                    )}
                    {userNFT.attributes && userNFT.attributes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-3 text-pizza-olive-dark dark:text-pizza-dough-light">Attributes:</h4>
                        <ul className="flex flex-wrap justify-center md:justify-start gap-3" aria-label="NFT Attributes">
                          {userNFT.attributes.map((attr, index) => (
                            <li key={index} className="bg-pizza-parchment dark:bg-pizza-box-dark/80 border border-pizza-crust/50 dark:border-pizza-cheese-melt/60 text-pizza-olive-dark dark:text-pizza-dough-light/90 px-4 py-2 rounded-lg shadow-sm text-sm hover:shadow-md transition-shadow">
                              <span className="font-semibold">{attr.trait_type}:</span> {attr.value}
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

      {/* Footer within the App Container card */}
      <footer className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t-2 border-pizza-crust/20 dark:border-pizza-cheese-melt/20 text-center space-y-3 sm:space-y-4">
        <p className="text-sm text-pizza-olive-dark/90 dark:text-pizza-parchment/80">
          <span className="font-semibold">🍕 Pizza Day NFT Minter</span> &copy; {new Date().getFullYear()}
        </p>
        <p className="text-xs text-pizza-olive-dark/70 dark:text-pizza-parchment/60 px-4">
          Always ensure you are on the <span className="font-medium">Base Mainnet</span> and interacting with the correct contract.
        </p>
        {CONTRACT_ADDRESS && (
          <div className="text-xs text-pizza-olive-dark/70 dark:text-pizza-parchment/60">
            <span className="font-medium">Contract:</span>{' '}
            <a
              href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-pizza-tomato-red hover:text-pizza-sauce-deep-red dark:text-pizza-cheese-yellow dark:hover:text-pizza-gold-accent underline break-all transition-colors duration-200 hover:opacity-80"
              title={`View contract ${CONTRACT_ADDRESS} on Basescan`}
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>
        )}
      </footer>
    </div> {/* End of App Container */}
  </div> {/* End of main flex layout container */}
</div> // End of Page Background
);
}

export default App;