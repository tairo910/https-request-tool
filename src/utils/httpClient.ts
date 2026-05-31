import axios, { AxiosResponse, CancelTokenSource } from 'axios'
import type { RequestConfig, ResponseData } from '../types'

let cancelSource: CancelTokenSource | null = null

export const sendRequest = async (
  config: RequestConfig
): Promise<ResponseData> => {
  if (cancelSource) {
    cancelSource.cancel('Request cancelled')
  }

  cancelSource = axios.CancelToken.source()

  const startTime = Date.now()

  try {
    const response: AxiosResponse = await axios({
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.body ? JSON.parse(config.body) : undefined,
      timeout: config.timeout,
      cancelToken: cancelSource.token,
      validateStatus: () => true,
    })

    const responseTime = Date.now() - startTime

    const headers: Record<string, string> = {}
    response.headers.forEach((value: string, key: string) => {
      headers[key] = value
    })

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body: response.data,
      time: responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (axios.isCancel(error)) {
      throw new Error('Request cancelled')
    }

    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: null,
      time: responseTime,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const cancelRequest = (): void => {
  if (cancelSource) {
    cancelSource.cancel('Request cancelled by user')
    cancelSource = null
  }
}
