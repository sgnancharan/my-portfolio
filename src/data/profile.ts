import type { SocialLink, TelemetryRow } from "@/types";

export const profile = {
  name: "S. Gnan Charan",
  displayName: "S. GNAN CHARAN",
  shortName: "SGC",
  tagline: "TECHNOLOGY × INFRASTRUCTURE × SPACE",
  role: "Student · systems & infrastructure",
  study: "NIAT (NxtWave in Advanced Technologies)",
  campus: "NSRIT, Andhra Pradesh",
  location: "Andhra Pradesh, India",
  aboutHeadline: "ENGINEERING THE SYSTEM, NOT JUST THE INTERFACE.",
  aboutBody: [
    "I am a student at NIAT (NxtWave in Advanced Technologies), based at NSRIT in Andhra Pradesh. My work sits closer to the machine than the mockup: Linux hosts, containers, isolation, and the quiet logic that keeps a system reachable.",
    "I spend time on systems administration, Debian 13 Trixie and boot-level recovery (including MBR), Docker and Docker Swarm, web development, and self-hosted infrastructure such as Jellyfin. I care about how workloads are isolated, how access is decided, and how multimedia actually runs on hardware I operate.",
    "Space technology and astronomy are the longer horizon. Computing, simulation, and systems engineering are the tools I am building toward that interest — not a claim of flight hardware, just a direction of study.",
  ],
  telemetry: [
    { label: "NODE", value: "S. GNAN CHARAN" },
    { label: "STATUS", value: "STUDYING · ACTIVE" },
    { label: "PROGRAM", value: "NIAT / NXTWAVE" },
    { label: "CAMPUS", value: "NSRIT, A.P." },
    { label: "FOCUS", value: "SYSTEMS · LINUX · DOCKER" },
    { label: "HORIZON", value: "SPACE TECH · ASTRONOMY" },
  ] satisfies TelemetryRow[],
  github: "https://github.com/sgnancharan",
  photo: "/images/Portfolio_Pic.png",
} as const;

export const socials: readonly SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/sgnancharan",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/s-gnan-charan-994a1b349/",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/s_gnan_charan",
  },
];
