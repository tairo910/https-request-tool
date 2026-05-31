import { useState, useCallback } from 'react'
import type { RequestConfig, ResponseData } from '../types'
import { sendRequest, cancelRequest } from '../utils/httpClient'
import { addToHistory } from '../utils/storage'

export const useHttpRequest = () => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (config: RequestConfig) => {
      setLoading(true)
      setResponse(null)
      setError(null)

      try {
        const result = await sendRequest(config)
        
        const historyItem = {
          id: Date.now().toString(),
          config,
          response: result,
          timestamp: Date.now(),
        }
        addToHistory(historyItem)

        setResponse(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const cancel = useCallback(() => {
    cancelRequest()
    setLoading(false)
    setError('Request cancelled')
  }, [])

  return { loading, response, error, execute, cancel }
}
