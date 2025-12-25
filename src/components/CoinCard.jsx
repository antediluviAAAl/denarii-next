"use client";

import React, { memo } from "react";
import { Calendar, DollarSign, Hash, Eye } from "lucide-react";
import FadeInImage from "./FadeInImage";

const CoinCard = memo(function CoinCard({ coin, onClick }) {
  const obverseUrl = coin.images?.obverse?.medium;
  const reverseUrl = coin.images?.reverse?.medium;
  const denomination = coin.d_denominations?.denomination_name;

  return (
    <div
      className={`coin-card ${coin.is_owned ? "owned-coin" : ""}`}
      onClick={() => onClick(coin)}
    >
      <div className="card-flipper">
        {/* --- FRONT FACE --- */}
        <div className="card-front">
          {/* BADGES */}
          {coin.marked && <div className="card-badge badge-rare">RARE</div>}
          {denomination && (
            <div className="card-badge badge-denom">{denomination}</div>
          )}

          <div className="coin-card-inner">
            {/* IMAGE CONTAINER */}
            <div className="coin-image-container relative">
              {obverseUrl ? (
                <FadeInImage
                  src={obverseUrl}
                  alt={coin.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="coin-image"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="coin-image-placeholder" />
              )}
            </div>

            {/* DETAILS */}
            <div className="coin-details">
              <h3 className="coin-name" title={coin.name}>
                {coin.name}
              </h3>
              <div className="coin-info">
                <div className="coin-info-item">
                  <Calendar size={14} />
                  <span>{coin.year || "?"}</span>
                </div>
                <div className="coin-info-item">
                  <DollarSign size={14} />
                  <span>
                    {coin.price_usd ? `$${coin.price_usd.toFixed(2)}` : "N/A"}
                  </span>
                </div>
                {coin.km && (
                  <div className="coin-info-item">
                    <Hash size={14} />
                    <span>{coin.km}</span>
                  </div>
                )}
              </div>
              {coin.subject && <p className="coin-subject">{coin.subject}</p>}
            </div>
          </div>
        </div>

        {/* --- BACK FACE --- */}
        <div className="card-back">
          <div className="back-content-wrapper relative">
            {reverseUrl ? (
              <FadeInImage
                src={reverseUrl}
                alt={`${coin.name} Reverse`}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="coin-image-full"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="no-reverse-placeholder"></div>
            )}

            <div className="card-back-overlay">
              <Eye size={20} />
              <span>View Details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CoinCard;