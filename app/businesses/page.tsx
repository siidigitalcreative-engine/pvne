"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, MapPinned, ArrowUpRight, Filter } from "lucide-react";
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
      seedBusinesses.filter(
        (business) =>
          `${business.name} ${business.category} ${business.blockLot} ${business.description}`
            .toLowerCase()
            .includes(q.toLowerCase()) &&
          (category === "All categories" || business.category === category),
      ),
    [q, category],
  );

  return (
    <SiteShell>
      <div className="page-container business-directory-page">
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
          {rows.length} sample businesses <span>· Listings shown are illustrative</span>
        </div>

        <div className="business-directory-list">
          {rows.map((business) => (
            <div
              className="business-directory-group"
              key={business.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                overflow: "hidden",
                border: "1px solid #dfe8df",
                borderRadius: "24px",
                background: "#ffffff",
              }}
            >
              <article
                className="business-directory-item"
                style={{
                  border: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  margin: 0,
                }}
              >
                <div
                  className="business-directory-image"
                  role="img"
                  aria-label={`${business.name} image`}
                >
                  <span aria-hidden="true">{business.emoji}</span>
                </div>

                <div className="business-directory-main">
                  <div className="business-directory-heading">
                    <h2>{business.name}</h2>
                    <span className="business-directory-category">{business.category}</span>
                  </div>

                  <div className="business-directory-location">
                    <MapPinned size={17} aria-hidden="true" />
                    <span>{business.blockLot}</span>
                  </div>

                  <div className="business-directory-divider" />

                  <div
                    className={
                      business.status === "Open"
                        ? "business-directory-status status-open"
                        : "business-directory-status status-variable"
                    }
                  >
                    <span aria-hidden="true">●</span> {business.status}
                  </div>

                  <p className="business-directory-hours">{business.hours}</p>
                </div>
              </article>

              <section
                className="business-directory-extra"
                aria-label={`${business.name} details`}
                style={{
                  margin: 0,
                  border: 0,
                  borderTop: "1px solid #e5ece5",
                  borderRadius: 0,
                  boxShadow: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <p className="business-directory-description">{business.description}</p>
                {business.socialLinks && Object.values(business.socialLinks).some((url) => Boolean(url?.trim())) && (
                  <nav className="business-directory-socials" aria-label={`${business.name} social and shop links`}>
                    {([
                      ["facebook", "Facebook"],
                      ["instagram", "Instagram"],
                      ["tiktok", "TikTok"],
                      ["lazada", "Lazada"],
                      ["shopee", "Shopee"],
                    ] as const).map(([platform, label]) => {
                      const url = business.socialLinks?.[platform]?.trim();
                      if (!url) return null;
                      const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                      return (
                        <a key={platform} href={safeUrl} target="_blank" rel="noopener noreferrer">
                          {label}
                        </a>
                      );
                    })}
                  </nav>
                )}
                <div className="business-directory-actions">
                  <Link href="/directory" className="secondary-button">
                    <Store size={17} aria-hidden="true" />
                    View household
                  </Link>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      alert(
                        "Inquiry preview only. Add resident verification and a secure messaging feature before launch.",
                      )
                    }
                  >
                    Contact business <ArrowUpRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </section>
            </div>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="business-directory-empty">
            <strong>No businesses found</strong>
            <p>Try another search term or choose a different category.</p>
          </div>
        )}

        <div className="info-banner">
          <Filter size={20} aria-hidden="true" />
          <div>
            <strong>Business owners can manage their listings</strong>
            <p>
              The production version should let verified household members create
              a business profile, upload images to Vercel Blob, and link the
              business to one or more approved household records.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .business-directory-page .business-directory-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 22px;
        }

        .business-directory-page .business-directory-group {
          min-width: 0;
        }

        .business-directory-page .business-directory-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.7fr);
          align-items: stretch;
          min-width: 0;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e1e9df;
          border-radius: 22px;
          box-shadow: 0 8px 24px rgba(25, 50, 32, 0.035);
        }

        .business-directory-page .business-directory-image {
          width: 100%;
          aspect-ratio: 3 / 4;
          min-width: 0;
          align-self: start;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #f3e8d9 0%, #dce9d9 100%);
        }

        .business-directory-page .business-directory-image span {
          display: block;
          font-size: clamp(56px, 7vw, 96px);
          line-height: 1;
          overflow-wrap: normal;
          word-break: normal;
        }

        .business-directory-page .business-directory-main {
          min-width: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .business-directory-page .business-directory-heading {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          min-width: 0;
          margin-bottom: 14px;
        }

        .business-directory-page .business-directory-heading h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.3;
          letter-spacing: -0.035em;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-category {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 6px 11px;
          border-radius: 999px;
          background: #edf4ec;
          color: #4a6d51;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-location {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #738176;
          font-size: 14px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-location svg {
          flex: 0 0 auto;
        }

        .business-directory-page .business-directory-divider {
          height: 1px;
          width: 100%;
          background: #e8eee7;
          margin: 14px 0;
        }

        .business-directory-page .business-directory-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
        }

        .business-directory-page .business-directory-status.status-open {
          color: #328554;
        }

        .business-directory-page .business-directory-status.status-variable {
          color: #a47a20;
        }

        .business-directory-page .business-directory-hours {
          margin: 0;
          color: #89958b;
          font-size: 13px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-extra {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          margin-top: 10px;
          padding: 18px 20px;
          border: 1px solid #e1e9df;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(25, 50, 32, 0.025);
          min-width: 0;
        }

        .business-directory-page .business-directory-description {
          margin: 0;
          color: #68776d;
          font-size: 14px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-socials {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .business-directory-page .business-directory-socials a {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 7px 10px;
          border: 1px solid #dfe8df;
          border-radius: 999px;
          background: #f7faf6;
          color: #315c3c;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          text-decoration: none;
          white-space: nowrap;
        }

        .business-directory-page .business-directory-socials a:hover {
          border-color: #b9cfb9;
          background: #edf5eb;
        }

        .business-directory-page .business-directory-actions {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          align-items: stretch;
        }

        .business-directory-page .business-directory-actions .secondary-button,
        .business-directory-page .business-directory-actions .primary-button {
          min-width: 0;
          min-height: 46px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 11px 12px;
          border-radius: 12px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .business-directory-page .business-directory-actions .secondary-button {
          border: 1px solid #dbe6da;
          background: #fff;
          color: #315c3c;
        }

        .business-directory-page .business-directory-actions .secondary-button:hover {
          background: #f5f9f4;
          border-color: #bfd2bf;
        }

        .business-directory-page .business-directory-actions .primary-button {
          border: 0;
          background: #244b37;
          color: #fff;
          cursor: pointer;
        }

        .business-directory-page .business-directory-actions .primary-button:hover {
          background: #193a29;
        }

        .business-directory-page .business-directory-empty {
          padding: 28px;
          border: 1px solid #e1e9df;
          border-radius: 16px;
          background: #fff;
          text-align: center;
          color: #68776d;
        }

        .business-directory-page .business-directory-empty strong {
          color: #17251e;
        }

        .business-directory-page .business-directory-empty p {
          margin: 6px 0 0;
        }

        @media (max-width: 560px) {
          .business-directory-page .business-directory-item {
            grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          }

          .business-directory-page .business-directory-main {
            padding: 15px 13px;
          }

          .business-directory-page .business-directory-heading h2 {
            font-size: 17px;
          }

          .business-directory-page .business-directory-category {
            padding: 5px 9px;
            font-size: 11px;
          }

          .business-directory-page .business-directory-location {
            font-size: 12px;
            gap: 6px;
          }

          .business-directory-page .business-directory-extra {
            padding: 15px;
            gap: 13px;
          }

          .business-directory-page .business-directory-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .business-directory-page .business-directory-actions .secondary-button,
          .business-directory-page .business-directory-actions .primary-button {
            padding: 10px 7px;
            gap: 5px;
            font-size: 11px;
          }
        }

        @media (max-width: 360px) {
          .business-directory-page .business-directory-item {
            grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
          }

          .business-directory-page .business-directory-main {
            padding: 12px 10px;
          }

          .business-directory-page .business-directory-heading h2 {
            font-size: 15px;
          }

          .business-directory-page .business-directory-actions .secondary-button,
          .business-directory-page .business-directory-actions .primary-button {
            font-size: 10px;
          }
        }
      `}</style>
    </SiteShell>
  );
}
