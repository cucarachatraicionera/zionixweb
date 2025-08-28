import React from 'react'
import Hero from '@/components/Home/Hero'
import Work from '@/components/Home/work'
import TimeLine from '@/components/Home/timeline'
import DexSection from '@/components/Home/Dex/DexSection'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zionix',
}

export default function Home() {
  return (
    <main>
      <DexSection />
      <Hero />
      <Work />
      <TimeLine />
    </main>
  )
}
