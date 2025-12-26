// src/components/CoinListItem.jsx
"use client";
import React, { memo } from "react";
import { Calendar, DollarSign, Hash, CheckCircle } from "lucide-react";
import FadeInImage from "./FadeInImage";

const CoinListItem = memo(function CoinListItem({ coin, onClick }) {
  const obverseUrl =
    coin.images?.obverse?.thumb || coin.images?.obverse?.medium;
  const reverseUrl =
    coin.images?.reverse?.thumb || coin.images?.reverse?.medium;
  const denomination = coin.d_denominations?.denomination_name;

  return (
    <div
      className={`coin-list-item ${coin.is_owned ? "owned" : ""}`}
      onClick={() => onClick(coin)}
    >
      {/* 1. DUAL IMAGES (Obverse + Reverse) */}
      <div className="list-images-container">
        <div className="list-img-wrapper relative">
          {obverseUrl ? (
            <FadeInImage
              src={obverseUrl}
              alt="Obv"
              fill
              sizes="80px"
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="list-item-placeholder">No Obv</div>
          )}
        </div>
        <div className="list-img-wrapper relative">
          {reverseUrl ? (
            <FadeInImage
              src={reverseUrl}
              alt="Rev"
              fill
              sizes="80px"
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="list-item-placeholder">No Rev</div>
          )}
        </div>
      </div>

      {/* 2. CONTENT */}
      <div className="list-item-content">
        <div className="list-item-header">
          <h3 className="list-item-title">{coin.name}</h3>
          {denomination && (
            <span className="list-item-denom">{denomination}</span>
          )}
        </div>
        
        <div className="list-item-meta">
          <div className="meta-tag">
            <Calendar size={12} />
            <span>{coin.year || "ND"}</span>
          </div>
          
          {/* ADDED: Catalog Number (KM) */}
          {coin.km && (
            <div className="meta-tag">
              <Hash size={12} />
              <span>{coin.km}</span>
            </div>
          )}
          
          {/* ADDED: Series Name (Hidden on Mobile) */}
          <div className="meta-tag mobile-hidden">
            <span>{coin.d_series?.series_name}</span>
          </div>
        </div>
      </div>

      {/* 3. ACTIONS / STATUS */}
      <div className="list-item-actions">
        {coin.is_owned && (
          <div className="list-owned-status">
            <CheckCircle size={16} />
            <span>Owned</span>
          </div>
        )}
        <div className="list-price">
          <DollarSign size={14} />
          <span>
            {coin.price_usd ? coin.price_usd.toFixed(2) : "---"}
          </span>
        </div>
      </div>
    </div>
  );
});

export default CoinListItem;