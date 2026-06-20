import { GoogleGenerativeAI } from "@google/generative-ai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { buildBodyContext } from "~/lib/sizes";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

async function imageToBase64(image: string): Promise<{ data: string; mimeType: string }> {
  // base64 data URI
  if (image.startsWith("data:")) {
    const semi = image.indexOf(";");
    const comma = image.indexOf(",");
    return { data: image.slice(comma + 1), mimeType: image.slice(5, semi) };
  }

  // local public file — read from disk to avoid server-side fetch of relative URLs
  if (image.startsWith("/")) {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const filePath = join(process.cwd(), "public", image);
    const buf = await readFile(filePath);
    const ext = image.split(".").pop()?.toLowerCase() ?? "jpg";
    return { data: buf.toString("base64"), mimeType: MIME[ext] ?? "image/jpeg" };
  }

  // external URL (Unsplash etc.)
  const res = await fetch(image);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${image}`);
  const buf = await res.arrayBuffer();
  const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  return { data: Buffer.from(buf).toString("base64"), mimeType };
}

export const tryonRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        modelImage: z.string().min(1),
        garmentImage: z.string().min(1),
        garmentName: z.string().optional(),
        garmentDescription: z.string().optional(),
        isLayering: z.boolean().optional(),
        selectedSize: z.string().optional(),
        height: z.number().optional(),  // cm
        weight: z.number().optional(),  // kg
        age: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_KEY);

      let personImg: { data: string; mimeType: string };
      let garmentImg: { data: string; mimeType: string };
      try {
        [personImg, garmentImg] = await Promise.all([
          imageToBase64(input.modelImage),
          imageToBase64(input.garmentImage),
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error cargando imagen: ${msg}` });
      }

      // Step 1: describe both person and garment in parallel for accurate text-guided generation
      const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const [personDescResult, garmentDescResult] = await Promise.allSettled([
        textModel.generateContent([
          { inlineData: { data: personImg.data, mimeType: personImg.mimeType } },
          `Describe this person for image generation. Be extremely specific:
- Hair: exact color, length, texture (e.g. "long straight black hair")
- Skin tone (e.g. "light olive", "dark brown", "fair")
- Face shape and notable features briefly
- Body type and posture
- Exact pose (e.g. "standing, hands on hips, facing camera, slight smile")
- Background (color, setting)
Output as a single dense paragraph. No opinions.`,
        ]),
        textModel.generateContent([
          { inlineData: { data: garmentImg.data, mimeType: garmentImg.mimeType } },
          `This is a product photo of: "${input.garmentName ?? "a clothing item"}".
Your task: describe ONLY the "${input.garmentName ?? "clothing item"}" itself. This photo may show a model wearing a complete outfit — IGNORE everything else and focus exclusively on the product being sold.

Describe the "${input.garmentName ?? "garment"}" with extreme precision:
- Exact garment type (what it is)
- Sleeve type (ONLY if it has sleeves): one of: sleeveless / cap sleeves / short sleeves / 3/4 sleeves / long sleeves / puff sleeves
- Neckline or waistband style
- Length (mini / knee / midi / maxi / full-length)
- Silhouette/fit (fitted / slim / regular / relaxed / wide-leg / A-line / flared / straight)
- Exact color and pattern (be precise: e.g. "navy blue with thin white horizontal stripes")
- Only visible attached details: buttons, zipper, pockets, collar, belt loops, suspenders, etc.
Output as one dense paragraph. Do NOT describe shoes, bags, jewelry, or any other garment not called "${input.garmentName ?? "this item"}".`,
        ]),
      ]);

      const personDesc =
        personDescResult.status === "fulfilled"
          ? personDescResult.value.response.text().trim()
          : "a person";
      const garmentDesc =
        garmentDescResult.status === "fulfilled"
          ? garmentDescResult.value.response.text().trim()
          : input.garmentDescription ?? "a clothing item";

      // Step 2: generate try-on image using the image generation model
      const imageModel = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-image",
        generationConfig: {
          // @ts-expect-error responseModalities not yet in type definitions
          responseModalities: ["IMAGE", "TEXT"],
        },
      });

      const bodyContext = buildBodyContext({
        size: input.selectedSize,
        height: input.height,
        weight: input.weight,
        age: input.age,
      });

      const fitNote = bodyContext
        ? `\nGARMENT SIZE & BODY: ${bodyContext}. Show how the garment fits these exact proportions — adjust drape, tightness, and length accordingly.`
        : "";

      const garmentLabel = input.garmentName ? `"${input.garmentName}"` : "the garment";

      const prompt = input.isLayering
        ? `TASK: Add ${garmentLabel} to a person who is already wearing an outfit.

CURRENT LOOK: ${personDesc}

${garmentLabel.toUpperCase()} TO ADD: ${garmentDesc}${fitNote}

CRITICAL RULES:
- Keep ALL existing clothing from the current look EXACTLY as shown — do not remove, replace, or alter any item already worn
- Add ONLY the ${garmentLabel} described above — nothing else from the product photo
- The product photo may show a full outfit on a model: extract and apply ONLY the ${garmentLabel}, ignore all other clothing visible in that photo
- If ${garmentLabel} is pants/skirt: layer below existing top, both visible
- If ${garmentLabel} is outerwear: layer over all existing clothes
- Preserve the person's face, hair, skin tone exactly
- Same pose and background as the current look
- Photorealistic fashion photography, ONE image only, no collage`
        : `Generate a single photorealistic fashion photo.

SUBJECT — copy this person exactly:
${personDesc}

GARMENT — dress the subject ONLY in ${garmentLabel}:
${garmentDesc}${fitNote}

CRITICAL RULES:
- Dress the subject ONLY in the ${garmentLabel} described above
- The product photo may show a model wearing a full outfit: extract and use ONLY the ${garmentLabel}, do NOT copy any other clothing from that photo
- The subject's face, hair, skin tone, and body must match the SUBJECT description precisely
- The ${garmentLabel} must match the GARMENT description precisely — same exact sleeves, color, pattern, and length
- Same pose and background as described for the subject
- Professional fashion photography, clean lighting
- ONE image only, no collage, no side-by-side, do NOT show any other person`;


      let result;
      try {
        result = await imageModel.generateContent([
          { inlineData: { data: personImg.data, mimeType: personImg.mimeType } },
          { inlineData: { data: garmentImg.data, mimeType: garmentImg.mimeType } },
          prompt,
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("[tryon] Gemini error:", msg);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gemini error: ${msg}`,
        });
      }

      // Extract image from response parts
      const parts = result.response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData?.data);

      if (!imagePart?.inlineData) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No image returned from Gemini. Try a different photo.",
        });
      }

      const { data, mimeType } = imagePart.inlineData;
      return { imageUrl: `data:${mimeType};base64,${data}` };
    }),
});
