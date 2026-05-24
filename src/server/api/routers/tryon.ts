import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

const FASHN_BASE = "https://api.fashn.ai/v1";

interface FashnRunResponse {
  id?: string;
  error?: string;
}

interface FashnStatusResponse {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  output?: string[];
  error?: string;
}

export const tryonRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        modelImage: z.string().min(1),
        garmentImage: z.string().min(1),
        category: z.enum(["tops", "bottoms", "one-pieces"]),
      }),
    )
    .mutation(async ({ input }) => {
      const startRes = await fetch(`${FASHN_BASE}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.FASHN_API_KEY}`,
        },
        body: JSON.stringify({
          model_image: input.modelImage,
          garment_image: input.garmentImage,
          category: input.category,
        }),
      });

      if (!startRes.ok) {
        const body = await startRes.text();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Fashn API error (${startRes.status}): ${body}`,
        });
      }

      const startData = (await startRes.json()) as FashnRunResponse;

      if (startData.error ?? !startData.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: startData.error ?? "No prediction ID returned from Fashn",
        });
      }

      const predictionId = startData.id!;

      // Poll for result — max 60 seconds
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await fetch(
          `${FASHN_BASE}/status/${predictionId}`,
          { headers: { Authorization: `Bearer ${env.FASHN_API_KEY}` } },
        );

        const statusData = (await statusRes.json()) as FashnStatusResponse;

        if (statusData.status === "completed" && statusData.output?.[0]) {
          return { imageUrl: statusData.output[0] };
        }

        if (statusData.status === "failed") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: statusData.error ?? "Try-on generation failed",
          });
        }
      }

      throw new TRPCError({
        code: "TIMEOUT",
        message: "Try-on generation timed out after 60s. Please try again.",
      });
    }),
});
