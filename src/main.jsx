// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Wagmi / RainbowKit
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { http } from 'viem';
import { FeedbackProvider } from './context/FeedbackContext';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const baseRpcUrl = import.meta.env.VITE_BASE_MAINNET_RPC_URL;

const config = getDefaultConfig({
  appName: 'Pizza Day NFT Minter',
  projectId: walletConnectProjectId,
  chains: [base],
  transports: {
    [base.id]: http(baseRpcUrl)
  }
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
              accentColor: '#facc15',
              accentColorForeground: '#1e1b16',
              borderRadius: 'medium',
            }),
          }}
        >
          <FeedbackProvider>
            <App />
          </FeedbackProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
