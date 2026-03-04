"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import InputSection from "@/components/input-section"
import Visualizer from "@/components/visualizer"
import ResultsSection from "@/components/results-section"
import MusicalBackground from "@/components/musical-background"

interface GeneratedSong {
  lyrics: string
  audioUrl?: string
  emotion?: string
  genre?: string
  title?: string
  metadata?: {
    bpm?: number
    key?: string
    duration?: number
  }
}

export default function GeneratePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<string>("")
  const [generatedSong, setGeneratedSong] = useState<GeneratedSong | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<string>("neutral")
  const [error, setError] = useState<string>("")

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true)
    setGeneratedSong(null)
    setError("")
    setSelectedEmotion("neutral")

    try {
      // Stage 1: Send prompt to n8n via our API
      setGenerationProgress("Sending your idea to the AI agent...")
      setSelectedEmotion("energetic")

      const response = await fetch("/api/generate-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `API returned status ${response.status}`)
      }

      const { jobId } = (await response.json()) as { jobId: string; status: string }
      console.log("[MuseMind] Job submitted:", jobId)

      // Stage 2: Poll for completion
      const progressMessages = [
        "AI is composing your lyrics...",
        "Crafting the melody...",
        "Generating vocals with Suno AI...",
        "Mixing and mastering...",
        "Adding final touches...",
        "Almost there, hang tight...",
        "Your song is cooking...",
      ]
      let msgIndex = 0
      setGenerationProgress(progressMessages[0])
      setSelectedEmotion("happy")

      const POLL_INTERVAL = 3000   // poll every 3 seconds
      const MAX_WAIT = 300000      // 5 minute timeout

      const startTime = Date.now()

      const result = await new Promise<GeneratedSong>((resolve, reject) => {
        const poll = async () => {
          try {
            // Rotate progress messages to keep the user engaged
            msgIndex = (msgIndex + 1) % progressMessages.length
            setGenerationProgress(progressMessages[msgIndex])

            // Cycle through emotions for the visualizer
            const emotions = ["energetic", "happy", "calm", "energetic"]
            setSelectedEmotion(emotions[msgIndex % emotions.length])

            const statusRes = await fetch(`/api/generate-song/status?jobId=${jobId}`)
            const statusData = await statusRes.json()

            if (statusData.status === "complete") {
              resolve(statusData as GeneratedSong)
              return
            }

            if (statusData.status === "error") {
              reject(new Error(statusData.error || "Song generation failed"))
              return
            }

            // Still processing — check timeout
            if (Date.now() - startTime > MAX_WAIT) {
              reject(new Error("Song generation timed out. Please try again."))
              return
            }

            // Poll again
            setTimeout(poll, POLL_INTERVAL)
          } catch (err) {
            reject(err)
          }
        }

        // Start first poll after a short delay (give n8n time to start)
        setTimeout(poll, POLL_INTERVAL)
      })

      console.log("[MuseMind] Song ready:", result)

      if (result.emotion) {
        setSelectedEmotion(result.emotion)
      }

      setGeneratedSong(result)
    } catch (error) {
      console.error("[MuseMind] Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate song"
      setError(errorMessage)
      setGenerationProgress("")
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleNewSong = useCallback(() => {
    setGeneratedSong(null)
    setError("")
    setGenerationProgress("")
    setSelectedEmotion("neutral")
  }, [])

  const handleBackHome = useCallback(() => {
    router.push("/")
  }, [router])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Musical Background */}
      <div className="fixed inset-0 z-0">
        <MusicalBackground />
      </div>
      
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <button
          onClick={handleBackHome}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Back Home</span>
        </button>
        {/* Center title removed per request */}
        <div className="w-24" />
      </div>

      {!generatedSong ? (
        <>
          <div className="max-w-4xl mx-auto px-6">
            <InputSection onGenerate={handleGenerate} isLoading={isGenerating} />
          </div>

          {isGenerating && (
            <div className="space-y-8">
              <div className="max-w-4xl mx-auto px-6 mt-8">
                <Visualizer emotion={selectedEmotion} isActive={isGenerating} />
              </div>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                  </div>
                  <p className="text-white text-sm font-medium drop-shadow-md">{generationProgress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && !isGenerating && (
            <div className="max-w-2xl mx-auto px-4 py-8">
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-white">
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="max-w-4xl mx-auto px-6">
          <ResultsSection song={generatedSong} onNewSong={handleNewSong} />
        </div>
      )}
    </main>
  )
}
