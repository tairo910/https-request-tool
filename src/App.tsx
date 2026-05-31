import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import type { RequestConfig } from './types'
import { useHttpRequest } from './hooks/useHttpRequest'
import { saveAPI, getSavedAPIs } from './utils/storage'
import RequestConfigComponent from './components/RequestConfig'
import ResponsePanel from './components/ResponsePanel'
import SavedAPIs from './components/SavedAPIs'
import RequestHistory from './components/RequestHistory'
import EnvironmentConfig from './components/EnvironmentConfig'
import TestCollection from './components/TestCollection'

interface Environment {
  id: string
  name: string
  baseUrl: string
  headers: Record<string, string>
  timeout: number
}

const defaultConfig: RequestConfig = {
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
}

export default function App() {
  const [config, setConfig] = useState<RequestConfig>(defaultConfig)
  const [currentEnv, setCurrentEnv] = useState<Environment | null>(null)
  const { loading, response, error, execute, cancel } = useHttpRequest()

  useEffect(() => {
    const savedConfig = localStorage.getItem('current_config')
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch {
        setConfig(defaultConfig)
      }
    }
  }, [])

  const handleEnvironmentChange = (env: Environment | null) => {
    setCurrentEnv(env)
    if (env) {
      setConfig((prev) => ({
        ...prev,
        url: `${env.baseUrl}/mgs/gateway.do`,
        headers: { ...prev.headers, ...env.headers },
        timeout: env.timeout,
      }))
    }
  }

  useEffect(() => {
    localStorage.setItem('current_config', JSON.stringify(config))
  }, [config])

  const handleConfigChange = (newConfig: RequestConfig) => {
    setConfig(newConfig)
  }

  const handleSend = () => {
    if (config.url) {
      execute(config)
    }
  }

  const handleCancel = () => {
    cancel()
  }

  const handleSave = () => {
    const name = prompt('请输入接口名称：')
    if (name && config.url) {
      const savedAPIs = getSavedAPIs()
      const exists = savedAPIs.some((api) => api.name === name)
      if (exists) {
        alert('该名称已存在')
        return
      }
      saveAPI({
        id: Date.now().toString(),
        name,
        config,
        createdAt: Date.now(),
      })
      alert('保存成功')
    }
  }

  const handleLoadConfig = (loadedConfig: RequestConfig) => {
    setConfig(loadedConfig)
  }

  const handleResetDefault = () => {
    if (confirm('确定重置为默认请求模板吗？这将覆盖当前请求体内容。')) {
      const newConfig = {
        ...defaultConfig,
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
      }
      setConfig(newConfig)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HTTPS 请求测试工具</h1>
              <p className="text-sm text-gray-400">发送和调试 HTTPS 请求</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <EnvironmentConfig
              onEnvironmentChange={handleEnvironmentChange}
              currentEnv={currentEnv}
            />
            <TestCollection
              onLoadConfig={handleLoadConfig}
              onExecute={(cfg) => {
                setConfig(cfg)
                handleSend()
              }}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <RequestConfigComponent
              config={config}
              onConfigChange={handleConfigChange}
              onSend={handleSend}
              onCancel={handleCancel}
              onSave={handleSave}
              onResetDefault={handleResetDefault}
              loading={loading}
            />

            <ResponsePanel response={response} error={error} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SavedAPIs onLoadConfig={handleLoadConfig} />
              <RequestHistory onLoadConfig={handleLoadConfig} />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        <p>HTTPS 请求测试工具 © 2024</p>
      </footer>
    </div>
  )
}
