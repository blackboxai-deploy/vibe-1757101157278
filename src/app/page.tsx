'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ImageGenerator } from '@/components/image/ImageGenerator'
import { CodeEditor } from '@/components/coder/CodeEditor'
import { HistoryView } from '@/components/history/HistoryView'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SoundManager } from '@/lib/sound/SoundManager'
import toast from 'react-hot-toast'

type ActivePage = 'chat' | 'image' | 'coder' | 'history'

export default function HomePage() {
  const [activePage, setActivePage] = useState<ActivePage>('chat')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Load user preferences
        const savedPrefs = localStorage.getItem('burme-mark-prefs')
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          setSoundEnabled(prefs.soundEnabled ?? true)
        }

        // Initialize sound system
        if (soundEnabled) {
          SoundManager.initialize()
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        
        if (soundEnabled) {
          SoundManager.playSound('startup')
        }
        
        toast.success('မင်္ဂလာပါ! Burme Mark သို့ ကြိုဆိုပါတယ်!', {
          icon: '🎉',
        })
      } catch (error) {
        console.error('App initialization error:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [soundEnabled])

  const handlePageChange = (page: ActivePage) => {
    if (soundEnabled) {
      SoundManager.playSound('click')
    }
    setActivePage(page)
  }

  const handleSettingsToggle = () => {
    if (soundEnabled) {
      SoundManager.playSound('click')
    }
    setIsSettingsOpen(!isSettingsOpen)
  }

  const pageVariants = {
    enter: {
      opacity: 0,
      x: 100,
    },
    center: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -100,
    }
  }

  const pageTransition = {
    duration: 0.3,
    ease: "easeOut" as const
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="floating-animation"
          >
            <div className="text-6xl mb-4">🔮</div>
          </motion.div>
          <LoadingSpinner size="lg" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold myanmar-text gradient-text"
          >
            Burme Mark
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground myanmar-text"
          >
            အစွမ်းထက် Assistant ကို လွှမ်းမိုးနေပါတယ်...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="floating-animation">🔮</div>
            <div>
              <h1 className="text-lg font-bold myanmar-text">Burme Mark</h1>
              <p className="text-xs text-muted-foreground myanmar-text">
                Myanmar AI Assistant
              </p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettingsToggle}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors touch-effect"
          >
            ⚙️
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="h-full"
          >
            {activePage === 'chat' && <ChatInterface />}
            {activePage === 'image' && <ImageGenerator />}
            {activePage === 'coder' && <CodeEditor />}
            {activePage === 'history' && <HistoryView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activePage={activePage}
        onPageChange={handlePageChange}
        soundEnabled={soundEnabled}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Floating Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  )
}