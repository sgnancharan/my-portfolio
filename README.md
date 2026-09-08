# S. Gnan Charan — 3D Spatial Systems Portfolio

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

Anchored by **S. Gnan Charan**, studying AI & ML at **Nadimpalli Satyanarayana Raju Institute of Technology (NSRIT), AP**, the platform documents hands-on operations across **Debian 13 Trixie**, container orchestration (**Docker & Docker Swarm**), local private LLM inference (**Ollama / CUDA**), and self-hosted bare-metal infrastructure—with space exploration and celestial telemetry as the long-term research horizon.

---

## ⚡ Key Highlights & Systems Architecture

### 1. Real-Time 3D Spatial Canvas
- **Deep Cosmos Environment**: A 1,800-particle custom starfield with color-temperature mixing, atmospheric fog, and dual-point celestial illumination.
- **Orbital Planetary Mechanics**: Interactive celestial bodies representing core competencies and projects, featuring multi-segmented orbital rings and dynamic hover states.
- **Scroll-Driven Camera Splines**: Seamless interpolation through 3D space driven by **Lenis** smooth inertia scrolling and **GSAP ScrollTrigger**, maintaining locked camera trajectories across all viewports.
- **Precision Aerodynamic Rocket Mechanics**: Real-time 3D Starship and ISRO launch vehicles with procedural flame shock diamonds and thruster dynamics that dive into the typography.

### 2. High-Performance OLED & Hardware Tuning
- **True OLED Contrast**: Native high-DPI canvas rendering (`dpr={[1, 2]}`) with hardware MSAA anti-aliasing for razor-sharp geometry edges on high-contrast displays.
- **Zero-Jerk GSAP Ticker Smoothing**: Engineered with `gsap.ticker.lagSmoothing(500, 33)` to eliminate frame skips and ensure silky 60–120 FPS high-refresh delivery.
- **Camera Matrix Caching**: Eliminates redundant projection matrix updates on static frames, minimizing GPU pipeline stalls.
- **Background Planet Dormancy**: Subscribes directly to modal state. Opening any detailed modal completely disables 3D planet draw calls (`visible = false`), freeing up 100% of background rendering load during reading.

### 3. Interactive 18-Node Modal Matrix
- **Comprehensive Telemetry Inspection**: 18 deeply documented nodes spanning **6 Core Vectors**, **7 Skills**, and **5 Projects**.
- **Zero-Layout-Shift Transitions**: Modal dialog measures dynamic scrollbar gutter width on mount, eliminating browser background layout twitching.
- **Hardware-Accelerated Scale & Fade**: Centered spring transition (`scale: 0.92` → `1.0`, `ease: [0.16, 1, 0.3, 1]`) with `will-change-transform` and GPU compositing.
- **Full Keyboard Navigation**: Cycle seamlessly through all 18 nodes using `←` and `→` arrow keys, with `Esc` to dismiss and trapped keyboard focus.

### 4. Kinetic Typography & Particle Physics
- **Elastic Rubber Squash & Stretch**: Moving the cursor across **S. GNAN CHARAN** squashes each character horizontally (`scaleX: 0.58`) and stretches it vertically (`scaleY: 1.54`), snapping into a natural rubber recoil.
- **Cosmic Stardust Engine**: A lightweight 2D canvas overlay emitting glowing celestial sparks (cyan, violet, emerald) as the mouse glides across letters, auto-sleeping at 0% idle CPU.
- **Supernova Shockwave**: Clicking detonates a 24-particle radial spark ring that cascades in an accordion wave through all 13 letters.
- **Quantum Cyber Scramble**: Double-clicking triggers a cybernetic glyph decryption sequence (`§ ⎔ ⏣ ⎈ ⏢ Δ Σ ∇`) before locking into place with an electric flash.

### 5. Verified Transmission Uplink
- **Direct Email Forwarding**: All inquiries are routed directly to **`sgnancharan730@gmail.com`**.
- **Multi-Protocol Dispatch**: Offers native Gmail web compose, direct default mail client (`mailto:`), one-click clipboard copy, and formatted WhatsApp message generation.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 (Turbopack) | React Server Components, Static Prerendering, Optimized Bundling |
| **UI Library** | React 19.0.0 | Concurrent Mode, Hooks, Modern Transition Primitives |
| **3D & Canvas** | Three.js (r174) & React Three Fiber | Real-time WebGL canvas, shaders, dynamic camera splines |
| **3D Helpers** | @react-three/drei | Billboards, pre-cached Troika SDF 3D text glyphs |
| **Styling** | Tailwind CSS v4 | Curated glassmorphism design system, CSS variables |
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
│   │   ├── globals.css         # OLED glass tokens, typography, and grain shaders
│   │   ├── layout.tsx          # Root layout, metadata, SEO, and font configurations
│   │   └── page.tsx            # Main page assembling all 3D canvas and section layers
│   ├── components/
│   │   ├── canvas/             # WebGL / React Three Fiber 3D Subsystems
│   │   │   ├── CameraController.tsx # Spline math and matrix-optimized camera updates
│   │   │   ├── CosmicNexus.tsx      # Orbiting planetary skill/project nodes with distance culling
│   │   │   ├── MouseParallax.tsx    # Smooth dampened cursor tracking in 3D
│   │   │   ├── OrbitalSystem.tsx    # Torus orbits and rotating satellite meshes
│   │   │   ├── SceneCanvas.tsx      # Main WebGL canvas configuration and DPR tuning
│   │   │   ├── Spaceship.tsx        # Starship & ISRO nose-dive kinetic physics
│   │   │   └── StarField.tsx        # Procedural 1800-star cosmos with additive blending
│   │   ├── identity/           # Identity Modal & Hardware Telemetry
│   │   │   ├── HeroProfile.tsx      # Neural face avatar with floating interactive triggers
│   │   │   ├── IdentityHUD.tsx      # Corner telemetry brackets and subsystem radar
│   │   │   ├── IdentityModal.tsx    # 18-node smooth modal with keyboard navigation
│   │   │   └── IdentityViz.tsx      # Terminal stream and interactive hardware gauges
│   │   ├── layout/             # Layout Chrome
│   │   │   ├── Navbar.tsx           # Glass navigation bar with backdrop blur
│   │   │   └── Footer.tsx           # Minimal institutional footer and social links
│   │   ├── providers/          # Context & Provider Layer
│   │   │   └── SmoothScroll.tsx     # Lenis smooth scroll provider synced with GSAP
│   │   ├── sections/           # Semantic Content Sections
│   │   │   ├── About.tsx            # Protected narrative and live telemetry status table
│   │   │   ├── Contact.tsx          # Multi-protocol transmission form routing to Gmail
│   │   │   ├── Hero.tsx             # Central origin, title, and telemetry equalizer
│   │   │   ├── Projects.tsx         # Technical project cards with modal openers
│   │   │   ├── Skills.tsx           # Systems skills matrix with translucent glass panels
│   │   │   └── Space.tsx            # Long-term astronomy and space technology horizon
│   │   └── ui/                 # Reusable UI Primitives
│   │       ├── JiggleTitle.tsx      # Squash & stretch typography with stardust particle canvas
│   │       ├── Reveal.tsx           # Viewport entry transitions
│   │       ├── Section.tsx          # Semantic section wrappers and kickers
│   │       └── SocialIcons.tsx      # Branded SVG social vector icons
│   ├── data/                   # Content Architecture
│   │   ├── identity-nodes.ts    # Comprehensive definitions for all 18 modal profiles
│   │   ├── profile.ts           # Core identity, bio, telemetry rows, and study vectors
│   │   ├── projects.ts          # Featured systems projects and tech stacks
│   │   └── skills.ts            # Core systems vocabulary and capability tags
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useMediaQuery.ts     # Responsive breakpoint queries
│   │   └── usePrefersReducedMotion.ts # Accessibility motion preference detection
│   ├── lib/                    # Engine Utilities
│   │   ├── camera-path.ts       # Mathematical 3D Bezier camera spline trajectories
│   │   ├── identity-state.ts    # Subscription-based modal and node interaction store
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
