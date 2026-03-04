export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok",
    service: "MuseMind API",
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: "/api/generate-song", method: "POST", description: "Generate a complete song" },
      { path: "/api/transcribe-audio", method: "POST", description: "Transcribe voice input" },
      { path: "/api/health", method: "GET", description: "Health check" },
    ],
  })
}
