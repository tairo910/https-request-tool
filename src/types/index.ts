export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestConfig {
  url: string
  method: HttpMethod
  headers: Record<string, string>
  body: string
  timeout: number
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  time: number
  error?: string
}

export interface SavedAPI {
  id: string
  name: string
  config: RequestConfig
  createdAt: number
}

export interface RequestHistoryItem {
  id: string
  config: RequestConfig
  response: ResponseData | null
  timestamp: number
}
