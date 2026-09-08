import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Outfit } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
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
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-slate-100">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
