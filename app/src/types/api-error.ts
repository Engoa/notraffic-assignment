export type ApiErrorResponse = {
  code?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  code?: string
  details?: unknown
  status?: number

  constructor(message: string, payload?: ApiErrorResponse, status?: number) {
    super(message)
    this.name = "ApiError"
    this.code = payload?.code
    this.details = payload?.details
    this.status = status
  }
}
