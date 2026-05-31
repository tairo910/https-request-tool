import { useState } from 'react'
import { Settings, Plus, X, ChevronDown, ChevronUp, Globe, Edit2 } from 'lucide-react'

interface Environment {
  id: string
  name: string
  baseUrl: string
  headers: Record<string, string>
  timeout: number
}

interface EnvironmentConfigProps {
  onEnvironmentChange: (env: Environment | null) => void
  currentEnv: Environment | null
}

const defaultEnvironments: Environment[] = [
  {
    id: 'test',
    name: '测试环境',
    baseUrl: 'https://testgate.pay.sina.com.cn',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    timeout: 30000,
  },
  {
    id: 'prod',
    name: '生产环境',
    baseUrl: 'https://gate.pay.sina.com.cn',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    timeout: 30000,
  },
]

export default function EnvironmentConfig({ onEnvironmentChange, currentEnv }: EnvironmentConfigProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [environments, setEnvironments] = useState<Environment[]>(() => {
    const saved = localStorage.getItem('environments')
    return saved ? JSON.parse(saved) : defaultEnvironments
  })
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editEnv, setEditEnv] = useState<Environment | null>(null)
  const [newEnv, setNewEnv] = useState<Omit<Environment, 'id'>>({
    name: '',
    baseUrl: '',
    headers: {},
    timeout: 30000,
  })
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  const saveEnvironments = (newEnvs: Environment[]) => {
    setEnvironments(newEnvs)
    localStorage.setItem('environments', JSON.stringify(newEnvs))
  }

  const handleSelectEnv = (env: Environment) => {
    onEnvironmentChange(env)
  }

  const handleOpenAddModal = () => {
    setIsEditing(false)
    setNewEnv({ name: '', baseUrl: '', headers: {}, timeout: 30000 })
    setNewHeaderKey('')
    setNewHeaderValue('')
    setShowModal(true)
  }

  const handleOpenEditModal = (env: Environment) => {
    setIsEditing(true)
    setEditEnv(env)
    setNewHeaderKey('')
    setNewHeaderValue('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditEnv(null)
    setIsEditing(false)
  }

  const handleAddEnv = () => {
    if (newEnv.name && newEnv.baseUrl) {
      const env: Environment = {
        ...newEnv,
        id: Date.now().toString(),
      }
      saveEnvironments([...environments, env])
      handleCloseModal()
    }
  }

  const handleSaveEdit = () => {
    if (editEnv) {
      const updated = environments.map((e) => (e.id === editEnv.id ? editEnv : e))
      saveEnvironments(updated)
      if (currentEnv?.id === editEnv.id) {
        onEnvironmentChange(editEnv)
      }
      handleCloseModal()
    }
  }

  const handleDeleteEnv = (id: string) => {
    if (confirm('确定删除该环境吗？')) {
      const filtered = environments.filter((e) => e.id !== id)
      saveEnvironments(filtered)
      if (currentEnv?.id === id) {
        onEnvironmentChange(null)
      }
    }
  }

  const handleAddHeader = (env: Environment | Omit<Environment, 'id'>) => {
    if (newHeaderKey.trim()) {
      const updatedHeaders = { ...env.headers, [newHeaderKey.trim()]: newHeaderValue.trim() }
      if (editEnv) {
        setEditEnv({ ...editEnv, headers: updatedHeaders })
      } else {
        setNewEnv({ ...newEnv, headers: updatedHeaders })
      }
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const handleRemoveHeader = (env: Environment | Omit<Environment, 'id'>, key: string) => {
    const updatedHeaders = { ...env.headers }
    delete updatedHeaders[key]
    if (editEnv) {
      setEditEnv({ ...editEnv, headers: updatedHeaders })
    } else {
      setNewEnv({ ...newEnv, headers: updatedHeaders })
    }
  }

  const handleClearEnv = () => {
    onEnvironmentChange(null)
  }

  const currentFormData = isEditing && editEnv ? editEnv : newEnv

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-blue-600" />
            <span className="font-medium text-gray-700">环境配置</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded && (
          <div className="p-4">
            <div className="space-y-2">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentEnv?.id === env.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectEnv(env)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-blue-500" />
                      <span className="font-medium text-gray-700">{env.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditModal(env)
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEnv(env.id)
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{env.baseUrl}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    超时: {env.timeout}ms | 请求头: {Object.keys(env.headers).length} 个
                  </p>
                </div>
              ))}
              {environments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">暂无环境配置</p>
              )}
              {currentEnv && (
                <button
                  onClick={handleClearEnv}
                  className="w-full mt-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  清除当前环境
                </button>
              )}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="w-full mt-4 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              添加环境
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-700">
                {isEditing ? '编辑环境' : '添加环境'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">环境名称</label>
                <input
                  type="text"
                  value={currentFormData.name}
                  onChange={(e) => {
                    if (editEnv) {
                      setEditEnv({ ...editEnv, name: e.target.value })
                    } else {
                      setNewEnv({ ...newEnv, name: e.target.value })
                    }
                  }}
                  placeholder="如：测试环境"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">基础URL</label>
                <input
                  type="url"
                  value={currentFormData.baseUrl}
                  onChange={(e) => {
                    if (editEnv) {
                      setEditEnv({ ...editEnv, baseUrl: e.target.value })
                    } else {
                      setNewEnv({ ...newEnv, baseUrl: e.target.value })
                    }
                  }}
                  placeholder="如：https://api.example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">超时时间(ms)</label>
                <input
                  type="number"
                  value={currentFormData.timeout}
                  onChange={(e) => {
                    const timeout = parseInt(e.target.value) || 30000
                    if (editEnv) {
                      setEditEnv({ ...editEnv, timeout })
                    } else {
                      setNewEnv({ ...newEnv, timeout })
                    }
                  }}
                  placeholder="30000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">默认请求头</label>
                <div className="space-y-2">
                  {Object.entries(currentFormData.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...currentFormData.headers }
                          delete newHeaders[key]
                          newHeaders[e.target.value] = value
                          if (editEnv) {
                            setEditEnv({ ...editEnv, headers: newHeaders })
                          } else {
                            setNewEnv({ ...newEnv, headers: newHeaders })
                          }
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const updatedHeaders = { ...currentFormData.headers, [key]: e.target.value }
                          if (editEnv) {
                            setEditEnv({ ...editEnv, headers: updatedHeaders })
                          } else {
                            setNewEnv({ ...newEnv, headers: updatedHeaders })
                          }
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => handleRemoveHeader(currentFormData, key)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      placeholder="Header Key"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddHeader(currentFormData)}
                    />
                    <input
                      type="text"
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      placeholder="Header Value"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddHeader(currentFormData)}
                    />
                    <button
                      onClick={() => handleAddHeader(currentFormData)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              {isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  保存修改
                </button>
              ) : (
                <button
                  onClick={handleAddEnv}
                  disabled={!newEnv.name || !newEnv.baseUrl}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  添加
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
