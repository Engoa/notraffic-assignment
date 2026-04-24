import { z } from "zod"

const polygonNameSchema = z
  .string()
  .trim()
  .min(1, "Polygon name is required.")
  .max(80, "Polygon name must be 80 characters or fewer.")

const polygonColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid hex color.")
  .transform((value) => value.toUpperCase())

export const polygonDraftSchema = z.object({
  name: polygonNameSchema,
  color: polygonColorSchema,
})

export const updatePolygonSchema = z.object({
  name: polygonNameSchema,
  color: polygonColorSchema,
})
