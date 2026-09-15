import { z } from "zod";

export const StartWorkSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const EndWorkSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});