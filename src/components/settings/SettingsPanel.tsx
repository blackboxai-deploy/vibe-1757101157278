'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

export function SettingsPanel({ isOpen, onClose, soundEnabled, setSoundEnabled }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState('my')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('burme-mark-lang') || 'my'
    setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('burme-mark-lang', lang)
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    const prefs = {
      soundEnabled: enabled,
      language,
      theme
    }
    localStorage.setItem('burme-mark-prefs', JSON.stringify(prefs))
  }

  const settingSections = [
    {
      title: language === 'my' ? 'အသွင်အပြင်' : 'Appearance',
      items: [
        {
          label: language === 'my' ? 'အလင်းရောင်/အမှောင်မုဒ်' : 'Light/Dark Mode',
          component: (
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                ☀️ {language === 'my' ? 'အလင်း' : 'Light'}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                🌙 {language === 'my' ? 'အမှောင်' : 'Dark'}
              </Button>
            </div>
          )
        }
      ]
    },
    {
      title: language === 'my' ? 'ဘာသာစကား' : 'Language',
      items: [
        {
          label: language === 'my' ? 'ဘာသာစကားရွေးချယ်ခြင်း' : 'Language Selection',
          component: (
            <div className="flex items-center space-x-2">
              <Button
                variant={language === 'my' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('my')}
              >
                🇲🇲 မြန်မာ
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('en')}
              >
                🇺🇸 English
              </Button>
            </div>
          )
        }
      ]
    },
    {
      title: 'API',
      items: [
        {
          label: language === 'my' ? 'API ပြင်ဆင်ခြင်း' : 'API Configuration',
          component: (
            <Button variant="outline" size="sm">
              ⚙️ {language === 'my' ? 'ပြင်ဆင်ရန်' : 'Configure'}
            </Button>
          )
        }
      ]
    },
    {
      title: language === 'my' ? 'အင်္ဂါရပ်များ' : 'Features',
      items: [
        {
          label: language === 'my' ? 'အသံဖွင့်ပိတ်ခြင်း' : 'Sound Effects',
          component: (
            <Switch
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          )
        }
      ]
    }
  ]

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold myanmar-text">
                {language === 'my' ? 'ဆက်တင်များ' : 'Settings'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="touch-effect"
              >
                ✕
              </Button>
            </div>

            {/* Settings Content */}
            <div className="p-4 space-y-6">
              {settingSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-medium text-foreground myanmar-text">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm text-muted-foreground myanmar-text">
                          {item.label}
                        </span>
                        {item.component}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Additional Sections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 border-t border-border pt-4"
              >
                <h3 className="font-medium text-foreground myanmar-text">
                  {language === 'my' ? 'အချက်အလက်များ' : 'Information'}
                </h3>
                
                <Button variant="outline" className="w-full justify-start touch-effect">
                  📚 {language === 'my' ? 'လမ်းညွှန်' : 'Documentation'}
                </Button>
                
                <Button variant="outline" className="w-full justify-start touch-effect">
                  ℹ️ {language === 'my' ? 'အကြောင်း' : 'About'}
                </Button>
              </motion.div>

              {/* Version Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center pt-4 border-t border-border"
              >
                <p className="text-xs text-muted-foreground myanmar-text">
                  Burme Mark v1.0.0
                </p>
                <p className="text-xs text-muted-foreground myanmar-text mt-1">
                  {language === 'my' ? 'မြန်မာ AI Assistant' : 'Myanmar AI Assistant'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}