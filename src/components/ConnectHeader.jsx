// src/components/ConnectHeader.jsx

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ConnectHeader = ({ feedback }) => {
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
      </main>
    </div>
  );
};

export default ConnectHeader;
