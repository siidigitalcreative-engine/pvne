"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, MapPinned, ArrowUpRight, Filter, Image as ImageIcon } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedBusinesses } from "@/lib/data";

export default function BusinessesPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All categories");

  const categories = [
    "All categories",
    ...Array.from(new Set(seedBusinesses.map((business) => business.category))),
  ];

  const rows = useMemo(
    () =>
      seedBusinesses.filter((business) => {
        const matchesSearch = `${business.name} ${business.category} ${business.blockLot} ${business.description}`
          .toLowerCase()
          .includes(q.toLowerCase());
        const matchesCategory =
          category === "All categories" || business.category === category;

        return matchesSearch && matchesCategory;
      }),
    [q, category],
  );

  return (
    <SiteShell>
      <div className="page-container">
        <div className="page-hero compact">
          <span className="section-kicker">SUPPORT YOUR NEIGHBORS</span>
          <h1>Village business directory</h1>
          <p>
            Discover food, products, and services offered by residents. Every
            listing can link back to its house and lot.
          </p>
        </div>

        <div className="directory-toolbar">
          <label className="directory-search">
            <Search size={19} aria-hidden="true" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search a business, product, or service..."
              aria-label="Search businesses"
            />
          </label>

          <select
            className="select-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="result-summary">
          {rows.length} sample businesses{" "}
          <span>· Listings shown are illustrative</span>
        </div>

        <div className="business-list-grid">
          {rows.map((business) => (
            <article className="business-list-card" key={business.id}>
              <div
                className="business-list-art business-list-art-full"
                aria-label={`${business.name} image area`}
              >
                <span aria-hidden="true">{business.emoji}</span>
                <div className="business-image-hint">
                  <ImageIcon size={14} aria-hidden="true" />
                  <span>Business image</span>
                </div>
              </div>

              <div className="business-list-body">
                <div className="business-title-row">
                  <h2>{business.name}</h2>
                  <span
                    className={
                      business.status === "Open"
                        ? "status-open"
                        : "status-variable"
                    }
                  >
                    ● {business.status}
                  </span>
                </div>

                <span className="business-category-pill">{business.category}</span>

                <p className="business-description">{business.description}</p>

                <div className="business-meta">
                  <span>
                    <MapPinned size={14} aria-hidden="true" />
                    {business.blockLot}
                  </span>
                  <span>{business.hours}</span>
                </div>

                <div className="business-actions">
                  <Link href="/directory" className="secondary-button">
                    <Store size={15} aria-hidden="true" />
                    View household
                  </Link>
                  <button
                    className="primary-button"
                    onClick={() =>
                      alert(
                        "Inquiry preview only. Add resident verification and a secure messaging feature before launch.",
                      )
                    }
                  >
                    Contact business
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="empty-state">
            <Store size={24} aria-hidden="true" />
            <h2>No businesses found</h2>
            <p>Try another search term or choose a different category.</p>
          </div>
        )}

        <div className="info-banner">
          <Filter size={20} aria-hidden="true" />
          <div>
            <strong>Business owners can manage their listings</strong>
            <p>
              The production version should let verified household members
              create a business profile, upload full business photos, and link
              the business to one or more approved household records.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .business-list-art-full {
          position: relative;
          overflow: hidden;
          min-width: 0;
          background: linear-gradient(135deg, #f3e9d9, #dce9da);
        }

        .business-list-art-full > span {
          font-size: clamp(64px, 12vw, 112px);
          line-height: 1;
          filter: drop-shadow(0 8px 10px rgba(32, 49, 40, 0.12));
        }

        .business-image-hint {
          position: absolute;
          left: 12px;
          bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.9);
          color: #536258;
          font-size: 11px;
        }

        .business-category-pill {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          margin: 0 0 10px;
          border-radius: 999px;
          padding: 6px 10px;
          background: #edf4ec;
          color: #47694f;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .business-description {
          margin-top: 0;
        }

        .business-title-row {
          align-items: flex-start;
          gap: 12px;
        }

        .business-title-row h2 {
          min-width: 0;
          overflow-wrap: break-word;
        }

        .business-meta {
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .business-list-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .business-list-card {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .business-list-art-full {
            width: 100%;
            min-height: 220px;
            aspect-ratio: 4 / 3;
            height: auto;
            border-radius: 16px 16px 0 0;
          }

          .business-list-art-full > span {
            font-size: clamp(76px, 22vw, 124px);
          }

          .business-list-body {
            min-width: 0;
            padding: 16px;
          }

          .business-title-row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .business-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .business-actions > * {
            flex: 1 1 145px;
            justify-content: center;
          }
        }
      `}</style>
    </SiteShell>
  );
}
