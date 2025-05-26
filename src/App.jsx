// src/App.jsx
import React from 'react';
import { useAccount } from 'wagmi';                     // 👈 Need this for isConnected
import { useFeedback } from './context/FeedbackContext';  // 👈 Need this for dynamic feedback (adjust path if needed)

// Import your components
import HeroSection from './components/HeroSection';
import ConnectHeader from './components/ConnectHeader';
import MintSection from './components/MintSection';
import DisconnectedMintInfo from './components/DisconnectedMintInfo'; // 👈 Need this
import Footer from './components/FooterComponent';                           // 👈 Import your Footer component

// Define CONTRACT_ADDRESS, likely from your environment variables
// Make sure VITE_CONTRACT_ADDRESS is set in your .env file
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const Layout = () => {
  const { isConnected } = useAccount(); // Get wallet connection status
  const { feedback } = useFeedback();   // Get dynamic feedback from context

  return (
    <div className="min-h-screen bg-page-bg-light-dough dark:bg-page-bg-dark-brick text-page-text-light dark:text-page-text-dark font-sans antialiased transition-colors duration-300 ease-in-out">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 gap-10 sm:gap-16">
        <HeroSection />
        <ConnectHeader feedback={feedback} /> {/* Pass dynamic feedback */}
        
        {/* Conditionally render MintSection or DisconnectedMintInfo */}
        {isConnected ? <MintSection /> : <DisconnectedMintInfo />}

        {/* 👇 Add your Footer component here 👇 */}
        <Footer contractAddress={CONTRACT_ADDRESS} />
      </div>
    </div>
  );
};

export default Layout;