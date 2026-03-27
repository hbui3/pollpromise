import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isHttpUrl, MAX_LENGTHS } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const charityId = searchParams.get('id')
    const campaignId = searchParams.get('campaign_id')

    // Fetch single charity by ID
    if (charityId) {
      const { data: charity, error } = await supabase
        .from('charities')
        .select('id, name, description, website_url, logo_url')
        .eq('id', charityId)
        .single()

      if (error || !charity) {
        return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
      }

      return NextResponse.json(charity)
    }

    if (campaignId) {
      // Fetch ALL charities + vote counts for this campaign in parallel
      const [charitiesRes, votesRes] = await Promise.all([
        supabase.from('charities').select('id, name, description, website_url, logo_url').order('name'),
        supabase.from('charity_votes').select('charity_id').eq('campaign_id', campaignId),
      ])

      if (charitiesRes.error) {
        return NextResponse.json({ error: 'Failed to fetch charities' }, { status: 500 })
      }

      // Count votes per charity
      const voteCounts: Record<string, number> = {}
      for (const vote of votesRes.data ?? []) {
        voteCounts[vote.charity_id] = (voteCounts[vote.charity_id] ?? 0) + 1
      }

      // Merge and sort: voted charities first, then rest alphabetically
      const result = (charitiesRes.data ?? [])
        .map((charity) => ({ ...charity, vote_count: voteCounts[charity.id] ?? 0 }))
        .sort((a, b) => b.vote_count - a.vote_count)

      return NextResponse.json(result)
    }

    // No campaign_id: return all charities ordered by name
    const { data: charities, error } = await supabase
      .from('charities')
      .select('id, name, description, website_url, logo_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('Fetch charities error:', error)
      return NextResponse.json({ error: 'Failed to fetch charities' }, { status: 500 })
    }

    return NextResponse.json(charities ?? [])
  } catch (err) {
    console.error('GET /api/charities error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, website_url, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (name.trim().length > MAX_LENGTHS.charityName) {
      return NextResponse.json({ error: `name must be at most ${MAX_LENGTHS.charityName} characters` }, { status: 400 })
    }
    if (description && typeof description === 'string' && description.trim().length > MAX_LENGTHS.charityDescription) {
      return NextResponse.json({ error: `description must be at most ${MAX_LENGTHS.charityDescription} characters` }, { status: 400 })
    }
    if (website_url && typeof website_url === 'string' && website_url.trim()) {
      if (!isHttpUrl(website_url.trim())) {
        return NextResponse.json({ error: 'website_url must be a valid http(s) URL' }, { status: 400 })
      }
    }

    // Check if charity with same name already exists (case-insensitive)
    const { data: existing } = await supabase
      .from('charities')
      .select('*')
      .ilike('name', name.trim())
      .single()

    if (existing) {
      return NextResponse.json(existing)
    }

    // Create new charity
    const { data: charity, error } = await supabase
      .from('charities')
      .insert({
        name: name.trim(),
        website_url: website_url?.trim() || null,
        description: description?.trim() || null,
      })
      .select('*')
      .single()

    if (error || !charity) {
      console.error('Insert charity error:', error)
      return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 })
    }

    return NextResponse.json(charity, { status: 201 })
  } catch (err) {
    console.error('POST /api/charities error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
