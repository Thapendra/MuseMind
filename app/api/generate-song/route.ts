import { generateText } from "ai"

interface SongGenerationRequest {
  prompt: string
}

interface SongGenerationResponse {
  lyrics: string
  emotion: string
  genre: string
  audioUrl?: string
  title?: string
  metadata?: {
    bpm?: number
    key?: string
    duration?: number
  }
}

async function detectEmotion(prompt: string): Promise<string> {
  try {
    const { text: emotion } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Analyze the following prompt and determine the primary emotion/vibe it conveys. 
      Respond with ONLY one word from this list: happy, sad, energetic, calm, romantic, melancholic.
      
      Prompt: "${prompt}"`,
      temperature: 0.3,
    })

    const cleanEmotion = emotion.toLowerCase().trim()
    const validEmotions = ["happy", "sad", "energetic", "calm", "romantic", "melancholic"]
    return validEmotions.includes(cleanEmotion) ? cleanEmotion : "calm"
  } catch (error) {
    console.error("Emotion detection error:", error)
    return "neutral"
  }
}

async function detectGenre(prompt: string, emotion: string): Promise<{ genre: string; bpm: number; key: string }> {
  try {
    const { text: genreData } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Based on this prompt and emotion, suggest a music genre and BPM.
      
      Prompt: "${prompt}"
      Emotion: ${emotion}
      
      Respond in JSON format with exactly these fields: {"genre": "string", "bpm": number, "key": "string"}
      Examples: {"genre": "indie pop", "bpm": 120, "key": "C Major"}
      Valid genres: pop, rock, hip-hop, electronic, jazz, classical, folk, indie, R&B, country, latin
      Valid keys: C Major, C# Major, D Major, D# Major, E Major, F Major, F# Major, G Major, G# Major, A Major, A# Major, B Major, and minor variants`,
      temperature: 0.4,
    })

    try {
      const parsed = JSON.parse(genreData)
      return {
        genre: parsed.genre || "pop",
        bpm: Math.max(60, Math.min(200, parsed.bpm || 120)),
        key: parsed.key || "C Major",
      }
    } catch {
      return { genre: "pop", bpm: 120, key: "C Major" }
    }
  } catch (error) {
    console.error("Genre detection error:", error)
    return { genre: "pop", bpm: 120, key: "C Major" }
  }
}

async function generateLyrics(prompt: string, emotion: string, genre: string): Promise<string> {
  try {
    const { text: lyrics } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `You are an expert songwriter creating a ${emotion} ${genre} song.

      Create original song lyrics based on this prompt: "${prompt}"
      
      Requirements:
      - Format with clear sections: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Chorus]
      - Each verse should have 4 lines
      - Chorus should be memorable and catchy
      - Match the ${emotion} emotion throughout
      - Use appropriate language for ${genre} music
      - Include rhythm and rhyme where appropriate
      
      Return ONLY the formatted lyrics, no additional commentary.`,
      temperature: 0.7,
    })

    return lyrics
  } catch (error) {
    console.error("Lyrics generation error:", error)
    throw new Error("Failed to generate lyrics")
  }
}

async function generateTitle(prompt: string, lyrics: string): Promise<string> {
  try {
    const { text: title } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Generate a creative, catchy song title based on this:
      
      Original prompt: "${prompt}"
      Lyrics excerpt: "${lyrics.split("\n").slice(0, 5).join(" ")}"
      
      Respond with ONLY the song title, no quotes or additional text. Keep it under 6 words.`,
      temperature: 0.6,
    })

    return title.trim()
  } catch (error) {
    console.error("Title generation error:", error)
    return "Untitled Song"
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as SongGenerationRequest
    const { prompt } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    // Step 1: Detect emotion and genre
    console.log(`[v0] Generating song for prompt: "${prompt}"`)
    const emotion = await detectEmotion(prompt)
    console.log(`[v0] Detected emotion: ${emotion}`)

    const { genre, bpm, key } = await detectGenre(prompt, emotion)
    console.log(`[v0] Detected genre: ${genre}, BPM: ${bpm}, Key: ${key}`)

    // Step 2: Generate lyrics
    const lyrics = await generateLyrics(prompt, emotion, genre)
    console.log(`[v0] Generated lyrics (${lyrics.length} characters)`)

    // Step 3: Generate title
    const title = await generateTitle(prompt, lyrics)
    console.log(`[v0] Generated title: ${title}`)

    const response: SongGenerationResponse = {
      lyrics,
      emotion,
      genre,
      title,
      metadata: {
        bpm,
        key,
        duration: Math.floor(Math.random() * 180) + 120, // Placeholder: 2-5 minutes
      },
      // TODO: Integrate with audio generation service (e.g., Replicate, Hugging Face)
      // audioUrl would be populated after audio generation
    }

    return Response.json(response, { status: 200 })
  } catch (error) {
    console.error("Song generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate song"
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
