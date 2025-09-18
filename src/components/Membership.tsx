export default function Membership() {
  const membershipFeatures = [
    {
      title: 'Curated Events',
      description: 'Learn More',
      icon: '🎯'
    },
    {
      title: 'Collectives',
      description: 'Learn More',
      icon: '👥'
    },
    {
      title: 'Community',
      description: 'Learn More',
      icon: '🌟'
    }
  ]

  return (
    <div className="bg-white py-20" id="membership">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            BIG membership
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipFeatures.map((feature, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 hover:text-black transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
