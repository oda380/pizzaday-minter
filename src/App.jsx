import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MintCard from './components/MintCard';
import { CONTRACT_ADDRESS } from './config';

// Particle component for background effect
const Particles = () => (
  <div className="particles">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="particle" />
    ))}
  </div>
);

// Brand Logo Component with Tagline
const BrandLogo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <span style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#F7931A',
        lineHeight: 1,
      }}>
        ₿
      </span>
      <span style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.5rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #ff6b35, #f7c53f)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.08em',
        lineHeight: 1,
      }}>
        PIZZA
      </span>
    </div>
    {/* Tagline - the real story */}
    <span style={{
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.6rem',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '0.1em',
      marginTop: '0.25rem',
    }}>
      10,000 BTC • 2 Pizzas • May 22, 2010
    </span>
  </div>
);

const App = () => {
  return (
    <>
      {/* Animated Background */}
      <div className="animated-bg" />
      <Particles />

      {/* Top Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 70%, transparent 100%)',
      }}>
        <BrandLogo />
        {/* ConnectButton for account management / disconnect */}
        <ConnectButton
          accountStatus="avatar"
          showBalance={false}
          chainStatus="none"
        />
      </nav>

      {/* Main Content */}
      <div className="app-container">
        <MintCard />

        {/* Footer - improved visibility */}
        <footer style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.5)',
        }}>
          <span style={{ color: '#F7931A', fontWeight: '600' }}>₿</span>
          <span>Built on</span>
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'none' }}
          >
            Base
          </a>
          {CONTRACT_ADDRESS && (
            <>
              <span style={{ opacity: 0.3 }}>•</span>
              <a
                href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c9952e', textDecoration: 'none' }}
              >
                View Contract
              </a>
            </>
          )}
        </footer>
      </div>
    </>
  );
};

export default App;