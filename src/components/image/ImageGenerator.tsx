'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: Date
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedImages(prev => [...prev, ...acceptedFiles])
    toast.success(`${acceptedFiles.length} ပုံတင်ပြီးပါပြီ!`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  })

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    toast.loading('ပုံဖန်တီးနေပါတယ်...', { id: 'generating' })

    try {
      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'athuyrain@gmail.com',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx'
        },
        body: JSON.stringify({
          model: 'replicate/black-forest-labs/flux-1.1-pro',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      const imageUrl = data.choices?.[0]?.message?.content || ''

      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt,
          timestamp: new Date()
        }

        setGeneratedImages(prev => [newImage, ...prev])
        
        // Save to localStorage
        const saved = JSON.parse(localStorage.getItem('burme-mark-images') || '[]')
        saved.unshift(newImage)
        localStorage.setItem('burme-mark-images', JSON.stringify(saved))

        toast.success('ပုံဖန်တီးပြီးပါပြီ!', { id: 'generating' })
        setPrompt('')
      } else {
        throw new Error('No image URL received')
      }

    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('ပုံဖန်တီးမှု မအောင်မြင်ပါ', { id: 'generating' })
    } finally {
      setIsGenerating(false)
    }
  }

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold myanmar-text">🎨 ပုံဖန်တီးခြင်း</h1>
        <p className="text-muted-foreground myanmar-text">
          AI ဖြင့် လှပသောပုံများ ဖန်တီးပါ
        </p>
      </motion.div>

      {/* Image Generation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className="p-6">
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ဖန်တီးချင်တဲ့ ပုံအကြောင်း ဖော်ပြပါ... (ဥပမာ: လှပသော သဘာဝရှုခင်း, အဆောင်မီးများ)"
              className="min-h-[100px] myanmar-text"
              disabled={isGenerating}
            />
            <Button
              onClick={generateImage}
              disabled={!prompt.trim() || isGenerating}
              className="w-full touch-effect"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span className="myanmar-text">ဖန်တီးနေပါတယ်...</span>
                </>
              ) : (
                <span className="myanmar-text">🎨 ပုံဖန်တီးရန်</span>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Photo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 myanmar-text">📤 ပုံတင်ခြင်း</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <p className="myanmar-text font-medium">
                {isDragActive
                  ? 'ဖိုင်များကို ဒီနေရာမှာ ပစ်ထည့်ပါ'
                  : 'ပုံများကို ဒီနေရာသို့ ဖိဆွဲပါ သို့မဟုတ် ရွေးချယ်ရန် နှိပ်ပါ'}
              </p>
              <p className="text-sm text-muted-foreground myanmar-text">
                PNG, JPG, GIF, WebP (အများဆုံး 10MB)
              </p>
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 myanmar-text">
                တင်ထားသော ပုံများ ({uploadedImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity touch-effect"
                      onClick={() => removeUploadedImage(index)}
                    >
                      ✕
                    </Button>
                    <p className="text-xs mt-1 truncate myanmar-text">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 myanmar-text">
              🖼️ ဖန်တီးထားသော ပုံများ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm myanmar-text text-muted-foreground line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {image.timestamp.toLocaleDateString('my-MM')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full touch-effect"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = image.url
                      link.download = `burme-mark-${image.id}.png`
                      link.click()
                    }}
                  >
                    💾 <span className="myanmar-text">ဒေါင်းလုဒ်</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}