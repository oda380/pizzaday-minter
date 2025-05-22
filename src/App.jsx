import React, { useState, useEffect, useCallback } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Actual import
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseAbi, formatEther } from 'viem';
import { readContract as wagmiReadContractAction } from '@wagmi/core';

// --- Configuration ---
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "YOUR_NEW_PIZZABOX_CONTRACT_ADDRESS_HERE"; // IMPORTANT: Update this!
const RAW_IPFS_GATEWAY_PREFIX = import.meta.env.VITE_IPFS_GATEWAY_PREFIX || "https://ipfs.io/ipfs/";

// Updated ABI strings for PizzaBox (new contract)
const PIZZABOX_ABI_STRINGS = [
  "constructor(address initialOwner, string initialCollectionPlaceholderURI, string initialBaseMetadataFolderCID, uint256 maxSupply_)",
  "function mintNFT(uint256 quantity) public payable",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function MAX_SUPPLY() public view returns (uint256)",
  "function mintPrice() public view returns (uint256)",
  "function publicMintOpen() public view returns (bool)",
  "function getMintedCount(address account) public view returns (uint256)",
  "function maxMintPerTx() public view returns (uint256)",         // Changed from constant to view func
  "function maxMintPerWallet() public view returns (uint256)",     // Changed from constant to view func
  "function collectionPlaceholderURI() public view returns (string memory)",
  "function getBaseMetadataFolderCID() public view returns (string memory)",
  "function getRemainingMetadataCount() public view returns (uint256)",
  // Owner functions (included for ABI completeness, though UI won't call them directly)
  "function setMintPrice(uint256 newPrice) external",
  "function setPublicMintOpen(bool open) external",
  "function setMintLimits(uint256 perTx, uint256 perWallet) external",
  "function withdrawFunds() external",
  "function setCollectionPlaceholderURI(string memory newPlaceholderURI) external",
  "function setBaseMetadataFolderCID(string memory newBaseCID) external",
  "function setTokenURI(uint256 tokenId, string memory newURI) external",
  // Events
  "event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI)",
  "event CollectionPlaceholderURISet(string newURI)",
  "event BaseMetadataFolderCIDSet(string newBaseCID)",
  "event TokenURIUpdated(uint256 indexed tokenId, string newURI)",
  "event RemainingMetadataCountUpdated(uint256 remainingCount)",
  "event MintPriceUpdated(uint256 newPrice)",
  "event PublicMintStatusUpdated(bool open)",
  "event MintLimitsUpdated(uint256 perTx, uint256 perWallet)"
];
const PIZZABOX_ABI = parseAbi(PIZZABOX_ABI_STRINGS);

const prizeImageUrls = [/* ... your prize image URLs ... */];
const collectionDescription = `Welcome to the Bitcoin Pizza Day 2025 NFT Minter! \n🍕 Celebrate the Bitcoin Pizza Day with our unique, 
random pizza box NFTs.
\nMint yours for a chance to get a slice of history and a chance to win a rare "Winner" slice with special traits to win a prize!`;

const convertIpfsUriToHttpUrl = (ipfsUri) => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) return ipfsUri;
  const cidAndPath = ipfsUri.substring(7);
  let gatewayPrefix = RAW_IPFS_GATEWAY_PREFIX;
  if (!gatewayPrefix.endsWith('/')) gatewayPrefix += '/';
  if (!gatewayPrefix.includes('/ipfs/')) {
    const parts = gatewayPrefix.split('/');
    if ((parts.length >= 3 && parts[parts.length - 2] !== 'ipfs') || parts.length < 3) gatewayPrefix += 'ipfs/';
  }
  return `${gatewayPrefix}${cidAndPath.startsWith('/') ? cidAndPath.substring(1) : cidAndPath}`;
};

function App() {
  const { address: currentAccount, isConnected, chain } = useAccount();
  const wagmiConfig = useConfig();

  const [feedback, setFeedback] = useState("");
  const [userNFT, setUserNFT] = useState(null);
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const [quantityToMint, setQuantityToMint] = useState(1);

  // --- Read Contract Data ---
  const { data: maxSupplyData, isLoading: isLoadingMaxSupply } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'MAX_SUPPLY',
  });
  const maxSupply = maxSupplyData ? Number(maxSupplyData) : 0;

  const { data: totalSupplyData, isLoading: isLoadingTotalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'totalSupply',
  });
  const currentTotalSupply = totalSupplyData ? Number(totalSupplyData) : 0;

  const { data: mintPriceData, isLoading: isLoadingMintPrice } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'mintPrice',
  });
  const mintPrice = mintPriceData !== undefined ? mintPriceData : BigInt(0);

  const { data: publicMintOpenData, isLoading: isLoadingPublicMintOpen } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'publicMintOpen',
  });
  const publicMintOpen = publicMintOpenData === true;

  const { data: mintedCountData, isLoading: isLoadingMintedCount, refetch: refetchMintedCount, error: mintedCountError } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'getMintedCount',
    args: [currentAccount], query: { enabled: !!currentAccount },
  });
  const userMintedCount = mintedCountData ? Number(mintedCountData) : 0;
  const userHasAlreadyMinted = userMintedCount > 0;

  const { data: maxMintPerTxData, isLoading: isLoadingMaxMintPerTx } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'maxMintPerTx',
  });
  const maxMintPerTx = maxMintPerTxData ? Number(maxMintPerTxData) : 3; // Default to 3 if not loaded

  const { data: maxMintPerWalletData, isLoading: isLoadingMaxMintPerWallet } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'maxMintPerWallet',
  });
  const maxMintPerWallet = maxMintPerWalletData ? Number(maxMintPerWalletData) : 3; // Default to 3 if not loaded

  // --- Write Contract Data ---
  const { data: mintTxHash, writeContractAsync: mintNFTAsync, isPending: isMintingWrite, error: mintError } = useWriteContract();
  const { isLoading: isConfirmingMint, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });

  // --- Effects ---
  useEffect(() => {
    if (mintedCountError) {
      console.error("Error fetching minted count:", mintedCountError);
      setFeedback(`Error checking your mint status: ${mintedCountError.shortMessage || mintedCountError.message}`);
    }
  }, [mintedCountError]);

  const fetchUserNFTDetails = useCallback(async () => {
    // ... (fetchUserNFTDetails logic remains largely the same as your last provided version)
    // Ensure it uses PIZZABOX_ABI
    if (!currentAccount || !userHasAlreadyMinted) {
      setUserNFT(null); setIsLoadingNFT(false); return;
    }
    setIsLoadingNFT(true); setFeedback("Fetching your NFT details..."); setUserNFT(null);
    try {
      const balance = await wagmiReadContractAction(wagmiConfig, { address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'balanceOf', args: [currentAccount] });
      if (Number(balance) === 0) { setFeedback("No PizzaBox NFTs found in your wallet for this collection."); setIsLoadingNFT(false); return; }
      
      const tokenId = await wagmiReadContractAction(wagmiConfig, { address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'tokenOfOwnerByIndex', args: [currentAccount, 0n] });
      const tokenIDString = tokenId.toString();
      setFeedback(`Workspaceing details for NFT (Token ID: ${tokenIDString})...`);
      
      const metadataUri = await wagmiReadContractAction(wagmiConfig, { address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'tokenURI', args: [tokenId] });
      const httpMetadataUrl = convertIpfsUriToHttpUrl(metadataUri);
      if (!httpMetadataUrl || typeof httpMetadataUrl !== 'string') throw new Error("Invalid metadata URI.");
      
      const metadataResponse = await fetch(httpMetadataUrl);
      if (!metadataResponse.ok) throw new Error(`Failed to fetch metadata (status: ${metadataResponse.status}) from ${httpMetadataUrl}`);
      const metadata = await metadataResponse.json();
      
      const primaryImageUrl = convertIpfsUriToHttpUrl(metadata.image);
      const imagesForCarousel = metadata.images?.map(imgUri => convertIpfsUriToHttpUrl(imgUri)) || (primaryImageUrl ? [primaryImageUrl] : []);
      const isWinner = !!metadata.attributes?.find(attr => attr.trait_type === "Status" && attr.value === "Winner");

      setUserNFT({
        tokenId: tokenIDString, name: metadata.name || "Unnamed NFT", image: primaryImageUrl,
        carouselImages: imagesForCarousel, description: metadata.description || "No description available.",
        attributes: metadata.attributes || [], isWinner: isWinner,
      });
      setFeedback(isWinner ? "🎉 Congratulations! You minted a Winner! 🎉" : "Your Pizza Day NFT details loaded.");
    } catch (error) {
      console.error("Error fetching user NFT details:", error);
      setFeedback(`Error fetching your NFT: ${error.message}.`); setUserNFT(null);
    } finally {
      setIsLoadingNFT(false);
    }
  }, [currentAccount, userHasAlreadyMinted, wagmiConfig]);

  useEffect(() => {
    // ... (Main useEffect for UI updates, slightly adjusted for new loading states)
    if (!isConnected || !currentAccount) {
      setUserNFT(null); 
      if (!isConnected && (!feedback || !feedback.toLowerCase().includes("error"))) setFeedback("Please connect your wallet to get started.");
      return;
    }
    const initialLoads = isLoadingMintedCount || isLoadingMaxSupply || isLoadingTotalSupply || isLoadingMintPrice || isLoadingPublicMintOpen || isLoadingMaxMintPerTx || isLoadingMaxMintPerWallet;
    if (initialLoads) { 
        if (!feedback || (!feedback.toLowerCase().includes("error") && !feedback.toLowerCase().includes("failed"))) setFeedback("Loading contract details..."); 
        return; 
    }

    if (userHasAlreadyMinted) {
      if (!userNFT && !isLoadingNFT) fetchUserNFTDetails();
      else if (userNFT && (!feedback || (!feedback.toLowerCase().includes("congratulations") && !feedback.toLowerCase().includes("error") && !feedback.toLowerCase().includes("fetching")))) {
        setFeedback("Your Pizza Day NFT details are loaded.");
      }
    } else {
      setUserNFT(null);
      if (publicMintOpen) {
        if (maxSupply > 0 && currentTotalSupply >= maxSupply) { setFeedback("Sorry, all Pizza Day NFTs have been minted!"); }
        else if (!feedback || (!feedback.toLowerCase().includes("failed") && !feedback.toLowerCase().includes("minting"))) {
            setFeedback(`Ready to mint! Price: ${formatEther(mintPrice)} ETH per NFT.`);
        }
      } else if (!feedback || !feedback.toLowerCase().includes("failed")) {
        setFeedback("Minting is currently closed.");
      }
    }
  }, [isConnected, currentAccount, isLoadingMintedCount, userHasAlreadyMinted, userNFT, isLoadingNFT, fetchUserNFTDetails, publicMintOpen, mintPrice, maxSupply, currentTotalSupply, isLoadingMaxSupply, isLoadingTotalSupply, isLoadingMintPrice, isLoadingPublicMintOpen, isLoadingMaxMintPerTx, isLoadingMaxMintPerWallet, feedback]);

  useEffect(() => {
    // ... (Effect for mint confirmation and error, largely the same, ensure PIZZABOX_ABI is used if it were directly referenced here)
    if (isMintConfirmed) {
      setFeedback("Mint successful! Fetching your new NFT details...");
      refetchTotalSupply(); refetchMintedCount();
    }
    if (mintError) {
      let errMsg = mintError.shortMessage || mintError.message || "An unknown error occurred during minting.";
      if (errMsg.includes("rejected") || (mintError).cause?.code === 4001) errMsg = "Transaction rejected by user.";
      else if (errMsg.includes("Exceeds wallet limit") || errMsg.includes("exceeds per-wallet limit")) errMsg = "You've reached the max mints for your wallet for this transaction.";
      else if (errMsg.includes("Exceeds tx limit") || errMsg.includes("exceeds per-tx limit")) errMsg = `Quantity exceeds max per transaction (Max: ${maxMintPerTx}).`;
      else if (errMsg.includes("Insufficient ETH")) errMsg = "Insufficient ETH sent for the mint.";
      else if (errMsg.includes("Sold out")) errMsg = "Sorry, all NFTs are sold out!";
      setFeedback(`Minting failed: ${errMsg}`);
    }
  }, [isMintConfirmed, mintError, refetchTotalSupply, refetchMintedCount, maxMintPerTx]);

  const isLoadingInitialData = isLoadingMaxSupply || isLoadingTotalSupply || (isConnected && isLoadingMintedCount) || isLoadingMintPrice || isLoadingPublicMintOpen || isLoadingMaxMintPerTx || isLoadingMaxMintPerWallet;

  const handleMint = async () => {
    // ... (handleMint logic, updated to use fetched maxMintPerTx and maxMintPerWallet)
    if (!currentAccount) { setFeedback("Please connect your wallet first."); return; }
    if (!publicMintOpen) { setFeedback("Minting is currently closed."); return; }
    if (userMintedCount + quantityToMint > maxMintPerWallet) { setFeedback(`This mint would exceed your wallet limit of ${maxMintPerWallet}. You have minted ${userMintedCount} and can mint ${maxMintPerWallet - userMintedCount > 0 ? maxMintPerWallet - userMintedCount : 0} more.`); return; }
    if (quantityToMint <= 0 || quantityToMint > maxMintPerTx) { setFeedback(`Please mint between 1 and ${maxMintPerTx} NFTs per transaction.`); return; }
    if (maxSupply > 0 && currentTotalSupply + quantityToMint > maxSupply) { setFeedback("Not enough NFTs left for this quantity."); return; }
    
    const totalPrice = mintPrice * BigInt(quantityToMint);
    setFeedback(`Preparing to mint ${quantityToMint} NFT(s) for ${formatEther(totalPrice)} ETH...`);
    try {
      await mintNFTAsync({
        address: CONTRACT_ADDRESS, abi: PIZZABOX_ABI, functionName: 'mintNFT',
        args: [BigInt(quantityToMint)], value: totalPrice,
      });
    } catch (e) {
      console.error("Error during mintNFTAsync call preparation:", e);
      if (!feedback || (!feedback.toLowerCase().includes("failed") && !feedback.toLowerCase().includes("rejected"))) {
        setFeedback(`Minting preparation failed: ${e.message || "Could not send transaction."}`);
      }
    }
  };

  const handleQuantityChange = (change) => {
    // ... (handleQuantityChange logic, updated to use fetched maxMintPerTx and maxMintPerWallet)
    setQuantityToMint(prev => {
      const potentialNewValue = prev + change;
      let newValue = potentialNewValue;

      if (potentialNewValue < 1) newValue = 1;
      // Use fetched maxMintPerTx, ensure it's loaded, otherwise use a sensible default or disable input
      const currentMaxPerTx = isLoadingMaxMintPerTx ? MAX_MINT_PER_TX : maxMintPerTx; // Fallback if still loading
      if (potentialNewValue > currentMaxPerTx) newValue = currentMaxPerTx;
      
      // Use fetched maxMintPerWallet
      const currentMaxPerWallet = isLoadingMaxMintPerWallet ? MAX_MINT_PER_WALLET : maxMintPerWallet; // Fallback
      const remainingWalletAllowance = currentMaxPerWallet - userMintedCount;

      if (newValue > remainingWalletAllowance && remainingWalletAllowance >= 0 && isConnected) { // check remainingWalletAllowance >=0
        newValue = remainingWalletAllowance;
      } else if (remainingWalletAllowance < 0 && isConnected) { // Should not happen if logic is correct elsewhere
         newValue = 0; // Can't mint more
      }
      if (newValue === 0 && remainingWalletAllowance === 0) return 0; // Allow setting to 0 if allowance is 0
      if (newValue === 0 && remainingWalletAllowance > 0) return 1; // If trying to go to 0 but allowance >0, set to 1


      return newValue < 1 ? 1 : newValue; // Final check for minimum 1 unless allowance is 0
    });
  };
  

  // --- JSX Return ---
  // (The JSX structure for UI elements remains the same as your last provided version.
  //  The key changes are in the logic above to interact with the new contract functions.)
  //  Make sure to use the correct `page-bg-*` and `page-text-*` classes for the outermost div
  //  as per our "Option 2: Warmer Theme" discussion.

  return (
    // Overall Page Background - Using "Option 2" Warmer Theme
    <div className="min-h-screen bg-page-bg-light dark:bg-page-bg-dark text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">

        {/* Hero Block */}
        <section className="text-center w-full max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="transform transition-all duration-500 ease-out hover:scale-[1.02]">
            <img
              src="/pizza-day-banner.png"
              alt="Celebrate Bitcoin Pizza Day with Yolo - Commemorative NFT Drop"
              className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-8 rounded-lg shadow-2xl dark:shadow-[0_10px_30px_-10px_rgba(241,196,15,0.3)]"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-6 leading-tight tracking-tight">
            <span className="drop-shadow-sm">🍕 A Slice of History:</span><br className="sm:hidden" /> Bitcoin Pizza Day '25
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-hero-paragraph-light dark:text-hero-paragraph-dark mb-8 max-w-2xl mx-auto leading-relaxed">
            Join <span className="font-semibold text-pizza-tomato-red dark:text-pizza-gold-accent">Yolo</span> in celebrating a legendary moment! Mint your exclusive Pizza Day NFT and own a piece of crypto folklore.
          </p>
        </section>

        {/* App Container */}
        <div className="w-full max-w-3xl xl:max-w-4xl 
                       bg-gradient-to-br from-pizza-dough-light via-white to-pizza-parchment 
                       dark:from-pizza-oven-dark dark:via-black/10 dark:to-pizza-oven-dark
                       rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] border border-pizza-crust/40 dark:border-pizza-cheese-melt/40 
                       p-6 sm:p-8 md:p-10">
          <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30 flex flex-col sm:flex-row justify-between items-center gap-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow tracking-wide flex items-center gap-2.5">
              <span role="img" aria-label="pizza" className="text-3xl sm:text-4xl transition-transform hover:rotate-12">🍕</span>
              <span>Pizza Box Minter</span> {/* Updated Name */}
            </h1>
            <ConnectButton accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} showBalance={{ smallScreen: false, largeScreen: true }} />
          </header>

          <main className="space-y-8 sm:space-y-10">
            {/* Feedback Display (ensure robust feedback string checking) */}
            {feedback && (
              <div
                role="alert"
                aria-live="polite"
                className={`my-4 p-4 rounded-xl shadow-md border-2 flex items-start gap-3 text-sm font-medium
                  ${ (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("error") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("failed") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("rejected") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("minting failed")
                      ? 'bg-pizza-error-light-bg dark:bg-pizza-error-dark-bg text-pizza-tomato-red dark:text-red-300 border-pizza-tomato-red/70 dark:border-red-500/70'
                      : (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("success") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("congratulations") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("your pizza day nft details loaded")
                      ? 'bg-pizza-success-light-bg dark:bg-pizza-success-dark-bg text-pizza-basil-green-darker dark:text-green-300 border-pizza-basil-green/70 dark:border-green-500/70'
                      : 'bg-pizza-info-light-bg dark:bg-pizza-info-dark-bg text-pizza-sky-blue-darker dark:text-blue-300 border-pizza-sky-blue/70 dark:border-blue-500/70'
                  }`}
              >
                <span aria-hidden="true" className="text-xl">
                  { (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("error") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("failed") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("rejected") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("minting failed") ? '❗️'
                      : (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("success") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("congratulations") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("your pizza day nft details loaded") ? '✅'
                      : (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("fetching") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("loading") || (typeof feedback === 'string' ? feedback.toLowerCase() : '').includes("preparing") ? '⏳' 
                      : '🔔'}
                </span>
                <span>{feedback}</span>
              </div>
            )}

            {/* Not Connected State (UI for this section can remain largely the same) */}
            {!isConnected && (
              <section className="mt-6 bg-pizza-dough-light/70 dark:bg-pizza-oven-dark/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-pizza-crust dark:border-pizza-cheese-melt transition-all duration-300 hover:shadow-[0_0_30px_5px_rgba(249,115,22,0.2)] dark:hover:shadow-[0_0_30px_5px_rgba(245,158,11,0.2)]">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-8 tracking-tight">
                  🍕 Mint a <span className="font-extrabold italic">Pizza Box</span> for a chance to win! 🍕
                </h2>
                {/* ... rest of your Not Connected JSX ... */}
                <div className="mb-8 text-center">
                  <img src={prizeImageUrls[0]} alt="Pizza Day Collection Preview" className="w-full max-w-lg mx-auto rounded-2xl shadow-xl border-2 border-pizza-crust/50 dark:border-pizza-cheese-melt/50 object-cover transition-transform hover:scale-105 duration-300 ease-in-out" style={{ maxHeight: '450px' }} onError={(e) => { e.target.style.display = 'none'; const ft = e.target.parentNode?.querySelector('.img-fallback-text'); if (ft) ft.style.display = 'block'; }}/>
                  <p className="img-fallback-text text-gray-500 dark:text-slate-400 text-xs mt-2" style={{ display: 'none' }}>Collection preview unavailable.</p>
                </div>
                <p className="text-pizza-olive-dark dark:text-pizza-parchment/90 mb-8 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line text-center">{collectionDescription}</p>
                {prizeImageUrls.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-2xl font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-6 text-center">🏆 What's in the Box? 🏆</h3>
                    <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 py-4">
                      {prizeImageUrls.map((src, index) => (
                        <div key={index} className="group w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl shadow-lg border border-pizza-crust/30 dark:border-pizza-cheese-melt/40 overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-pizza-tomato-red dark:hover:border-pizza-cheese-yellow flex flex-col items-center justify-center p-2 cursor-pointer">
                          <img src={src} alt={`Prize outcome ${index + 1}`} className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target).parentElement.style.display = 'none'; }}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center bg-pizza-tomato-red/10 dark:bg-pizza-cheese-yellow/10 p-6 rounded-2xl border-2 border-dashed border-pizza-tomato-red/50 dark:border-pizza-cheese-yellow/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-pizza-tomato-red dark:text-pizza-cheese-yellow text-lg sm:text-xl font-semibold leading-relaxed">Ready to grab a slice?</p>
                  <p className="text-pizza-olive-dark dark:text-pizza-parchment/80 text-sm mt-1">Connect your wallet to mint your Pizza Day NFT!</p>
                </div>
              </section>
            )}

            {/* Connected State */}
            {isConnected && (
              <section aria-labelledby="minting-section-heading" className="bg-pizza-dough-light/80 dark:bg-pizza-oven-dark/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-pizza-crust/70 dark:border-pizza-cheese-melt/70">
                {isLoadingInitialData ? (
                  <div className="flex flex-col items-center space-y-4 py-10" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pizza-tomato-red dark:border-pizza-cheese-yellow"></div>
                    <p className="text-lg text-pizza-tomato-red dark:text-pizza-cheese-yellow font-semibold mt-3">Loading Contract Info...</p>
                  </div>
                ) : (
                  <>
                    <h2 id="minting-section-heading" className="sr-only">NFT Minting Section</h2>
                    <div className="mb-6 p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border border-pizza-crust/50 dark:border-pizza-cheese-melt/50 text-center shadow-md">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm sm:text-base">
                            <p className="font-semibold text-pizza-olive-dark dark:text-pizza-parchment">Price: <span className="text-pizza-tomato-red dark:text-pizza-cheese-yellow">{formatEther(mintPrice)} ETH</span></p>
                            <p className="font-semibold text-pizza-olive-dark dark:text-pizza-parchment">Supply: <span className="text-pizza-tomato-red dark:text-pizza-cheese-yellow">{currentTotalSupply} / {maxSupply}</span></p>
                            <p className="font-semibold text-pizza-olive-dark dark:text-pizza-parchment">Your Mints: <span className="text-pizza-tomato-red dark:text-pizza-cheese-yellow">{userMintedCount} / {maxMintPerWallet}</span></p>
                        </div>
                    </div>

                    {!publicMintOpen && (
                        <p className="mb-6 text-lg font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border-2 border-pizza-tomato-red/30 dark:border-pizza-cheese-yellow/30 text-center shadow-md">
                            Minting is currently closed by the chef! 👨‍🍳
                        </p>
                    )}
                    
                    {/* Minting UI: Quantity Selector and Mint Button */}
                    {publicMintOpen && userMintedCount < maxMintPerWallet && maxSupply > 0 && currentTotalSupply < maxSupply && (
                      <div className="my-6 space-y-4">
                        <div className="flex items-center justify-center gap-3 sm:gap-4">
                            <button 
                                onClick={() => handleQuantityChange(-1)} 
                                disabled={quantityToMint <= 1} 
                                className="px-5 py-3 bg-pizza-crust hover:bg-opacity-80 text-white font-bold text-lg rounded-lg disabled:opacity-50 transition-opacity active:scale-95"
                                aria-label="Decrease mint quantity"
                            >-</button>
                            <span className="text-2xl font-bold text-pizza-olive-dark dark:text-pizza-parchment w-12 text-center tabular-nums">{quantityToMint}</span>
                            <button 
                                onClick={() => handleQuantityChange(1)} 
                                disabled={quantityToMint >= maxMintPerTx || userMintedCount + quantityToMint >= maxMintPerWallet || currentTotalSupply + quantityToMint > maxSupply } 
                                className="px-5 py-3 bg-pizza-crust hover:bg-opacity-80 text-white font-bold text-lg rounded-lg disabled:opacity-50 transition-opacity active:scale-95"
                                aria-label="Increase mint quantity"
                            >+</button>
                        </div>
                        <button
                          onClick={handleMint}
                          disabled={isMintingWrite || isConfirmingMint || isLoadingNFT || !publicMintOpen || (maxSupply > 0 && currentTotalSupply + quantityToMint > maxSupply) || userMintedCount + quantityToMint > maxMintPerWallet || quantityToMint === 0 }
                          className={`w-full font-bold py-5 px-6 rounded-xl text-xl transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-60 transform hover:scale-105
                          ${ isMintingWrite || isConfirmingMint || isLoadingNFT || !publicMintOpen || (maxSupply > 0 && currentTotalSupply + quantityToMint > maxSupply) || userMintedCount + quantityToMint > maxMintPerWallet || quantityToMint === 0
                              ? 'bg-pizza-slate-light dark:bg-pizza-slate-dark text-slate-500 dark:text-slate-400 cursor-not-allowed'
                              : 'bg-pizza-basil-green hover:bg-pizza-basil-green-darker text-white focus:ring-pizza-basil-green/50'
                          }`}
                        >
                          {isMintingWrite ? 'Sending Transaction...' : isConfirmingMint ? 'Confirming Mint...' : isLoadingNFT ? 'Preparing Your NFT...' : `Mint ${quantityToMint} NFT(s)!`}
                        </button>
                         {(userMintedCount + quantityToMint > maxMintPerWallet) && <p className="text-xs text-center text-pizza-tomato-red dark:text-yellow-500 mt-2">This quantity exceeds your wallet's remaining mint allowance ({maxMintPerWallet - userMintedCount} left).</p>}
                         {(currentTotalSupply + quantityToMint > maxSupply) && (maxSupply > 0) && <p className="text-xs text-center text-pizza-tomato-red dark:text-yellow-500 mt-2">This quantity exceeds the remaining supply ({maxSupply - currentTotalSupply} left).</p>}
                      </div>
                    )}
                    
                    {publicMintOpen && userMintedCount >= maxMintPerWallet && !isLoadingInitialData && (
                         <p className="mt-6 text-lg font-semibold text-pizza-basil-green dark:text-green-400 p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border-2 border-pizza-basil-green/30 dark:border-green-600/30 text-center shadow-md">
                            You've minted the maximum for your wallet!
                        </p>
                    )}

                    {userHasAlreadyMinted && !userNFT && !isLoadingNFT && (
                      <button
                        onClick={fetchUserNFTDetails}
                        className="mt-6 w-full font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl bg-pizza-sky-blue hover:bg-pizza-sky-blue-darker text-white focus:outline-none focus:ring-4 focus:ring-pizza-sky-blue/50 transform hover:scale-105"
                      >
                        <span>🔍 View Your Minted NFT(s)</span>
                      </button>
                    )}
                    
                    {publicMintOpen && maxSupply > 0 && currentTotalSupply >= maxSupply && (
                      <p className="mt-6 text-lg font-semibold text-pizza-tomato-red dark:text-pizza-cheese-yellow p-4 bg-pizza-parchment dark:bg-pizza-box-dark rounded-xl border-2 border-pizza-tomato-red/30 dark:border-pizza-cheese-yellow/30 text-center shadow-md">
                        All Pizza Day NFTs have been minted out!
                        {userHasAlreadyMinted && " Check yours below if loaded."}
                      </p>
                    )}
                  </>
                )}

                {/* Loader for userNFT fetch (already present) */}
                {/* User NFT Details Card (already present and styled) */}
                {isLoadingNFT && (
                  <div className="mt-8 flex flex-col items-center space-y-4 py-10" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pizza-sky-blue dark:border-pizza-cheese-yellow"></div>
                    <p className="text-lg text-pizza-sky-blue dark:text-pizza-cheese-yellow font-semibold mt-3">Loading Your NFT...</p>
                  </div>
                )}

                {userNFT && ( 
                  <section aria-labelledby="user-nft-details-heading" className="mt-10 pt-8 border-t-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30">
                    <h2 id="user-nft-details-heading" className="text-3xl font-bold mb-8 text-pizza-tomato-red dark:text-pizza-cheese-yellow text-center">
                      Your Delicious Pizza Box!
                    </h2>
                    {userNFT.isWinner && (
                      <p className="my-6 p-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 dark:from-pizza-cheese-yellow/80 dark:via-amber-500/90 dark:to-pizza-cheese-yellow/80 border-2 border-amber-500 dark:border-amber-600/80 text-yellow-900 dark:text-gray-900 font-bold rounded-2xl text-lg shadow-xl text-center animate-pulse">
                        🎉 Congratulations! You found a WINNER Box! 🏆 <span className="block text-sm font-normal mt-1">Special rewards await!</span>
                      </p>
                    )}
                    <div className="bg-gradient-to-br from-pizza-parchment via-white to-pizza-parchment dark:from-pizza-box-dark dark:via-pizza-oven-dark dark:to-pizza-box-dark p-6 sm:p-8 rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.25)] md:flex md:flex-row md:items-start md:space-x-8">
                      <div className="w-full md:w-2/5 mx-auto md:mx-0 mb-6 md:mb-0">
                        {userNFT.carouselImages && userNFT.carouselImages.length > 0 ? (
                          <Carousel
                            showArrows={userNFT.carouselImages.length > 1} showThumbs={false}
                            autoPlay={userNFT.carouselImages.length > 1} infiniteLoop={userNFT.carouselImages.length > 1}
                            className="rounded-2xl overflow-hidden border-4 border-pizza-crust dark:border-pizza-cheese-melt shadow-xl bg-white dark:bg-pizza-oven-dark"
                            aria-label="NFT Images Carousel"
                          >
                            {userNFT.carouselImages.map((src, index) => (
                              <div key={index} className="aspect-square flex items-center justify-center bg-white dark:bg-pizza-oven-dark/50">
                                <img src={src || 'https://placehold.co/300x300/cccccc/999999?text=Pizza'} alt={`${userNFT.name || 'NFT Image'} - view ${index + 1}`} className="object-contain h-full w-full" onError={(e) => { (e.target).onerror = null; (e.target).src = "https://placehold.co/300x300/ef4444/FFFFFF?text=Error"; }}/>
                              </div>
                            ))}
                          </Carousel>
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-white dark:bg-pizza-oven-dark/50 rounded-2xl border-4 border-pizza-crust dark:border-pizza-cheese-melt shadow-xl overflow-hidden">
                            <img src={userNFT.image || 'https://placehold.co/300x300/cccccc/999999?text=N/A'} alt={userNFT.name || 'NFT Image'} className="object-contain h-full w-full"/>
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-3/5 text-center md:text-left pt-2">
                        <h3 className="text-2xl lg:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow break-words mb-2.5">{userNFT.name}</h3>
                        <p className="text-sm text-pizza-olive-dark/80 dark:text-pizza-parchment/70 mb-4">Token ID: <span className="font-mono font-semibold text-pizza-sky-blue dark:text-purple-400 text-base">{userNFT.tokenId}</span></p>
                        {userNFT.description && (<p className="text-sm sm:text-base mb-5 text-pizza-olive-dark dark:text-pizza-parchment/90 whitespace-pre-line leading-relaxed">{userNFT.description}</p>)}
                        {userNFT.attributes && userNFT.attributes.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-3 text-pizza-olive-dark dark:text-pizza-parchment">Attributes:</h4>
                            <ul className="flex flex-wrap justify-center md:justify-start gap-3" aria-label="NFT Attributes">
                              {userNFT.attributes.map((attr, index) => (
                                <li key={index} className="bg-pizza-parchment dark:bg-pizza-box-dark/80 border border-pizza-crust/50 dark:border-pizza-cheese-melt/60 text-pizza-olive-dark dark:text-pizza-parchment/90 px-4 py-2 rounded-lg shadow-sm text-sm hover:shadow-md transition-shadow">
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
                <a href={`https://basescan.org/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="font-mono text-pizza-tomato-red hover:text-pizza-sauce-deep-red dark:text-pizza-cheese-yellow dark:hover:text-pizza-gold-accent underline break-all transition-colors duration-200 hover:opacity-80" title={`View contract ${CONTRACT_ADDRESS} on Basescan`}>
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