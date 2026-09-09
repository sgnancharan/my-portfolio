# S. Gnan Charan — 3D Spatial Systems & ISRO Launch Portfolio

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r174-black?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Debian](https://img.shields.io/badge/Debian-13_Trixie-A80030?style=for-the-badge&logo=debian)

**Autonomous 3D Spatial Computing Portfolio & Systems Infrastructure Showcase**

[Explore Live Demo](https://sgnancharan.vercel.app) · [Report Bug](https://github.com/sgnancharan/s-gnan-charan/issues) · [Contact Operator](mailto:sgnancharan730@gmail.com)

</div>

---

## ✦ Overview

This portfolio is an interactive, spatial computational web surface engineered to reflect real infrastructure principles rather than superficial mockups. It merges high-performance **Three.js / React Three Fiber** graphics with a robust systems-oriented architecture.

Anchored by **S. Gnan Charan**, studying AI & ML at **Nadimpalli Satyanarayana Raju Institute of Technology (NSRIT), AP** under **NIAT (NxtWave in Advanced Technologies)**, the platform documents hands-on operations across **Debian 13 Trixie**, container orchestration (**Docker & Docker Swarm**), local private LLM inference (**Ollama / CUDA**), and self-hosted bare-metal infrastructure—with space exploration and celestial telemetry as the long-term research horizon.

---

## ⚡ Key Highlights & Systems Architecture

### 1. Cinematic ISRO Sriharikota Launch Sequence
- **Dual-Theme Launch Environment**: Fully adaptive launch experience supporting both **Daytime Sriharikota Launch** (in Light Mode, featuring natural bright sunlight, coastal atmospheric fog `#f4f7fb`, and high-contrast telemetry panels) and **Nighttime Sriharikota Launch** (in Dark Mode, featuring deep-space void `#05070c`, starry sky, floodlights, and cybernetic neon HUD).
- **Direct Interactive Launch Switcher**: Includes an interactive `<ThemeToggle />` right in the ISRO launch control footer next to the "SKIP SEQUENCE" button, enabling instant switching between day and night launch modes at any moment.
- **Autonomous Systems Diagnostic Checks**: 7 autonomous checks executed on load with individual status indicators: Pad Security (`PAD-SEC`), Cryogenic Fuel Pressure (`CRYO-PROP`), Guidance Matrix (`INS-NAV`), S-Band Telemetry Carrier Lock (`S-BAND`), Triple Redundancy Flight Computers (`OBC-MAIN`), High-Speed Internet Link (`WAN-SYNC`), and Solid Rocket Motors (`AUTO-SEQ`). All diagnostic text uses high-contrast, radiant aerospace typography (vibrant electric cyan, emerald, amber) with zero unreadable dark-on-dark contrast.
- **Terminal Countdown**: Bold central countdown sequence ($T-3$, $T-2$, $T-1$, $T-0$) with acoustic camera vibration and umbilical swing arm retraction, styled with theme-adaptive acrylic plaques and vibrant glowing digits.
- **Flight Dynamics & Telemetry HUD**: Real-time altitude, velocity ($M/S$), and active S200 + L110 engine thrust gauge with authentic Indian Livery confirmation (🇮🇳), rendered in frosted glass cards with sharp daylight/dark-mode typography.
- **Procedural LVM3 Heavy Lifter**: 3D rocket model featuring the central L110 core, C25 cryogenic upper stage, payload fairing with launch abort spike, and twin S200 solid rocket boosters mounted with the Indian National Flag.
- **Realistic S200 Stage Separation**: At altitude ($p \in [0.40, 0.65]$), the twin S200 solid rocket boosters physically detach from the central core, translate laterally outward ($x \pm 4.4$), tilt back gracefully, and their flames burn out—all occurring *before* the camera initiates its descent dive into the core engine bells.
- **Thruster Dive & Atmosphere Transition**: After booster jettison is complete, the camera swoops directly into the roaring core Vikas engine bells as the sky transitions into an incandescent orange plasma barrier.

### 2. Radiant Orange Wall & Bottom-Up Inverted V Unzipping Transition (0° to 180°)
- **Concealed Theme-Adaptive Wall Preloading**: The entire portfolio website is pre-rendered in the DOM behind an opaque concealment wall ($z-20$) matching the active theme (`#f4f7fb` in light mode, `#000000` in dark mode), with the 3D rocket scene elevated to $z-30$. Zero website elements bleed through during ascent.
- **Full-Screen Orange Flame Cover**: As the camera enters the engine bells, an incandescent radiant orange plasma wall covers 100% of the viewport.
- **Bottom-Up Opening from 0° to 180°**: Opens cleanly **from the bottom upward** as a pure inverted V shape ($\bigwedge$); the opening angle expands from 0° up to 180° flat, revealing the website hero section starting from the bottom, and cleanly dissolving away into full site interaction.
- **Dual-Phase Ray Geometry & Thermal Edge Glow**: Mathematically computes trigonometric boundary intersections (bottom border $y = 100\%$ during the first phase, transitioning to side borders $x = 0$ and $x = 100$ as the angle widens to 180° horizontal flat at the top), accompanied by glowing SVG thermal lasers and an incandescent energy spark.

### 3. Dual-Theme Switcher (Dark & Light Mode)
- **Deep Space Dark Mode (Default)**: Deep space void (`#05070c`), glowing glass panels, neon cyan/emerald telemetry accents, and organic stardust particles.
- **Aerospace Lab Light Mode**: Crisp mission control laboratory aesthetic (`#f4f7fb` background, high-contrast obsidian typography `#090d16`, luminous frosted laboratory glass panels `rgba(255, 255, 255, 0.92)`, and deep sapphire accents).
- **Universal Interactive Sun/Moon Switcher**: Tactile theme toggle button with 500ms rotation and scale micro-animations, accessible across the entire application — including the ISRO Launch Mission Control HUD, desktop Navbar, and mobile drawer.
- **3D Cosmos & Launch Real-Time Adaptation**: The Three.js canvas dynamically transitions its background, atmospheric fog, and lighting between cosmic night void and pearlescent daytime atmosphere (`#f4f7fb`), ensuring consistent illumination across both the launch sequence and the orbital nexus.
- **Zero-Flash Persistence**: Powered by `ThemeProvider` with `localStorage` persistence (`sgc-portfolio-theme`), system preference fallback (`prefers-color-scheme`), and an inline head script preventing layout flash.

### 4. Real-Time 3D Spatial Canvas
- **Deep Cosmos Environment**: A 1,800-particle custom starfield with color-temperature mixing, atmospheric fog, and dual-point celestial illumination.
- **Orbital Planetary Mechanics**: Interactive celestial bodies representing core competencies and projects, featuring multi-segmented orbital rings and dynamic hover states.
- **Scroll-Driven Camera Splines**: Seamless interpolation through 3D space driven by **Lenis** smooth inertia scrolling and **GSAP ScrollTrigger**, maintaining locked camera trajectories across all viewports.
- **Zero-Jerk GSAP Ticker Smoothing**: Engineered with `gsap.ticker.lagSmoothing(500, 33)` to eliminate frame skips and ensure silky 60–120 FPS high-refresh delivery.

### 5. Interactive 18-Node Modal Matrix
- **Comprehensive Telemetry Inspection**: 18 deeply documented nodes spanning **6 Core Vectors**, **7 Skills**, and **5 Projects**.
- **Zero-Layout-Shift Transitions**: Modal dialog measures dynamic scrollbar gutter width on mount, eliminating browser background layout twitching.
- **Hardware-Accelerated Scale & Fade**: Centered spring transition (`scale: 0.92` → `1.0`, `ease: [0.16, 1, 0.3, 1]`) with `will-change-transform` and GPU compositing.
- **Full Keyboard Navigation**: Cycle seamlessly through all 18 nodes using `←` and `→` arrow keys, with `Esc` to dismiss and trapped keyboard focus.

### 6. Kinetic Typography & Particle Physics
- **Elastic Rubber Squash & Stretch**: Moving the cursor across **S. GNAN CHARAN** squashes each character horizontally (`scaleX: 0.58`) and stretches it vertically (`scaleY: 1.54`), snapping into a natural rubber recoil.
- **Cosmic Stardust Engine**: A lightweight 2D canvas overlay emitting glowing celestial sparks (cyan, violet, emerald) as the mouse glides across letters, auto-sleeping at 0% idle CPU.
- **Supernova Shockwave**: Clicking detonates a 24-particle radial spark ring that cascades in an accordion wave through all 13 letters.
- **Quantum Cyber Scramble**: Double-clicking triggers a cybernetic glyph decryption sequence (`§ ⎔ ⏣ ⎈ ⏢ Δ Σ ∇`) before locking into place with an electric flash.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 (Turbopack) | React Server Components, Static Prerendering, Optimized Bundling |
| **UI Library** | React 19.0.0 | Concurrent Mode, Hooks, Modern Transition Primitives |
| **3D & Canvas** | Three.js (r174) & React Three Fiber | Real-time WebGL canvas, shaders, dynamic camera splines |
| **3D Helpers** | @react-three/drei | Billboards, pre-cached Troika SDF 3D text glyphs |
| **Styling** | Tailwind CSS v4 | Curated glassmorphism design system, CSS custom properties |
| **Theme Engine** | React Context + LocalStorage | Dark & Light mode switcher with zero-flash head script |
| **Animations** | Framer Motion & GSAP | Kinetic layout spring physics, scroll triggers, ticker timing |
| **Smooth Scroll** | Lenis v1.1.20 | Inertia-based virtual scroll normalization |
| **Icons** | Lucide React | Clean, scalable technical SVG icon set |
| **Base OS** | Debian 13 Trixie | Self-hosted compute, headless server nodes, and Docker hosts |

---

## 📂 Project Structure

```
s-gnan-charan/
├── public/                     # Static assets, diagrams, and profile photo
│   └── images/                 # Optimized portfolio photography and visual assets
├── src/
│   ├── app/
│   │   ├── globals.css         # Dark & light mode tokens, typography, glass panels, and shaders
│   │   ├── layout.tsx          # Root layout, ThemeProvider, metadata, SEO, and font configurations
│   │   └── page.tsx            # Main page assembling launch HUD, 3D canvas, and portfolio sections
│   ├── components/
│   │   ├── canvas/             # WebGL / React Three Fiber 3D Subsystems
│   │   │   ├── CameraController.tsx # Spline math, matrix-optimized updates, and thruster dive camera
│   │   │   ├── CosmicNexus.tsx      # Orbiting planetary skill/project nodes with distance culling
│   │   │   ├── IsroLaunchComplex.tsx # Sriharikota pad, red umbilical tower, S200 rocket & flame dynamics
│   │   │   ├── MouseParallax.tsx    # Smooth dampened cursor tracking in 3D
│   │   │   ├── OrbitalSystem.tsx    # Torus orbits and rotating satellite meshes
│   │   │   ├── SceneBackdrop.tsx    # Dynamic z-index backdrop holding 3D canvas
│   │   │   ├── SceneCanvas.tsx      # Main WebGL canvas, DPR tuning, and theme color adaptation
│   │   │   ├── Spaceship.tsx        # Starship & kinetic physics
│   │   │   └── StarField.tsx        # Procedural 1800-star cosmos with additive blending
│   │   ├── identity/           # Identity Modal & Hardware Telemetry
│   │   │   ├── HeroProfile.tsx      # Neural face avatar with floating interactive triggers
│   │   │   ├── IdentityHUD.tsx      # Corner telemetry brackets and subsystem radar
│   │   │   ├── IdentityModal.tsx    # 18-node smooth modal with keyboard navigation
│   │   │   └── IdentityViz.tsx      # Terminal stream and interactive hardware gauges
│   │   ├── layout/             # Layout Chrome
│   │   │   ├── Footer.tsx           # Institutional footer and social links
│   │   │   ├── LaunchTransitionWrapper.tsx # Conceals preloaded website behind black wall during launch
│   │   │   └── Navbar.tsx           # Glass navigation bar with ThemeToggle and backdrop blur
│   │   ├── providers/          # Context & Provider Layer
│   │   │   ├── SmoothScroll.tsx     # Lenis smooth scroll provider synced with GSAP
│   │   │   └── ThemeProvider.tsx    # Dark & Light mode theme provider with localStorage sync
│   │   ├── sections/           # Semantic Content Sections
│   │   │   ├── About.tsx            # Protected narrative and live telemetry status table
│   │   │   ├── Contact.tsx          # Multi-protocol transmission form routing to Gmail
│   │   │   ├── Hero.tsx             # Central origin, title, and telemetry equalizer
│   │   │   ├── Projects.tsx         # Technical project cards with modal openers
│   │   │   ├── Skills.tsx           # Systems skills matrix with translucent glass panels
│   │   │   └── Space.tsx            # Long-term astronomy and space technology horizon
│   │   └── ui/                 # Reusable UI Primitives
│   │       ├── Atmosphere.tsx       # Vignette and grain overlays
│   │       ├── IsroLaunchHud.tsx    # ISRO Sriharikota launch HUD telemetry and countdown
│   │       ├── JiggleTitle.tsx      # Squash & stretch typography with stardust particle canvas
│   │       ├── OrangeZipTearOverlay.tsx # Direct inverted V-shape unzipping tear transition
│   │       ├── Reveal.tsx           # Viewport entry transitions
│   │       ├── Section.tsx          # Semantic section wrappers and kickers
│   │       ├── SocialIcons.tsx      # Branded SVG social vector icons
│   │       └── ThemeToggle.tsx      # Animated Sun/Moon theme switcher button
│   ├── data/                   # Content Architecture
│   │   ├── identity-nodes.ts    # Comprehensive definitions for all 18 modal profiles
│   │   ├── navigation.ts        # Primary navigation links and IDs
│   │   ├── profile.ts           # Core identity, bio, telemetry rows, and study vectors
│   │   ├── projects.ts          # Featured systems projects and tech stacks
│   │   └── skills.ts            # Core systems vocabulary and capability tags
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useMediaQuery.ts     # Responsive breakpoint queries
│   │   ├── usePrefersReducedMotion.ts # Accessibility motion preference detection
│   │   └── useWebGLSupport.ts   # WebGL feature detection
│   ├── lib/                    # Engine Utilities
│   │   ├── camera-path.ts       # Mathematical 3D Bezier camera spline trajectories
│   │   ├── flag-texture.ts      # Procedural Indian National Flag canvas texture generator
│   │   ├── gsap-client.ts       # Dynamic SSR-safe GSAP and ScrollTrigger loader
│   │   ├── identity-state.ts    # Subscription-based modal and node interaction store
│   │   ├── launch-intro-state.ts # GSAP timeline engine for ISRO launch and transition
│   │   ├── scroll-state.ts      # Reactive scroll velocity, progress, and pointer state
│   │   └── validate-contact.ts  # Contact transmission validation engine
│   └── types/                  # Strict TypeScript Definitions
│       └── index.ts             # Complete union types for all 18 identity nodes and models
└── package.json                # Scripts and project dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (Node 22 recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sgnancharan/s-gnan-charan.git
   cd s-gnan-charan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server with **Turbopack**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Building for Production

To validate TypeScript types and generate an optimized static production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run start
```

---

## 🛰️ Operator Information

- **Operator**: S. Gnan Charan
- **Discipline**: B.Tech AI & Data Science / Systems Infrastructure
- **Campus**: Nadimpalli Satyanarayana Raju Institute of Technology (NSRIT), Andhra Pradesh
- **Program**: NIAT (NxtWave in Advanced Technologies)
- **Primary OS**: Debian 13 Trixie
- **Direct Inquiries**: [sgnancharan730@gmail.com](mailto:sgnancharan730@gmail.com)
- **GitHub**: [@sgnancharan](https://github.com/sgnancharan)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
