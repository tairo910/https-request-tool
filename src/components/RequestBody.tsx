import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'

interface RequestBodyProps {
  body: string
  onBodyChange: (body: string) => void
}

export default function RequestBody({ body, onBodyChange }: RequestBodyProps) {
  const [isValidJson, setIsValidJson] = useState(true)
  const [formattedBody, setFormattedBody] = useState(body)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(200)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  const MIN_HEIGHT = 120
  const MAX_HEIGHT = 600

  useEffect(() => {
    try {
      if (body.trim()) {
        const parsed = JSON.parse(body)
        setFormattedBody(JSON.stringify(parsed, null, 2))
        setIsValidJson(true)
      } else {
        setFormattedBody('')
        setIsValidJson(true)
      }
    } catch {
      setIsValidJson(false)
    }
  }, [body])

  useEffect(() => {
    if (textareaRef.current) {
      const contentHeight = textareaRef.current.scrollHeight
      const newHeight = Math.min(Math.max(contentHeight, MIN_HEIGHT), isExpanded ? MAX_HEIGHT : 240)
      if (newHeight !== textareaHeight) {
        setTextareaHeight(newHeight)
      }
    }
  }, [formattedBody, isExpanded])

  const handleChange = (value: string) => {
    onBodyChange(value)
  }

  const handleFormat = () => {
    try {
      if (body.trim()) {
        const parsed = JSON.parse(body)
        const formatted = JSON.stringify(parsed, null, 2)
        setFormattedBody(formatted)
        onBodyChange(formatted)
        setIsValidJson(true)
      }
    } catch {
      setIsValidJson(false)
    }
  }

  const handleMinify = () => {
    try {
      if (body.trim()) {
        const parsed = JSON.parse(body)
        const minified = JSON.stringify(parsed)
        setFormattedBody(minified)
        onBodyChange(minified)
        setIsValidJson(true)
      }
    } catch {
      setIsValidJson(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setTextareaHeight(Math.min(Math.max(textareaHeight, 300), MAX_HEIGHT))
    } else {
      setTextareaHeight(Math.min(textareaHeight, 240))
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    startHeightRef.current = textareaHeight
  }, [textareaHeight])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaY = e.clientY - startYRef.current
    const newHeight = startHeightRef.current + deltaY
    
    if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
      setTextareaHeight(newHeight)
      setIsExpanded(newHeight > 240)
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValidJson ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <AlertCircle size={14} className="text-red-500" />
          )}
          <span className="text-xs text-gray-500">
            {isValidJson ? 'JSON格式有效' : 'JSON格式无效'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFormat}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            格式化
          </button>
          <button
            onClick={handleMinify}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            压缩
          </button>
          <button
            onClick={toggleExpand}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      <div ref={containerRef} className="relative">
        <textarea
          ref={textareaRef}
          value={formattedBody}
          onChange={(e) => handleChange(e.target.value)}
          placeholder='{"key": "value"}'
          style={{ 
            height: `${textareaHeight}px`,
            overflowY: 'auto',
            resize: 'none'
          }}
          className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 scrollbar-thin transition-all ${
            isValidJson ? 'border-gray-300' : 'border-red-300'
          }`}
        />
        <div 
          className={`absolute bottom-0 right-0 left-0 h-2 cursor-ns-resize transition-colors ${
            isDragging ? 'bg-blue-400' : 'bg-gray-200 hover:bg-gray-300'
          }`}
          style={{ 
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            opacity: isDragging ? 1 : 0.6
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-gray-400 rounded" />
            <div className="w-0.5 h-3 bg-gray-400 rounded" />
            <div className="w-0.5 h-3 bg-gray-400 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
