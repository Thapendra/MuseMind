"use client"

import { useRouter } from "next/navigation"
import Hero from "@/components/hero"

export default function Home() {
  const router = useRouter()

  const handleCreateSong = () => {
    router.push("/generate")
  }

  return (
    <main className="min-h-screen relative z-10">
      <Hero onCreateClick={handleCreateSong} />
    </main>
  )
}
