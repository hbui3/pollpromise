import { supabase } from '@/lib/supabase'

export interface PublicCampaign {
  id: string
  slug: string
  title: string
  description: string
  survey_url: string
  estimated_minutes: number
  budget_cents: number
  donation_per_completion_cents: number
  status: string
  target_audience: string | null
  donation_confirmed: boolean
  donation_proof_url: string | null
  is_public: boolean
  created_at: string
  verified_count: number
  charity: { id: string; name: string; website_url: string | null } | null
}

export async function getPublicCampaigns(): Promise<{
  active: PublicCampaign[]
  completed: PublicCampaign[]
}> {
  try {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(
        'id, slug, title, description, target_audience, survey_url, estimated_minutes, budget_cents, donation_per_completion_cents, locked_charity_id, status, donation_confirmed, donation_proof_url, is_public, created_at'
      )
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (!campaigns || campaigns.length === 0)
      return { active: [], completed: [] }

    const enriched = await Promise.all(
      campaigns.map(async (campaign) => {
        const { count } = await supabase
          .from('completions')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'verified')

        let charity = null
        if (campaign.locked_charity_id) {
          const { data } = await supabase
            .from('charities')
            .select('id, name, website_url')
            .eq('id', campaign.locked_charity_id)
            .single()
          charity = data
        }

        return {
          ...campaign,
          verified_count: count ?? 0,
          charity,
        } as PublicCampaign
      })
    )

    return {
      active: enriched.filter((c) => c.status === 'active'),
      completed: enriched.filter(
        (c) => c.status === 'completed' || c.donation_confirmed
      ),
    }
  } catch {
    return { active: [], completed: [] }
  }
}
