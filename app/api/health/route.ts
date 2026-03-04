export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok",
    service: "MuseMind API",
    timestamp: new Date().toISOString(),
    architecture: "Next.js ↔ n8n ↔ Suno AI",
    endpoints: [
      { path: "/api/generate-song", method: "POST", description: "Submit prompt → sends to n8n agent → returns jobId" },
      { path: "/api/generate-song/status", method: "GET", description: "Poll job status by ?jobId=xxx" },
      { path: "/api/suno-callback", method: "POST", description: "n8n calls this with completed song from Suno" },
      { path: "/api/transcribe-audio", method: "POST", description: "Transcribe voice input" },
      { path: "/api/whisper", method: "POST", description: "Whisper fallback transcription" },
      { path: "/api/health", method: "GET", description: "Health check" },
    ],
    n8n_webhooks: {
      generate: "https://thapendratest.app.n8n.cloud/webhook-test/generate-song",
      suno_callback: "https://thapendratest.app.n8n.cloud/webhook-test/suno-callback",
    },
  })
}
