/**
 * In-memory store for song generation jobs.
 *
 * Flow:
 *  1. POST /api/generate-song  → creates entry with status "processing"
 *  2. n8n does its thing (agent → lyrics → Suno)
 *  3. Suno calls n8n callback webhook
 *  4. n8n Flow 2 POSTs completed song data to POST /api/suno-callback
 *  5. /api/suno-callback updates the entry to status "complete"
 *  6. Frontend polls GET /api/generate-song/status?jobId=xxx and gets the result
 *
 * Note: This is an in-memory Map. It works perfectly for a single-instance
 * Next.js server. For multi-instance deployments, swap this for Redis/DB.
 */

export interface SongJob {
  status: "processing" | "complete" | "error"
  prompt?: string
  error?: string

  // Song data — populated by the suno-callback
  title?: string
  lyrics?: string
  audioUrl?: string
  emotion?: string
  genre?: string
  imageUrl?: string
  metadata?: {
    bpm?: number
    key?: string
    duration?: number
    tags?: string
    style?: string
  }

  createdAt?: number
  completedAt?: number
}

class SongStore {
  private readonly store = new Map<string, SongJob>()

  /** Auto-cleanup: remove jobs older than 30 minutes */
  private readonly TTL_MS = 30 * 60 * 1000

  set(jobId: string, data: SongJob) {
    this.store.set(jobId, { ...data, createdAt: data.createdAt ?? Date.now() })
    this.cleanup()
  }

  get(jobId: string): SongJob | undefined {
    return this.store.get(jobId)
  }

  update(jobId: string, patch: Partial<SongJob>) {
    const existing = this.store.get(jobId)
    if (existing) {
      this.store.set(jobId, { ...existing, ...patch })
    }
  }

  delete(jobId: string) {
    this.store.delete(jobId)
  }

  /** Remove stale entries to prevent memory leaks */
  private cleanup() {
    const now = Date.now()
    for (const [id, job] of this.store) {
      if (job.createdAt && now - job.createdAt > this.TTL_MS) {
        this.store.delete(id)
      }
    }
  }
}

/** Singleton — survives across hot reloads in dev via globalThis */
const globalStore = globalThis as unknown as { __songStore?: SongStore }

export const songStore: SongStore =
  globalStore.__songStore ?? (globalStore.__songStore = new SongStore())
