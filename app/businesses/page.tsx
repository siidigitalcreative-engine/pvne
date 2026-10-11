"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  MapPinned,
  ArrowUpRight,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
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
                className="business-list-art"
                aria-label={`${business.name} image area`}
              >
                <span className="business-illustration" aria-hidden="true">
                  {business.emoji}
                </span>
                <div className="business-image-hint">
                  <ImageIcon size={16} aria-hidden="true" />
                  <span>Business image</span>
                </div>
              </div>

              <div className="business-list-body">
                <h2 className="business-name">{business.name}</h2>

                <span className="business-category-pill">
                  {business.category}
                </span>

                <span
                  className={
                    business.status === "Open"
                      ? "business-status status-open"
                      : "business-status status-variable"
                  }
                >
                  <span aria-hidden="true">●</span> {business.status}
                </span>

                <p className="business-description">{business.description}</p>

                <div className="business-meta">
                  <span>
                    <MapPinned size={16} aria-hidden="true" />
                    {business.blockLot}
                  </span>
                  <span>{business.hours}</span>
                </div>

                <div className="business-actions">
                  <Link href="/directory" className="secondary-button">
                    <Store size={16} aria-hidden="true" />
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
                    <ArrowUpRight size={16} aria-hidden="true" />
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
        .business-list-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
        }

        /* Horizontal card: image on the left, all details on the right. */
        .business-list-card {
          display: grid;
          grid-template-columns: minmax(180px, 34%) minmax(0, 1fr);
          align-items: stretch;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e1e9df;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(30, 55, 39, 0.035);
        }

        .business-list-art {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 220px;
          overflow: hidden;
          aspect-ratio: 4 / 3;
          background: linear-gradient(135deg, #f3e9d9, #dce9da);
        }

        .business-illustration {
          display: block;
          font-size: clamp(64px, 9vw, 112px);
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
          max-width: calc(100% - 24px);
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          padding: 7px 11px;
          background: rgba(255, 255, 255, 0.92);
          color: #536258;
          font-size: 12px;
        }

        .business-list-body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          min-width: 0;
          padding: 22px 24px;
        }

        .business-name {
          margin: 0 0 9px;
          color: #203128;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 700;
          line-height: 1.25;
          overflow-wrap: break-word;
        }

        .business-category-pill {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          margin: 0 0 10px;
          border-radius: 999px;
          padding: 7px 12px;
          background: #edf4ec;
          color: #47694f;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.3;
          overflow-wrap: break-word;
        }

        .business-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.35;
        }

        .status-open {
          color: #348553;
        }

        .status-variable {
          color: #a17b22;
        }

        .business-description {
          margin: 0 0 12px;
          color: #69786d;
          font-size: 14px;
          line-height: 1.55;
          overflow-wrap: break-word;
        }

        .business-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 18px;
          width: 100%;
          color: #879288;
          font-size: 13px;
          line-height: 1.5;
        }

        .business-meta > span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .business-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          width: 100%;
          margin-top: 16px;
        }

        .business-actions > * {
          min-width: 0;
        }

        .business-actions :global(.primary-button),
        .business-actions :global(.secondary-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          padding: 10px 14px;
          font-size: 13px;
          white-space: normal;
        }

        @media (min-width: 1100px) {
          .business-list-card {
            grid-template-columns: minmax(240px, 32%) minmax(0, 1fr);
          }

          .business-list-art {
            min-height: 240px;
          }
        }

        @media (max-width: 640px) {
          .business-list-card {
            grid-template-columns: minmax(112px, 36%) minmax(0, 1fr);
            border-radius: 18px;
          }

          .business-list-art {
            min-height: 190px;
            height: 100%;
            aspect-ratio: auto;
            border-radius: 0;
          }

          .business-illustration {
            font-size: clamp(48px, 13vw, 76px);
          }

          .business-image-hint {
            left: 7px;
            right: 7px;
            bottom: 8px;
            justify-content: center;
            gap: 4px;
            padding: 6px 5px;
            font-size: 10px;
          }

          .business-list-body {
            padding: 15px 12px;
          }

          .business-name {
            font-size: 17px;
            margin-bottom: 8px;
          }

          .business-category-pill {
            margin-bottom: 8px;
            padding: 6px 8px;
            font-size: 11px;
          }

          .business-status {
            margin-bottom: 7px;
            font-size: 12px;
          }

          .business-description {
            margin-bottom: 9px;
            font-size: 12px;
            line-height: 1.45;
          }

          .business-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
            font-size: 11px;
          }

          .business-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 7px;
            margin-top: 12px;
          }

          .business-actions > * {
            width: 100%;
          }

          .business-actions :global(.primary-button),
          .business-actions :global(.secondary-button) {
            width: 100%;
            min-height: 40px;
            padding: 8px 9px;
            font-size: 11px;
          }
        }

        @media (max-width: 360px) {
          .business-list-card {
            grid-template-columns: minmax(100px, 34%) minmax(0, 1fr);
          }

          .business-list-body {
            padding: 12px 9px;
          }

          .business-name {
            font-size: 15px;
          }

          .business-description {
            font-size: 11px;
          }
        }
      `}</style>
    </SiteShell>
  );
}
