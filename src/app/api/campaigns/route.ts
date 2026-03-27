import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSlug, isHttpUrl, MAX_LENGTHS } from '@/lib/utils'

const PUBLIC_FIELDS = 'id, slug, title, description, target_audience, creator_name, survey_url, estimated_minutes, budget_cents, donation_per_completion_cents, verification_method, locked_charity_id, status, donation_confirmed, donation_proof_url, created_at, expires_at' as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const adminToken = searchParams.get('admin_token')

    if (!slug && !adminToken) {
      return NextResponse.json(
        { error: 'Either slug or admin_token query parameter is required' },
        { status: 400 }
      )
    }

    if (slug) {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(PUBLIC_FIELDS)
        .eq('slug', slug)
        .single()

      if (error || !campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }

      return NextResponse.json(campaign)
    }

    // Admin access via admin_token
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('admin_token', adminToken!)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch completion stats
    const { data: completions } = await supabase
      .from('completions')
      .select('status')
      .eq('campaign_id', campaign.id)

    const stats = {
      completions_verified: 0,
      completions_pending: 0,
      completions_rejected: 0,
      total_completions: 0,
    }

    if (completions) {
      for (const c of completions) {
        stats.total_completions++
        if (c.status === 'verified') stats.completions_verified++
        else if (c.status === 'pending') stats.completions_pending++
        else if (c.status === 'rejected') stats.completions_rejected++
      }
    }

    return NextResponse.json({
      ...campaign,
      stats,
    })
  } catch (err) {
    console.error('GET /api/campaigns error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      // Accept both camelCase (from form) and snake_case
      survey_url,
      surveyUrl,
      estimated_minutes,
      estimatedMinutes,
      budget_cents,
      totalBudgetCents,
      donation_per_completion_cents,
      perParticipationCents,
      verification_method,
      verificationMethod,
      completion_code,
      completionCode,
      locked_charity_name,
      fixedCharityName,
      fixedCharityDescription,
      fixedCharityWebsite,
      target_audience,
      targetAudience,
      verification_url,
      verificationUrl,
      is_public,
      isPublic,
      creator_name,
      creatorName,
    } = body

    const resolvedCreatorName = creator_name || creatorName || null
    const resolvedTargetAudience = target_audience || targetAudience || null
    const resolvedVerificationUrl = verification_url || verificationUrl || null

    const resolvedIsPublic = is_public ?? isPublic ?? false

    const resolvedSurveyUrl = survey_url || surveyUrl
    const resolvedEstimatedMinutes = estimated_minutes ?? estimatedMinutes
    const resolvedBudgetCents = budget_cents ?? totalBudgetCents
    const resolvedDonationCents = donation_per_completion_cents ?? perParticipationCents
    const resolvedVerificationMethod = verification_method || verificationMethod
    const resolvedCompletionCode = completion_code || completionCode
    const resolvedLockedCharityName = locked_charity_name || fixedCharityName

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }
    if (title.trim().length > MAX_LENGTHS.title) {
      return NextResponse.json({ error: `title must be at most ${MAX_LENGTHS.title} characters` }, { status: 400 })
    }
    if (!resolvedSurveyUrl || typeof resolvedSurveyUrl !== 'string' || resolvedSurveyUrl.trim().length === 0) {
      return NextResponse.json({ error: 'survey_url is required' }, { status: 400 })
    }
    if (!isHttpUrl(resolvedSurveyUrl.trim())) {
      return NextResponse.json({ error: 'survey_url must be a valid http(s) URL' }, { status: 400 })
    }
    if (resolvedTargetAudience && typeof resolvedTargetAudience === 'string' && resolvedTargetAudience.trim().length > 300) {
      return NextResponse.json({ error: 'target_audience must be at most 300 characters' }, { status: 400 })
    }
    if (description && typeof description === 'string' && description.trim().length > MAX_LENGTHS.description) {
      return NextResponse.json({ error: `description must be at most ${MAX_LENGTHS.description} characters` }, { status: 400 })
    }
    if (resolvedVerificationUrl && typeof resolvedVerificationUrl === 'string') {
      if (resolvedVerificationUrl.trim().length > MAX_LENGTHS.url) {
        return NextResponse.json({ error: 'verification_url too long' }, { status: 400 })
      }
    }
    if (resolvedCompletionCode && typeof resolvedCompletionCode === 'string' && resolvedCompletionCode.length > MAX_LENGTHS.code) {
      return NextResponse.json({ error: `completion_code must be at most ${MAX_LENGTHS.code} characters` }, { status: 400 })
    }

    const slug = generateSlug(title)

    // Handle locked charity
    let locked_charity_id: string | null = null
    if (resolvedLockedCharityName && typeof resolvedLockedCharityName === 'string' && resolvedLockedCharityName.trim().length > 0) {
      if (resolvedLockedCharityName.trim().length > MAX_LENGTHS.charityName) {
        return NextResponse.json({ error: `Charity name must be at most ${MAX_LENGTHS.charityName} characters` }, { status: 400 })
      }
      if (fixedCharityWebsite && typeof fixedCharityWebsite === 'string' && fixedCharityWebsite.trim() && !isHttpUrl(fixedCharityWebsite.trim())) {
        return NextResponse.json({ error: 'Charity website must be a valid http(s) URL' }, { status: 400 })
      }
      if (fixedCharityDescription && typeof fixedCharityDescription === 'string' && fixedCharityDescription.trim().length > MAX_LENGTHS.charityDescription) {
        return NextResponse.json({ error: `Charity description must be at most ${MAX_LENGTHS.charityDescription} characters` }, { status: 400 })
      }
      // Check if charity exists (case-insensitive)
      const { data: existingCharity } = await supabase
        .from('charities')
        .select('id')
        .ilike('name', resolvedLockedCharityName.trim())
        .single()

      if (existingCharity) {
        locked_charity_id = existingCharity.id
      } else {
        const { data: newCharity, error: charityError } = await supabase
          .from('charities')
          .insert({
            name: resolvedLockedCharityName.trim(),
            description: fixedCharityDescription?.trim() || null,
            website_url: fixedCharityWebsite?.trim() || null,
          })
          .select('id')
          .single()

        if (charityError || !newCharity) {
          return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 })
        }
        locked_charity_id = newCharity.id
      }
    }

    const budgetCents = resolvedBudgetCents != null ? Math.round(Number(resolvedBudgetCents)) : undefined
    const donationCents = resolvedDonationCents != null ? Math.round(Number(resolvedDonationCents)) : undefined

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        slug,
        title: title.trim(),
        description: description?.trim() || '',
        target_audience: resolvedTargetAudience?.trim() || null,
        survey_url: resolvedSurveyUrl.trim(),
        estimated_minutes: resolvedEstimatedMinutes != null ? Number(resolvedEstimatedMinutes) : 5,
        budget_cents: budgetCents,
        donation_per_completion_cents: donationCents,
        verification_method: resolvedVerificationMethod || 'code',
        completion_code: resolvedCompletionCode || null,
        verification_url: resolvedVerificationUrl,
        locked_charity_id,
        creator_name: resolvedCreatorName?.trim()?.substring(0, 100) || null,
        is_public: resolvedIsPublic,
      })
      .select('id, slug, admin_token')
      .single()

    if (error || !campaign) {
      console.error('Insert campaign error:', error)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json(
      {
        id: campaign.id,
        slug: campaign.slug,
        adminUrl: `/admin/${campaign.admin_token}`,
        participantUrl: `/s/${campaign.slug}`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/campaigns error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_token, status, donation_confirmed, donation_proof_url } = body

    if (!admin_token || typeof admin_token !== 'string') {
      return NextResponse.json({ error: 'admin_token is required' }, { status: 400 })
    }

    // Verify campaign exists with this admin_token
    const { data: existing, error: fetchError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('admin_token', admin_token)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Campaign not found or invalid admin_token' }, { status: 404 })
    }

    // Validate status value
    const ALLOWED_STATUSES = ['active', 'completed', 'cancelled']
    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 })
    }

    // Validate donation_proof_url size (base64 images can be very large)
    if (donation_proof_url !== undefined && donation_proof_url !== null) {
      if (typeof donation_proof_url !== 'string') {
        return NextResponse.json({ error: 'donation_proof_url must be a string' }, { status: 400 })
      }
      if (donation_proof_url.length > MAX_LENGTHS.base64Image) {
        return NextResponse.json({ error: 'donation_proof_url is too large (max ~5MB)' }, { status: 400 })
      }
      // Must be either a valid http(s) URL or a data:image/* URL
      if (!donation_proof_url.startsWith('data:image/') && !isHttpUrl(donation_proof_url)) {
        return NextResponse.json({ error: 'donation_proof_url must be an image data URL or http(s) URL' }, { status: 400 })
      }
    }

    // Build update object with only allowed fields
    const updates: Record<string, unknown> = {}
    if (status !== undefined) updates.status = status
    if (donation_confirmed !== undefined) updates.donation_confirmed = donation_confirmed
    if (donation_proof_url !== undefined) updates.donation_proof_url = donation_proof_url

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', existing.id)
      .select('*')
      .single()

    if (updateError || !updated) {
      console.error('Update campaign error:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/campaigns error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_token } = body

    if (!admin_token || typeof admin_token !== 'string') {
      return NextResponse.json({ error: 'admin_token is required' }, { status: 400 })
    }

    // Verify campaign exists with this admin_token
    const { data: existing, error: fetchError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('admin_token', admin_token)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Campaign not found or invalid admin_token' }, { status: 404 })
    }

    // Delete completions first (cascade should handle this, but be explicit)
    await supabase.from('completions').delete().eq('campaign_id', existing.id)

    // Delete the campaign
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      console.error('Delete campaign error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/campaigns error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
