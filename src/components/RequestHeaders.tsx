import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface RequestHeadersProps {
  headers: Record<string, string>
  onHeadersChange: (headers: Record<string, string>) => void
}

export default function RequestHeaders({ headers, onHeadersChange }: RequestHeadersProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAddHeader = () => {
    if (newKey.trim()) {
      onHeadersChange({ ...headers, [newKey.trim()]: newValue.trim() })
      setNewKey('')
      setNewValue('')
    }
  }

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[key]
    onHeadersChange(newHeaders)
  }

  const handleHeaderChange = (key: string, value: string) => {
    onHeadersChange({ ...headers, [key]: value })
  }

  const handleKeyRename = (oldKey: string, newKey: string) => {
    if (newKey.trim() && newKey !== oldKey) {
      const newHeaders = { ...headers }
      newHeaders[newKey.trim()] = newHeaders[oldKey]
      delete newHeaders[oldKey]
      onHeadersChange(newHeaders)
    }
  }

  return (
    <div className="space-y-2">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyRename(key, e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Key"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleHeaderChange(key, e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Value"
          />
          <button
            onClick={() => handleRemoveHeader(key)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="添加请求头 Key"
          onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Value"
          onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
        />
        <button
          onClick={handleAddHeader}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      {Object.keys(headers).length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">暂无请求头，点击上方添加</p>
      )}
    </div>
  )
}
