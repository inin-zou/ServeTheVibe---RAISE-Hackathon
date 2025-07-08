interface MusicGenResponse {
  success: boolean
  audioUrl?: string
  message: string
}

type ProgressCallback = (progress: number, step: string) => void

export async function generateMusicFromAudio(
  audioBlob: Blob,
  prompt: string,
  onProgress?: ProgressCallback,
): Promise<MusicGenResponse> {
  const MUSICGEN_API_URL = "https://ykzou1214--musicgen-melody-api-inference-api.modal.run"

  if (!MUSICGEN_API_URL) {
    return {
      success: false,
      message: "❌ MUSICGEN_API_URL is not configured",
    }
  }

  try {
    // Progress tracking
    onProgress?.(10, "Preparing audio data...")

    // Create FormData for the API request
    const formData = new FormData()
    formData.append("melody", audioBlob, "recording.wav")
    formData.append("text", prompt)

    onProgress?.(20, "Uploading audio to MusicGen...")

    console.log("Sending request to MusicGen API...")

    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

    onProgress?.(30, "Connecting to MusicGen API...")

    const response = await fetch(MUSICGEN_API_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `❌ API error ${response.status}: ${errorText}`,
      }
    }

    onProgress?.(50, "MusicGen analyzing audio...")

    // Simulate progress during processing (since we can't get real progress from the API)
    const progressSteps = [
      { progress: 60, step: "AI understanding melody structure..." },
      { progress: 70, step: "Generating harmony and rhythm..." },
      { progress: 80, step: "Adding instrument arrangement..." },
      { progress: 90, step: "Optimizing audio quality..." },
    ]

    for (const { progress, step } of progressSteps) {
      onProgress?.(progress, step)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for UX
    }

    onProgress?.(95, "Downloading generated audio...")

    // Get the generated audio as blob
    const generatedAudioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(generatedAudioBlob)

    onProgress?.(100, "Music generation complete!")

    return {
      success: true,
      audioUrl,
      message: "✅ Music generated successfully!",
    }
  } catch (error) {
    console.error("MusicGen API error:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        message: "❌ Request timeout: MusicGen is taking too long to respond",
      }
    }

    return {
      success: false,
      message: `❌ Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Convert audio characteristics to Strudel code
export function audioToStrudelCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Analyze prompt for musical characteristics
  if (lowerPrompt.includes("drum") || lowerPrompt.includes("beat") || lowerPrompt.includes("rhythm")) {
    return `// Generated from: "${prompt}"
bd sd bd sd
`
  }

  if (lowerPrompt.includes("bass") || lowerPrompt.includes("low")) {
    return `// Generated from: "${prompt}"
c2 f2 g2 c2
`
  }

  if (lowerPrompt.includes("melody") || lowerPrompt.includes("tune")) {
    return `// Generated from: "${prompt}"
c4 e4 g4 c5
`
  }

  if (lowerPrompt.includes("jazz")) {
    return `// Generated from: "${prompt}"
stack(
  c3 e3 g3 b3,
  bd ~ sd ~
)
`
  }

  if (lowerPrompt.includes("electronic") || lowerPrompt.includes("synth")) {
    return `// Generated from: "${prompt}"
stack(
  c3 [e3 g3] c4 [g3 e3],
  bd ~ sd ~,
  ~ ~ hh ~
)
`
  }

  if (lowerPrompt.includes("ambient") || lowerPrompt.includes("calm")) {
    return `// Generated from: "${prompt}"
c3 e3 g3 c4
`
  }

  if (lowerPrompt.includes("fast") || lowerPrompt.includes("quick")) {
    return `// Generated from: "${prompt}"
stack(
  c4*2 e4*2 g4*2 c5*2,
  bd*2 sd*2
)
`
  }

  if (lowerPrompt.includes("slow") || lowerPrompt.includes("gentle")) {
    return `// Generated from: "${prompt}"
c3/2 e3/2 g3/2 c4/2
`
  }

  // Default pattern
  return `// Generated from: "${prompt}"
stack(
  c3 e3 g3 c4,
  bd ~ sd ~
)
`
}
