export interface SampleModel {
  id: string;
  name: string;
  imageUrl: string;
}

const CDN = "?w=600&h=900&fit=crop&auto=format";

export const sampleModels: SampleModel[] = [
  {
    id: "m1",
    name: "Model 1",
    imageUrl: `https://images.unsplash.com/photo-1657815929003-b97cc426cb3d${CDN}`,
  },
  {
    id: "m2",
    name: "Model 2",
    imageUrl: `https://images.unsplash.com/photo-1659522761084-79196b64abe4${CDN}`,
  },
  {
    id: "m3",
    name: "Model 3",
    imageUrl: `https://images.unsplash.com/photo-1562894369-193bedce28e3${CDN}`,
  },
  {
    id: "m4",
    name: "Model 4",
    imageUrl: `https://images.unsplash.com/photo-1701318226934-50170be1eb19${CDN}`,
  },
  {
    id: "m5",
    name: "Model 5",
    imageUrl: `https://images.unsplash.com/photo-1645819133607-cd84092bee6f${CDN}`,
  },
  {
    id: "m6",
    name: "Model 6",
    imageUrl: `https://images.unsplash.com/photo-1617690032354-34273b431955${CDN}`,
  },
];
