
import React from 'react';

const ClaimButton = ({ onClaim, disabled, isClaiming }) => {
  return (
    <button
      onClick={onClaim}
      disabled={disabled || isClaiming}
      className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow hover:scale-105 transition"
    >
      {isClaiming ? 'Claiming...' : '🎁 Claim 50 USDC'}
    </button>
  );
};

export default ClaimButton;
