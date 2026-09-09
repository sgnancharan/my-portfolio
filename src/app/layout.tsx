import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Outfit } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { profile } from "@/data/profile";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

const title = `${profile.displayName} — Systems, infrastructure, space`;
const description =
  "Portfolio of S. Gnan Charan, studying NIAT (NxtWave in Advanced Technologies) at NSRIT, Andhra Pradesh. Systems administration, Linux, Docker, self-hosted infrastructure, and a longer interest in space technology.";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/logo.ico",
  },
  keywords: [
    "S. Gnan Charan",
    "NIAT",
    "NxtWave",
    "NSRIT",
    "systems administration",
    "Docker",
    "Linux",
    "Jellyfin",
    "space technology",
  ],
  authors: [{ name: profile.name, url: profile.github }],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('sgc-portfolio-theme');
                const isLight = stored === 'light' || (!stored && window.matchMedia('(prefers-color-scheme: light)').matches);
                if (isLight) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-void text-slate-100 transition-colors duration-500">
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
