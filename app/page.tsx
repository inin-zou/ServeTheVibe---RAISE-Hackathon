"use client"

import { useState } from "react"
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
        '🎵 Hello! I\'m your AI music collaboration partner. I can help you create Strudel music code, explain music theory, generate beats and melodies. You can also record or upload audio, and I\'ll use MusicGen AI to generate complete musical arrangements for you!\n\nTry asking me questions like:\n• "Create a funk-style bass line"\n• "How to make fast drum beats?"\n• "Generate a sad melody"',
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
      <div className="relative z-10 container mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl md:text-7xl font-bold text-glow-purple bg-gradient-to-r from-immersive-purple via-immersive-pink to-immersive-teal bg-clip-text text-transparent font-mono">
              ServeTheVibe
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-immersive-purple/20 via-immersive-pink/20 to-immersive-teal/20 blur-2xl rounded-full" />
          </div>

          <p className="text-immersive-light/80 text-lg md:text-xl font-medium tracking-wide mb-6">
            AI-powered music generation with code & sound
          </p>

          {/* Status indicators */}
          <div className="flex justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-immersive-teal rounded-full animate-pulse-soft" />
              <span className="text-immersive-teal">Strudel Ready</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-immersive-purple rounded-full animate-pulse-soft" />
              <span className="text-immersive-purple">BlackboxAI CodeAgent Connected</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-immersive-pink rounded-full animate-pulse-soft" />
              <span className="text-immersive-pink">MusicGen Active</span>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Panel - Chat */}
          <div className="lg:w-2/5 flex flex-col">
            <ChatPanel
              messages={chatMessages}
              onPromptSubmit={handlePromptSubmit}
              onAudioUpload={handleAudioUpload}
              onRecordingComplete={handleRecordingComplete}
              onStrudelCodeGenerated={handleStrudelCodeGenerated}
              onMessageAdd={handleMessageAdd}
            />
          </div>

          {/* Right Panel - Strudel Editor */}
          <div className="lg:w-3/5 flex flex-col">
            <StrudelEditor
              code={strudelCode}
              onCodeChange={setStrudelCode}
              isPlaying={isPlaying}
              onPlayToggle={() => setIsPlaying(!isPlaying)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
