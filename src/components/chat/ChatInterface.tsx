'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TypingLoader } from '@/components/ui/LoadingSpinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isTyping?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'မင်္ဂလာပါ! ကျွန်တော် Burme Mark ပါ။ ဘယ်လိုကူညီပေးရမလဲ?',
      role: 'assistant',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history from localStorage
    const savedChats = localStorage.getItem('burme-mark-chats')
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats)
        if (Array.isArray(parsedChats) && parsedChats.length > 0) {
          setMessages(parsedChats.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('burme-mark-chats', JSON.stringify(messages))
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      // Call AI API
      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'athuyrain@gmail.com',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx'
        },
        body: JSON.stringify({
          model: 'openrouter/anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are Burme Mark, a helpful Myanmar AI assistant. Respond in Myanmar language (Burmese) when appropriate, and be friendly and helpful. You can also respond in English if needed.'
            },
            ...messages.filter(m => !m.isTyping).map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: inputValue }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.'

      // Remove typing indicator and add real response
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== 'typing')
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date(),
          }
        ]
      })

      toast.success('Response received!')

    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove typing indicator and show error
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== 'typing')
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            content: 'တောင်းပန်ပါတယ်၊ အင်တာနက်ချိတ်ဆက်မှုတွင် ပြသနာရှိနေပါတယ်။ ကြိုးစားကြည့်ပါ။',
            role: 'assistant',
            timestamp: new Date(),
          }
        ]
      })

      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto p-4">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl myanmar-text ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.isTyping ? (
                  <TypingLoader />
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('my-MM', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex gap-2 p-3 bg-muted/50 rounded-xl"
      >
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="မေးခွန်းရေးပါ..."
          className="flex-1 min-h-[44px] max-h-32 resize-none myanmar-text border-0 bg-background"
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="px-6 self-end touch-effect"
        >
          {isLoading ? <div className="spinner" /> : '📤'}
        </Button>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mt-3 overflow-x-auto"
      >
        {[
          'မင်္ဂလာပါ',
          'ကူညီပါ',
          'ဘာတွေလုပ်နိုင်လဲ?',
          'မြန်မာလိုပြန်ပါ'
        ].map((text) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            onClick={() => setInputValue(text)}
            className="whitespace-nowrap myanmar-text touch-effect"
            disabled={isLoading}
          >
            {text}
          </Button>
        ))}
      </motion.div>
    </div>
  )
}