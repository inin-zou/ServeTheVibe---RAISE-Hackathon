"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Square, Play, Pause, Mic, RotateCcw, Check } from "lucide-react"

interface MicrophoneRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void
}

type RecordingState = "idle" | "recording" | "reviewing"

export function MicrophoneRecorder({ onRecordingComplete }: MicrophoneRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      setRecordingTime(0)
      setRecordedAudioUrl(null)
      setRecordedAudioBlob(null)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudioUrl(audioUrl)
        setRecordedAudioBlob(audioBlob)
        setRecordingState("reviewing")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setRecordingState("recording")

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Microphone Access Denied")
      setRecordingState("idle")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleRetake = () => {
    setRecordedAudioUrl(null)
    setRecordedAudioBlob(null)
    setRecordingState("idle")
  }

  const handleConfirm = () => {
    if (recordedAudioBlob && recordedAudioUrl) {
      onRecordingComplete(recordedAudioBlob, recordedAudioUrl)
      setRecordingState("idle")
      setRecordedAudioUrl(null)
      setRecordedAudioBlob(null)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4 flex-1">
      {recordingState !== "reviewing" && (
        <div className="flex items-center gap-3">
          <Button
            onClick={recordingState === "recording" ? stopRecording : startRecording}
            className={`${
              recordingState === "recording"
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                : "btn-immersive"
            } text-white font-semibold h-12 px-4 rounded-xl w-full text-base`}
          >
            {recordingState === "recording" ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Stop Recording</span>
                <span className="sm:hidden">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Start Recording</span>
                <span className="sm:hidden">Record</span>
              </>
            )}
          </Button>

          {recordingState === "recording" && (
            <span className="text-sm text-immersive-pink font-semibold whitespace-nowrap">
              {formatTime(recordingTime)}
            </span>
          )}
        </div>
      )}

      {recordingState === "reviewing" && recordedAudioUrl && (
        <div className="glass-panel-teal rounded-xl p-4 space-y-4">
          <h3 className="text-base font-semibold text-immersive-teal">Review Your Recording</h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlayback}
              size="sm"
              className="btn-immersive text-white font-semibold h-10 px-4 rounded-lg"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <div className="w-full bg-immersive-surface/50 h-2 rounded-full">
              <div
                className="bg-immersive-teal h-2 rounded-full transition-all duration-200"
                style={{
                  width: audioRef.current
                    ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
          <audio
            ref={audioRef}
            src={recordedAudioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => audioRef.current && setRecordingTime(audioRef.current.currentTime)}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetake}
              className="w-full bg-immersive-surface hover:bg-immersive-panel border border-immersive-gray text-immersive-light font-semibold h-12 rounded-xl text-base"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-immersive-teal to-immersive-cyan hover:from-immersive-cyan hover:to-immersive-teal text-immersive-bg font-semibold h-12 rounded-xl text-base"
            >
              <Check className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Use This Recording</span>
              <span className="sm:hidden">Use</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
