"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // 1. Import dynamic
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import CoinGallery from "../components/CoinGallery";
import { useCoins } from "../hooks/useCoins";

// 2. Lazy Load the Modal
// ssr: false means "don't try to render this on the server", which saves server CPU
// since modals are purely client-side interactions anyway.
const CoinModal = dynamic(() => import("../components/CoinModal"), { 
  ssr: false,
  loading: () => null // Optional: render nothing while loading code
});

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const {
    coins,
    loading,
    filters,
    setFilters,
    metadata,
    ownedCount,
    isExploreMode,
  } = useCoins();

  return (
    <div className="app-container">
      <Header ownedCount={ownedCount} displayCount={coins.length} />

      <main className="main-content">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          metadata={metadata}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isExploreMode={isExploreMode}
        />

        <CoinGallery
          coins={coins}
          loading={loading}
          categories={metadata.categories}
          onCoinClick={setSelectedCoin}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={filters.sortBy}
        />
      </main>

      {/* 3. Render conditionally - code downloads only when selectedCoin becomes true */}
      {selectedCoin && (
        <CoinModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}

      <footer className="app-footer">
        <p>Numismatic Gallery v2 • {coins.length} coins loaded</p>
      </footer>
    </div>
  );
}