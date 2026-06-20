export type GarmentCategory = "tops" | "bottoms" | "one-pieces";

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  imageUrl: string;
  description: string;
}

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  tops: "Top",
  bottoms: "Bottom",
  "one-pieces": "One Piece",
};

export const CATEGORY_COLORS: Record<GarmentCategory, string> = {
  tops: "bg-blue-100 text-blue-700",
  bottoms: "bg-amber-100 text-amber-700",
  "one-pieces": "bg-rose-100 text-rose-700",
};

const CDN = "?w=480&h=600&fit=crop&auto=format";

export const sampleGarments: Garment[] = [
  {
    id: "1",
    name: "Cream Knit Sweater",
    category: "tops",
    imageUrl: `https://images.unsplash.com/photo-1621198059871-0d5f9b449233${CDN}`,
    description: "Cozy oversized knit pullover",
  },
  {
    id: "2",
    name: "Blue Denim Jeans",
    category: "bottoms",
    imageUrl: `https://images.unsplash.com/photo-1617178388553-a9d022974a5c${CDN}`,
    description: "Classic straight-fit blue denim",
  },
  {
    id: "3",
    name: "Yellow Graphic Tee",
    category: "tops",
    imageUrl: `https://images.unsplash.com/photo-1696086152504-4843b2106ab4${CDN}`,
    description: "Relaxed cotton graphic t-shirt",
  },
  {
    id: "4",
    name: "Pink Tie Blouse",
    category: "tops",
    imageUrl: `https://images.unsplash.com/photo-1777462985111-9da64fb2e6e6${CDN}`,
    description: "Light pink blouse with tie waist",
  },
  {
    id: "5",
    name: "Floral Strap Top",
    category: "tops",
    imageUrl: `https://images.unsplash.com/photo-1584061516874-ed56f46d8e13${CDN}`,
    description: "Black & white floral spaghetti strap",
  },
  {
    id: "6",
    name: "Classic Black Tee",
    category: "tops",
    imageUrl: `https://images.unsplash.com/photo-1696086152513-c74dc1d4b135${CDN}`,
    description: "Essential everyday black t-shirt",
  },
];

export function getGarmentById(id: string): Garment | undefined {
  return sampleGarments.find((g) => g.id === id);
}
