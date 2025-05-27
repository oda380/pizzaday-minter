// src/App.jsx
import React, { useEffect, useRef } from 'react'; // 👈 CORRECTED IMPORT
import { useAccount } from 'wagmi';
import { useFeedback } from './context/FeedbackContext';

// Import your components
import HeroSection from './components/HeroSection';
import ConnectHeader from './components/ConnectHeader';
import MintSection from './components/MintSection';
import DisconnectedMintInfo from './components/DisconnectedMintInfo';
import Footer from './components/FooterComponent';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const Layout = () => {
  const { isConnected } = useAccount();
  const { feedback } = useFeedback();
  const mountCount = useRef(0); // Now useRef is defined

  useEffect(() => { // Now useEffect is defined
    mountCount.current += 1;
    console.log(
      `%cLayout (App) component MOUNTED - Mount Count: ${mountCount.current}`,
      'color: blue; font-weight: bold;'
    );
    return () => {
      console.log(
        `%cLayout (App) component UNMOUNTED - Mount Count was: ${mountCount.current}`,
        'color: red; font-weight: bold;'
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-page-bg-light-dough dark:bg-page-bg-dark-brick text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">
        <HeroSection />
        <ConnectHeader feedback={feedback} />
        {isConnected ? <MintSection /> : <DisconnectedMintInfo />}
        <Footer contractAddress={CONTRACT_ADDRESS} />
      </div>
    </div>
  );
};

export default Layout;