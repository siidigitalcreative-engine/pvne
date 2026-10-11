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
  "General Chat", "Food / Marketplace", "House Improvements", "Garbage / Sanitation",
  "Water / Utilities", "Transportation", "School", "Sports & Hobbies",
  "Leisure / Pasayalan", "Emergencies", "Pets", "Jobs & Services"
];

export const amenities = [
  "Main Entrance Gate & Guardhouse", "Multi-purpose Hall", "Dedicated Water Tank",
  "BBQ Picnic Area", "Heart Sculpture", "Garden Gazebo", "Basketball Court",
  "Outdoor Adult Fitness Zone", "Children's Playground", "Metal Portal & Bougainvillea"
];

export const seedBusinesses: Business[] = [
  { id: "biz-1", name: "Kuya's Homemade Pizza", category: "Food & Beverages", blockLot: "Blk 15 Lot 26", description: "Homemade pizza and family-size orders from a local resident.", hours: "10:00 AM – 9:00 PM", status: "Open", emoji: "🍕" },
  { id: "biz-2", name: "Beanbo Cafe", category: "Coffee / Drinks", blockLot: "Blk 11 Lot 33", description: "Coffee, iced drinks, and neighborhood favorites.", hours: "8:00 AM – 8:00 PM", status: "Open", emoji: "🧋" },
  { id: "biz-3", name: "Creative Print Services", category: "Printing & Design", blockLot: "Blk 8 Lot 21", description: "Printing, layouts, and creative services.", hours: "9:00 AM – 6:00 PM", status: "Hours vary", emoji: "🖨️" },
  { id: "biz-4", name: "Home Repair & Maintenance", category: "Home Services", blockLot: "Blk 15 Lot 41", description: "Resident-listed home repair and maintenance services.", hours: "Message for schedule", status: "Hours vary", emoji: "🛠️" }
];

export const seedHouseholds: Household[] = [
  { id: "house-1", block: "15", lot: "26", street: "Bayanihan St.", colorScheme: "Turquoise", hasBusiness: true, businesses: ["biz-1"] },
  { id: "house-2", block: "11", lot: "33", street: "Lot 33", colorScheme: "Santan", hasBusiness: true, businesses: ["biz-2"] },
  { id: "house-3", block: "8", lot: "21", street: "Amenities Front", colorScheme: "Aubergine", hasBusiness: true, businesses: ["biz-3"] },
  { id: "house-4", block: "15", lot: "41", street: "Bayanihan St.", colorScheme: "Turquoise", hasBusiness: true, businesses: ["biz-4"] },
  { id: "house-5", block: "32", lot: "34", street: "Buhay", colorScheme: "Santan", hasBusiness: false, businesses: [] },
  { id: "house-6", block: "17", lot: "44", street: "Community Road", colorScheme: "Aubergine", hasBusiness: false, businesses: [] },
  { id: "house-7", block: "19", lot: "15", street: "Commitment", colorScheme: "Turquoise", hasBusiness: false, businesses: [] },
  { id: "house-8", block: "5", lot: "14", street: "Kagitingan", colorScheme: "Santan", hasBusiness: false, businesses: [] }
];

export const seedPosts: VillagePost[] = [
  { id: "post-1", category: "Water / Utilities", title: "Scheduled water interruption", body: "Please check the official notice for the affected areas and schedule. This is sample content for the starter site.", location: "Village-wide", author: "Village Admin", createdAt: "2h ago", comments: 8, type: "announcement" },
  { id: "post-2", category: "Garbage / Sanitation", title: "Garbage collection schedule update", body: "Residents can use this topic to share collection reminders and ask sanitation-related questions.", location: "All blocks", author: "Sanitation Committee", createdAt: "Yesterday", comments: 12, type: "announcement" },
  { id: "post-3", category: "Transportation", title: "Carpool to Dasmariñas on weekdays", body: "Looking to coordinate a weekday carpool. Reply in the community thread to connect.", location: "Bayanihan St.", author: "Resident", createdAt: "12m ago", comments: 5, type: "post" },
  { id: "post-4", category: "House Improvements", title: "Looking for a reliable electrician", body: "Can anyone recommend a trusted electrician who serves the village?", location: "Blk 15 Lot 41", author: "Resident", createdAt: "25m ago", comments: 3, type: "post" },
  { id: "post-5", category: "School", title: "LF: Tutor for Grade 3", body: "Looking for recommendations for a tutor near the village.", location: "Village-wide", author: "Resident", createdAt: "2h ago", comments: 4, type: "post" },
  { id: "post-6", category: "Food / Marketplace", title: "Selling: pre-loved study table", body: "Post an item, add photos, and arrange safe handover details privately.", location: "Blk 11", author: "Resident", createdAt: "3h ago", comments: 6, type: "post" }
];
