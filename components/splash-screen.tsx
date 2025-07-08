"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  const loadingSteps = [
    { step: "Initializing System...", duration: 800 },
    { step: "Loading AI Modules...", duration: 1000 },
    { step: "Connecting MusicGen...", duration: 700 },
    { step: "Booting Strudel Engine...", duration: 900 },
    { step: "Syncing Audio Context...", duration: 600 },
    { step: "System Ready!", duration: 500 },
  ]

  useEffect(() => {
    let currentProgress = 0
    let stepIndex = 0

    const runLoadingSequence = () => {
      if (stepIndex < loadingSteps.length) {
        const currentStepData = loadingSteps[stepIndex]
        setCurrentStep(currentStepData.step)

        const stepProgress = 100 / loadingSteps.length
        const targetProgress = (stepIndex + 1) * stepProgress

        const progressInterval = setInterval(() => {
          currentProgress += 2
          setProgress(Math.min(currentProgress, targetProgress))

          if (currentProgress >= targetProgress) {
            clearInterval(progressInterval)
            stepIndex++
            setTimeout(runLoadingSequence, 200)
          }
        }, currentStepData.duration / 50)
      } else {
        // Loading complete - fade out
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(onComplete, 500)
        }, 800)
      }
    }

    setTimeout(runLoadingSequence, 500)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-immersive flex items-center justify-center transition-opacity duration-500 particles-bg ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Hero Image with soft glow */}
        <div className="relative mb-12">
          <div className="relative w-80 h-80 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-immersive-purple via-immersive-pink to-immersive-teal opacity-30 rounded-full blur-3xl animate-soft-glow" />
            <Image
              src="/images/splash-hero.png"
              alt="ServeTheVibe - AI Music Co-Creator"
              fill
              className="object-contain relative z-10 animate-float"
              priority
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="mb-12">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 text-glow-purple bg-gradient-to-r from-immersive-purple via-immersive-pink to-immersive-teal bg-clip-text text-transparent font-mono">
            ServeTheVibe
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-immersive-light/90 tracking-wide mb-4">
            AI-Powered Music Generation
          </p>
          <p className="text-lg text-immersive-gray">Create • Code • Collaborate</p>
        </div>

        {/* Loading Progress */}
        <div className="max-w-lg mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="glass-panel rounded-full p-2">
            <div className="w-full bg-immersive-surface/50 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-immersive-purple via-immersive-pink to-immersive-teal h-4 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="flex justify-between items-center text-lg font-medium">
            <span className="text-immersive-teal">{currentStep}</span>
            <span className="text-immersive-purple font-bold">{Math.round(progress)}%</span>
          </div>

          {/* System Status */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  progress > 20 ? "bg-immersive-purple animate-soft-glow" : "bg-immersive-surface"
                }`}
              />
              <span
                className={`text-sm font-medium ${progress > 20 ? "text-immersive-purple" : "text-immersive-gray"}`}
              >
                AI Core
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  progress > 50 ? "bg-immersive-teal animate-teal-glow" : "bg-immersive-surface"
                }`}
              />
              <span className={`text-sm font-medium ${progress > 50 ? "text-immersive-teal" : "text-immersive-gray"}`}>
                MusicGen
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  progress > 80 ? "bg-immersive-pink animate-pink-glow" : "bg-immersive-surface"
                }`}
              />
              <span className={`text-sm font-medium ${progress > 80 ? "text-immersive-pink" : "text-immersive-gray"}`}>
                Strudel
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-immersive-gray/70">
          <p>Powered by Artificial Intelligence</p>
          <p className="mt-2">Live Coding • Music Generation • Creative Collaboration</p>
        </div>
      </div>
    </div>
  )
}
