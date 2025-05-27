# 🍕 Pizza Day NFT Minter

A commemorative NFT minter dApp built for Bitcoin Pizza Day 2025 — deployed on Base Mainnet. Lucky minters receive an on-chain Pizza Box NFT, and "Winner" slices can claim a 50 USDC reward via a Merkle-proof-based smart contract.

---

## 🔧 Tech Stack

- **Frontend**: React + TailwindCSS + Vite
- **Web3 Frameworks**: Wagmi + RainbowKit + Viem
- **Smart Contracts**:
  - ERC-721 (PizzaBox NFT)
  - RewardClaim (Merkle root-based reward distribution)
- **Storage**: IPFS for NFT metadata

---

## 📂 Structure

```
📁 src
├── abis/                      # Contract ABIs
├── components/               # UI Components (Hero, MintSection, NFTDetails...)
├── context/                  # Global state (FeedbackProvider)
├── hooks/                    # Custom hooks (useNFTDetails, useClaimStatus...)
├── App.jsx                   # Entry component
├── main.jsx                  # App bootstrap with Wagmi/RainbowKit
└── index.css                 # TailwindCSS base styles
```

---

## 🔑 Features

### 🎨 Minting Flow
- Wallet connect with RainbowKit
- Displays NFT preview after mint
- Only 200 Pizza Box NFTs available (limited supply)

### 🥇 Winner Reward Claim
- Randomly assigned metadata on mint
- If NFT has `Status: Winner`, it becomes eligible for 50 USDC
- Uses Merkle proof validation to verify eligibility without exposing full list
- Claim button visible only if:
  - NFT has winner trait
  - Merkle proof exists for tokenId
  - User hasn't claimed yet

---

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Set up your environment variables in `.env`:

```
VITE_CONTRACT_ADDRESS=0x...
VITE_REWARD_CLAIM_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=xxx
VITE_IPFS_GATEWAY_PREFIX=https://ipfs.io/ipfs
```

Make sure `public/merkle-proofs.json` exists for claims.

---

## 📝 Merkle Proofs Format

```json
{
  "merkleRoot": "0x...",
  "proofs": {
    "12": ["0xabc...", "0xdef..."],
    "99": ["0x123..."]
  }
}
```

Served from: `/public/merkle-proofs.json`

---

## 📦 Contracts

### 🔹 PizzaBox.sol (ERC721Enumerable)
- Public mint with `mintNFT()`
- Randomized metadata URI from CID list
- Emits `NFTMinted(address, tokenId, uri)`

### 🔹 RewardClaimV3.sol
- Merkle-root based claim validation
- Uses `ownerOf(tokenId)` and Merkle proof
- Sends `rewardAmount` of USDC to caller
- Admin configurable: token, NFT contract, reward amount

---

## 📸 Screenshots

| Mint Page | Winner Claim |
|-----------|--------------|
| ![](./screenshots/mint.png) | ![](./screenshots/claim.png) |

---

## 📜 License

MIT
