"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { X, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

// Fetcher Function
async function fetchCoinDetails(coinId) {
  // 1. Fetch Coin & Relations
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

  // 2. Robust Country Fetch (2-Step Strategy)
  let countryName = "Unknown";

  if (data.period_id) {
    try {
      // Step A: Find the Country ID for this Period
      const { data: linkData, error: linkError } = await supabase
        .from("b_periods_countries")
        .select("country_id")
        .eq("period_id", data.period_id)
        .limit(1)
        .maybeSingle();

      if (linkError) {
        console.error("Link Fetch Error:", linkError);
      } else if (linkData) {
        // Step B: Fetch the Country Name using the ID
        const { data: countryData, error: countryError } = await supabase
          .from("d_countries")
          .select("country_name")
          .eq("country_id", linkData.country_id)
          .single();

        if (countryError) {
          console.error("Country Name Error:", countryError);
        } else if (countryData) {
          countryName = countryData.country_name;
        }
      } else {
        console.warn("No country linked to period:", data.period_id);
      }
    } catch (err) {
      console.error("Unexpected error fetching country:", err);
    }
  }

  return { ...data, countryName };
}

export default function CoinModal({ coin, onClose }) {
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Use Query
  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useQuery({
    // UPDATE: Changed key to '_v2' to bust any stale cache from previous errors
    queryKey: ["coin_detail_v2", coin.coin_id],
    queryFn: () => fetchCoinDetails(coin.coin_id),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  // Merge Data
  const displayData = details ? { ...coin, ...details } : coin;

  // Preserve local ownership/image data
  if (!displayData.is_owned) displayData.is_owned = coin.is_owned;
  if (!displayData.images) displayData.images = coin.images;

  // Link Helper
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

  // Image Logic
  const obverseUrl =
    displayData.images?.obverse?.full ||
    displayData.images?.obverse?.original ||
    displayData.images?.obverse?.medium;
  const reverseUrl =
    displayData.images?.reverse?.full ||
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
          {/* Error Banner */}
          {isError && (
            <div className="p-4 mb-4 text-red-700 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
              <AlertTriangle size={20} />
              <div className="flex flex-col text-sm">
                <span className="font-bold">Error loading details</span>
                <span>{error?.message || "Check console for details."}</span>
              </div>
            </div>
          )}

          {isLoading && !details ? (
            <div
              style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}
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
                      height: "400px", // React Parity: 400px
                      background: "var(--border-light)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                    }}
                  >
                    {obverseUrl ? (
                      <Image
                        src={obverseUrl}
                        alt="Obverse"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        style={{ objectFit: "cover" }} // React Parity: Cover
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
                      height: "400px",
                      background: "var(--border-light)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                    }}
                  >
                    {reverseUrl ? (
                      <Image
                        src={reverseUrl}
                        alt="Reverse"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="modal-placeholder">No Image</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="coin-details-grid three-col">
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
                      {/* This will now show "Unknown" instead of Loading if fetch succeeded but found nothing */}
                      {displayData.countryName ||
                        (isError ? "Error" : "Unknown")}
                    </span>
                  </div>
                </div>

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
