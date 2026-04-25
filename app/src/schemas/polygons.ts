import { z } from "zod"

export const polygonFormSchema = z.object({
  name: z.string().trim().min(1, "Polygon name is required.").max(80, "Polygon name must be 80 characters or fewer."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid hex color.")
    .transform((value) => value.toUpperCase()),
})

export type PolygonForm = z.infer<typeof polygonFormSchema>
