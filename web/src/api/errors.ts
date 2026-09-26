import { ApiRequestError } from './client'

export function requestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return 'Your session has expired. Keep a copy of any unsaved text, then sign out and sign in again.'
    if (error.status === 404) return 'This record is no longer available. Return to the inbox and refresh.'
    if (error.status === 429) return 'Too many requests. Please wait a moment and try again.'
    if (error.status === null) return 'Unable to reach the server. Check your connection and try again. Any entered text is still available.'
  }
  return fallback
}
