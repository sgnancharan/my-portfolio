import type { Project } from "@/types";

/**
 * Editable project catalog. Only include work that can be stated truthfully.
 * Leave `links` empty rather than inventing repositories or live URLs.
 */
export const projects: readonly Project[] = [
  {
    id: "self-hosted-jellyfin",
    code: "SYS-01",
    title: "Self-hosted media infrastructure",
    domain: "Infrastructure",
    status: "Personal / operational",
    summary:
      "A self-hosted Jellyfin path on hardware I administer: library layout, service uptime, and the operational work of multimedia on a local stack rather than a consumer cloud.",
    stack: ["Jellyfin", "Linux", "Self-hosted services"],
    links: [],
  },
  {
    id: "container-ops",
    code: "SYS-02",
    title: "Containerized service operations",
    domain: "Containers",
    status: "Practice / lab",
    summary:
      "Running and coordinating services with Docker and Docker Swarm, with emphasis on isolation, image hygiene, and how replicas actually behave on a host.",
    stack: ["Docker", "Docker Swarm", "Linux"],
    links: [],
  },
  {
    id: "linux-admin",
    code: "SYS-03",
    title: "Linux administration & boot recovery",
    domain: "Systems",
    status: "Hands-on study",
    summary:
      "Debian 13 Trixie and Linux systems administration, including MBR-level boot recovery work. The brief is operational: keep a machine bootable, understandable, and maintainable.",
    stack: ["Debian 13 Trixie", "Linux", "MBR"],
    links: [],
  },
  {
    id: "access-and-isolation",
    code: "SYS-04",
    title: "Access control & workload isolation",
    domain: "Systems logic",
    status: "Study / applied",
    summary:
      "Access-control logic paired with server optimization and workload isolation — deciding who reaches a service and how that service is fenced from its neighbors.",
    stack: ["Access control", "Workload isolation", "Server optimization"],
    links: [],
  },
  {
    id: "web-systems",
    code: "WEB-01",
    title: "Web development on real hosts",
    domain: "Web",
    status: "Ongoing",
    summary:
      "Web development treated as part of the same systems picture: application structure that can live beside self-hosted services rather than as a disconnected template.",
    stack: ["Web development", "Application structure"],
    links: [],
  },
];
