/**
 * /api/generate-song
 *
 * Sends the user prompt to the n8n webhook (Flow 1).
 * n8n agent → ChatGPT → Extract Lyrics → Suno API → callback.
 *
 * Returns a jobId so the frontend can poll /api/generate-song/status.
 */

import { songStore } from "@/lib/song-store"

const N8N_GENERATE_WEBHOOK =
  "https://thapendratest.app.n8n.cloud/webhook-test/generate-song"

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { prompt } = body as { prompt?: string }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    // Create a unique job id for this generation request
    const jobId = crypto.randomUUID()
    console.log(`[MuseMind] New job ${jobId} for prompt: "${prompt}"`)

    // Store the pending job so the callback can find it later
    songStore.set(jobId, { status: "processing", prompt })

    // Fire the prompt to the n8n webhook (Flow 1)
    // We pass jobId so n8n can include it in the Suno callback
    const n8nResponse = await fetch(N8N_GENERATE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim(), jobId }),
    })

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text().catch(() => "Unknown n8n error")
      console.error(`[MuseMind] n8n webhook error (${n8nResponse.status}):`, errText)
      songStore.set(jobId, { status: "error", error: `n8n returned ${n8nResponse.status}` })
      return Response.json(
        { error: `Song generation service returned ${n8nResponse.status}` },
        { status: 502 },
      )
    }

    // n8n may return an immediate response with partial data (lyrics from the agent).
    // We store whatever it gives us as a head-start.
    let n8nData: Record<string, unknown> = {}
    try {
      n8nData = (await n8nResponse.json()) as Record<string, unknown>
      console.log("[MuseMind] n8n immediate response:", JSON.stringify(n8nData).slice(0, 500))
    } catch {
      // Some webhook configs return 200 with no body — that's fine
    }

    // Merge any immediate data into the store
    const existing = songStore.get(jobId)
    const str = (v: unknown): string =>
      typeof v === "string" ? v : JSON.stringify(v)
    songStore.set(jobId, {
      ...existing,
      status: "processing",
      // If n8n already returned lyrics / title / emotion, keep them
      ...(n8nData.lyrics ? { lyrics: str(n8nData.lyrics) } : {}),
      ...(n8nData.title ? { title: str(n8nData.title) } : {}),
      ...(n8nData.emotion ? { emotion: str(n8nData.emotion) } : {}),
      ...(n8nData.genre ? { genre: str(n8nData.genre) } : {}),
    })

    // Return the jobId immediately — frontend will poll for completion
    return Response.json({ jobId, status: "processing" }, { status: 202 })
  } catch (error) {
    console.error("[MuseMind] generate-song error:", error)
    const msg = error instanceof Error ? error.message : "Failed to generate song"
    return Response.json({ error: msg }, { status: 500 })
  }
}
