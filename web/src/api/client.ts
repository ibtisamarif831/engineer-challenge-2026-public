import { API_URL } from '../config'

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string
  body?: unknown
}

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number | null) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

async function request(path: string, options: RequestOptions): Promise<Response> {
  const { token, body, headers: suppliedHeaders, ...init } = options
  const headers = new Headers(suppliedHeaders)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (init.signal?.aborted) throw error
    throw new ApiRequestError('Unable to reach the server. Please try again.', null)
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data: unknown = await response.json()
      if (
        typeof data === 'object' && data !== null &&
        'error' in data && typeof data.error === 'string' && data.error.trim()
      ) {
        message = data.error
      }
    } catch {
      // Proxies and other intermediaries may return non-JSON error responses.
    }
    throw new ApiRequestError(message, response.status)
  }

  return response
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(path, options)
  try {
    return await response.json() as T
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiRequestError('The server returned an invalid JSON response.', response.status)
  }
}

export async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await request(path, options)
  try {
    return await response.blob()
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiRequestError('Unable to read the server response. Please try again.', response.status)
  }
}
