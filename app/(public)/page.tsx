
import Hero from '@/components/layout/Hero'
import BrandValue from '@/components/layout/BrandValue'
import Collection from '@/components/layout/FeaturedCollection'
import CustomizerSpotLight from '@/components/layout/CustomizerSpotLight'
import ReviewSection from '@/components/layout/ReviewSection'
import ReviewTwo from '@/components/layout/ReviewTwo'

export const metadata = {
  title: 'Home',
}

export default function HomePage() {
  return (
    <div className="w-full">
      <Hero/>
      <BrandValue/>
      <Collection/>
      <CustomizerSpotLight/>
      <ReviewSection/>
      <ReviewTwo/>
    </div>
  )
}
