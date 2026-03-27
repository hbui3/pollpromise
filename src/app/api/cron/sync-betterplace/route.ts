import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const PER_PAGE = 200
const MAX_PAGES = 10 // 2000 orgs max per run — fits in 60s timeout
const API_BASE = "https://api.betterplace.org/de/api_v4/organisations.json"

interface BetterplaceOrg {
  id: number
  name: string
  description: string | null
  city: string | null
  country: string | null
  tax_deductible: boolean | null
  picture?: { links?: { rel: string; href: string }[] }
  links?: { rel: string; href: string }[]
}

function extractOrg(raw: BetterplaceOrg) {
  return {
    betterplace_id: raw.id,
    name: raw.name || "",
    description: (raw.description || "").substring(0, 500),
    city: raw.city || null,
    country: raw.country || null,
    tax_deductible: raw.tax_deductible ?? null,
    logo_url:
      raw.picture?.links?.find((l) => l.rel === "fill_200x200")?.href || null,
    website_url: raw.links?.find((l) => l.rel === "website")?.href || null,
    betterplace_url:
      raw.links?.find((l) => l.rel === "platform")?.href || null,
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this header for cron jobs)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  let imported = 0
  let errors = 0

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      // Fetch most recently updated orgs first
      const url = `${API_BASE}?per_page=${PER_PAGE}&page=${page}&order=updated_at:desc`
      const res = await fetch(url)

      if (!res.ok) {
        errors++
        continue
      }

      const json = await res.json()
      const orgs = (json.data || []).map(extractOrg)

      if (orgs.length === 0) break

      const { error } = await supabase
        .from("betterplace_charities")
        .upsert(orgs, { onConflict: "betterplace_id" })

      if (error) {
        errors++
      } else {
        imported += orgs.length
      }

      // Stop if we're running out of time (50s safety margin)
      if (Date.now() - startTime > 50_000) break
    }

    return NextResponse.json({
      ok: true,
      imported,
      errors,
      duration_ms: Date.now() - startTime,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    )
  }
}
