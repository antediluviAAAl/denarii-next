"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { X, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

// 1. EXACT REPLICATION OF OLD FETCHER LOGIC
async function fetchCoinDetails(coinId) {
  const { data, error } = await supabase
    .from("f_coins")
    .select(
      `
      *,
      d_period!inner(period_name, period_link),
      d_series(series_name, series_link, series_range),
      d_categories(type_name),
      d_denominations(denomination_name)
    `
    )
    .eq("coin_id", coinId)
    .single();

  if (error) throw error;
  if (!data) return null;

  // Manual Country Fetch (Critical for accuracy)
  let countryName = "Unknown";
  if (data.period_id) {
    const { data: cData } = await supabase
      .from("b_periods_countries")
      .select("d_countries(country_name)")
      .eq("period_id", data.period_id)
      .limit(1);
    if (cData && cData[0] && cData[0].d_countries) {
      countryName = cData[0].d_countries.country_name;
    }
  }

  return { ...data, countryName };
}

export default function CoinModal({ coin, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Use Query for Caching
  const { data: details, isLoading } = useQuery({
    queryKey: ["coin_detail", coin.coin_id],
    queryFn: () => fetchCoinDetails(coin.coin_id),
    staleTime: 1000 * 60 * 30,
    initialData: null, // Don't use 'coin' as initial data to avoid hydration mismatches
  });

  // Merge Data safely
  const displayData = details ? { ...coin, ...details } : coin;

  // Explicitly preserve parent props that might be missing in fetch
  if (!displayData.is_owned) displayData.is_owned = coin.is_owned;
  if (!displayData.images) displayData.images = coin.images;

  // Helper for Links
  const renderLink = (text, url) => {
    if (!url) return <span>{text || "Unknown"}</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="modal-link"
        onClick={(e) => e.stopPropagation()}
      >
        {text}{" "}
        <ExternalLink size={10} style={{ marginLeft: 2, marginBottom: 1 }} />
      </a>
    );
  };

  // Image Logic (Next.js Version)
  const obverseUrl =
    displayData.images?.obverse?.original ||
    displayData.images?.obverse?.medium;
  const reverseUrl =
    displayData.images?.reverse?.original ||
    displayData.images?.reverse?.medium;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <h2>{displayData.name}</h2>
            {displayData.is_owned && (
              <div className="modal-owned-badge">
                <CheckCircle size={18} /> <span>Owned</span>
              </div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading && !details ? (
            <div
              style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}
            >
              Loading full details...
            </div>
          ) : (
            <>
              {/* Images Section */}
              <div className="coin-images">
                <div className="coin-image-modal relative">
                  <h3>Obverse</h3>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "300px",
                    }}
                  >
                    {obverseUrl ? (
                      <Image
                        src={obverseUrl}
                        alt="Obverse"
                        fill
                        style={{ objectFit: "contain" }}
                        priority
                      />
                    ) : (
                      <div className="modal-placeholder">No Image</div>
                    )}
                  </div>
                </div>
                <div className="coin-image-modal relative">
                  <h3>Reverse</h3>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "300px",
                    }}
                  >
                    {reverseUrl ? (
                      <Image
                        src={reverseUrl}
                        alt="Reverse"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div className="modal-placeholder">No Image</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grid - EXACT MATCH TO OLD APP */}
              <div className="coin-details-grid three-col">
                {/* Col 1: Identification */}
                <div className="detail-group">
                  <h3>Identification</h3>
                  <div className="detail-item">
                    <strong>Coin ID:</strong>{" "}
                    <span className="detail-value">{displayData.coin_id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>KM#:</strong>{" "}
                    <span className="detail-value">
                      {displayData.km || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Denomination:</strong>{" "}
                    <span className="detail-value">
                      {displayData.d_denominations?.denomination_name ||
                        "Unknown"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Year:</strong>
                    <span className="detail-value">
                      {displayData.year || "?"}
                      {displayData.d_series?.series_range && (
                        <span className="series-range">
                          {" "}
                          ({displayData.d_series.series_range})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Col 2: Groups */}
                <div className="detail-group">
                  <h3>Groups</h3>
                  <div className="detail-item link-item">
                    <strong>Series:</strong>
                    <span className="detail-value">
                      {renderLink(
                        displayData.d_series?.series_name,
                        displayData.d_series?.series_link
                      )}
                    </span>
                  </div>
                  <div className="detail-item link-item">
                    <strong>Period:</strong>
                    <span className="detail-value">
                      {renderLink(
                        displayData.d_period?.period_name,
                        displayData.d_period?.period_link
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Country:</strong>{" "}
                    <span className="detail-value">
                      {displayData.countryName || "Loading..."}
                    </span>
                  </div>
                </div>

                {/* Col 3: Extra */}
                <div className="detail-group">
                  <h3>Extra</h3>
                  <div className="detail-item">
                    <strong>Subject:</strong>{" "}
                    <span className="detail-value">
                      {displayData.subject || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Price (USD):</strong>
                    <span className="detail-value price-tag">
                      {displayData.price_usd
                        ? `$${displayData.price_usd.toFixed(2)}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Marked:</strong>
                    <span className="detail-value">
                      {displayData.marked ? (
                        <span className="badge-true">Yes</span>
                      ) : (
                        <span className="badge-false">No</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
