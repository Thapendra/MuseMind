"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface VisualizerProps {
  emotion: string
  isActive?: boolean
}

export default function Visualizer({ emotion, isActive = true }: VisualizerProps) {
  const barCount = 60 // Increased bar count for more dynamic effect
  const [beat, setBeat] = useState(false)

  // Crazy beat effect
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBeat(prev => !prev)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isActive])

  const emotionConfig: Record<
    string,
    {
      gradient: string
      glowColor: string
      intensity: number
      secondaryColor: string
      shape: string
    }
  > = {
    happy: {
      gradient: "from-yellow-400 via-orange-400 to-red-500",
      glowColor: "rgba(255, 193, 7, 0.8)",
      intensity: 1.2,
      secondaryColor: "#FFD700",
      shape: "circle",
    },
    sad: {
      gradient: "from-blue-600 via-indigo-500 to-purple-800",
      glowColor: "rgba(147, 112, 219, 0.7)",
      intensity: 0.8,
      secondaryColor: "#9370DB",
      shape: "wave",
    },
    energetic: {
      gradient: "from-red-500 via-pink-600 to-fuchsia-700",
      glowColor: "rgba(239, 68, 68, 0.9)",
      intensity: 1.5,
      secondaryColor: "#FF1493",
      shape: "zigzag",
    },
    calm: {
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      glowColor: "rgba(34, 197, 94, 0.6)",
      intensity: 0.7,
      secondaryColor: "#20B2AA",
      shape: "pulse",
    },
    neutral: {
      gradient: "from-blue-500 via-cyan-400 to-purple-600",
      glowColor: "rgba(102, 204, 255, 0.7)",
      intensity: 1.0,
      secondaryColor: "#66CCFF",
      shape: "bars",
    },
  }

  const config = emotionConfig[emotion] || emotionConfig.neutral

  const getBarAnimation = (index: number) => {
    const frequency = Math.sin((index / barCount) * Math.PI * 2)
    const baseDelay = index * 0.01
    const randomFactor = Math.sin(index * 0.8) * 0.5 + 0.5
    const beatFactor = beat ? 1.3 : 0.8

    return {
      scaleY: [
        0.1, 
        0.3 + randomFactor * 0.6 * beatFactor, 
        0.7 + Math.abs(frequency) * 0.5 * beatFactor, 
        0.2 + randomFactor * 0.4 * beatFactor, 
        0.1
      ],
      opacity: [0.7, 1, 1, 0.9, 0.7],
      rotate: [0, index % 2 === 0 ? 5 : -5, 0],
      skewX: [0, index % 3 === 0 ? 10 : -10, 0],
    }
  }

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Main Visualizer */}
        <div
          className="relative flex items-end justify-center gap-0.5 h-48 px-4 py-8 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 overflow-hidden"
          style={
            isActive
              ? {
                  boxShadow: `0 0 60px ${config.glowColor}, inset 0 0 40px ${config.glowColor}`,
                }
              : undefined
          }
        >
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-20"
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                style={{
                  background: `radial-gradient(circle, ${config.glowColor}, transparent)`,
                }}
              />
              
              {/* Floating music symbols */}
              {Array.from({ length: 8 }).map((_, i) => {
                const symbols = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"]
                return (
                  <motion.div
                    key={`symbol-${i}`}
                    className="absolute text-xl font-bold"
                    style={{ 
                      color: config.secondaryColor,
                      textShadow: `0 0 5px ${config.glowColor}`,
                    }}
                    initial={{ 
                      x: Math.random() * 300 + 50,
                      y: Math.random() * 100 + 20,
                      opacity: 0 
                    }}
                    animate={{ 
                      y: [null, -50 - Math.random() * 30],
                      x: [null, (Math.random() - 0.5) * 40],
                      rotate: [0, Math.random() > 0.5 ? 180 : -180],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                  >
                    {symbols[i % symbols.length]}
                  </motion.div>
                )
              })}
            </>
          )}

          {/* Bars */}
          <div className="flex items-end justify-center gap-0.5 h-full flex-1 z-10">
            {Array.from({ length: barCount }).map((_, i) => {
              const animation = getBarAnimation(i)
              const duration = 0.8 / (0.8 + config.intensity * 0.4)

              return (
                <motion.div
                  key={i}
                  className={`flex-1 bg-gradient-to-t ${config.gradient} rounded-t-sm`}
                  animate={animation}
                  transition={{
                    duration,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.01,
                    ease: "easeInOut",
                  }}
                  style={{
                    filter: `drop-shadow(0 0 5px ${config.glowColor})`,
                    minWidth: "2px",
                  }}
                />
              )
            })}
          </div>

          {/* Circular pulse effect */}
          {isActive && config.shape === "circle" && (
            <motion.div
              className="absolute w-40 h-40 rounded-full border-2 border-opacity-50 z-0"
              style={{ borderColor: config.secondaryColor }}
              animate={{ scale: [0, 2.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
            />
          )}

          {/* Zigzag effect for energetic */}
          {isActive && config.shape === "zigzag" && (
            <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1000 300">
              <motion.path
                d="M0,150 L100,50 L200,150 L300,50 L400,150 L500,50 L600,150 L700,50 L800,150 L900,50 L1000,150"
                fill="none"
                stroke={config.secondaryColor}
                strokeWidth="3"
                animate={{
                  strokeDashoffset: [1000, 0],
                  opacity: [0.8, 0.2],
                }}
                style={{
                  strokeDasharray: 1000,
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </svg>
          )}
        </div>

        {isActive && (
          <motion.div className="flex justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{
                  duration: 1.5 + ring * 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: ring * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Emotion Label */}
        <div className="text-center">
          <motion.p
            className="text-sm text-muted-foreground capitalize tracking-wide"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            {emotion === "neutral" ? "Analyzing..." : `Vibing: ${emotion}`}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
