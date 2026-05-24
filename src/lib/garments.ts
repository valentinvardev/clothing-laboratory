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

export const sampleGarments: Garment[] = [
  {
    id: "1",
    name: "Classic White Tee",
    category: "tops",
    imageUrl:
      "https://placehold.co/400x500/f8fafc/475569?text=White+T-Shirt",
    description: "Essential everyday crew neck tee",
  },
  {
    id: "2",
    name: "Slim Black Jeans",
    category: "bottoms",
    imageUrl:
      "https://placehold.co/400x500/1e293b/94a3b8?text=Black+Jeans",
    description: "Versatile slim-fit denim",
  },
  {
    id: "3",
    name: "Floral Sundress",
    category: "one-pieces",
    imageUrl:
      "https://placehold.co/400x500/fdf4ff/a21caf?text=Floral+Dress",
    description: "Light summer floral pattern",
  },
  {
    id: "4",
    name: "Oversized Hoodie",
    category: "tops",
    imageUrl:
      "https://placehold.co/400x500/f1f5f9/475569?text=Grey+Hoodie",
    description: "Cozy heavyweight fleece",
  },
  {
    id: "5",
    name: "Tailored Blazer",
    category: "tops",
    imageUrl:
      "https://placehold.co/400x500/1e3a5f/93c5fd?text=Navy+Blazer",
    description: "Smart navy single-button blazer",
  },
  {
    id: "6",
    name: "Linen Shorts",
    category: "bottoms",
    imageUrl:
      "https://placehold.co/400x500/fef9c3/92400e?text=Khaki+Shorts",
    description: "Relaxed summer linen shorts",
  },
  {
    id: "7",
    name: "Little Black Dress",
    category: "one-pieces",
    imageUrl:
      "https://placehold.co/400x500/171717/a3a3a3?text=Black+Dress",
    description: "Timeless evening mini dress",
  },
  {
    id: "8",
    name: "Denim Jacket",
    category: "tops",
    imageUrl:
      "https://placehold.co/400x500/dbeafe/1d4ed8?text=Denim+Jacket",
    description: "Classic light-wash denim jacket",
  },
];

export function getGarmentById(id: string): Garment | undefined {
  return sampleGarments.find((g) => g.id === id);
}
