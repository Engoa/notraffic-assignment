import { type ApiErrorResponse, ApiError } from "@/types/api-error"
import { type Options, HTTPError } from "ky"
import { kyInstance } from "./instance"

export async function requestJson<T>(
  input: string,
  init?: Options
): Promise<T> {
  try {
    return await kyInstance(input, init).json<T>()
  } catch (error) {
    if (error instanceof HTTPError) {
      let payload: ApiErrorResponse | undefined

      try {
        // `json()` consumes the body, so clone before reading the API error payload.
        payload = (await error.response.clone().json()) as ApiErrorResponse
      } catch {
        payload = undefined
      }

      throw new ApiError(
        payload?.message || error.message || "Request failed",
        payload,
        error.response.status
      )
    }

    if (error instanceof Error) {
      throw new ApiError("Couldn't reach the API. Check that it's running.")
    }

    throw new ApiError("Couldn't reach the API. Check that it's running.")
  }
}
