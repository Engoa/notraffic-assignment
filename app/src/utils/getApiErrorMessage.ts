import { ApiError } from "@/types/api-error"

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message

  return "An error occurred, please try again later."
}
