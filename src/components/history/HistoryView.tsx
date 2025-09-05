'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface HistoryItem {
  id: string
  type: 'chat' | 'image' | 'code'
  title: string
  content: string
  timestamp: Date
  preview?: string
}

export function HistoryView() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'image' | 'code'>('all')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadHistoryData()
  }, [])

  const loadHistoryData = () => {
    const items: HistoryItem[] = []

    // Load chat history
    const chats = JSON.parse(localStorage.getItem('burme-mark-chats') || '[]')
    chats.forEach((chat: any) => {
      if (chat.role === 'user') {
        items.push({
          id: `chat-${chat.id}`,
          type: 'chat',
          title: chat.content.substring(0, 50) + (chat.content.length > 50 ? '...' : ''),
          content: chat.content,
          timestamp: new Date(chat.timestamp),
          preview: chat.content
        })
      }
    })

    // Load image history
    const images = JSON.parse(localStorage.getItem('burme-mark-images') || '[]')
    images.forEach((image: any) => {
      items.push({
        id: `image-${image.id}`,
        type: 'image',
        title: image.prompt.substring(0, 50) + (image.prompt.length > 50 ? '...' : ''),
        content: image.prompt,
        timestamp: new Date(image.timestamp),
        preview: image.url
      })
    })

    // Load code history
    const codes = JSON.parse(localStorage.getItem('burme-mark-codes') || '[]')
    codes.forEach((code: any) => {
      items.push({
        id: `code-${code.id}`,
        type: 'code',
        title: code.name,
        content: code.code,
        timestamp: new Date(code.timestamp),
        preview: code.code.substring(0, 100)
      })
    })

    // Sort by timestamp
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setHistoryItems(items)
  }

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || item.type === activeTab
    return matchesSearch && matchesTab
  })

  const exportData = async () => {
    setIsExporting(true)
    
    try {
      const exportData = {
        chats: JSON.parse(localStorage.getItem('burme-mark-chats') || '[]'),
        images: JSON.parse(localStorage.getItem('burme-mark-images') || '[]'),
        codes: JSON.parse(localStorage.getItem('burme-mark-codes') || '[]'),
        preferences: JSON.parse(localStorage.getItem('burme-mark-prefs') || '{}'),
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `burme-mark-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')

    } catch (error) {
      toast.error('Export failed')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.chats) localStorage.setItem('burme-mark-chats', JSON.stringify(data.chats))
        if (data.images) localStorage.setItem('burme-mark-images', JSON.stringify(data.images))
        if (data.codes) localStorage.setItem('burme-mark-codes', JSON.stringify(data.codes))
        if (data.preferences) localStorage.setItem('burme-mark-prefs', JSON.stringify(data.preferences))

        loadHistoryData()
        toast.success('Data imported successfully!')
        
      } catch (error) {
        toast.error('Invalid backup file')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  const clearAllHistory = () => {
    if (window.confirm('မှတ်တမ်းအားလုံးကို ရှင်းလင်းမှာ သေချာပါသလား?')) {
      localStorage.removeItem('burme-mark-chats')
      localStorage.removeItem('burme-mark-images')
      localStorage.removeItem('burme-mark-codes')
      setHistoryItems([])
      toast.success('History cleared successfully!')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬'
      case 'image': return '🎨'
      case 'code': return '💻'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'chat': return 'စကားပြော'
      case 'image': return 'ပုံ'
      case 'code': return 'ကုဒ်'
      default: return 'အခြား'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold myanmar-text">📚 မှတ်တမ်းများ</h1>
          <p className="text-muted-foreground myanmar-text">
            သင်၏ လှုပ်ရှားမှုများနှင့် အချက်အလက်များ
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
            id="import-file"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('import-file')?.click()}
            className="touch-effect"
          >
            📥 <span className="myanmar-text ml-1">Import</span>
          </Button>
          <Button 
            onClick={exportData} 
            disabled={isExporting}
            className="touch-effect"
          >
            {isExporting ? (
              <>
                <div className="spinner mr-2" />
                <span className="myanmar-text">Export လုပ်နေ...</span>
              </>
            ) : (
              <>
                📤 <span className="myanmar-text ml-1">Export</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 items-center"
      >
        <Input
          placeholder="မှတ်တမ်းများထဲမှ ရှာဖွေပါ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 myanmar-text"
        />
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="all">
              📄 <span className="myanmar-text ml-1">အားလုံး</span>
            </TabsTrigger>
            <TabsTrigger value="chat">
              💬 <span className="myanmar-text ml-1">စကားပြော</span>
            </TabsTrigger>
            <TabsTrigger value="image">
              🎨 <span className="myanmar-text ml-1">ပုံ</span>
            </TabsTrigger>
            <TabsTrigger value="code">
              💻 <span className="myanmar-text ml-1">ကုဒ်</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button 
          variant="destructive" 
          onClick={clearAllHistory}
          className="touch-effect"
        >
          🗑️ <span className="myanmar-text ml-1">ရှင်းလင်း</span>
        </Button>
      </motion.div>

      {/* History Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium myanmar-text">
                            {item.title}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded myanmar-text">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                        
                        {item.type === 'image' && item.preview?.startsWith('http') ? (
                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted mb-2">
                            <img
                              src={item.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground myanmar-text line-clamp-2 mb-2">
                            {item.preview}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleDateString('my-MM')} - {item.timestamp.toLocaleTimeString('my-MM')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-muted-foreground myanmar-text">
                  {searchTerm ? 'ရှာဖွေမှုနှင့် မကိုက်ညီသော မှတ်တမ်းမရှိပါ' : 'မှတ်တမ်းမရှိသေးပါ'}
                </p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { type: 'chat', label: 'စကားပြောမှတ်တမ်း', count: historyItems.filter(i => i.type === 'chat').length },
          { type: 'image', label: 'ပုံမှတ်တမ်း', count: historyItems.filter(i => i.type === 'image').length },
          { type: 'code', label: 'ကုဒ်မှတ်တမ်း', count: historyItems.filter(i => i.type === 'code').length },
          { type: 'total', label: 'စုစုပေါင်း', count: historyItems.length }
        ].map((stat) => (
          <Card key={stat.type} className="p-4 text-center">
            <div className="text-2xl mb-2">{getTypeIcon(stat.type)}</div>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm text-muted-foreground myanmar-text">{stat.label}</p>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}