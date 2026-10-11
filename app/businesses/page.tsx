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
                <div className="business-image-frame">
                  <span className="business-illustration" aria-hidden="true">
                    {business.emoji}
                  </span>
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

        .business-list-card {
          display: grid;
          grid-template-columns: minmax(0, 34%) minmax(0, 1fr);
          align-items: stretch;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e1e9df;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(30, 55, 39, 0.035);
        }

        /* The color panel fills the card, but the photo/illustration frame itself stays 3:4. */
        .business-list-art {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-width: 0;
          min-height: 100%;
          overflow: hidden;
          padding: 0;
          background: linear-gradient(135deg, #f3e9d9, #dce9da);
        }

        .business-image-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          flex: 0 0 auto;
        }

        .business-illustration {
          display: block;
          max-width: 100%;
          font-size: clamp(54px, 8vw, 88px);
          line-height: 1;
          filter: drop-shadow(0 8px 10px rgba(32, 49, 40, 0.12));
        }

        .business-list-body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          min-width: 0;
          padding: 18px 20px;
        }

        .business-name {
          margin: 0 0 7px;
          color: #203128;
          font-size: clamp(17px, 1.8vw, 22px);
          font-weight: 700;
          line-height: 1.25;
          overflow-wrap: break-word;
        }

        .business-category-pill {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          margin: 0 0 8px;
          border-radius: 999px;
          padding: 5px 10px;
          background: #edf4ec;
          color: #47694f;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.3;
          overflow-wrap: break-word;
        }

        .business-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 7px;
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
          margin: 0 0 8px;
          color: #69786d;
          font-size: 13px;
          line-height: 1.4;
          overflow-wrap: break-word;
        }

        .business-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 5px 14px;
          width: 100%;
          color: #879288;
          font-size: 12px;
          line-height: 1.4;
        }

        .business-meta > span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .business-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          gap: 8px;
          width: 100%;
          margin-top: 12px;
        }

        .business-actions > * {
          flex: 1 1 120px;
          min-width: 0;
        }

        .business-actions :global(.primary-button),
        .business-actions :global(.secondary-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          padding: 8px 10px;
          font-size: 12px;
          line-height: 1.25;
          text-align: center;
          white-space: normal;
        }

        @media (min-width: 1100px) {
          .business-list-card {
            grid-template-columns: minmax(0, 30%) minmax(0, 1fr);
          }

          .business-list-body {
            padding: 20px 22px;
          }
        }

        @media (max-width: 640px) {
          .business-list-card {
            grid-template-columns: minmax(0, 32%) minmax(0, 1fr);
            border-radius: 18px;
          }

          .business-list-art {
            align-items: flex-start;
          }

          .business-illustration {
            font-size: clamp(42px, 11vw, 64px);
          }

          .business-list-body {
            padding: 13px 11px;
          }

          .business-name {
            font-size: 16px;
            margin-bottom: 6px;
          }

          .business-category-pill {
            margin-bottom: 7px;
            padding: 5px 7px;
            font-size: 10px;
          }

          .business-status {
            margin-bottom: 6px;
            font-size: 12px;
          }

          .business-description {
            margin-bottom: 7px;
            font-size: 11px;
            line-height: 1.35;
          }

          .business-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            font-size: 10px;
          }

          .business-actions {
            flex-direction: column;
            gap: 6px;
            margin-top: 10px;
          }

          .business-actions > * {
            flex: 1 1 auto;
            width: 100%;
          }

          .business-actions :global(.primary-button),
          .business-actions :global(.secondary-button) {
            width: 100%;
            min-height: 36px;
            padding: 7px 8px;
            font-size: 10px;
          }
        }

        @media (max-width: 360px) {
          .business-list-card {
            grid-template-columns: minmax(0, 30%) minmax(0, 1fr);
          }

          .business-list-body {
            padding: 11px 8px;
          }

          .business-name {
            font-size: 14px;
          }

          .business-description {
            font-size: 10px;
          }
        }
      `}</style>
    </SiteShell>
  );
}
