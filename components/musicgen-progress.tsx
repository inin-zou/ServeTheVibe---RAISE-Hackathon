"use client"

import { Music, Wand2, Zap } from "lucide-react"

interface MusicGenProgressProps {
  progress: number
  step: string
  isVisible: boolean
}

export function MusicGenProgress({ progress, step, isVisible }: MusicGenProgressProps) {
  if (!isVisible) return null

  return (
    <div className="glass-panel-pink border border-immersive-pink/50 rounded-lg p-4 space-y-3 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-immersive-pink/10 via-immersive-purple/10 to-immersive-teal/10 animate-pulse" />

      {/* Header */}
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <Music className="w-5 h-5 text-immersive-pink animate-pulse" />
          <Zap className="w-3 h-3 text-immersive-teal absolute -top-1 -right-1 animate-bounce" />
        </div>
        <h3 className="font-bold font-mono text-glow-pink">MusicGen AI</h3>
      </div>

      {/* Progress Bar */}
      <div className="relative space-y-2">
        <div className="w-full bg-immersive-surface rounded-full h-3 overflow-hidden border border-immersive-pink/30">
          <div
            className="bg-gradient-to-r from-immersive-pink via-immersive-purple to-immersive-teal h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center text-sm font-mono">
          <span className="text-immersive-pink flex items-center gap-1">
            <Wand2 className="w-3 h-3 animate-spin" />
            {step}
          </span>
          <span className="font-bold text-glow-purple">{progress}%</span>
        </div>
      </div>

      {/* Visual Indicators */}
      <div className="relative flex justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-6 rounded-full transition-all duration-300 ${
              progress > i * 20
                ? "bg-gradient-to-t from-immersive-pink to-immersive-purple"
                : "bg-immersive-surface border border-immersive-gray/50"
            }`}
            style={{
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Estimated Time */}
      <div className="relative text-center text-xs font-mono">
        {progress < 30 && <span className="text-immersive-gray">Estimated Time: 30-60s...</span>}
        {progress >= 30 && progress < 70 && <span className="text-immersive-pink">AI Composing...</span>}
        {progress >= 70 && progress < 95 && <span className="text-immersive-teal">Finalizing...</span>}
        {progress >= 95 && <span className="text-immersive-teal">Completing Process...</span>}
      </div>
    </div>
  )
}
