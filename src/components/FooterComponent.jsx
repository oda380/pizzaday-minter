// src/components/Footer.jsx
import React from 'react';

const Footer = ({ contractAddress }) => { // Accept contractAddress as a prop
  return (
    <footer className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t-2 border-pizza-crust/20 dark:border-pizza-cheese-melt/20 text-center space-y-3 sm:space-y-4">
      <p className="text-sm text-pizza-olive-dark/90 dark:text-pizza-parchment/80">
        <span className="font-semibold">🍕 Pizza Day NFT Minter</span> &copy; {new Date().getFullYear()}
      </p>
      <p className="text-xs text-pizza-olive-dark/70 dark:text-pizza-parchment/60 px-4">
        Always ensure you are on the <span className="font-medium">Base Mainnet</span> and interacting with the correct contract.
      </p>
      {/* Use the contractAddress prop here */}
      {contractAddress && (
        <div className="text-xs text-pizza-olive-dark/70 dark:text-pizza-parchment/60">
          <span className="font-medium">Contract:</span>{' '}
          <a
            href={`https://basescan.org/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-pizza-tomato-red hover:text-pizza-sauce-deep-red dark:text-pizza-cheese-yellow dark:hover:text-pizza-gold-accent underline break-all transition-colors duration-200 hover:opacity-80"
            title={`View contract ${contractAddress} on Basescan`}
          >
            {contractAddress}
          </a>
        </div>
      )}
    </footer>
  );
};

export default Footer;