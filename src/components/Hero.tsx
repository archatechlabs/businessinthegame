export default function Hero() {
  return (
    <div className="bg-white">
      {/* Hero Image Section - Full height with just the image */}
      <div className="relative h-screen w-full">
        <img
          src="/hero-image.webp"
          alt="BIG Center Stage Hero - Locker Room"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Text Section - Below the hero image */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main heading - "THE COMMUNITY WHERE" */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight text-blue-900">
              THE COMMUNITY WHERE
            </h1>
            
            {/* Sub heading - "MULTI—HYPHENATES CONNECT" */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-12 tracking-tight text-blue-900">
              MULTI—HYPHENATES CONNECT
            </h2>
            
            {/* CTA Button - Light blue like in reference */}
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg">
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
