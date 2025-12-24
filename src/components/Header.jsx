"use client";

import React from "react";
import Image from "next/image";
import { Database, CheckCircle } from "lucide-react";

export default function Header({
  ownedCount,
  displayCount,
  totalCoins = 264962,
}) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">
            <div className="app-icon">
              <Image
                src="/logo.svg"
                width={48}
                height={48}
                alt="Logo"
                priority
              />
            </div>
            <span className="title-denarii">Denarii</span>
            <span className="title-district"> District</span>
          </h1>

          <div className="app-subtitle">
            <Database size={16} className="text-gold" />
            <span style={{ fontWeight: 600 }}>
              {totalCoins.toLocaleString()} coins in database
            </span>

            {ownedCount > 0 && (
              <span className="owned-count">
                <CheckCircle size={14} />
                {ownedCount} owned
              </span>
            )}
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-label">Showing</span>
            <span className="stat-value">{displayCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
