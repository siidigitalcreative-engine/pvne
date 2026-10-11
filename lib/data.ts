export type VillagePost = {
  id: string;
  category: string;
  title: string;
  body: string;
  location?: string;
  author: string;
  createdAt: string;
  comments: number;
  type: "post" | "announcement";
};

export type Business = {
  id: string;
  ownerId?: string;
  locationType?: "Inside Store" | "Inside PVNE";
  name: string;
  category: string;
  blockLot: string;
  description: string;
  hours: string;
  status: "Open" | "Hours vary" | "Closed";
  emoji: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    lazada?: string;
    shopee?: string;
  };
};

export type Household = {
  id: string;
  block: string;
  lot: string;
  street: string;
  colorScheme: "Turquoise" | "Aubergine" | "Santan";
  hasBusiness: boolean;
  businesses: string[];
};

export const categories = [
  "General Chat", "Food / Marketplace", "House Improvements",
  "Garbage / Sanitation", "Water / Utilities", "Transportation",
  "School", "Sports & Hobbies", "Leisure / Pasayalan", "Emergencies",
  "Pets", "Jobs & Services",
];

export const amenities = [
  "Main Entrance Gate & Guardhouse", "Multi-purpose Hall", "Dedicated Water Tank",
  "BBQ Picnic Area", "Heart Sculpture", "Garden Gazebo", "Basketball Court",
  "Outdoor Adult Fitness Zone", "Children's Playground", "Metal Portal & Bougainvillea",
];

// Compatibility exports: demo content has been removed.
export const seedBusinesses: Business[] = [];
export const seedHouseholds: Household[] = [];
export const seedPosts: VillagePost[] = [];
