import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    // Total verified completions
    const { count: totalCompletions } = await supabase
      .from('completions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified')

    // Campaigns with confirmed donations
    const { data: confirmedCampaigns } = await supabase
      .from('campaigns')
      .select('id, donation_per_completion_cents')
      .eq('donation_confirmed', true)

    let confirmedDonationCents = 0
    if (confirmedCampaigns && confirmedCampaigns.length > 0) {
      const campaignIds = confirmedCampaigns.map((c) => c.id)
      const { data: completions } = await supabase
        .from('completions')
        .select('campaign_id')
        .in('campaign_id', campaignIds)
        .eq('status', 'verified')

      const countMap: Record<string, number> = {}
      for (const c of completions ?? []) {
        countMap[c.campaign_id] = (countMap[c.campaign_id] ?? 0) + 1
      }

      for (const campaign of confirmedCampaigns) {
        const verified = countMap[campaign.id] ?? 0
        confirmedDonationCents += verified * campaign.donation_per_completion_cents
      }
    }

    // Total campaigns
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      total_completions: totalCompletions ?? 0,
      confirmed_donation_cents: confirmedDonationCents,
      total_campaigns: totalCampaigns ?? 0,
    })
  } catch {
    return NextResponse.json({
      total_completions: 0,
      confirmed_donation_cents: 0,
      total_campaigns: 0,
    })
  }
}
