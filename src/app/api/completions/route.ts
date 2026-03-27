import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashParticipant } from '@/lib/hash'
import { MAX_LENGTHS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, verification_type, code_entered, screenshot_data, url_entered } = body

    if (!campaign_id || typeof campaign_id !== 'string') {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    if (!verification_type || !['code', 'screenshot', 'url'].includes(verification_type)) {
      return NextResponse.json(
        { error: 'verification_type must be "code", "screenshot", or "url"' },
        { status: 400 }
      )
    }

    // Get client IP + User-Agent and hash them together
    // This allows multiple users behind the same IP (CGN, university networks)
    // while still preventing the same person from submitting twice
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''
    const ipHash = hashParticipant(ip, userAgent)

    // Check campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status, budget_cents, donation_per_completion_cents, completion_code, survey_url, verification_url')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 })
    }

    // Check budget not exhausted
    const { count: verifiedCount } = await supabase
      .from('completions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaign_id)
      .eq('status', 'verified')

    const spentCents = (verifiedCount ?? 0) * campaign.donation_per_completion_cents
    if (spentCents >= campaign.budget_cents) {
      return NextResponse.json({ error: 'Campaign budget is exhausted' }, { status: 400 })
    }

    // Check for duplicate submission (same campaign + IP)
    const { data: existingCompletion } = await supabase
      .from('completions')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('ip_hash', ipHash)
      .single()

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'You have already submitted a completion for this campaign' },
        { status: 409 }
      )
    }

    // Handle code verification
    if (verification_type === 'code') {
      if (!code_entered || typeof code_entered !== 'string') {
        return NextResponse.json({ error: 'code_entered is required for code verification' }, { status: 400 })
      }
      if (code_entered.length > MAX_LENGTHS.code) {
        return NextResponse.json({ error: 'code_entered is too long' }, { status: 400 })
      }

      const codeMatch =
        campaign.completion_code != null &&
        code_entered.trim().toLowerCase() === campaign.completion_code.toLowerCase()

      if (!codeMatch) {
        return NextResponse.json({ error: 'wrong_code' }, { status: 400 })
      }

      const { data: completion, error: insertError } = await supabase
        .from('completions')
        .insert({
          campaign_id,
          ip_hash: ipHash,
          verification_type: 'code',
          code_entered: code_entered.trim(),
          status: 'verified',
        })
        .select('*')
        .single()

      if (insertError || !completion) {
        console.error('Insert completion error:', insertError)
        return NextResponse.json({ error: 'Failed to create completion' }, { status: 500 })
      }

      return NextResponse.json(completion, { status: 201 })
    }

    // Handle screenshot verification
    if (verification_type === 'screenshot') {
      // Validate screenshot size
      if (screenshot_data && typeof screenshot_data === 'string' && screenshot_data.length > MAX_LENGTHS.base64Image) {
        return NextResponse.json({ error: 'Screenshot is too large (max ~5MB)' }, { status: 400 })
      }

      // Upload screenshot to Supabase Storage
      let screenshotUrl: string | null = null
      if (screenshot_data && typeof screenshot_data === 'string' && screenshot_data.startsWith('data:image/')) {
        // Extract mime type and base64 content
        const matches = screenshot_data.match(/^data:(image\/\w+);base64,(.+)$/)
        if (matches) {
          const mimeType = matches[1]
          const base64Content = matches[2]
          const ext = mimeType.split('/')[1] || 'png'
          const fileName = `${campaign_id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

          const buffer = Buffer.from(base64Content, 'base64')

          const { error: uploadError } = await supabase.storage
            .from('screenshots')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: false,
            })

          if (uploadError) {
            console.error('Screenshot upload error:', uploadError)
            return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 })
          }

          const { data: publicUrl } = supabase.storage
            .from('screenshots')
            .getPublicUrl(fileName)

          screenshotUrl = publicUrl.publicUrl
        }
      }

      const { data: completion, error: insertError } = await supabase
        .from('completions')
        .insert({
          campaign_id,
          ip_hash: ipHash,
          verification_type: 'screenshot',
          screenshot_url: screenshotUrl,
          status: 'pending',
        })
        .select('*')
        .single()

      if (insertError || !completion) {
        console.error('Insert completion error:', insertError)
        return NextResponse.json({ error: 'Failed to create completion' }, { status: 500 })
      }

      return NextResponse.json(completion, { status: 201 })
    }

    // Handle URL verification
    if (verification_type === 'url') {
      if (!url_entered || typeof url_entered !== 'string') {
        return NextResponse.json({ error: 'url_entered is required for url verification' }, { status: 400 })
      }
      if (url_entered.length > MAX_LENGTHS.url) {
        return NextResponse.json({ error: 'url_entered is too long' }, { status: 400 })
      }

      const normalize = (u: string) => u.trim().toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '')
      const compareUrl = campaign.verification_url || campaign.survey_url
      const urlMatch = compareUrl != null && normalize(url_entered) === normalize(compareUrl)

      if (!urlMatch) {
        return NextResponse.json({ error: 'wrong_url' }, { status: 400 })
      }

      const { data: completion, error: insertError } = await supabase
        .from('completions')
        .insert({
          campaign_id,
          ip_hash: ipHash,
          verification_type: 'url',
          code_entered: url_entered.trim(),
          status: 'verified',
        })
        .select('*')
        .single()

      if (insertError || !completion) {
        console.error('Insert completion error:', insertError)
        return NextResponse.json({ error: 'Failed to create completion' }, { status: 500 })
      }

      return NextResponse.json(completion, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid verification_type' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/completions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { completion_id, status, admin_token } = body

    if (!completion_id || !status || !admin_token) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "verified" or "rejected"' },
        { status: 400 }
      )
    }

    // Get completion with campaign
    const { data: completion } = await supabase
      .from('completions')
      .select('*, campaigns!inner(admin_token)')
      .eq('id', completion_id)
      .single()

    if (!completion) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Verify admin token - access the joined campaign data
    if ((completion as any).campaigns?.admin_token !== admin_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('completions')
      .update({ status })
      .eq('id', completion_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/completions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const adminToken = searchParams.get('admin_token')

    if (!campaignId || !adminToken) {
      return NextResponse.json(
        { error: 'campaign_id and admin_token query parameters are required' },
        { status: 400 }
      )
    }

    // Verify admin_token matches the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, admin_token')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.admin_token !== adminToken) {
      return NextResponse.json({ error: 'Invalid admin_token' }, { status: 403 })
    }

    const { data: completions, error } = await supabase
      .from('completions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch completions error:', error)
      return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 })
    }

    return NextResponse.json(completions ?? [])
  } catch (err) {
    console.error('GET /api/completions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
