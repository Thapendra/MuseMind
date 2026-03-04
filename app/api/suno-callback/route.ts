/**
 * POST /api/suno-callback
 *
 * This is the endpoint that n8n's Flow 2 (Webhook2 → Extract Song Data → HTTP Request)
 * calls BACK to deliver the completed song from Suno.
 *
 * n8n Webhook2 URL: https://thapendratest.app.n8n.cloud/webhook-test/suno-callback
 * That webhook receives the Suno result, extracts the song data,
 * and then POSTs it here so we can deliver it to the frontend.
 *
 * Expected body from n8n (flexible — we handle many shapes):
 * {
 *   jobId: string,              // the id we sent in Flow 1
 *   title?: string,
 *   lyrics?: string,
 *   audio_url?: string,         // Suno audio URL
 *   image_url?: string,         // Suno cover image
 *   tags?: string,              // genre tags from Suno
 *   duration?: number,          // in seconds
 *   status?: string,            // "complete" | "error"
 *   error?: string,
 *   ...any other fields from Suno
 * }
 */

import { songStore } from "@/lib/song-store"

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    console.log("[suno-callback] Received payload:", JSON.stringify(body).slice(0, 1000))

    // ── Extract jobId ──────────────────────────────────────────
    // n8n may nest the data in different ways depending on config
    const jobId: string | undefined =
      body.jobId || body.job_id || body.data?.jobId || body.data?.job_id

    if (!jobId) {
      console.error("[suno-callback] No jobId found in payload")
      // Even without jobId, log the payload so we can debug
      return Response.json(
        { error: "jobId is required in the callback payload" },
        { status: 400 },
      )
    }

    const existing = songStore.get(jobId)
    if (!existing) {
      console.warn(`[suno-callback] Job ${jobId} not found — it may have expired`)
      // Still process it in case timing is tight
    }

    // ── Extract song data (handle various field names from Suno/n8n) ──
    const songData = body.data || body

    const title: string =
      songData.title || songData.song_title || existing?.title || "Untitled Song"

    const lyrics: string =
      songData.lyrics || songData.song_lyrics || existing?.lyrics || ""

    const audioUrl: string =
      songData.audio_url || songData.audioUrl || songData.song_url || songData.mp3_url || ""

    const imageUrl: string =
      songData.image_url || songData.imageUrl || songData.cover_url || ""

    const emotion: string =
      songData.emotion || songData.mood || existing?.emotion || "neutral"

    const genre: string =
      songData.genre || songData.tags || songData.style || existing?.genre || "pop"

    const duration: number =
      Number(songData.duration) || Number(songData.song_duration) || 0

    // ── Check for error status ──
    const isError =
      songData.status === "error" ||
      songData.status === "failed" ||
      !!songData.error

    if (isError) {
      songStore.set(jobId, {
        ...existing,
        status: "error",
        error: songData.error || songData.message || "Song generation failed on Suno",
        completedAt: Date.now(),
      })
      console.log(`[suno-callback] Job ${jobId} marked as error`)
      return Response.json({ received: true, jobId, status: "error" })
    }

    // ── Store the completed song ──
    songStore.set(jobId, {
      status: "complete",
      prompt: existing?.prompt,
      title,
      lyrics,
      audioUrl,
      imageUrl,
      emotion,
      genre,
      metadata: {
        duration: duration || undefined,
        tags: typeof songData.tags === "string" ? songData.tags : undefined,
        style: typeof songData.style === "string" ? songData.style : undefined,
      },
      createdAt: existing?.createdAt,
      completedAt: Date.now(),
    })

    console.log(`[suno-callback] Job ${jobId} completed — title: "${title}", audioUrl: ${audioUrl ? "yes" : "no"}`)

    return Response.json({ received: true, jobId, status: "complete" })
  } catch (error) {
    console.error("[suno-callback] Error processing callback:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Callback processing failed" },
      { status: 500 },
    )
  }
}

/** Allow GET for health-check / testing */
export async function GET(): Promise<Response> {
  return Response.json({
    endpoint: "/api/suno-callback",
    description: "POST song data here from n8n after Suno generates the audio",
    expectedFields: ["jobId", "title", "lyrics", "audio_url", "image_url", "duration", "tags"],
  })
}
