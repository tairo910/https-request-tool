import { useState } from 'react'
import { Bookmark, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { SavedAPI, RequestConfig } from '../types'
import { getSavedAPIs, deleteAPI, saveAPI } from '../utils/storage'

interface SavedAPIsProps {
  onLoadConfig: (config: RequestConfig) => void
}

export default function SavedAPIs({ onLoadConfig }: SavedAPIsProps) {
  const [savedAPIs, setSavedAPIs] = useState<SavedAPI[]>(getSavedAPIs())
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleDelete = (id: string) => {
    deleteAPI(id)
    setSavedAPIs(getSavedAPIs())
  }

  const handleLoad = (api: SavedAPI) => {
    onLoadConfig(api.config)
  }

  const handleEditStart = (api: SavedAPI) => {
    setEditingId(api.id)
    setEditName(api.name)
  }

  const handleEditSave = (id: string) => {
    if (editName.trim()) {
      const updated = savedAPIs.map((api) =>
        api.id === id ? { ...api, name: editName.trim() } : api
      )
      localStorage.setItem('saved_apis', JSON.stringify(updated))
      setSavedAPIs(updated)
    }
    setEditingId(null)
    setEditName('')
  }

  const handleAddCurrent = () => {
    const name = prompt('请输入接口名称：')
    if (name) {
      const currentConfig = JSON.parse(localStorage.getItem('current_config') || '{}')
      if (currentConfig.url) {
        const newAPI: SavedAPI = {
          id: Date.now().toString(),
          name,
          config: {
            url: currentConfig.url || '',
            method: (currentConfig.method as RequestConfig['method']) || 'GET',
            headers: currentConfig.headers || {},
            body: currentConfig.body || '',
            timeout: currentConfig.timeout || 30000,
          },
          createdAt: Date.now(),
        }
        saveAPI(newAPI)
        setSavedAPIs(getSavedAPIs())
      }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bookmark size={16} className="text-blue-600" />
          <span className="font-medium text-gray-700">已保存的接口</span>
          <span className="text-xs text-gray-500">({savedAPIs.length})</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {savedAPIs.map((api) => (
            <div
              key={api.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {editingId === api.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleEditSave(api.id)}
                  />
                  <button
                    onClick={() => handleEditSave(api.id)}
                    className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditName('')
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 cursor-pointer" onClick={() => handleLoad(api)}>
                    <p className="font-medium text-gray-700 text-sm">
                      {api.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {api.config.method} {api.config.url}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(api.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditStart(api)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(api.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {savedAPIs.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              暂无保存的接口
              <button
                onClick={handleAddCurrent}
                className="block w-full mt-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                保存当前配置
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
