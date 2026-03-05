import { useState } from "react";
import { Shield, Menu, X, Terminal } from "lucide-react";

const navLinks = [
  { label: "Início", href: "#hero" },
  { label: "Habilidades", href: "#skills" },
  { label: "Atuação", href: "#atuacao" },
  { label: "Projetos", href: "#projetos" },
  { label: "Sobre", href: "#sobre" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0d14]/90 backdrop-blur border-b border-[#00ff9d]/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleNav("#hero"); }}
          className="flex items-center gap-2 text-[#00ff9d]"
        >
          <Shield size={20} />
          <span className="text-sm font-mono text-[#00ff9d]">JE::SOC</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
              className="text-sm font-mono text-[#8892b0] hover:text-[#00ff9d] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border border-[#00ff9d]/40 text-[#00ff9d] rounded hover:bg-[#00ff9d]/10 transition-colors"
          >
            <Terminal size={13} />
            GitHub
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#8892b0] hover:text-[#00ff9d] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0a0d14] border-t border-[#00ff9d]/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
              className="text-sm font-mono text-[#8892b0] hover:text-[#00ff9d] transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 border border-[#00ff9d]/40 text-[#00ff9d] rounded hover:bg-[#00ff9d]/10 transition-colors w-fit"
          >
            <Terminal size={13} />
            GitHub
          </a>
        </div>
      )}
    </header>
  );
}