'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import toast from 'react-hot-toast'

interface CodeProject {
  id: string
  name: string
  language: string
  code: string
  output: string
  timestamp: Date
}

export function CodeEditor() {
  const [projects, setProjects] = useState<CodeProject[]>([])
  const [activeProject, setActiveProject] = useState<string>('')
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // Load projects from localStorage
    const saved = localStorage.getItem('burme-mark-codes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProjects(parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        })))
        if (parsed.length > 0) {
          setActiveProject(parsed[0].id)
          setCode(parsed[0].code)
          setLanguage(parsed[0].language)
          setOutput(parsed[0].output)
        }
      } catch (error) {
        console.error('Error loading code projects:', error)
      }
    } else {
      // Create default project
      createNewProject()
    }
  }, [])

  const createNewProject = () => {
    const newProject: CodeProject = {
      id: Date.now().toString(),
      name: `Project ${projects.length + 1}`,
      language: 'javascript',
      code: '// မင်္ဂလာပါ! ကုဒ်ရေးကြည့်ပါ\nconsole.log("Hello from Burme Mark!");',
      output: '',
      timestamp: new Date()
    }

    setProjects(prev => [newProject, ...prev])
    setActiveProject(newProject.id)
    setCode(newProject.code)
    setLanguage(newProject.language)
    setOutput('')
    
    saveProjects([newProject, ...projects])
    toast.success('Project အသစ်ဖန်တီးပြီးပါပြီ!')
  }

  const saveProjects = (updatedProjects: CodeProject[]) => {
    localStorage.setItem('burme-mark-codes', JSON.stringify(updatedProjects))
  }

  const saveCurrentProject = () => {
    if (!activeProject) return

    const updatedProjects = projects.map(p => 
      p.id === activeProject 
        ? { ...p, code, output, language, timestamp: new Date() }
        : p
    )
    
    setProjects(updatedProjects)
    saveProjects(updatedProjects)
    toast.success('Project သိမ်းဆည်းပြီးပါပြီ!')
  }

  const runCode = async () => {
    if (!code.trim() || isRunning) return

    setIsRunning(true)
    setOutput('ကုဒ်ရန်နေပါတယ်...')

    try {
      // Simulate code execution (for demo purposes)
      await new Promise(resolve => setTimeout(resolve, 1500))

      let result = ''
      
      if (language === 'javascript') {
        // Simple JavaScript evaluation (unsafe for production)
        try {
          const originalLog = console.log
          const logs: string[] = []
          console.log = (...args) => logs.push(args.join(' '))
          
          // eslint-disable-next-line no-eval
          eval(code)
          
          console.log = originalLog
          result = logs.length > 0 ? logs.join('\n') : 'No output'
        } catch (error) {
          result = `Error: ${(error as Error).message}`
        }
      } else if (language === 'python') {
        // Simulated Python output
        result = 'Python execution simulation: Code executed successfully!\n(Note: Real Python execution not available in browser)'
      } else {
        result = `${language} code executed successfully!\n(Note: Real execution not available in browser)`
      }

      setOutput(result)
      saveCurrentProject()
      toast.success('ကုဒ်ရန်ပြီးပါပြီ!')

    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`)
      toast.error('ကုဒ်ရန်ခြင်းတွင် အမှားရှိပါတယ်')
    } finally {
      setIsRunning(false)
    }
  }

  const loadProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setActiveProject(projectId)
      setCode(project.code)
      setLanguage(project.language)
      setOutput(project.output)
    }
  }

  const deleteProject = (projectId: string) => {
    if (projects.length === 1) {
      toast.error('Project နောက်ဆုံးတစ်ခုကို ဖျက်မရပါ')
      return
    }

    const updatedProjects = projects.filter(p => p.id !== projectId)
    setProjects(updatedProjects)
    saveProjects(updatedProjects)

    if (activeProject === projectId) {
      const newActive = updatedProjects[0]
      setActiveProject(newActive.id)
      setCode(newActive.code)
      setLanguage(newActive.language)
      setOutput(newActive.output)
    }

    toast.success('Project ဖျက်ပြီးပါပြီ!')
  }

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold myanmar-text">💻 ကုဒ်ရေးခြင်း</h1>
          <p className="text-muted-foreground myanmar-text">
            ကုဒ်များရေး၍ စမ်းသပ်ပါ
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewProject} className="touch-effect">
            ➕ <span className="myanmar-text">Project အသစ်</span>
          </Button>
          <Button onClick={saveCurrentProject} variant="outline" className="touch-effect">
            💾 <span className="myanmar-text">သိမ်းဆည်းရန်</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {/* Projects Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="h-full p-4">
            <h3 className="font-semibold mb-4 myanmar-text">Projects</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeProject === project.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => loadProject(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate myanmar-text">
                          {project.name}
                        </p>
                        <p className="text-xs opacity-70">
                          {languages.find(l => l.value === project.language)?.icon} {project.language}
                        </p>
                        <p className="text-xs opacity-70">
                          {project.timestamp.toLocaleDateString('my-MM')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProject(project.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity touch-effect"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Main Editor Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <Tabs defaultValue="editor" className="h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <TabsList>
                  <TabsTrigger value="editor">
                    📝 <span className="myanmar-text ml-1">Editor</span>
                  </TabsTrigger>
                  <TabsTrigger value="output">
                    📟 <span className="myanmar-text ml-1">Output</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {/* Language Selector */}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.icon} {lang.label}
                      </option>
                    ))}
                  </select>

                  <Button 
                    onClick={runCode} 
                    disabled={!code.trim() || isRunning}
                    className="touch-effect"
                  >
                    {isRunning ? (
                      <>
                        <div className="spinner mr-2" />
                        <span className="myanmar-text">ရန်နေ...</span>
                      </>
                    ) : (
                      <>
                        ▶️ <span className="myanmar-text ml-1">Run</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <TabsContent value="editor" className="h-[calc(100%-5rem)] p-0">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 border-0 resize-none font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="// ကုဒ်ရေးပါ..."
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="output" className="h-[calc(100%-5rem)] p-0">
                <ScrollArea className="h-full">
                  <pre className="p-4 font-mono text-sm whitespace-pre-wrap">
                    {output || 'ရလဒ်မျာကး ဒီနေရာမှာ ပြပါမည်...'}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}