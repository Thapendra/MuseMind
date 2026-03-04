"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function MusicalBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const [isClient, setIsClient] = useState(false)
  
  // Only run animations after client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden bg-black z-0" suppressHydrationWarning>
      {/* Base gradient - wild color scheme */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 via-red-700 to-amber-500" />
      
      {/* Center equalizer strips removed per performance request */}

      {/* Spinning vinyl records */}
      {isClient && Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={`vinyl-${i}`}
          className="absolute rounded-full border-8 border-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
          style={{
            width: 100 + i * 30,
            height: 100 + i * 30,
            left: `${(i * 25) % 90 + 5}%`,
            top: `${(i * 20) % 80 + 10}%`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 0.9, 1],
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{
            rotate: {
              duration: 2 - i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 3 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            x: {
              duration: 8 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            y: {
              duration: 10 - i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          {/* Record center */}
          <motion.div 
            className="absolute rounded-full bg-gray-300" 
            style={{
              width: '20%',
              height: '20%',
              left: '40%',
              top: '40%',
            }}
            animate={{ rotate: [0, -360] }}
            transition={{
              duration: 2 - i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </motion.div>
      ))}

      {/* Exploding music notes */}
      {isClient && Array.from({ length: 30 }, (_, i) => {
        const musicSymbols = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"]
        const symbolIndex = i % musicSymbols.length
        const randomSymbol = musicSymbols[symbolIndex]
        const size = 20 + (i % 10) * 4
        const posX = (i * 3.33) % 100
        const posY = (i * 3.33 + 50) % 100
        
        return (
          <motion.div
            key={`note-${i}`}
            className="absolute font-bold text-white"
            style={{
              fontSize: `${size}px`,
              left: `${posX}%`,
              top: `${posY}%`,
              textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
            }}
            animate={{
              y: [0, i % 2 === 0 ? -300 : 300],
              x: [0, ((i % 10) - 5) * 50],
              rotate: [0, i % 2 === 0 ? 720 : -720],
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 5) * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              delay: (i % 10) * 0.5,
              ease: "easeOut",
            }}
          >
            {randomSymbol}
          </motion.div>
        )
      })}

      {/* Pulsating waveform */}
      {isClient && (
        <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 0, 255, 0.8)" />
              <stop offset="50%" stopColor="rgba(0, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 255, 0, 0.8)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,400 Q150,200 300,400 T600,400 T900,400 T1200,400 L1200,800 L0,800 Z"
            fill="url(#waveGradient)"
            animate={{
              d: [
                "M0,400 Q150,200 300,400 T600,400 T900,400 T1200,400 L1200,800 L0,800 Z",
                "M0,300 Q150,500 300,300 T600,300 T900,300 T1200,300 L1200,800 L0,800 Z",
                "M0,500 Q150,100 300,500 T600,500 T900,500 T1200,500 L1200,800 L0,800 Z",
                "M0,400 Q150,200 300,400 T600,400 T900,400 T1200,400 L1200,800 L0,800 Z",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </svg>
      )}

      {/* Cursor-following spotlight */}
      {isClient && (
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,0,0.3) 0%, transparent 70%)",
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Bouncing speakers */}
      {isClient && Array.from({ length: 2 }, (_, i) => (
        <motion.div
          key={`speaker-${i}`}
          className="absolute w-20 h-32 rounded-md bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700"
          style={{
            left: i === 0 ? '10%' : '85%',
            bottom: '15%',
          }}
          animate={{
            y: [0, -10, 0],
            rotate: i === 0 ? [-5, 0, -5] : [5, 0, 5],
          }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {/* Speaker cones */}
          <motion.div
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-500"
            style={{ top: '20%', left: '20%' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.2, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-500"
            style={{ bottom: '20%', left: '30%' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.15, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
          />
        </motion.div>
      ))}

      {/* Flashing strobe lights */}
      {isClient && (
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ opacity: [0, 0.05, 0, 0.08, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}
    </div>
  )
}
