"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square } from "lucide-react"

interface AudioPlayerProps {
  audioUrl: string
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [canPlay, setCanPlay] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const detectSupport = () => {
      const mime = audio.src.endsWith(".webm") ? "audio/webm" : "audio/wav"
      const supported = !!audio.canPlayType && audio.canPlayType(mime) !== ""
      setCanPlay(supported)
    }
    audio.addEventListener("loadedmetadata", detectSupport)

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadedmetadata", detectSupport)
    }
  }, [audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !canPlay) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Playback failed:", err)
            setIsPlaying(false)
            alert("Playback Error: Unsupported codec")
          })
      }
    }
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="glass-panel p-3 rounded-xl">
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex items-center gap-2 mb-2">
        <Button
          onClick={togglePlay}
          size="sm"
          disabled={!canPlay}
          title={canPlay ? "" : "Unsupported Codec"}
          className="btn-immersive text-white font-semibold disabled:opacity-40"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </Button>

        <Button
          onClick={stop}
          size="sm"
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
        >
          <Square className="w-3 h-3" />
        </Button>

        <span className="text-xs text-immersive-teal ml-auto font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="h-8 bg-immersive-surface/50 rounded flex items-center justify-center border border-immersive-teal/30">
        <div className="flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-immersive-teal rounded animate-pulse"
              style={{
                height: `${Math.random() * 20 + 4}px`,
                opacity: i / 20 < currentTime / duration ? 1 : 0.3,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      {!canPlay && <p className="mt-2 text-xs text-red-400 font-mono">Codec Error: Download file instead</p>}
    </div>
  )
}
