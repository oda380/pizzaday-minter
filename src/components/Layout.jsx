// src/components/Layout.jsx

import React from 'react';
import { useAccount } from 'wagmi';
import HeroSection from './HeroSection';
import ConnectHeader from './ConnectHeader';
import MintSection from './MintSection';
import DisconnectedMintInfo from './DisconnectedMintInfo';
import { useFeedback } from '../hooks/useFeedback';

const Layout = () => {
  const { isConnected } = useAccount();
  const { feedback } = useFeedback();

  return (
    <div className="min-h-screen bg-page-bg-light-dough dark:bg-page-bg-dark-brick text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">
        <HeroSection />
        <ConnectHeader feedback={feedback} />
        {isConnected ? <MintSection /> : <DisconnectedMintInfo />}
      </div>
    </div>
  );
};

export default Layout;
