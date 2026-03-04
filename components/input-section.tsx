"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface InputSectionProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

export default function InputSection({ onGenerate, isLoading }: InputSectionProps) {
  const [prompt, setPrompt] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef<string>("")
  const userStopRef = useRef<boolean>(false)
  const [sttError, setSttError] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Debug banner
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const supported = !!SpeechRecognition
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown"
    setDebugInfo(`STT supported: ${supported} | UA: ${userAgent}`)
  }, [])

  const handleTextGenerate = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt)
    }
  }

  const startSpeechToText = async () => {
    try {
      setSttError("")
      if (isRecording || isStarting) return
      setIsStarting(true)
      userStopRef.current = false

      // 1. Mic permission
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((e) => {
          console.error("[STT] getUserMedia error", e)
          throw new Error("Microphone permission denied")
        })
        stream.getTracks().forEach((t) => t.stop()) // release immediately
      }

      // 2. SpeechRecognition availability
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        const msg = "Speech recognition unavailable in this browser."
        setSttError(msg)
        console.error("[STT]", msg)
        setIsStarting(false)
        return
      }
      const recognition = new SpeechRecognition()
      recognition.continuous = true          // keep listening until user stops
      recognition.interimResults = true      // give us partial results live
      recognition.maxAlternatives = 1
      recognition.lang = "en-US"

      // 3. Event handlers – stream interim + final into textarea
      recognition.onstart = () => {
        console.log("[STT] onstart")
        setIsRecording(true)
        setIsStarting(false)
        baseTextRef.current = prompt // remember text prior to recording
      }

      recognition.onresult = (event: any) => {
        console.log("[STT] onresult", event.results)
        let liveTranscript = ""
        // accumulate all recognized text within this session
        for (let i = 0; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript
        }
        const combined = `${baseTextRef.current} ${liveTranscript}`.trim()
        setPrompt(combined)   // live update while speaking without losing initial text
      }

      recognition.onend = () => {
        console.log("[STT] onend")
        setIsRecording(false)
        // auto-restart unless user stopped
        if (!userStopRef.current) {
          try {
            console.log("[STT] auto-restart")
            recognition.start()
          } catch (e) {
            console.warn("[STT] restart failed", e)
          }
        }
      }

      recognition.onerror = (err: any) => {
        const code = err?.error || "unknown"
        console.error("[STT] onerror", code, err)
        if (code === "aborted") {
          // we explicitly call .stop() – ignore harmless aborts
        } else if (code === "network") {
          // network issues cannot stream; surface message and stop cleanly
          setSttError("Network error with speech service. Please check connection.")
          try { recognition.abort?.() } catch {}
          setIsRecording(false)
          setIsStarting(false)
          userStopRef.current = true
        } else {
          let message = ""
          switch (code) {
            case "not-allowed":
              message = "Microphone access blocked. Allow mic permission and try again."
              break
            case "no-speech":
              message = "No speech detected. Speak clearly and try again."
              // auto-restart to keep session smooth
              try {
                console.log("[STT] auto-restart after no-speech")
                recognition.abort?.()
                recognition.start()
                message = "" // avoid flashing error while restarting
              } catch {}
              break
            case "audio-capture":
              message = "No microphone available. Check audio input device."
              break
            default:
              message = err?.message || `Speech recognition error: ${code}`
          }
          if (message) setSttError(message)
        }
        try { recognition.abort?.() } catch {}
        setIsRecording(false)
        setIsStarting(false)
      }

      recognitionRef.current = recognition
      console.log("[STT] starting continuous recognition…")
      recognition.start()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to start speech recognition"
      console.error("[STT] catch", msg)
      setSttError(msg)
      setIsRecording(false)
      setIsStarting(false)
    }
  }

  const startWhisperFallback = async () => {
    console.log("[Whisper] fallback triggered")
    if (isRecording) return // prevent double-start
    setIsRecording(true)
    setSttError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("[Whisper] mic stream obtained")
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        console.log("[Whisper] ondataavailable", e.data.size, "bytes")
        chunks.push(e.data)
      }
      recorder.onstop = async () => {
        console.log("[Whisper] recorder stopped, chunks", chunks.length)
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: mime })
        console.log("[Whisper] blob size", blob.size)
        const form = new FormData()
        form.append("audio", blob, "mic.webm")
        console.log("[Whisper] uploading audio…")
        const res = await fetch("/api/whisper", { method: "POST", body: form })
        if (!res.ok) throw new Error("Whisper request failed")
        const { text } = await res.json()
        console.log("[Whisper] transcript →", text)
        if (text) setPrompt((prev) => `${prev ? prev + " " : ""}${text}`.trim())
      }
      recorder.start()
      console.log("[Whisper] recording started")
      // Auto-stop after 10 s
      window.setTimeout(() => {
        console.log("[Whisper] auto-stopping after 10 s")
        recorder.stop()
        setIsRecording(false)
      }, 10000)
    } catch (e: any) {
      console.error("[Whisper]", e)
      setSttError(e.message || "Local transcription unavailable")
      setIsRecording(false)
    }
  }

  const stopSpeechToText = () => {
    console.log("[STT] stopSpeechToText called")
    userStopRef.current = true
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current.abort?.()
      } catch (e) {
        console.warn("[STT] stop ignored", e)
      }
    }
    setIsRecording(false)
    setIsStarting(false)
  }

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Create Your Song</h2>

           {/* Debug banner removed per request */}

           {/* Text Input */}
           <div className="mb-6">
             <label className="block text-sm font-medium mb-2 text-muted-foreground">
               Describe your song
             </label>
             <div className="relative">
               {/* Mic button integrated inside the textarea on the left */}
               <motion.button
                 aria-label={isRecording ? "Stop recording" : "Start recording"}
                 onClick={isRecording ? stopSpeechToText : startSpeechToText}
                 disabled={isLoading || isStarting}
                 whileTap={{ scale: 0.95 }}
                 className={`absolute left-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                   isRecording
                     ? "bg-white/20 text-white hover:bg-white/30 border border-red-400 ring-2 ring-red-400 backdrop-blur-md shadow-[0_0_12px_rgba(255,0,0,0.35)] animate-pulse"
                     : "bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-md"
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                   <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 18h2v3h-2v-3z" />
                 </svg>
               </motion.button>
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="e.g., A sad romantic Hindi song with acoustic guitar and soulful vocals"
                 className="w-full bg-background/60 border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                 rows={4}
                 disabled={isLoading}
               />
             </div>
             {sttError && (
               <div className="mt-2 text-xs text-red-400">{sttError}</div>
             )}
           </div>

          {/* Generate Button */}
          <button
            onClick={handleTextGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
          >
            {isLoading ? "Generating..." : "Generate Song"}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
