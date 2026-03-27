import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashParticipant } from '@/lib/hash'
import { isHttpUrl, MAX_LENGTHS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, charity_id, new_charity } = body

    if (!campaign_id || typeof campaign_id !== 'string') {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    if (!charity_id && !new_charity) {
      return NextResponse.json(
        { error: 'Either charity_id or new_charity is required' },
        { status: 400 }
      )
    }

    // Get client IP and hash it
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''
    const ipHash = hashParticipant(ip, userAgent)

    // Check campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check for duplicate vote
    const { data: existingVote } = await supabase
      .from('charity_votes')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('ip_hash', ipHash)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this campaign' },
        { status: 409 }
      )
    }

    // Resolve charity_id
    let resolvedCharityId: string | null = charity_id || null

    if (new_charity) {
      const { name, website_url, description } = new_charity

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'new_charity.name is required' }, { status: 400 })
      }
      if (name.trim().length > MAX_LENGTHS.charityName) {
        return NextResponse.json({ error: `Charity name must be at most ${MAX_LENGTHS.charityName} characters` }, { status: 400 })
      }
      if (description && typeof description === 'string' && description.trim().length > MAX_LENGTHS.charityDescription) {
        return NextResponse.json({ error: `Charity description must be at most ${MAX_LENGTHS.charityDescription} characters` }, { status: 400 })
      }
      if (website_url && typeof website_url === 'string' && website_url.trim() && !isHttpUrl(website_url.trim())) {
        return NextResponse.json({ error: 'Charity website must be a valid http(s) URL' }, { status: 400 })
      }

      // Check if charity with same name exists (case-insensitive)
      const { data: existingCharity } = await supabase
        .from('charities')
        .select('id')
        .ilike('name', name.trim())
        .single()

      if (existingCharity) {
        resolvedCharityId = existingCharity.id
      } else {
        const { data: createdCharity, error: createError } = await supabase
          .from('charities')
          .insert({
            name: name.trim(),
            website_url: website_url?.trim() || null,
            description: description?.trim() || null,
          })
          .select('id')
          .single()

        if (createError || !createdCharity) {
          console.error('Create charity error:', createError)
          return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 })
        }
        resolvedCharityId = createdCharity.id
      }
    }

    if (!resolvedCharityId) {
      return NextResponse.json({ error: 'Could not resolve charity' }, { status: 400 })
    }

    // Verify the charity exists (when charity_id was passed directly)
    if (charity_id && !new_charity) {
      const { data: charity } = await supabase
        .from('charities')
        .select('id')
        .eq('id', charity_id)
        .single()

      if (!charity) {
        return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
      }
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabase
      .from('charity_votes')
      .insert({
        campaign_id,
        charity_id: resolvedCharityId,
        ip_hash: ipHash,
      })
      .select('*')
      .single()

    if (voteError || !vote) {
      console.error('Insert vote error:', voteError)
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    return NextResponse.json(vote, { status: 201 })
  } catch (err) {
    console.error('POST /api/votes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
