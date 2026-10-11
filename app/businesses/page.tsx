"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  MapPinned,
  ArrowUpRight,
  Filter,
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
          gap: 20px;
          align-items: stretch;
        }

        .business-list-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e1e9df;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(30, 55, 39, 0.035);
        }

        .business-list-art {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-width: 0;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: linear-gradient(135deg, #f3e9d9, #dce9da);
        }

        .business-illustration {
          display: block;
          font-size: clamp(64px, 7vw, 100px);
          line-height: 1;
          filter: drop-shadow(0 8px 10px rgba(32, 49, 40, 0.12));
        }

        .business-list-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          padding: 20px;
        }

        .business-name {
          margin: 0 0 9px;
          color: #203128;
          font-size: clamp(18px, 1.4vw, 22px);
          font-weight: 700;
          line-height: 1.3;
          overflow-wrap: anywhere;
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

        .business-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 8px;
          font-size: 13px;
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
          margin: 0 0 14px;
          color: #69786d;
          font-size: 13px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .business-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 16px;
          width: 100%;
          color: #879288;
          font-size: 12px;
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
          align-items: stretch;
          gap: 9px;
          width: 100%;
          margin-top: auto;
          padding-top: 18px;
        }

        .business-actions > * {
          flex: 1 1 140px;
          min-width: 0;
        }

        .business-actions :global(.primary-button),
        .business-actions :global(.secondary-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 10px 12px;
          font-size: 12px;
          white-space: normal;
          text-align: center;
        }

        @media (min-width: 1024px) {
          .business-list-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .business-list-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
          }

          .business-list-card {
            border-radius: 18px;
          }

          .business-list-art {
            aspect-ratio: 16 / 9;
          }

          .business-illustration {
            font-size: clamp(64px, 18vw, 90px);
          }

          .business-list-body {
            padding: 16px;
          }

          .business-name {
            font-size: 19px;
          }

          .business-actions {
            flex-direction: column;
            gap: 8px;
          }

          .business-actions > * {
            width: 100%;
            flex-basis: auto;
          }
        }
      `}</style>
    </SiteShell>
  );
}
