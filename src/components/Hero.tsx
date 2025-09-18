export default function Hero() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8">
            BIG is the stage for{' '}
            <span className="text-gray-600">multi-hyphenates</span>
          </h1>

          {/* Subheading with Connect, Collaborate, Thrive */}
          <div className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-700 mb-12">
            <div className="space-y-2">
              <div>The community where</div>
              <div className="font-bold text-black">multi—hyphenates</div>
              <div className="space-x-8">
                <span className="inline-block">Connect</span>
                <span className="inline-block">Collaborate</span>
                <span className="inline-block">Thrive</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
            Explore Membership
          </button>
        </div>
      </div>

      {/* Learn the game section */}
      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-8">
              Learn the game{' '}
              <span className="text-gray-600">on and off the field</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              The membership community for athletes, entrepreneurs, creators, and investors. 
              Experience unparalleled networking through our curated events.
            </p>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-black mb-4">Our Vision</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
