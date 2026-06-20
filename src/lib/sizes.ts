export interface SizeMeasurements {
  chest?: number;   // cm
  waist?: number;   // cm
  hips?: number;    // cm
  inseam?: number;  // cm
}

const LETTER_SIZES: Record<string, SizeMeasurements> = {
  XS:    { chest: 82,  waist: 62,  hips: 88 },
  S:     { chest: 88,  waist: 68,  hips: 94 },
  M:     { chest: 96,  waist: 76,  hips: 102 },
  L:     { chest: 104, waist: 84,  hips: 110 },
  XL:    { chest: 112, waist: 92,  hips: 118 },
  "2XL": { chest: 120, waist: 100, hips: 126 },
};

const NUMERIC_SIZES: Record<string, SizeMeasurements> = {
  "24": { waist: 61, inseam: 76 },
  "26": { waist: 66, inseam: 76 },
  "28": { waist: 71, inseam: 76 },
  "30": { waist: 76, inseam: 76 },
  "32": { waist: 81, inseam: 76 },
  "34": { waist: 86, inseam: 76 },
  "36": { waist: 91, inseam: 76 },
};

export function getSizeMeasurements(size: string): SizeMeasurements | null {
  return LETTER_SIZES[size] ?? NUMERIC_SIZES[size] ?? null;
}

export function buildBodyContext(opts: {
  size?: string;
  height?: number;
  weight?: number;
  age?: number;
}): string {
  const { size, height, weight, age } = opts;
  const lines: string[] = [];

  if (size) {
    const m = getSizeMeasurements(size);
    if (m) {
      const details: string[] = [`Size ${size}`];
      if (m.chest)  details.push(`chest ${m.chest}cm`);
      if (m.waist)  details.push(`waist ${m.waist}cm`);
      if (m.hips)   details.push(`hips ${m.hips}cm`);
      if (m.inseam) details.push(`inseam ${m.inseam}cm`);
      lines.push(details.join(", "));
    } else {
      lines.push(`Size ${size}`);
    }
  }

  if (height) lines.push(`Height ${height} cm`);
  if (weight) lines.push(`Weight ${weight} kg`);
  if (age)    lines.push(`Age ~${age} years`);

  return lines.join(" | ");
}
