import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import type { RequestHistoryItem, RequestConfig } from '../types'
import { getHistory, clearHistory } from '../utils/storage'

interface RequestHistoryProps {
  onLoadConfig: (config: RequestConfig) => void
}

export default function RequestHistory({ onLoadConfig }: RequestHistoryProps) {
  const [history, setHistory] = useState<RequestHistoryItem[]>(getHistory())
  const [isExpanded, setIsExpanded] = useState(false)

  const handleLoad = (item: RequestHistoryItem) => {
    onLoadConfig(item.config)
  }

  const handleClear = () => {
    if (confirm('确定清空所有历史记录吗？')) {
      clearHistory()
      setHistory([])
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History size={16} className="text-purple-600" />
          <span className="font-medium text-gray-700">请求历史</span>
          <span className="text-xs text-gray-500">({history.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              清空
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100 max-h-64 overflow-auto scrollbar-thin">
          {history.map((item) => (
            <div
              key={item.id}
              className="px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleLoad(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    item.response?.status && item.response.status >= 200 && item.response.status < 300
                      ? 'bg-green-100 text-green-600'
                      : item.response?.status && item.response.status >= 400
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.response?.status || '--'}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {item.config.method}
                  </span>
                  <span className="text-sm text-gray-500 truncate flex-1 ml-2">
                    {item.config.url}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.response && (
                    <span className="text-xs text-gray-400">
                      {item.response.time}ms
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              暂无请求历史
            </div>
          )}
        </div>
      )}
    </div>
  )
}
