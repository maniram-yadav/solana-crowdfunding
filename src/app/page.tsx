'use client'

import CampaignCard from '@/components/CampaignCard'
import CampaignHero from '@/components/CampaignHero'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchActiveCampaigns,
  getProviderReadonly,
} from '@/services/blockapi'
import { Campaign } from '@/utils/interfaces'


export default function Page() {

  const [campaign, setCampaign] = useState<Campaign[]>([])
  const program = useMemo(() => getProviderReadonly(), [])

  useEffect(() => {
    fetchActiveCampaigns(program!).then((data) => setCampaign(data))
  }, [program])


  return (
    <div className="container mx-auto p-6">
      <CampaignHero />
      main body
    </div>
  )
}
