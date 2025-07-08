"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface AudioUploaderProps {
  onUpload: (file: File) => void
}

export function AudioUploader({ onUpload }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      onUpload(file)
    }
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
      <Button onClick={handleClick} className="w-full btn-immersive text-white font-semibold h-12 rounded-xl">
        <Upload className="w-5 h-5 mr-2" />
        Upload Audio File
      </Button>
    </div>
  )
}
