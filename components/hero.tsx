"use client"

import { motion } from "framer-motion"
import MusicalBackground from "./musical-background"

interface HeroProps {
  onCreateClick: () => void
}

export default function Hero({ onCreateClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      <MusicalBackground />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="mb-6 inline-block">
            <span className="text-sm font-medium bg-primary/20 px-4 py-2 rounded-full border border-primary/30 text-white drop-shadow-md">
              AI-Powered Music Creation
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight drop-shadow-lg">
              <span className="text-white">MuseMind</span>
              <span className="block mt-2 text-white gradient-text-transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-400 hover:via-sky-400 hover:to-rose-500 animated-gradient-text text-rainbow-hover">
                Transform Ideas Into Melodies
              </span>
            </h1>

          <p className="text-xl text-white mb-8 max-w-2xl mx-auto text-balance leading-relaxed drop-shadow-md text-rainbow-hover">
            From your words to a complete song. MuseMind uses advanced AI to generate lyrics, compose music, and create
            realistic vocals instantly.
          </p>

          <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
                onClick={onCreateClick}
                className="glass-btn px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Create Your Song
              </button>
          </motion.div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          style={{ perspective: 1000 }}
        >
          {[
            { label: "Text or Voice", icon: "mic", desc: "Speak or type your ideas", accent: "from-fuchsia-500/30 to-pink-500/20", color: "text-fuchsia-300", ring: "ring-fuchsia-300/30" },
            { label: "Multiple Languages", icon: "globe", desc: "Create in any language", accent: "from-sky-500/30 to-cyan-500/20", color: "text-sky-300", ring: "ring-sky-300/30" },
            { label: "Download MP3", icon: "download", desc: "Save and share instantly", accent: "from-emerald-500/30 to-green-500/20", color: "text-emerald-300", ring: "ring-emerald-300/30" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.04, y: -2, rotateX: -2, rotateY: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * i }}
              className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] p-6 [transform-style:preserve-3d] before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 group-hover:before:opacity-40 before:transition-opacity before:duration-300"
            >
              <div className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${feature.accent} to-transparent`} />
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-black/40 border border-white/30 ring-2 ${feature.ring} flex items-center justify-center shadow-inner ${feature.color} bg-gradient-to-br from-white/5 to-white/0`}>
                  {feature.icon === "mic" && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="3" width="6" height="10" rx="3" />
                      <path d="M7 10a5 5 0 0 0 10 0" />
                      <path d="M12 17v4" />
                      <path d="M8 21h8" />
                    </svg>
                  )}
                  {feature.icon === "globe" && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a15 15 0 0 1 0 18" />
                      <path d="M12 3a15 15 0 0 0 0 18" />
                    </svg>
                  )}
                  {feature.icon === "download" && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v10" />
                      <path d="M8 9l4 4 4-4" />
                      <rect x="4" y="17" width="16" height="4" rx="1" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-white drop-shadow-sm text-rainbow-hover">{feature.label}</div>
                  <div className="text-sm text-white/80 text-rainbow-hover">{feature.desc}</div>
                </div>
              </div>
              <div className="relative z-10 mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative z-10 mt-3 text-xs text-white/70">Beautifully simple features for faster creativity.</div>
              <div className="absolute -left-8 top-0 h-full w-16 bg-white/20 blur-md rotate-6 opacity-0 group-hover:opacity-70 transition-all duration-500 group-hover:-translate-x-2" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
