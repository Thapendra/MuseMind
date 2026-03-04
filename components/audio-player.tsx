"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  bpm?: number
  duration?: number
}

export default function AudioPlayer({ src, title = "Untitled", artist = "MuseMind", bpm, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = percent * audioDuration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = audioDuration ? (currentTime / audioDuration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 backdrop-blur-sm"
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} crossOrigin="anonymous" />

      {/* Song Info */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <p className="text-sm text-muted-foreground">{artist}</p>
        {bpm && <p className="text-xs text-muted-foreground mt-1">{bpm} BPM</p>}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-1 bg-secondary/30 rounded-full cursor-pointer hover:h-2 transition-all group"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${progress}%` }}
            layoutId="progress-bar"
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, marginLeft: "-6px" }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play/Pause */}
        <motion.button
          onClick={togglePlayPause}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6915026,16.4744748 L3.50612381,3.28784348 C3.19218622,2.97384246 2.71249712,2.97384246 2.40142889,3.28784348 C2.08748131,3.60115248 2.08748131,4.08011069 2.40142889,4.39348904 L5.19572554,7.20018705 C5.03043344,7.92852117 4.93714286,8.67983149 4.93714286,9.45454545 C4.93714286,11.1002392 5.27306317,12.6932376 5.875031,14.1541227 L3.50612381,16.5340469 C3.19218622,16.8480479 3.19218622,17.3274461 3.50612381,17.6408144 C3.82006139,17.9548155 4.3001535,17.9548155 4.61146924,17.6408144 L7.54181769,14.6986931 C8.34806633,15.2200704 9.18987137,15.6931146 10.0809886,16.1062666 L10.0809886,20.4744748 C10.0809886,20.9488181 10.4735526,21.3414286 10.9479049,21.3414286 C11.4220555,21.3414286 11.8148004,20.9488181 11.8148004,20.4744748 L11.8148004,16.1062666 C12.7060699,15.6931146 13.5474131,15.2200704 14.3539562,14.6986931 L17.2844752,17.6408144 C17.5980915,17.9548155 18.0773851,17.9548155 18.391288,17.6408144 C18.7049881,17.3274461 18.7049881,16.8480479 18.391288,16.5340469 L16.6915026,14.8273318 L16.6915026,14.8273318 Z M10.0809886,7.49704142 C11.9587818,7.49704142 13.5140778,9.05428699 13.5140778,10.9329112 C13.5140778,12.8116444 11.9587818,14.3688899 10.0809886,14.3688899 C8.20349793,14.3688899 6.6479019,12.8116444 6.6479019,10.9329112 C6.6479019,9.05428699 8.20349793,7.49704142 10.0809886,7.49704142 Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </motion.button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-secondary/30 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                (isMuted ? 0 : volume) * 100
              }%, var(--color-secondary) ${(isMuted ? 0 : volume) * 100}%, var(--color-secondary) 100%)`,
            }}
          />
        </div>

        {/* Download Button */}
        <motion.a
          href={src}
          download
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-muted-foreground hover:text-primary transition-colors"
          title="Download"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  )
}
