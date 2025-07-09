"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AudioUploader } from "@/components/audio-uploader"
import { AudioPlayer } from "@/components/audio-player"
import { Send, Music, Sparkles, Bot, MessageSquare } from "lucide-react"
import { MicrophoneRecorder } from "@/components/microphone-recorder"
import { MusicGenProgress } from "@/components/musicgen-progress"
import { generateMusicFromAudio, audioToStrudelCode } from "@/lib/musicgen-api"
import {
  generateAIResponse,
  extractStrudelCode,
  getConversationSummary,
  trimConversationHistory,
} from "@/lib/blackbox-api"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  strudelCode: string | null
  audioUrl: string | null
  isGenerating?: boolean
}

interface ChatPanelProps {
  messages: Message[]
  onPromptSubmit: (prompt: string) => void
  onAudioUpload: (file: File) => void
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void
  onStrudelCodeGenerated: (code: string) => void
  onMessageAdd: (message: Message) => void
}

export function ChatPanel({
  messages,
  onPromptSubmit,
  onAudioUpload,
  onRecordingComplete,
  onStrudelCodeGenerated,
  onMessageAdd,
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [musicGenProgress, setMusicGenProgress] = useState(0)
  const [musicGenStep, setMusicGenStep] = useState("")
  const [conversationHistory, setConversationHistory] = useState<BlackboxMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add interface for BlackboxMessage
  interface BlackboxMessage {
    role: "user" | "assistant" | "system"
    content: string
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isAIThinking) {
      const userPrompt = prompt.trim()
      setPrompt("")

      const userMessage: Message = {
        id: Date.now(),
        type: "user",
        content: userPrompt,
        strudelCode: null,
        audioUrl: null,
      }
      onMessageAdd(userMessage)

      setIsAIThinking(true)

      try {
        console.log("Sending message to Blackbox AI with conversation history:", {
          userMessage: userPrompt,
          historyLength: conversationHistory.length,
          conversationSummary: getConversationSummary(conversationHistory),
        })

        // Send user message along with full conversation history
        const { response: aiResponse, updatedHistory } = await generateAIResponse(userPrompt, conversationHistory)

        // Update local conversation history
        setConversationHistory(trimConversationHistory(updatedHistory))

        // Extract Strudel code if present
        const strudelCode = extractStrudelCode(aiResponse)

        if (strudelCode) {
          onStrudelCodeGenerated(strudelCode)
        }

        const aiMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: aiResponse,
          strudelCode: strudelCode,
          audioUrl: null,
        }
        onMessageAdd(aiMessage)

        console.log("AI response processed:", {
          responseLength: aiResponse.length,
          strudelCodeExtracted: !!strudelCode,
          updatedHistoryLength: updatedHistory.length,
        })
      } catch (error) {
        console.error("Error generating AI response:", error)
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content:
            "Sorry, I can't respond right now. Please try again later, or try some Strudel code directly in the editor!",
          strudelCode: null,
          audioUrl: null,
        }
        onMessageAdd(errorMessage)
      } finally {
        setIsAIThinking(false)
      }
    }
  }

  const handleRecordingCompleteWithMusicGen = async (audioBlob: Blob, audioUrl: string) => {
    onRecordingComplete(audioBlob, audioUrl)

    setIsGenerating(true)
    setMusicGenProgress(0)
    setMusicGenStep("Starting processing...")

    try {
      const result = await generateMusicFromAudio(
        audioBlob,
        "Convert this humming into a full musical arrangement with instruments",
        (progress, step) => {
          setMusicGenProgress(progress)
          setMusicGenStep(step)
        },
      )

      if (result.success && result.audioUrl) {
        const strudelCode = audioToStrudelCode("Convert this humming into a full musical arrangement with instruments")
        onStrudelCodeGenerated(strudelCode)

        const aiMessage = {
          id: Date.now(),
          type: "ai" as const,
          content:
            "🎵 I've used MusicGen AI to generate a complete musical arrangement from your humming! Strudel code has been updated to match the style.",
          strudelCode,
          audioUrl: result.audioUrl,
        }

        onMessageAdd(aiMessage)
      } else {
        console.error("MusicGen failed:", result.message)
        const errorMessage = {
          id: Date.now(),
          type: "ai" as const,
          content: `❌ MusicGen generation failed: ${result.message}`,
          strudelCode: null,
          audioUrl: null,
        }
        onMessageAdd(errorMessage)
      }
    } catch (error) {
      console.error("Error generating music:", error)
      const errorMessage = {
        id: Date.now(),
        type: "ai" as const,
        content: `❌ MusicGen generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        strudelCode: null,
        audioUrl: null,
      }
      onMessageAdd(errorMessage)
    } finally {
      setIsGenerating(false)
      setMusicGenProgress(0)
      setMusicGenStep("")
    }
  }

  const handleAudioUploadWithMusicGen = async (file: File) => {
    onAudioUpload(file)

    setIsGenerating(true)
    setMusicGenProgress(0)
    setMusicGenStep("Starting processing...")

    try {
      const result = await generateMusicFromAudio(
        file,
        `Enhance this audio file into a full musical composition`,
        (progress, step) => {
          setMusicGenProgress(progress)
          setMusicGenStep(step)
        },
      )

      if (result.success && result.audioUrl) {
        const strudelCode = audioToStrudelCode(`Enhance this audio file into a full musical composition`)
        onStrudelCodeGenerated(strudelCode)

        const aiMessage = {
          id: Date.now(),
          type: "ai" as const,
          content: "🎵 I've used MusicGen AI to enhance your audio file and created a complete musical work!",
          strudelCode,
          audioUrl: result.audioUrl,
        }

        onMessageAdd(aiMessage)
      } else {
        console.error("MusicGen failed:", result.message)
        const errorMessage = {
          id: Date.now(),
          type: "ai" as const,
          content: `❌ MusicGen generation failed: ${result.message}`,
          strudelCode: null,
          audioUrl: null,
        }
        onMessageAdd(errorMessage)
      }
    } catch (error) {
      console.error("Error generating music:", error)
      const errorMessage = {
        id: Date.now(),
        type: "ai" as const,
        content: `❌ Error generating music: ${error instanceof Error ? error.message : "Unknown error"}`,
        strudelCode: null,
        audioUrl: null,
      }
      onMessageAdd(errorMessage)
    } finally {
      setIsGenerating(false)
      setMusicGenProgress(0)
      setMusicGenStep("")
    }
  }

  // Add this function to reset conversation if needed
  const resetConversation = () => {
    setConversationHistory([])
    console.log("Conversation history reset")
  }

  return (
    <div className="h-full flex flex-col glass-panel rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="relative p-4 md:p-6 border-b border-immersive-purple/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3 text-glow-purple">
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-immersive-purple" />
            <span className="hidden sm:inline">AI Collaborator</span>
            <span className="sm:hidden">AI Chat</span>
            {isGenerating && (
              <span className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-immersive-pink">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                <span className="hidden sm:inline">MusicGen Active</span>
                <span className="sm:hidden">Gen</span>
              </span>
            )}
            {isAIThinking && (
              <span className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-immersive-teal">
                <Bot className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                <span className="hidden sm:inline">AI Processing</span>
                <span className="sm:hidden">AI</span>
              </span>
            )}
          </h2>

          {/* Conversation status indicator */}
          <div className="text-xs text-immersive-gray">
            {conversationHistory.length > 0 && (
              <span>History: {Math.floor(conversationHistory.length / 2)} exchanges</span>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="relative p-4 md:p-6 border-b border-immersive-purple/10 space-y-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <AudioUploader onUpload={handleAudioUploadWithMusicGen} />
          <MicrophoneRecorder onRecordingComplete={handleRecordingCompleteWithMusicGen} />
        </div>
        <MusicGenProgress progress={musicGenProgress} step={musicGenStep} isVisible={isGenerating} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-immersive">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl relative transition-all duration-300 hover:scale-[1.02] ${
                message.type === "user"
                  ? "glass-panel-teal text-immersive-light"
                  : "glass-panel-pink text-immersive-light"
              }`}
            >
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                {message.type === "ai" && (
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-immersive-pink mt-0.5 md:mt-1 flex-shrink-0" />
                )}
                {message.type === "user" && (
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-immersive-teal mt-0.5 md:mt-1 flex-shrink-0" />
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.strudelCode && (
                <div className="mt-3 md:mt-4 code-editor rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <Music className="w-3 h-3 md:w-4 md:h-4 text-immersive-teal" />
                    <span className="text-xs text-immersive-teal font-semibold">STRUDEL CODE</span>
                  </div>
                  <pre className="text-xs text-immersive-teal overflow-x-auto leading-relaxed font-mono">
                    <code>{message.strudelCode}</code>
                  </pre>
                </div>
              )}

              {message.audioUrl && (
                <div className="mt-3 md:mt-4">
                  <AudioPlayer audioUrl={message.audioUrl} />
                </div>
              )}

              {message.isGenerating && (
                <div className="mt-2 md:mt-3 flex items-center gap-1 md:gap-2 text-xs text-immersive-pink">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Generating Audio...
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Thinking Indicator */}
        {isAIThinking && (
          <div className="flex justify-start">
            <div className="glass-panel-pink rounded-xl md:rounded-2xl p-3 md:p-4 max-w-[90%] md:max-w-[85%]">
              <div className="flex items-center gap-2 md:gap-3 text-sm text-immersive-pink">
                <Bot className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                <span>AI Processing</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-pink rounded-full animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-pink rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-immersive-pink rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative p-4 md:p-6 border-t border-immersive-purple/20 flex-shrink-0">
        <div className="flex gap-3">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              conversationHistory.length > 0 ? "Continue the conversation..." : "Enter your music command..."
            }
            className="flex-1 glass-panel border-immersive-purple/30 text-immersive-light placeholder-immersive-gray focus:border-immersive-purple focus:ring-immersive-purple/20 rounded-xl h-12 text-base"
            disabled={isGenerating || isAIThinking}
          />
          <Button
            type="submit"
            className="btn-immersive text-white font-semibold px-6 h-12 rounded-xl"
            disabled={isGenerating || isAIThinking}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-immersive-gray mt-3 px-1">
          <span className="hidden sm:inline">
            {conversationHistory.length > 0
              ? 'AI remembers our conversation • Try: "expand on that" | "make it faster"'
              : 'Try: "create jazz drums" | "generate bass line" | "explain stack() function"'}
          </span>
          <span className="sm:hidden">
            {conversationHistory.length > 0 ? "AI remembers our chat" : 'Try: "create jazz drums" | "generate bass"'}
          </span>
        </p>
      </form>
    </div>
  )
}
