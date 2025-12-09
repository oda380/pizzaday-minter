# ₿PIZZA — Bitcoin Pizza Day NFT Minter

> **10,000 BTC • 2 Pizzas • May 22, 2010**

A premium NFT minting dApp celebrating the historic first real-world Bitcoin transaction on Base.

![License](https://img.shields.io/badge/license-MIT-blue)
![Base](https://img.shields.io/badge/chain-Base-0052FF)
![React](https://img.shields.io/badge/react-18-61DAFB)

---

## Features

- **Mint NFTs** — Free mint for Pizza Box NFTs with random winner selection
- **Claim Rewards** — Winners can claim $50 USDC via Merkle proof verification
- **Premium UI** — Dark theme with animated neon glow effects
- **Mobile-First** — Responsive bottom sheet design on mobile
- **RainbowKit** — Seamless wallet connection

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Styling | Custom CSS (dark theme) |
| Web3 | Wagmi v2 + Viem |
| Wallet | RainbowKit |
| Chain | Base (Mainnet) |
| Contracts | Solidity + OpenZeppelin |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd pizzaday-minter
npm install
```

### Environment

Create a `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x...
VITE_REWARD_CLAIM_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

---

## Project Structure

```
pizzaday-minter/
├── public/
│   ├── favicon.svg
│   ├── pizza-preview.png
│   └── merkle-proofs.json    # Winner proofs for claims
├── src/
│   ├── App.jsx               # Main layout
│   ├── main.jsx              # Entry point
│   ├── index.css             # Theme & animations
│   ├── components/
│   │   └── MintCard.jsx      # Core minting UI
│   ├── hooks/
│   │   ├── useMintStatus.js
│   │   ├── useNFTDetails.js
│   │   └── useClaimStatus.js
│   ├── abis/                 # Contract ABIs
│   ├── config/               # App configuration
│   └── context/              # React context
└── index.html
```

---

## Contracts

| Contract | Address |
|----------|---------|
| PizzaBox NFT | `VITE_CONTRACT_ADDRESS` |
| RewardClaim | `VITE_REWARD_CLAIM_ADDRESS` |

Winner verification uses Merkle proofs stored in `public/merkle-proofs.json`.

---

## License

MIT
