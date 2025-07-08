"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, RotateCcw, Code2 } from "lucide-react"

interface StrudelEditorProps {
  code: string
  onCodeChange: (code: string) => void
  isPlaying: boolean
  onPlayToggle: () => void
}

function sanitizeMini(src: string) {
  let text = src.trim()
  if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
    text = text.slice(1, -1)
  }

  return text
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .join(" ")
}

export function StrudelEditor({ code, onCodeChange, isPlaying, onPlayToggle }: StrudelEditorProps) {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [strudelLoaded, setStrudelLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initProgress, setInitProgress] = useState(0)
  const [initStep, setInitStep] = useState("")
  const strudelRef = useRef<any>(null)
  const patternRef = useRef<any>(null)

  useEffect(() => {
    const loadStrudel = async () => {
      if (strudelRef.current) return

      setIsInitializing(true)
      setInitProgress(0)
      setInitStep("Initializing...")

      try {
        console.log("Loading Strudel modules...")
        setInitStep("Loading Modules...")
        setInitProgress(10)

        const [{ evaluate, repl }, { initAudioOnFirstClick, getAudioContext }, { mini }] = await Promise.all([
          import("@strudel/core"),
          import("@strudel/webaudio"),
          import("@strudel/mini"),
        ])

        console.log("Strudel modules loaded, initializing...")
        setInitStep("Modules Loaded...")
        setInitProgress(40)

        setInitStep("Waiting User Interaction...")
        setInitProgress(50)

        setInitStep("Audio Context Ready...")
        setInitProgress(60)

        setInitStep("Initializing REPL...")
        setInitProgress(80)

        const { scheduler } = await repl({
          defaultOutput: "webaudio",
          prebake: () => mini.loadSounds(),
        })

        setInitStep("Loading Samples...")
        setInitProgress(90)

        strudelRef.current = {
          evaluate,
          repl,
          mini,
          scheduler,
          isPlaying: false,
        }

        setInitStep("System Ready!")
        setInitProgress(100)

        setTimeout(() => {
          setStrudelLoaded(true)
          console.log("Strudel REPL initialized successfully!")
        }, 500)
      } catch (err) {
        console.error("Failed to load Strudel:", err)
        setError(`System Error: ${err instanceof Error ? err.message : "Unknown Error"}`)
        setInitStep("Initialization Failed")
      } finally {
        setTimeout(() => {
          setIsInitializing(false)
        }, 500)
      }
    }

    loadStrudel()
  }, [])

  useEffect(() => {
    if (isPlaying && strudelLoaded) {
      const interval = setInterval(() => {
        setHighlightedLine(Math.floor(Math.random() * code.split("\n").length))
      }, 500)

      return () => clearInterval(interval)
    } else {
      setHighlightedLine(null)
    }
  }, [isPlaying, code, strudelLoaded])

  const handlePlay = async () => {
    if (!strudelLoaded || !strudelRef.current) {
      alert("System Not Ready...")
      return
    }

    try {
      if (isPlaying) {
        if (patternRef.current) {
          patternRef.current.stop()
          patternRef.current = null
        }
        strudelRef.current.isPlaying = false
        onPlayToggle()
        setError(null)
      } else {
        const { initAudioOnFirstClick, getAudioContext } = await import("@strudel/webaudio")
        await initAudioOnFirstClick()
        const audioContext = getAudioContext()

        if (!audioContext || audioContext.state !== "running") {
          throw new Error("Audio Context Error")
        }

        console.log("Evaluating Strudel code:", code)

        let pattern
        try {
          const cleaned = sanitizeMini(code)
          console.log("Cleaned Mini code:", cleaned)
          pattern = strudelRef.current.mini(cleaned)
          console.log("Mini pattern created:", pattern)
        } catch (e) {
          console.error("Mini parse failed:", e)
          try {
            console.log("Trying JavaScript evaluation...")
            pattern = await strudelRef.current.evaluate(code.trim())
            console.log("JS pattern created:", pattern)
          } catch (jsErr) {
            const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Parse Error"
            setError(`Syntax Error: ${msg}`)
            console.error("Both Mini and JS parsing failed:", { miniError: e, jsError: jsErr })
            return
          }
        }

        if (pattern && typeof pattern.play === "function") {
          console.log("Starting pattern playback...")
          patternRef.current = pattern.play()
          strudelRef.current.isPlaying = true
          onPlayToggle()
          setError(null)
          console.log("Strudel pattern started successfully!")
        } else {
          throw new Error("Invalid Pattern")
        }
      }
    } catch (err) {
      console.error("Strudel execution error:", err)
      const errorMessage = err instanceof Error ? err.message : "Execution Error"
      setError(`Runtime Error: ${errorMessage}`)

      if (patternRef.current) {
        patternRef.current.stop()
        patternRef.current = null
      }
      if (strudelRef.current) {
        strudelRef.current.isPlaying = false
      }
      if (isPlaying) onPlayToggle()
    }
  }

  const handleReload = async () => {
    if (!strudelLoaded || !strudelRef.current) return

    try {
      if (patternRef.current) {
        patternRef.current.stop()
        patternRef.current = null
      }

      console.log("Reloading Strudel code...")
      try {
        const cleaned = sanitizeMini(code)
        const p = strudelRef.current.mini(cleaned)
      } catch (e) {
        const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Parse Error"
        setError(`Syntax Error: ${msg}`)
        console.error("Mini reload parse error:", e)
        return
      }

      const p = await strudelRef.current.evaluate(`(${code.trim()})`)
      if (!p || typeof p.play !== "function") {
        throw new Error("Invalid Pattern")
      }

      p.play()
      setError(null)
      console.log("Strudel code reloaded successfully")
    } catch (err) {
      console.error("Strudel reload error:", err)
      const errorMessage = err instanceof Error ? err.message : "Reload Error"
      setError(`Reload Error: ${errorMessage}`)
    }
  }

  const handleCodeChange = (newCode: string) => {
    onCodeChange(newCode)
  }

  return (
    <div className="h-full flex flex-col glass-panel-teal rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="relative p-6 border-b border-immersive-teal/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3 text-glow-teal">
            <Code2 className="w-6 h-6 text-immersive-teal" />
            Strudel Live Coding
            {isInitializing && <span className="text-sm text-immersive-pink">Booting...</span>}
            {!strudelLoaded && !isInitializing && <span className="text-sm text-immersive-gray">Loading...</span>}
            {strudelLoaded && <span className="text-sm text-immersive-teal">Online</span>}
          </h2>

          <div className="flex gap-3">
            <Button
              onClick={handlePlay}
              disabled={!strudelLoaded || isInitializing}
              className={`${
                isPlaying
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "btn-immersive"
              } text-white font-semibold px-6 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
            >
              {isPlaying ? <Square className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isPlaying ? "Stop" : "Play"}
            </Button>

            <Button
              onClick={handleReload}
              disabled={!strudelLoaded || isInitializing}
              className="glass-panel border-immersive-teal/50 text-immersive-teal hover:bg-immersive-teal/10 font-semibold h-12 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="relative p-4 bg-red-900/20 border-b border-red-500/30">
          <p className="text-sm text-red-400">
            <span className="text-immersive-pink font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Loading Display */}
      {isInitializing && (
        <div className="relative p-6 glass-panel-pink border-b border-immersive-pink/20">
          <div className="space-y-4">
            <p className="text-sm text-immersive-pink font-semibold">🎵 Initializing Strudel Engine...</p>

            <div className="w-full bg-immersive-surface/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-immersive-teal to-immersive-pink h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${initProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-immersive-teal">{initStep}</span>
              <span className="text-immersive-pink font-bold">{initProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 p-6 overflow-hidden relative">
        <div className="h-full code-editor rounded-xl relative overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-full p-6 bg-transparent text-immersive-teal font-mono text-sm resize-none outline-none scrollbar-immersive"
            spellCheck={false}
            placeholder={
              isInitializing
                ? "// System booting..."
                : strudelLoaded
                  ? "// Enter Strudel code here..."
                  : "// Loading Strudel REPL..."
            }
            disabled={!strudelLoaded || isInitializing}
          />

          {/* Code highlighting overlay */}
          <div className="absolute inset-0 p-6 pointer-events-none overflow-hidden">
            <pre className="font-mono text-sm leading-relaxed">
              {code.split("\n").map((line, index) => (
                <div
                  key={index}
                  className={`${
                    highlightedLine === index ? "bg-immersive-teal/20 shadow-lg border-l-2 border-immersive-teal" : ""
                  } transition-all duration-200`}
                >
                  <span className="text-transparent select-none">{line || " "}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative p-4 border-t border-immersive-teal/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-immersive-light">
            {isInitializing ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-immersive-pink rounded-full animate-pulse" />
                Initializing Audio Engine...
              </span>
            ) : !strudelLoaded ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                Loading Strudel...
              </span>
            ) : isPlaying ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-immersive-teal rounded-full animate-pulse" />
                <span className="text-immersive-teal">Audio Playing</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-immersive-teal rounded-full" />
                <span className="text-immersive-teal">Ready to Play</span>
              </span>
            )}
          </span>
          <span className="text-immersive-gray">
            Lines: {code.split("\n").length} | Chars: {code.length}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="relative p-4 glass-panel border-t border-immersive-teal/20">
        <p className="text-xs text-immersive-light/80 leading-relaxed">
          <span className="text-immersive-teal font-semibold">Strudel Mini Examples:</span>
          <br />
          <span className="text-immersive-purple">• Melody →</span>{" "}
          <code className="text-immersive-teal font-mono">c3 e3 g3 c4</code>
          <br />
          <span className="text-immersive-purple">• Drums →</span>{" "}
          <code className="text-immersive-teal font-mono">bd sd bd sd</code>
          <br />
          <span className="text-immersive-purple">• Bass →</span>{" "}
          <code className="text-immersive-teal font-mono">c2 f2 g2 ~</code>
        </p>
      </div>
    </div>
  )
}
