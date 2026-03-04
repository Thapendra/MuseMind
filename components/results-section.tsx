"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import AudioPlayer from "./audio-player"
import DownloadManager from "./download-manager"

interface Song {
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

interface ResultsSectionProps {
  song: Song
  onNewSong: () => void
}

export default function ResultsSection({ song, onNewSong }: ResultsSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLyrics = async () => {
    try {
      await navigator.clipboard.writeText(song.lyrics)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy lyrics:", error)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Header with song metadata */}
        <div className="text-center space-y-4">
          {song.title && (
            <motion.h1 className="text-4xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {song.title}
            </motion.h1>
          )}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {song.emotion && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full capitalize border border-primary/20">
                {song.emotion}
              </span>
            )}
            {song.genre && (
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full capitalize border border-accent/20">
                {song.genre}
              </span>
            )}
            {song.metadata?.bpm && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full">
                {song.metadata.bpm} BPM
              </span>
            )}
            {song.metadata?.key && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full">
                {song.metadata.key}
              </span>
            )}
          </div>
        </div>

        {/* Lyrics Card */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lyrics</h3>
            <button
              onClick={handleCopyLyrics}
              className="text-xs px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
            >
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-background rounded-lg p-6 text-muted-foreground whitespace-pre-line text-sm leading-relaxed max-h-96 overflow-y-auto font-mono">
            {song.lyrics}
          </div>
        </motion.div>

        {song.audioUrl && (
          <AudioPlayer
            src={song.audioUrl}
            title={song.title}
            artist="MuseMind"
            bpm={song.metadata?.bpm}
            duration={song.metadata?.duration}
          />
        )}

        {/* Metadata Display */}
        {song.metadata && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {song.metadata.bpm && (
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-2xs text-muted-foreground uppercase tracking-wide">Tempo</p>
                <p className="text-xl font-bold mt-1">{song.metadata.bpm} BPM</p>
              </div>
            )}
            {song.metadata.key && (
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-2xs text-muted-foreground uppercase tracking-wide">Key</p>
                <p className="text-xl font-bold mt-1">{song.metadata.key}</p>
              </div>
            )}
            {song.metadata.duration && (
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-2xs text-muted-foreground uppercase tracking-wide">Duration</p>
                <p className="text-xl font-bold mt-1">{formatDuration(song.metadata.duration)}</p>
              </div>
            )}
            {song.genre && (
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-2xs text-muted-foreground uppercase tracking-wide">Genre</p>
                <p className="text-xl font-bold mt-1 capitalize">{song.genre}</p>
              </div>
            )}
          </motion.div>
        )}

        <DownloadManager songTitle={song.title || "Untitled"} lyrics={song.lyrics} audioUrl={song.audioUrl} />

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onNewSong}
            className="px-8 py-3 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Create Another Song
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
