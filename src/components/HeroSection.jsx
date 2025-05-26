import React from 'react';

const HeroSection = () => {
  return (
    <section className="text-center w-full max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <div className="transform transition-all duration-500 ease-out hover:scale-[1.02]">
        <img
          src="/pizza-day-banner.png"
          alt="Celebrate Bitcoin Pizza Day with Yolo - Commemorative NFT Drop"
          className="max-w-sm sm:max-w-md md:max-w-lg mx-auto mb-8 rounded-lg shadow-2xl dark:shadow-[0_10px_30px_-10px_rgba(241,196,15,0.3)]"
        />
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-6 leading-tight tracking-tight">
        <span className="drop-shadow-sm">🍕 A Slice of History:</span><br className="sm:hidden" /><br />Bitcoin Pizza Day '25
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-page-text-light dark:text-page-text-dark/90 mb-8 max-w-2xl mx-auto leading-relaxed">
        Join <span className="font-semibold text-pizza-tomato-red dark:text-pizza-gold-accent">Yolo</span> in celebrating a legendary moment! Mint your exclusive Pizza Day NFT and own a piece of crypto folklore.
      </p>
    </section>
  );
};

export default HeroSection;