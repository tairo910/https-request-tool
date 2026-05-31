import { useState } from 'react'
import { Copy, Check, Clock, AlertCircle } from 'lucide-react'
import type { ResponseData } from '../types'

interface ResponsePanelProps {
  response: ResponseData | null
  error: string | null
}

export default function ResponsePanel({ response, error }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (response?.body) {
      const text = typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100'
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-100'
    if (status >= 400) return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (!response && !error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <p className="text-lg font-medium">发送请求后查看响应结果</p>
          <p className="text-sm mt-1">输入URL并点击"发送请求"按钮</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response?.status || 0)}`}>
              {response?.status || '--'} {response?.statusText || ''}
            </div>
            {response && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} />
                <span>{response.time}ms</span>
              </div>
            )}
          </div>
          {response && response.body !== null && response.body !== undefined && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={14} />
                  复制响应体
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'headers'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              响应头
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'body'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              响应体
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'headers' && response && (
              <div className="space-y-1">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}
                {Object.keys(response.headers).length === 0 && (
                  <p className="text-sm text-gray-400">暂无响应头</p>
                )}
              </div>
            )}
            {activeTab === 'body' && response && (
              <pre className="whitespace-pre-wrap break-all text-sm font-mono text-gray-800 max-h-96 overflow-auto scrollbar-thin">
                {typeof response.body === 'string' ? (
                  response.body
                ) : (
                  JSON.stringify(response.body, null, 2)
                )}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}
