export default function Footer() {
  const footerLinks = [
    { name: 'Inquire', href: '#inquire' },
    { name: 'About', href: '#about' },
    { name: 'Terms & Conditions', href: '#terms' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Press', href: '#press' },
  ]

  return (
    <footer className="bg-black text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo and description */}
          <div>
            <h3 className="text-2xl font-bold mb-4">BIG</h3>
            <p className="text-gray-300 mb-6">
              The community where multi-hyphenates connect, collaborate, and thrive.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Business Inside the Game, LLC
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              BIG and all related logos are trademarks of Business Inside the Game, LLC.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
