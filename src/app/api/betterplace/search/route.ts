import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get("limit") || "20", 10),
    50
  )

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  // Use ilike for simple pattern matching (works without pg_trgm extension)
  const pattern = `%${q}%`

  const { data, error } = await supabase
    .from("betterplace_charities")
    .select("betterplace_id, name, description, city, country, logo_url, website_url, betterplace_url")
    .ilike("name", pattern)
    .order("name")
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
