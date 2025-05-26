// src/App.jsx
import React from 'react';
import HeroSection from './components/HeroSection';
import MintSection from './components/MintSection';
import ConnectHeader from './components/ConnectHeader'; // ✅ ADD THIS LINE

const Layout = () => {
  return (
    <div className="min-h-screen bg-page-bg-light-dough dark:bg-page-bg-dark-brick text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">
        <HeroSection />
        <ConnectHeader feedback="Connect your wallet to get started." />
        <MintSection />
      </div>
    </div>
  );
};

export default Layout;