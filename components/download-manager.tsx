"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface DownloadManagerProps {
  songTitle: string
  lyrics: string
  audioUrl?: string
}

export default function DownloadManager({ songTitle, lyrics, audioUrl }: DownloadManagerProps) {
  const [downloadFormat, setDownloadFormat] = useState<"mp3" | "txt" | "both">("mp3")
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadLyrics = async () => {
    const element = document.createElement("a")
    const file = new Blob([lyrics], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${songTitle || "song"}-lyrics.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadAll = async () => {
    if (!audioUrl) {
      handleDownloadLyrics()
      return
    }

    setIsDownloading(true)
    try {
      // Download lyrics
      await handleDownloadLyrics()

      // Download audio
      const audioElement = document.createElement("a")
      audioElement.href = audioUrl
      audioElement.download = `${songTitle || "song"}.mp3`
      document.body.appendChild(audioElement)
      audioElement.click()
      document.body.removeChild(audioElement)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownload = () => {
    if (downloadFormat === "txt") {
      handleDownloadLyrics()
    } else if (downloadFormat === "mp3" && audioUrl) {
      const element = document.createElement("a")
      element.href = audioUrl
      element.download = `${songTitle || "song"}.mp3`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } else if (downloadFormat === "both") {
      handleDownloadAll()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm space-y-4"
    >
      <h3 className="font-semibold text-foreground">Download Your Song</h3>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground block">Select Format</label>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDownloadFormat("txt")}
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              downloadFormat === "txt"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
            }`}
          >
            Lyrics (TXT)
          </motion.button>
          {audioUrl && (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDownloadFormat("mp3")}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  downloadFormat === "mp3"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                Audio (MP3)
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDownloadFormat("both")}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  downloadFormat === "both"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                Both
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </>
        )}
      </motion.button>

      <p className="text-xs text-muted-foreground text-center">
        {downloadFormat === "txt" && "Download lyrics as a text file"}
        {downloadFormat === "mp3" && "Download the generated audio"}
        {downloadFormat === "both" && "Download both lyrics and audio files"}
      </p>
    </motion.div>
  )
}
