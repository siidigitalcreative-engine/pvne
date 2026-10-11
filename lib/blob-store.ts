import { list, put } from "@vercel/blob";
import { seedBusinesses, seedHouseholds, seedPosts, type Business, type Household, type VillagePost } from "@/lib/data";

export type VillageData = {
  households: Household[];
  businesses: Business[];
  posts: VillagePost[];
};

const DATA_PATH = "village-data/community.json";

export const seedData: VillageData = {
  households: seedHouseholds,
  businesses: seedBusinesses,
  posts: seedPosts
};

export async function readVillageData(): Promise<VillageData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seedData;
  try {
    const result = await list({ prefix: DATA_PATH, limit: 10 });
    const file = result.blobs.find((blob) => blob.pathname === DATA_PATH);
    if (!file) return seedData;
    const response = await fetch(file.url, { cache: "no-store" });
    if (!response.ok) return seedData;
    const data = await response.json();
    if (!data || !Array.isArray(data.households) || !Array.isArray(data.businesses) || !Array.isArray(data.posts)) return seedData;
    return data as VillageData;
  } catch (error) {
    console.error("Could not read village data from Blob:", error);
    return seedData;
  }
}

export async function writeVillageData(data: VillageData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  await put(DATA_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0
  });
}
