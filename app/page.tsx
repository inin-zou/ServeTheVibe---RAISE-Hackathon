"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { ChatPanel } from "@/components/chat-panel"
import { StrudelEditor } from "@/components/strudel-editor"
import { SplashScreen } from "@/components/splash-screen"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  strudelCode: string | null
  audioUrl: string | null
  isGenerating?: boolean
}

export default function MusicCoCreator() {
  const [showSplash, setShowSplash] = useState(true)
  const [strudelCode, setStrudelCode] = useState(`
 // Strudel Mini – press PLAY!
 bd ~ sd ~   // simple drums
 `)

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        '🎵 Hello! I\'m your AI music collaboration partner powered by Blackbox AI. I can help you create Strudel music code, explain music theory, generate beats and melodies, and I\'ll remember our entire conversation!\n\nYou can also record or upload audio, and I\'ll use MusicGen AI to generate complete musical arrangements for you!\n\nTry asking me questions like:\n• "Create a funk-style bass line"\n• "How to make fast drum beats?"\n• "Generate a sad melody"\n• "Remember what we discussed about jazz patterns?"\n\nI\'ll build upon our conversation as we go!',
      strudelCode: null,
      audioUrl: null,
    },
  ])

  const [isPlaying, setIsPlaying] = useState(false)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handlePromptSubmit = async (prompt: string) => {
    console.log("Prompt submitted:", prompt)
  }

  const handleAudioUpload = (file: File) => {
    const audioMessage: Message = {
      id: Date.now(),
      type: "user",
      content: `Uploaded audio file: ${file.name}`,
      strudelCode: null,
      audioUrl: URL.createObjectURL(file),
    }
    setChatMessages((prev) => [...prev, audioMessage])
  }

  const handleRecordingComplete = (audioBlob: Blob, audioUrl: string) => {
    const recordingMessage: Message = {
      id: Date.now(),
      type: "user",
      content: `Recorded audio (${(audioBlob.size / 1024).toFixed(1)}KB)`,
      strudelCode: null,
      audioUrl: audioUrl,
    }
    setChatMessages((prev) => [...prev, recordingMessage])
  }

  const handleStrudelCodeGenerated = (code: string) => {
    setStrudelCode(code)
  }

  const handleMessageAdd = (message: Message) => {
    setChatMessages((prev) => [...prev, message])
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-immersive text-immersive-light relative overflow-hidden particles-bg">
      <div className="relative z-10 container mx-auto p-4 md:p-6 h-screen flex flex-col">
        {/* Header */}
        <header className="mb-4 md:mb-6 text-center flex-shrink-0">
          <div className="relative inline-block mb-3 md:mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-glow-purple bg-gradient-to-r from-immersive-purple via-immersive-pink to-immersive-teal bg-clip-text text-transparent font-mono">
              ServeTheVibe
            </h1>
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-immersive-purple/20 via-immersive-pink/20 to-immersive-teal/20 blur-xl md:blur-2xl rounded-full" />
          </div>

          <p className="text-immersive-light/80 text-sm md:text-base lg:text-lg font-medium tracking-wide mb-3 md:mb-4 px-4">
            AI-powered music generation with code & sound
          </p>

          {/* Status indicators */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs md:text-sm font-medium px-4">
            <div className="flex items-center justify-center gap-2 glass-panel px-3 py-1.5 md:px-4 md:py-2 rounded-full">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-teal rounded-full animate-pulse-soft" />
              <span className="text-immersive-teal">Strudel Ready</span>
            </div>
            <div className="flex items-center justify-center gap-2 glass-panel px-3 py-1.5 md:px-4 md:py-2 rounded-full">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-purple rounded-full animate-pulse-soft" />
              <span className="text-immersive-purple hidden sm:inline">BlackboxAI CodeAgent Connected</span>
              <span className="text-immersive-purple sm:hidden">AI Connected</span>
            </div>
            <div className="flex items-center justify-center gap-2 glass-panel px-3 py-1.5 md:px-4 md:py-2 rounded-full">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-pink rounded-full animate-pulse-soft" />
              <span className="text-immersive-pink">MusicGen Active</span>
            </div>
          </div>
        </header>

        {/* Main Layout - Resizable */}
        <main className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 py-4">
          <PanelGroup direction="horizontal" className="flex-1 min-h-0">
            <Panel defaultSize={40} minSize={30}>
              <ChatPanel
                messages={chatMessages}
                onPromptSubmit={handlePromptSubmit}
                onAudioUpload={handleAudioUpload}
                onRecordingComplete={handleRecordingComplete}
                onStrudelCodeGenerated={handleStrudelCodeGenerated}
                onMessageAdd={handleMessageAdd}
              />
            </Panel>
            <div className="resize-handle-container">
              <PanelResizeHandle className="resize-handle" />
            </div>
            <Panel defaultSize={60} minSize={30}>
              <StrudelEditor
                code={strudelCode}
                onCodeChange={setStrudelCode}
                isPlaying={isPlaying}
                onPlayToggle={() => setIsPlaying(!isPlaying)}
              />
            </Panel>
          </PanelGroup>
        </main>
      </div>
    </div>
  )
}
