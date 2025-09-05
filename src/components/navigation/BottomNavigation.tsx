'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type ActivePage = 'chat' | 'image' | 'coder' | 'history'

interface BottomNavigationProps {
  activePage: ActivePage
  onPageChange: (page: ActivePage) => void
  soundEnabled: boolean
}

export function BottomNavigation({ activePage, onPageChange, soundEnabled }: BottomNavigationProps) {
  const navItems = [
    { id: 'chat' as const, icon: '💬', label: 'New Chat', labelMm: 'စကားပြော' },
    { id: 'image' as const, icon: '🎨', label: 'Image', labelMm: 'ရုပ်ပုံ' },
    { id: 'coder' as const, icon: '💻', label: 'Coder', labelMm: 'ကုဒ်' },
    { id: 'history' as const, icon: '📚', label: 'History', labelMm: 'မှတ်တမ်း' },
  ]

  const handleClear = () => {
    if (window.confirm('အားလုံးကို ရှင်းလင်းမှာ သေချာပါသလား?')) {
      localStorage.removeItem('burme-mark-chats')
      localStorage.removeItem('burme-mark-images')
      localStorage.removeItem('burme-mark-codes')
      window.location.reload()
    }
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border z-40"
    >
      <div className="flex items-center justify-between px-2 py-2">
        {/* Navigation Items */}
        <div className="flex items-center space-x-1 flex-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all touch-effect',
                'min-h-[60px] flex-1 relative',
                activePage === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {activePage === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs myanmar-text font-medium">
                  {item.labelMm}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* History View Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange('history')}
          className={cn(
            'flex flex-col items-center justify-center px-3 py-2 rounded-lg mx-1 touch-effect',
            'min-h-[60px] min-w-[60px]',
            'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <span className="text-lg mb-1">👁️</span>
          <span className="text-xs myanmar-text">ကြည့်ရှု</span>
        </motion.button>

        {/* Clear Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
          className="flex flex-col items-center justify-center px-3 py-2 rounded-lg min-h-[60px] min-w-[60px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors touch-effect"
        >
          <span className="text-lg mb-1">🗑️</span>
          <span className="text-xs myanmar-text">ရှင်း</span>
        </motion.button>
      </div>

      {/* Active Page Indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-b-lg" />
    </motion.div>
  )
}