import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const collectionDescription = `Welcome to the Bitcoin Pizza Day 2025 NFT Minter! \n🍕 Celebrate the Bitcoin Pizza Day with our unique, random pizza box NFTs.\nMint yours for a chance to get a slice of history and win a rare \"Winner\" slice with special traits to claim a $50 USDC reward!`;

const prizeImageUrls = [
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/lost.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeigu2dznrcbusodcnhb5ixtz7qbmqhy5yal6b2djl4rwrq5k4pxhzy/winner.png"
];

const DisconnectedMintInfo = () => {
  return (
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
            e.target.style.display = 'none';
            const fallback = e.target.parentNode?.querySelector('.img-fallback-text');
            if (fallback) fallback.style.display = 'block';
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
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
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
  );
};

export default DisconnectedMintInfo;
