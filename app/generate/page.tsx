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
      // Stage 1: Analyzing prompt
      setGenerationProgress("Analyzing your vibe...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Stage 2: Detecting emotion
      setGenerationProgress("Detecting emotion and genre...")
      setSelectedEmotion("energetic")
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Stage 3: Generating lyrics
      setGenerationProgress("Writing lyrics...")
      setSelectedEmotion("happy")
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Stage 4: Creating song metadata
      setGenerationProgress("Creating your song...")
      await new Promise((resolve) => setTimeout(resolve, 400))

      console.log("[v0] Starting API call to /api/generate-song")
      setGenerationProgress("Finalizing your masterpiece...")

      const response = await fetch("/api/generate-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `API returned status ${response.status}`)
      }

      const data = (await response.json()) as GeneratedSong
      console.log("[v0] Song generated successfully:", data)

      // Update emotion based on API response
      if (data.emotion) {
        setSelectedEmotion(data.emotion)
      }

      setGeneratedSong(data)
    } catch (error) {
      console.error("[v0] Generation error:", error)
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
