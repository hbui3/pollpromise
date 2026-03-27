import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Well-known German nonprofits to feature by default
const FEATURED_NAMES = [
  'Ärzte ohne Grenzen',
  'UNICEF',
  'WWF Deutschland',
  'Welthungerhilfe',
  'Deutsche Krebshilfe',
  'SOS-Kinderdörfer weltweit',
  'Amnesty International',
  'Tafel Deutschland',
  'NABU',
]

export async function GET() {
  // Try to find these orgs in betterplace_charities
  const results: { betterplace_id: number; name: string; description: string | null; city: string | null; logo_url: string | null; website_url: string | null; betterplace_url: string | null }[] = []

  for (const name of FEATURED_NAMES) {
    if (results.length >= 9) break

    const { data } = await supabase
      .from('betterplace_charities')
      .select('betterplace_id, name, description, city, logo_url, website_url, betterplace_url')
      .ilike('name', `%${name}%`)
      .limit(1)

    if (data && data.length > 0) {
      // Avoid duplicates
      if (!results.find((r) => r.betterplace_id === data[0].betterplace_id)) {
        results.push(data[0])
      }
    }
  }

  // If we have fewer than 20, fill with random popular ones
  if (results.length < 9) {
    const existingIds = results.map((r) => r.betterplace_id)
    const { data: extras } = await supabase
      .from('betterplace_charities')
      .select('betterplace_id, name, description, city, logo_url, website_url, betterplace_url')
      .not('betterplace_id', 'in', `(${existingIds.join(',')})`)
      .order('name')
      .limit(9 - results.length)

    if (extras) {
      results.push(...extras)
    }
  }

  return NextResponse.json(results)
}
