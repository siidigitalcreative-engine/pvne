import { get, list, put } from "@vercel/blob";
import type { Business, Household, VillagePost } from "@/lib/data";

export type VillageData = {
  households: Household[];
  businesses: Business[];
  posts: VillagePost[];
};

const DATA_PATH = "village-data/community.json";

export const emptyVillageData: VillageData = {
  households: [],
  businesses: [],
  posts: [],
};

const DEMO_POST_IDS = new Set(["post-1", "post-2", "post-3", "post-4", "post-5", "post-6"]);
const DEMO_BUSINESS_IDS = new Set(["biz-1", "biz-2", "biz-3", "biz-4"]);
const DEMO_HOUSEHOLD_IDS = new Set([
  "house-1", "house-2", "house-3", "house-4",
  "house-5", "house-6", "house-7", "house-8",
]);

function cleanDemoRecords(value: unknown): VillageData {
  if (!value || typeof value !== "object") return emptyVillageData;
  const data = value as Partial<VillageData>;
  const households = Array.isArray(data.households)
    ? data.households.filter((item) => item && !DEMO_HOUSEHOLD_IDS.has(item.id))
    : [];
  const businesses = Array.isArray(data.businesses)
    ? data.businesses.filter((item) => item && !DEMO_BUSINESS_IDS.has(item.id))
    : [];
  const posts = Array.isArray(data.posts)
    ? data.posts.filter((item) => item && !DEMO_POST_IDS.has(item.id))
    : [];
  return { households, businesses, posts };
}

async function readStoredData(): Promise<{ data: VillageData; exists: boolean }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured. Persistent village data is unavailable.");
  }

  const result = await list({ prefix: DATA_PATH, limit: 10 });
  const file = result.blobs.find((blob) => blob.pathname === DATA_PATH);
  if (!file) return { data: emptyVillageData, exists: false };

  const stored = await get(DATA_PATH, { access: "private" });
  if (!stored || stored.statusCode !== 200) {
    throw new Error("Could not read village data from private Blob storage.");
  }
  const raw = await new Response(stored.stream).json();
  if (!raw || !Array.isArray(raw.households) || !Array.isArray(raw.businesses) || !Array.isArray(raw.posts)) {
    throw new Error("Stored village data has an invalid format. It was not overwritten.");
  }

  return { data: cleanDemoRecords(raw), exists: true };
}

export async function readVillageData(): Promise<VillageData> {
  // Never write from a read. Writing a stale snapshot during demo cleanup can
  // overwrite a newly published announcement or a recently updated house.
  const { data } = await readStoredData();
  return data;
}

export async function writeVillageData(data: VillageData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured. Changes were not saved.");
  }

  const normalized: VillageData = {
    households: Array.isArray(data.households) ? data.households : [],
    businesses: Array.isArray(data.businesses) ? data.businesses : [],
    posts: Array.isArray(data.posts) ? data.posts : [],
  };

  await put(DATA_PATH, JSON.stringify(normalized, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}
