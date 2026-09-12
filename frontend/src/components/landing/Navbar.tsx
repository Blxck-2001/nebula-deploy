"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Github } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/recursos", label: "Recursos" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/tecnologias", label: "Tecnologias" },
  { href: "/documentacao", label: "Documentação" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-nebula-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-medium text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/Blxck-2001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:flex"
            aria-label="GitHub"
          >
            <Github size={20} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-violet-500/30 hover:bg-violet-500/10"
          >
            Acessar plataforma
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>
    </header>
  );
}
