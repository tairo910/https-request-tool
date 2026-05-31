import type { SavedAPI, RequestHistoryItem } from '../types'

const SAVED_APIS_KEY = 'saved_apis'
const HISTORY_KEY = 'request_history'
const MAX_HISTORY = 50

export const getSavedAPIs = (): SavedAPI[] => {
  try {
    const data = localStorage.getItem(SAVED_APIS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveAPI = (api: SavedAPI): void => {
  const apis = getSavedAPIs()
  apis.push(api)
  localStorage.setItem(SAVED_APIS_KEY, JSON.stringify(apis))
}

export const deleteAPI = (id: string): void => {
  const apis = getSavedAPIs().filter((api) => api.id !== id)
  localStorage.setItem(SAVED_APIS_KEY, JSON.stringify(apis))
}

export const getHistory = (): RequestHistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const addToHistory = (item: RequestHistoryItem): void => {
  const history = getHistory()
  history.unshift(item)
  const trimmed = history.slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
}

export const clearHistory = (): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
}
