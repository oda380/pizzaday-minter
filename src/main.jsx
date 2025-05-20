// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global styles, including Tailwind

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains'; // Import Base mainnet chain
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'viem'; // <<< Import http for custom transport

// Access environment variables (Vite specific)
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const baseMainnetRpcUrl = import.meta.env.VITE_BASE_MAINNET_RPC_URL; // <<< Get custom RPC URL

if (!walletConnectProjectId) {
  console.error("ERROR: VITE_WALLETCONNECT_PROJECT_ID is not set in your .env file. WalletConnect will not function effectively.");
}

if (!baseMainnetRpcUrl) {
  console.warn(
    "⚠️ WARNING: VITE_BASE_MAINNET_RPC_URL is not set in your .env file. " +
    "The application will attempt to use RainbowKit's default public RPC for Base Mainnet, which may be rate-limited."
  );
}

const config = getDefaultConfig({
  appName: 'PizzaDay NFT Minter',
  projectId: walletConnectProjectId || "DEFAULT_PROJECT_ID_IF_NOT_SET", // Fallback, but ensure it's set
  chains: [base],
  // Configure transports to use your custom RPC URL for Base Mainnet
  transports: {
    [base.id]: http(baseMainnetRpcUrl || undefined), // <<< Use your custom RPC URL here
    // If baseMainnetRpcUrl is undefined, http() will use RainbowKit's default public RPC for Base.
    // For a more robust setup, you might want to ensure baseMainnetRpcUrl is always provided
    // or have a specific fallback public RPC you trust more.
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme({
              accentColor: '#F59E0B', 
              accentColorForeground: '#1F2937',
              borderRadius: 'medium',
            }),
          }}
          modalSize="compact"
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
