import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"
import { spawn } from "child_process"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("audio") as File
    if (!file) return NextResponse.json({ error: "Missing audio" }, { status: 400 })

    // Save temporary webm file
    const tmpFile = join(tmpdir(), `whisper-${Date.now()}.webm`)
    await writeFile(tmpFile, Buffer.from(await file.arrayBuffer()))

    // Run whisper-cli (install: pip install openai-whisper)
    const whisper = spawn("whisper", [tmpFile, "--model", "base", "--output_format", "json"], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    whisper.stdout.on("data", (d) => (stdout += d))
    whisper.stderr.on("data", (d) => (stderr += d))

    await new Promise<void>((res, rej) => {
      whisper.on("close", (code) => (code === 0 ? res() : rej(new Error(stderr))))
    })

    // Parse JSON output
    const result = JSON.parse(stdout)
    const text = result.segments.map((s: any) => s.text.trim()).join(" ")

    // Cleanup
    await unlink(tmpFile).catch(() => {})

    return NextResponse.json({ text })
  } catch (e: any) {
    console.error("[Whisper API]", e)
    return NextResponse.json({ error: e.message || "Transcription failed" }, { status: 500 })
  }
}