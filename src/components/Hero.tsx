import Image from 'next/image'

export default function Hero() {
  return (
    <div className="bg-white">
      {/* Hero Image Section */}
      <div className="relative h-[70vh] min-h-[500px]">
        <Image
          src="/Images/663c7a22e233c27b7722622e_big-center_stage-hero__feature.webp"
          alt="BIG Center Stage Hero"
          fill
          className="object-cover"
          priority
        />
        
        {/* Text Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              THE COMMUNITY WHERE
            </h1>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8">
              MULTI—HYPHENATES CONNECT
            </h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-medium transition-colors">
              Explore Membership
            </button>
          </div>
        </div>
      </div>

      {/* Learn the game section */}
      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-8">
              Learn the game{' '}
              <span className="text-gray-600">on and off the field</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              The membership community for athletes, entrepreneurs, creators, and investors. 
              Experience unparalleled networking through our curated events.
            </p>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Our Vision</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
