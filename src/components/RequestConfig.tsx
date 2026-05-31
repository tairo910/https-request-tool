import { Send, Square, Save, RotateCcw, FileText } from 'lucide-react'
import type { RequestConfig as RequestConfigType, HttpMethod } from '../types'
import RequestHeaders from './RequestHeaders'
import RequestBody from './RequestBody'

interface RequestConfigProps {
  config: RequestConfigType
  onConfigChange: (config: RequestConfigType) => void
  onSend: () => void
  onCancel: () => void
  onSave: () => void
  onResetDefault: () => void
  loading: boolean
}

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export default function RequestConfig({
  config,
  onConfigChange,
  onSend,
  onCancel,
  onSave,
  onResetDefault,
  loading,
}: RequestConfigProps) {
  const handleUrlChange = (value: string) => {
    onConfigChange({ ...config, url: value })
  }

  const handleMethodChange = (method: HttpMethod) => {
    onConfigChange({ ...config, method })
  }

  const handleHeadersChange = (headers: Record<string, string>) => {
    onConfigChange({ ...config, headers })
  }

  const handleBodyChange = (body: string) => {
    onConfigChange({ ...config, body })
  }

  const handleTimeoutChange = (value: string) => {
    const timeout = parseInt(value) || 30000
    onConfigChange({ ...config, timeout })
  }

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(config.method)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <select
              value={config.method}
              onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
              className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {methods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={config.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="请输入请求URL..."
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => handleTimeoutChange(e.target.value)}
              placeholder="超时(ms)"
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">请求头</span>
          </div>
          <div className="p-4">
            <RequestHeaders headers={config.headers} onHeadersChange={handleHeadersChange} />
          </div>
        </div>

        {isBodyMethod && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">请求体</span>
            </div>
            <div className="p-4">
              <RequestBody body={config.body} onBodyChange={handleBodyChange} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onConfigChange({
                url: '',
                method: 'GET',
                headers: {},
                body: '',
                timeout: 30000,
              })
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RotateCcw size={14} />
            重置
          </button>
          <button
            onClick={onResetDefault}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            <FileText size={14} />
            重置模板
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={loading || !config.url}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={14} />
            保存配置
          </button>
          {loading ? (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-4 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <Square size={14} />
              取消
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!config.url}
              className="flex items-center gap-1 px-4 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
              发送请求
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
