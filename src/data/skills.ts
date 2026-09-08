import type { Skill } from "@/types";

export const skills: readonly Skill[] = [
  {
    id: "containerization",
    title: "Containerization",
    index: "01",
    summary:
      "Packaging and running services with Docker, and coordinating replicas with Docker Swarm rather than treating containers as a demo.",
    signals: ["Docker", "Docker Swarm", "Image hygiene", "Service isolation"],
  },
  {
    id: "web-development",
    title: "Web Development",
    index: "02",
    summary:
      "Building interfaces and application structure for the web, with attention to how the frontend sits on real infrastructure.",
    signals: ["Application structure", "UI systems", "Client/server boundaries"],
  },
  {
    id: "systems-administration",
    title: "Systems Administration",
    index: "03",
    summary:
      "Day-to-day Linux operations, Debian 13 Trixie administration, and recovery work that includes MBR-level boot concerns.",
    signals: ["Linux", "Debian 13 Trixie", "MBR / boot", "Host maintenance"],
  },
  {
    id: "self-hosted",
    title: "Self-hosted Infrastructure",
    index: "04",
    summary:
      "Operating personal infrastructure instead of outsourcing every layer — including a self-hosted Jellyfin media path.",
    signals: ["Jellyfin", "On-prem services", "Network locality"],
  },
  {
    id: "hpc-opt",
    title: "HPC / Workload Optimization",
    index: "05",
    summary:
      "Thinking in terms of workload isolation and server optimization: what runs where, what it contends for, and how to keep the host honest.",
    signals: ["Workload isolation", "Server optimization", "Resource contention"],
  },
  {
    id: "access-control",
    title: "Access Control",
    index: "06",
    summary:
      "Access-control logic as a systems problem: who may reach a service, under what conditions, and how that decision is enforced.",
    signals: ["Authorization logic", "Service boundaries", "Least privilege"],
  },
  {
    id: "multimedia",
    title: "Multimedia",
    index: "07",
    summary:
      "Multimedia integration in a self-hosted context — transcoding, libraries, and the operational side of media rather than only playback UI.",
    signals: ["Jellyfin", "Media pipelines", "Integration"],
  },
];
