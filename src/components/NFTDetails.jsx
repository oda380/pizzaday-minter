// src/components/NFTDetails.jsx

import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ClaimButton from './ClaimButton';

const NFTDetails = ({ userNFT, hasUserClaimed, isClaiming, onClaim, claimProof, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mt-10 text-center py-10">
        <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-b-4 border-pizza-sky-blue mx-auto mb-4"></div>
        <p className="text-pizza-sky-blue dark:text-pizza-cheese-yellow text-lg font-medium">Loading your NFT...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center py-10">
        <p className="text-red-600 dark:text-red-400 font-medium">❗ Error loading NFT: {error.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!userNFT) return null;

  return (
    <section className="mt-10 pt-8 border-t-2 border-pizza-crust/30 dark:border-pizza-cheese-melt/30">
      <h2 className="text-3xl font-bold mb-8 text-pizza-tomato-red dark:text-pizza-cheese-yellow text-center">
        Your Delicious Pizza NFT!
      </h2>

      {userNFT.isWinner && (
        <p className="my-6 p-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 dark:from-pizza-cheese-yellow/80 dark:via-amber-500/90 dark:to-pizza-cheese-yellow/80 border-2 border-amber-500 dark:border-amber-600/80 text-yellow-900 dark:text-gray-900 font-bold rounded-2xl text-lg shadow-xl text-center animate-pulse">
          🎉 Congratulations! You're a WINNER! 🏆
        </p>
      )}

      <div className="bg-gradient-to-br from-pizza-parchment via-white to-pizza-parchment dark:from-pizza-box-dark dark:via-pizza-oven-dark dark:to-pizza-box-dark p-6 sm:p-8 rounded-3xl shadow-2xl md:flex md:flex-row md:items-start md:space-x-8">
        <div className="w-full md:w-2/5 mx-auto md:mx-0 mb-6 md:mb-0">
          {userNFT.carouselImages?.length > 0 ? (
            <Carousel
              showArrows={userNFT.carouselImages.length > 1}
              showThumbs={false}
              autoPlay={userNFT.carouselImages.length > 1}
              infiniteLoop={userNFT.carouselImages.length > 1}
              className="rounded-2xl overflow-hidden border-4 border-pizza-crust dark:border-pizza-cheese-melt shadow-xl bg-white dark:bg-pizza-oven-dark"
            >
              {userNFT.carouselImages.map((src, index) => (
                <div key={index} className="aspect-square flex items-center justify-center bg-white dark:bg-pizza-oven-dark/50">
                  <img
                    src={src}
                    alt={`${userNFT.name || 'NFT Image'} - view ${index + 1}`}
                    className="object-contain h-full w-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/300x300/ef4444/FFFFFF?text=Error';
                    }}
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
          <h3 className="text-2xl lg:text-3xl font-bold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-2.5 break-words">{userNFT.name}</h3>
          <p className="text-sm text-pizza-olive-dark/80 dark:text-pizza-dough-light/70 mb-4">
            Token ID: <span className="font-mono font-semibold text-pizza-sky-blue dark:text-purple-400 text-base">{userNFT.tokenId}</span>
          </p>
          {userNFT.description && (
            <p className="text-sm sm:text-base mb-5 text-pizza-olive-dark dark:text-pizza-dough-light/90 whitespace-pre-line leading-relaxed">
              {userNFT.description}
            </p>
          )}

          {userNFT.attributes?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-pizza-olive-dark dark:text-pizza-dough-light">Attributes:</h4>
              <ul className="flex flex-wrap justify-center md:justify-start gap-3">
                {userNFT.attributes.map((attr, index) => (
                  <li key={index} className="bg-pizza-parchment dark:bg-pizza-box-dark/80 border border-pizza-crust/50 dark:border-pizza-cheese-melt/60 text-pizza-olive-dark dark:text-pizza-dough-light/90 px-4 py-2 rounded-lg shadow-sm text-sm">
                    <span className="font-semibold">{attr.trait_type}:</span> {attr.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {userNFT.isWinner && claimProof && !hasUserClaimed && (
            <ClaimButton
              onClaim={onClaim}
              disabled={false}
              isClaiming={isClaiming}
            />
          )}

          {hasUserClaimed && (
            <p className="mt-4 text-green-600 dark:text-green-300 font-medium text-center">
              ✅ You have already claimed your reward.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default NFTDetails;
