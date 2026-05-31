import { useState } from 'react'
import { FolderOpen, X, Play, ChevronDown, ChevronRight, Trash2, Copy, FolderPlus, FilePlus, Edit2, Plus } from 'lucide-react'
import type { RequestConfig } from '../types'

interface TestCase {
  id: string
  name: string
  config: RequestConfig
}

interface TestFolder {
  id: string
  name: string
  testCases: TestCase[]
  isExpanded: boolean
}

interface TestCollectionData {
  id: string
  name: string
  description: string
  folders: TestFolder[]
  createdAt: number
}

interface TestCollectionProps {
  onLoadConfig: (config: RequestConfig) => void
  onExecute: (config: RequestConfig) => void
}

const defaultData: TestCollectionData[] = [
  {
    id: '1',
    name: '新浪支付接口测试',
    description: '新浪支付相关接口测试集合',
    folders: [
      {
        id: '1-1',
        name: '交易接口',
        isExpanded: true,
        testCases: [
          {
            id: '1-1-1',
            name: '创建交易订单',
            config: {
              url: 'https://testgate.pay.sina.com.cn/mgs/gateway.do',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                service: 'create_partner_trade_by_buyer',
                version: '1.0',
                partner_id: '2088002007018916',
                out_trade_no: 'TEST' + Date.now(),
                subject: '测试商品',
                price: '1.00',
                quantity: '1',
                payment_type: '1',
                return_url: 'http://www.example.com/return',
                notify_url: 'http://www.example.com/notify',
                sign_type: 'MD5',
                sign: '',
              }, null, 2),
              timeout: 30000,
            },
          },
        ],
      },
      {
        id: '1-2',
        name: '查询接口',
        isExpanded: false,
        testCases: [
          {
            id: '1-2-1',
            name: '查询订单状态',
            config: {
              url: 'https://testgate.pay.sina.com.cn/mgs/gateway.do',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                service: 'query_hosting_trade',
                version: '1.0',
                partner_id: '2088002007018916',
                out_trade_no: '',
                sign_type: 'MD5',
                sign: '',
              }, null, 2),
              timeout: 30000,
            },
          },
        ],
      },
    ],
    createdAt: Date.now(),
  },
]

export default function TestCollection({ onLoadConfig, onExecute }: TestCollectionProps) {
  const [collections, setCollections] = useState<TestCollectionData[]>(() => {
    const saved = localStorage.getItem('test_collections_v2')
    return saved ? JSON.parse(saved) : defaultData
  })
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolderTo, setAddingFolderTo] = useState<string | null>(null)
  const [newTestCaseName, setNewTestCaseName] = useState('')
  const [newTestCaseUrl, setNewTestCaseUrl] = useState('')
  const [addingTestCaseTo, setAddingTestCaseTo] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editCollection, setEditCollection] = useState<TestCollectionData | null>(null)
  const [newCollection, setNewCollection] = useState<Omit<TestCollectionData, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    folders: [],
  })

  const saveCollections = (newCollections: TestCollectionData[]) => {
    setCollections(newCollections)
    localStorage.setItem('test_collections_v2', JSON.stringify(newCollections))
  }

  const toggleFolder = (collectionId: string, folderId: string) => {
    const updated = collections.map((c) => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.map((f) =>
            f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
          ),
        }
      }
      return c
    })
    saveCollections(updated)
  }

  const handleOpenAddModal = () => {
    setIsEditing(false)
    setNewCollection({ name: '', description: '', folders: [] })
    setShowModal(true)
  }

  const handleOpenEditModal = (collection: TestCollectionData) => {
    setIsEditing(true)
    setEditCollection(collection)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditCollection(null)
    setIsEditing(false)
  }

  const handleAddCollection = () => {
    if (newCollection.name) {
      const collection: TestCollectionData = {
        ...newCollection,
        id: Date.now().toString(),
        createdAt: Date.now(),
      }
      saveCollections([...collections, collection])
      handleCloseModal()
    }
  }

  const handleSaveEdit = () => {
    if (editCollection) {
      const updated = collections.map((c) => (c.id === editCollection.id ? editCollection : c))
      saveCollections(updated)
      handleCloseModal()
    }
  }

  const handleDeleteCollection = (id: string) => {
    if (confirm('确定删除该测试集合吗？')) {
      saveCollections(collections.filter((c) => c.id !== id))
      if (activeCollectionId === id) {
        setActiveCollectionId(null)
      }
    }
  }

  const handleAddFolder = (collectionId: string) => {
    if (!newFolderName.trim()) return
    
    const newFolder: TestFolder = {
      id: `${collectionId}-${Date.now()}`,
      name: newFolderName.trim(),
      isExpanded: true,
      testCases: [],
    }

    const updated = collections.map((c) => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: [...c.folders, newFolder],
        }
      }
      return c
    })
    saveCollections(updated)
    setNewFolderName('')
    setAddingFolderTo(null)
  }

  const handleEditFolder = (_collectionId: string, folderId: string, currentName: string) => {
    setEditingFolderId(folderId)
    setEditingFolderName(currentName)
  }

  const handleSaveFolderName = (collectionId: string, folderId: string) => {
    if (!editingFolderName.trim()) return
    
    const updated = collections.map((c) => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.map((f) =>
            f.id === folderId ? { ...f, name: editingFolderName.trim() } : f
          ),
        }
      }
      return c
    })
    saveCollections(updated)
    setEditingFolderId(null)
    setEditingFolderName('')
  }

  const handleDeleteFolder = (collectionId: string, folderId: string) => {
    if (confirm('确定删除该文件夹及所有测试用例吗？')) {
      const updated = collections.map((c) => {
        if (c.id === collectionId) {
          return {
            ...c,
            folders: c.folders.filter((f) => f.id !== folderId),
          }
        }
        return c
      })
      saveCollections(updated)
    }
  }

  const handleAddTestCase = (collectionId: string, folderId: string) => {
    if (!newTestCaseName.trim() || !newTestCaseUrl.trim()) return

    const testCase: TestCase = {
      id: `${folderId}-${Date.now()}`,
      name: newTestCaseName.trim(),
      config: {
        url: newTestCaseUrl.trim(),
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          service: '',
          version: '1.0',
          partner_id: '',
          sign_type: 'MD5',
          sign: '',
        }, null, 2),
        timeout: 30000,
      },
    }

    const updated = collections.map((c) => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.map((f) =>
            f.id === folderId ? { ...f, testCases: [...f.testCases, testCase] } : f
          ),
        }
      }
      return c
    })
    saveCollections(updated)
    setNewTestCaseName('')
    setNewTestCaseUrl('')
    setAddingTestCaseTo(null)
  }

  const handleDeleteTestCase = (collectionId: string, folderId: string, testCaseId: string) => {
    const updated = collections.map((c) => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.map((f) =>
            f.id === folderId
              ? { ...f, testCases: f.testCases.filter((tc) => tc.id !== testCaseId) }
              : f
          ),
        }
      }
      return c
    })
    saveCollections(updated)
  }

  const handleLoadTestCase = (config: RequestConfig) => {
    onLoadConfig(config)
  }

  const handleExecuteTestCase = (config: RequestConfig) => {
    onExecute(config)
  }

  const handleExecuteFolder = (collectionId: string, folderId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    const folder = collection?.folders.find((f) => f.id === folderId)
    if (folder && folder.testCases.length > 0) {
      folder.testCases.forEach((testCase, index) => {
        setTimeout(() => {
          onExecute(testCase.config)
        }, index * 2000)
      })
      alert(`开始执行 "${folder.name}"，共 ${folder.testCases.length} 个用例`)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-purple-600" />
            <span className="font-medium text-gray-700">测试集合</span>
            <span className="text-xs text-gray-500">({collections.length})</span>
          </div>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {isExpanded && (
          <div className="p-4">
            <div className="space-y-3">
              {collections.map((collection) => (
                <div key={collection.id} className="border rounded-lg overflow-hidden">
                  <div
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                      activeCollectionId === collection.id
                        ? 'bg-purple-50 border-b border-purple-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveCollectionId(activeCollectionId === collection.id ? null : collection.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen size={16} className="text-purple-600" />
                        <span className="font-medium text-gray-700">{collection.name}</span>
                        <span className="text-xs text-gray-400">
                          ({collection.folders.length} 个文件夹)
                        </span>
                      </div>
                      {collection.description && (
                        <p className="text-xs text-gray-500 mt-0.5 ml-6">{collection.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditModal(collection)
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCollection(collection.id)
                        }}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {activeCollectionId === collection.id && (
                    <div className="p-3 bg-white border-t">
                      <div className="space-y-2 mb-3">
                        {collection.folders.map((folder) => (
                          <div key={folder.id} className="border rounded-lg overflow-hidden bg-gray-50">
                            <div className="px-3 py-2 flex items-center justify-between bg-gray-100">
                              <div className="flex items-center gap-2 flex-1">
                                <button
                                  onClick={() => toggleFolder(collection.id, folder.id)}
                                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                >
                                  {folder.isExpanded ? (
                                    <ChevronDown size={14} className="text-gray-500" />
                                  ) : (
                                    <ChevronRight size={14} className="text-gray-500" />
                                  )}
                                </button>
                                {editingFolderId === folder.id ? (
                                  <div className="flex items-center gap-1 flex-1">
                                    <input
                                      type="text"
                                      value={editingFolderName}
                                      onChange={(e) => setEditingFolderName(e.target.value)}
                                      className="flex-1 px-2 py-0.5 text-sm border rounded"
                                      autoFocus
                                      onKeyPress={(e) => e.key === 'Enter' && handleSaveFolderName(collection.id, folder.id)}
                                    />
                                    <button
                                      onClick={() => handleSaveFolderName(collection.id, folder.id)}
                                      className="px-2 py-0.5 text-xs text-green-600 hover:bg-green-50 rounded"
                                    >
                                      保存
                                    </button>
                                    <button
                                      onClick={() => setEditingFolderId(null)}
                                      className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                      取消
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <FolderOpen size={14} className="text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-700">{folder.name}</span>
                                    <span className="text-xs text-gray-400">({folder.testCases.length})</span>
                                  </>
                                )}
                              </div>
                              {editingFolderId !== folder.id && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleExecuteFolder(collection.id, folder.id)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="执行全部"
                                  >
                                    <Play size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleEditFolder(collection.id, folder.id, folder.name)}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFolder(collection.id, folder.id)}
                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {folder.isExpanded && (
                              <div className="p-2 bg-white">
                                <div className="space-y-1">
                                  {folder.testCases.map((testCase) => (
                                    <div
                                      key={testCase.id}
                                      className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">{testCase.name}</span>
                                        <p className="text-xs text-gray-500 truncate">
                                          {testCase.config.method} {testCase.config.url}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleExecuteTestCase(testCase.config)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="执行"
                                      >
                                        <Play size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleLoadTestCase(testCase.config)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="加载"
                                      >
                                        <Copy size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTestCase(collection.id, folder.id, testCase.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {addingTestCaseTo === folder.id ? (
                                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <input
                                      type="text"
                                      value={newTestCaseName}
                                      onChange={(e) => setNewTestCaseName(e.target.value)}
                                      placeholder="用例名称"
                                      className="w-full px-2 py-1.5 text-sm border rounded mb-2"
                                    />
                                    <input
                                      type="url"
                                      value={newTestCaseUrl}
                                      onChange={(e) => setNewTestCaseUrl(e.target.value)}
                                      placeholder="请求URL"
                                      className="w-full px-2 py-1.5 text-sm border rounded mb-2"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setAddingTestCaseTo(null)
                                          setNewTestCaseName('')
                                          setNewTestCaseUrl('')
                                        }}
                                        className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                      >
                                        取消
                                      </button>
                                      <button
                                        onClick={() => handleAddTestCase(collection.id, folder.id)}
                                        disabled={!newTestCaseName.trim() || !newTestCaseUrl.trim()}
                                        className="flex-1 px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        添加
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAddingTestCaseTo(folder.id)}
                                    className="mt-2 w-full px-2 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    <FilePlus size={12} className="inline mr-1" />
                                    添加用例
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {addingFolderTo === 'root' ? (
                        <div className="p-2 bg-purple-50 rounded border border-purple-200">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="文件夹名称"
                            className="w-full px-2 py-1.5 text-sm border rounded mb-2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setAddingFolderTo(null)
                                setNewFolderName('')
                              }}
                              className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleAddFolder(collection.id)}
                              disabled={!newFolderName.trim()}
                              className="flex-1 px-2 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                            >
                              创建文件夹
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingFolderTo('root')}
                          className="w-full px-3 py-2 text-sm text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                        >
                          <FolderPlus size={14} className="inline mr-1" />
                          新建文件夹
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {collections.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">暂无测试集合</p>
              )}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="w-full mt-4 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              新建集合
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-700">
                {isEditing ? '编辑测试集合' : '新建测试集合'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">集合名称</label>
                <input
                  type="text"
                  value={isEditing && editCollection ? editCollection.name : newCollection.name}
                  onChange={(e) => {
                    if (isEditing && editCollection) {
                      setEditCollection({ ...editCollection, name: e.target.value })
                    } else {
                      setNewCollection({ ...newCollection, name: e.target.value })
                    }
                  }}
                  placeholder="如：新浪支付接口测试"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                  type="text"
                  value={isEditing && editCollection ? editCollection.description : newCollection.description}
                  onChange={(e) => {
                    if (isEditing && editCollection) {
                      setEditCollection({ ...editCollection, description: e.target.value })
                    } else {
                      setNewCollection({ ...newCollection, description: e.target.value })
                    }
                  }}
                  placeholder="可选描述"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  onClick={handleAddCollection}
                  disabled={!newCollection.name}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  创建
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
