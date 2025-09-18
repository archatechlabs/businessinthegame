import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Membership from '@/components/Membership'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Membership />
      <Footer />
    </div>
  )
}
