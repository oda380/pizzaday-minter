// src/components/Leaderboard.jsx

import React, { useState } from 'react';
import { useLeaderboardFromWinners } from '../hooks/useLeaderboardFromWinners';

const winningTokenIds = [
  5,
  9,
  33,
  35,
  41,
  44,
  60,
  90,
  95,
  97,
  117,
  119,
  144,
  147,
  149,
  154,
  157,
  162,
  165,
  200
]; // ✅ Replace with actual winning token IDs

const itemsPerPage = 5;

const Leaderboard = () => {
  const { winners, loading } = useLeaderboardFromWinners(winningTokenIds);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(winners.length / itemsPerPage);
  const paginatedData = winners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-pizza-tomato-red dark:text-pizza-cheese-yellow mb-4">
        🏆 Pizza Day Winners
      </h2>

      {loading ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
              <thead>
                <tr className="text-xs uppercase bg-gray-100 dark:bg-slate-700 whitespace-nowrap">
                  <th className="py-2 px-4">Token ID</th>
                  <th className="py-2 px-4">Wallet</th>
                  <th className="py-2 px-4 text-right">Prize</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((entry, index) => (
                  <tr key={index} className="border-t border-gray-100 dark:border-slate-700 whitespace-nowrap">
                    <td className="py-2 px-4 font-medium">{entry.tokenId}</td>
                    <td className="py-2 px-4 font-mono text-xs truncate max-w-[120px]">{entry.wallet}</td>
                    <td className="py-2 px-4 text-right">{entry.prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-slate-700 text-sm disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-slate-700 text-sm disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
