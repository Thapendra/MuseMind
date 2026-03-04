/**
 * GET /api/generate-song/status?jobId=xxx
 *
 * Frontend polls this endpoint to check whether the song generation
 * has been completed by the n8n → Suno pipeline.
 */

import { songStore } from "@/lib/song-store"

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")

  if (!jobId) {
    return Response.json({ error: "jobId query parameter is required" }, { status: 400 })
  }

  const job = songStore.get(jobId)

  if (!job) {
    return Response.json({ error: "Job not found or expired" }, { status: 404 })
  }

  // Still processing — return 202
  if (job.status === "processing") {
    return Response.json(
      { jobId, status: "processing", message: "Song is being generated..." },
      { status: 202 },
    )
  }

  // Error
  if (job.status === "error") {
    return Response.json(
      { jobId, status: "error", error: job.error || "Unknown error" },
      { status: 200 },
    )
  }

  // Complete — return the full song
  return Response.json(
    {
      jobId,
      status: "complete",
      title: job.title || "Untitled Song",
      lyrics: job.lyrics || "",
      audioUrl: job.audioUrl || undefined,
      emotion: job.emotion || "neutral",
      genre: job.genre || "pop",
      imageUrl: job.imageUrl || undefined,
      metadata: job.metadata || {},
    },
    { status: 200 },
  )
}
