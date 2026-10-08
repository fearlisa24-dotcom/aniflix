import Link from 'next/link';

const footerLinks = [
  {
    title: 'Navigate',
    links: [
      { label: 'Popular Anime', href: '/search?sort=popular' },
      { label: 'Simulcast Season', href: '/search?sort=simulcast' },
      { label: 'Newly Added', href: '/search?sort=new' },
      { label: 'Browse All', href: '/search' },
    ],
  },
  {
    title: 'Aniflix',
    links: [
      { label: 'About', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'TikTok', href: 'https://www.tiktok.com/@aniflix3' },
      { label: 'Discord', href: 'https://discord.gg/cfz3HUQeG' },
      { label: 'Twitter / X', href: '#' },
      { label: 'Reddit', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] mt-20">
      <div className="px-hero-pad py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo section */}
          <div>
            <svg
              width="115"
              height="28"
              viewBox="0 0 132 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Aniflix"
            >
              <path d="M4 28L16 4L28 28H22L16 14L10 28H4Z" fill="#F47521" />
              <path d="M12 20L16 12L20 20H12Z" fill="#0a0a0a" />
              <path d="M14 18L18 16L14 14V18Z" fill="#F47521" />
              <text x="32" y="28" fill="#F47521" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="31" letterSpacing="-0.04em">NIFLIX</text>
            </svg>
            <p className="mt-4 text-xs text-[#707070] leading-relaxed">
              Your destination for streaming anime. Powered by AniList.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-[#a0a0a0] mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#707070] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-[#707070]">
            &copy; {new Date().getFullYear()} Aniflix. Not affiliated with any anime producers.
            Data provided by AniList.
          </p>
        </div>
      </div>
    </footer>
  );
}
