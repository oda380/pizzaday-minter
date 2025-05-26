import { useCallback, useEffect, useState } from 'react';
import { pizzaDayNftAbi } from '../abis/pizzaDayNftAbi';
import { readContract as wagmiReadContract } from '@wagmi/core';
import { useConfig } from 'wagmi';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const RAW_IPFS_GATEWAY_PREFIX = import.meta.env.VITE_IPFS_GATEWAY_PREFIX;

const convertIpfsUriToHttpUrl = (ipfsUri) => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) return ipfsUri;
  const cidAndPath = ipfsUri.substring(7);
  let gatewayPrefix = RAW_IPFS_GATEWAY_PREFIX;
  if (!gatewayPrefix.endsWith('/')) gatewayPrefix += '/';
  if (!gatewayPrefix.includes('/ipfs/')) gatewayPrefix += 'ipfs/';
  return `${gatewayPrefix}${cidAndPath.startsWith('/') ? cidAndPath.substring(1) : cidAndPath}`;
};

export function useNFTDetails(account, enabled = true) {
  const [userNFT, setUserNFT] = useState(null);
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const [error, setError] = useState(null);
  const wagmiConfig = useConfig();

  const fetchNFT = useCallback(async () => {
    if (!account || !enabled) return;
    setIsLoadingNFT(true);
    setUserNFT(null);
    setError(null);
    try {
      // Pre-check: balanceOf
      const balance = await wagmiReadContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: pizzaDayNftAbi,
        functionName: 'balanceOf',
        args: [account],
      });

      if (balance === 0n) {
        setUserNFT(null); // No NFTs owned
        return;
      }

      const tokenId = await wagmiReadContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: pizzaDayNftAbi,
        functionName: 'tokenOfOwnerByIndex',
        args: [account, 0n],
      });

      const uri = await wagmiReadContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: pizzaDayNftAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      });

      const httpUri = convertIpfsUriToHttpUrl(uri);
      const metadata = await (await fetch(httpUri)).json();
      const isWinner = metadata.attributes?.some(attr => attr.trait_type === 'Status' && attr.value === 'Winner');

      setUserNFT({
        tokenId: tokenId.toString(),
        ...metadata,
        isWinner,
        carouselImages: metadata.images?.map(convertIpfsUriToHttpUrl) || [convertIpfsUriToHttpUrl(metadata.image)]
      });
    } catch (err) {
      console.error("useNFTDetails error:", err);
      setError(err);
    } finally {
      setIsLoadingNFT(false);
    }
  }, [account, enabled, wagmiConfig]);

  useEffect(() => {
    fetchNFT();
  }, [fetchNFT]);

  return { userNFT, isLoadingNFT, error, refetchNFT: fetchNFT };
}
