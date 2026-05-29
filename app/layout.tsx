import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Příležitosti — denní výběr",
  description:
    "Každý den dvě nové příležitosti: jedna na míru tvému profilu, jedna ze světových trendů použitelných v ČR.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body>
        <header className="sticky top-0 z-30 border-b border-ink/[0.07] bg-paper/85 backdrop-blur">
          <div className="container-tight flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="text-lg font-extrabold tracking-tight text-ink">
                Příležitosti<span className="text-brand">.cz</span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-ink/60">
              <Link href="/" className="transition-colors hover:text-ink">
                Výpis
              </Link>
              <Link href="/rss.xml" className="transition-colors hover:text-ink">
                RSS
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-ink/[0.07]">
          <div className="container-tight flex flex-col gap-2 py-10 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Denní výběr příležitostí. Generováno každý den v 5:00. Pouze osobní
              použití.
            </span>
            <Link
              href="/admin"
              className="text-ink/40 transition-colors hover:text-ink/70"
            >
              Nastavení
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

function Logo() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 flex-col items-center justify-center gap-[3px] rounded-xl bg-brand-soft"
    >
      <span className="h-[3px] w-4 rounded-full bg-brand" />
      <span className="h-[3px] w-[18px] rounded-full bg-brand" />
      <span className="h-[3px] w-3 rounded-full bg-brand" />
    </span>
  );
}
