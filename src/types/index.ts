export type SectionId =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "space"
  | "contact";

export type NavItem = {
  id: SectionId;
  label: string;
  href: `#${SectionId}`;
};

export type SocialId = "github" | "linkedin" | "instagram";

export type SocialLink = {
  id: SocialId;
  label: string;
  href: string;
};

export type Skill = {
  id: string;
  title: string;
  index: string;
  summary: string;
  signals: readonly string[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  code: string;
  title: string;
  domain: string;
  status: string;
  summary: string;
  stack: readonly string[];
  links: readonly ProjectLink[];
};

export type Vec3 = [number, number, number];

export type CameraKeyframe = {
  progress: number;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
};

export type TelemetryRow = {
  label: string;
  value: string;
};

export type ContactField = "name" | "email" | "intent" | "message";

export type ContactFormState = Record<ContactField, string>;

export type ContactErrors = Partial<Record<ContactField, string>>;

export type IdentityNodeId =
  | "aiml"
  | "debugger"
  | "web"
  | "server"
  | "local-ai"
  | "core"
  | "containerization"
  | "web-development"
  | "systems-administration"
  | "self-hosted"
  | "hpc-opt"
  | "access-control"
  | "multimedia"
  | "self-hosted-jellyfin"
  | "container-ops"
  | "linux-admin"
  | "access-and-isolation"
  | "web-systems"
  | (string & {});

export type IdentityNode = {
  id: IdentityNodeId;
  label: string;
  kicker: string;
  angle?: number;
  radius?: number;
  speed?: number;
  phase?: number;
  color: string;
  summary: string;
  body: string;
  concepts: readonly string[];
  technologies: readonly string[];
};

export type OrbitalIdentityNode = IdentityNode & {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
};
