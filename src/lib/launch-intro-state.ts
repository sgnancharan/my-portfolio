export type LaunchPhase =
  | "INIT"
  | "SYSTEMS_CHECK"
  | "COUNTDOWN"
  | "IGNITION"
  | "LIFTOFF"
  | "TRANSITION"
  | "COMPLETE";

export interface SystemCheckItem {
  id: string;
  name: string;
  code: string;
  status: "WAITING" | "CHECKING" | "VERIFIED" | "GO";
  telemetry: string;
}

export interface LaunchIntroData {
  isActive: boolean;
  phase: LaunchPhase;
  phaseProgress: number; // 0..1 in current phase
  totalProgress: number; // 0..1 overall
  systems: SystemCheckItem[];
  allSystemsGo: boolean;
  countdown: number; // 3, 2, 1, 0 or -1
  countdownLabel: string;
  statusHeadline: string;
  statusSubline: string;
  engineThrust: number; // 0..1
  rocketY: number; // 3D rocket vertical position
  rocketVelocity: number; // m/s
  rocketAltitudeMeters: number; // for HUD readout
  cameraShake: number; // 0..1
  thrusterZoom: number; // 0..1 smooth camera zoom from station into inside thrusters
  orangeWall: number; // 0..1 full-screen radiant orange screen wall
  zipProgress: number; // 0..1 tears from bottom middle and separates like zip to reveal hero
  baseVisible: boolean; // whether the launchpad base & tower in background are visible
  heroPreloaded: boolean; // whether hero section is preloaded in the background
  exhaustExpansion: number; // 0..1
  stardustMorph: number; // 0..1
  fogCover: number; // 0..1
  cosmosLoaded: number; // 0..1
  heroReveal: number; // 0..1
  hudVisible: boolean; // whether HUD telemetry is shown
  isReducedMotion: boolean;
  isComplete: boolean;
}

const INITIAL_SYSTEMS: SystemCheckItem[] = [
  { id: "sec", name: "PAD SECURITY", code: "PAD-SEC", status: "WAITING", telemetry: "PERIMETER SECURE // GATES LOCKED" },
  { id: "fuel", name: "FUEL SYSTEM", code: "CRYO-PROP", status: "WAITING", telemetry: "LOX/LH2 PRESSURE 4.2 BAR // CHILLDOWN NOMINAL" },
  { id: "guide", name: "GUIDANCE SYSTEM", code: "INS-NAV", status: "WAITING", telemetry: "RLG INERTIAL MATRIX ALIGNED // 0.002° DRIFT" },
  { id: "comm", name: "COMMUNICATION", code: "S-BAND", status: "WAITING", telemetry: "ISTRAC 2240MHz CARRIER LOCK // SNR 34dB" },
  { id: "cpu", name: "FLIGHT COMPUTERS", code: "OBC-MAIN", status: "WAITING", telemetry: "TRIPLE MODULAR REDUNDANCY 100% SYNC" },
  { id: "net", name: "INTERNET LINK", code: "WAN-SYNC", status: "WAITING", telemetry: "DUAL FIBER OPTIC // 10 Gbps HIGH-SPEED UPLINK" },
  { id: "launch", name: "LAUNCH SYSTEM", code: "AUTO-SEQ", status: "WAITING", telemetry: "S200 SOLID MOTORS ARMED // G-0 SEQUENCE READY" },
];

export const launchIntroState: LaunchIntroData = {
  isActive: true,
  phase: "INIT",
  phaseProgress: 0,
  totalProgress: 0,
  systems: INITIAL_SYSTEMS.map((s) => ({ ...s })),
  allSystemsGo: false,
  countdown: -1,
  countdownLabel: "",
  statusHeadline: "S.GNAN CHARAN",
  statusSubline: "MISSION INITIALIZING",
  engineThrust: 0,
  rocketY: 0,
  rocketVelocity: 0,
  rocketAltitudeMeters: 0,
  cameraShake: 0,
  thrusterZoom: 0,
  orangeWall: 0,
  zipProgress: 0,
  baseVisible: true,
  heroPreloaded: false,
  exhaustExpansion: 0,
  stardustMorph: 0,
  fogCover: 0,
  cosmosLoaded: 0,
  heroReveal: 0,
  hudVisible: true,
  isReducedMotion: false,
  isComplete: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

// Fresh immutable snapshot created on every notify to guarantee React re-renders
let currentSnapshot: LaunchIntroData = {
  ...launchIntroState,
  systems: launchIntroState.systems.map((s) => ({ ...s })),
};

export function subscribeLaunchIntro(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyLaunchIntro(): void {
  currentSnapshot = {
    ...launchIntroState,
    systems: launchIntroState.systems.map((s) => ({ ...s })),
  };
  listeners.forEach((listener) => listener());
}

export function getLaunchIntroSnapshot(): LaunchIntroData {
  return currentSnapshot;
}

let activeTimeline: { kill: () => void } | null = null;

/**
 * Initiates the cinematic launch timeline using GSAP.
 * Flow:
 * 1. Automatic start on page load
 * 2. Deliberate, paced auto checks for 7 systems (including INTERNET LINK)
 * 3. ALL SYSTEMS GO confirmation
 * 4. Countdown (T-3, T-2, T-1, T-0) appears on screen
 * 5. Engine Ignition: Thrust ramps 0% -> 100%
 * 6. Liftoff: Camera zooms into the rocket's thrusters, making the whole screen orange
 * 7. All HUD disappears completely while screen is orange
 * 8. Ultra-smooth transition clearing the orange fire into the clean Hero section
 */
export async function startLaunchSequence(): Promise<void> {
  if (launchIntroState.isComplete) return;

  const { getGsap } = await import("@/lib/gsap-client");
  const { gsap } = getGsap();

  launchIntroState.isActive = true;
  launchIntroState.hudVisible = true;
  launchIntroState.cosmosLoaded = 0;
  launchIntroState.fogCover = 0;
  launchIntroState.thrusterZoom = 0;
  launchIntroState.orangeWall = 0;
  launchIntroState.baseVisible = true;
  launchIntroState.heroPreloaded = false;
  launchIntroState.countdown = -1;
  launchIntroState.countdownLabel = "";
  launchIntroState.engineThrust = 0;
  launchIntroState.rocketY = 0;
  launchIntroState.rocketVelocity = 0;
  launchIntroState.rocketAltitudeMeters = 0;
  launchIntroState.allSystemsGo = false;
  launchIntroState.systems = INITIAL_SYSTEMS.map((s) => ({ ...s }));
  notifyLaunchIntro();

  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  const tl = gsap.timeline({
    onUpdate: notifyLaunchIntro,
    onComplete: () => {
      completeLaunchSequence();
    },
  });

  activeTimeline = tl;

  // Phase 0: INIT (0.8s) - Automatic start upon loading site
  tl.to(launchIntroState, {
    duration: 0.8,
    totalProgress: 0.08,
    onStart: () => {
      launchIntroState.phase = "INIT";
      launchIntroState.statusHeadline = "S.GNAN CHARAN";
      launchIntroState.statusSubline = "MISSION INITIALIZING";
      launchIntroState.hudVisible = true;
      launchIntroState.baseVisible = true;
      launchIntroState.heroPreloaded = false;
      launchIntroState.orangeWall = 0;
      launchIntroState.thrusterZoom = 0;
      launchIntroState.cosmosLoaded = 0;
      launchIntroState.fogCover = 0;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // Phase 1: DELIBERATE AUTO CHECKS (7 Subsystems including INTERNET LINK)
  tl.to(launchIntroState, {
    duration: 0.1,
    onStart: () => {
      launchIntroState.phase = "SYSTEMS_CHECK";
      launchIntroState.statusHeadline = "SYSTEMS DIAGNOSTIC";
      launchIntroState.statusSubline = "AUTONOMOUS SUBSYSTEM VERIFICATION";
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // Comfortable pacing (~550ms per check) so user can easily read each check
  const checkDuration = 0.55;
  launchIntroState.systems.forEach((sys) => {
    // 1. Checking state
    tl.to(launchIntroState, {
      duration: checkDuration * 0.55,
      onStart: () => {
        sys.status = "CHECKING";
        launchIntroState.statusSubline = `CHECKING ${sys.name}...`;
        notifyLaunchIntro();
      },
      onUpdate: notifyLaunchIntro,
    });

    // 2. Verified GO state
    tl.to(launchIntroState, {
      duration: checkDuration * 0.45,
      onStart: () => {
        sys.status = "GO";
        launchIntroState.statusSubline = `${sys.name} // GO FOR LAUNCH`;
        notifyLaunchIntro();
      },
      onUpdate: notifyLaunchIntro,
    });
  });

  // Phase 2: ALL SYSTEMS GO (After all 7 checks complete)
  tl.to(launchIntroState, {
    duration: 0.9,
    totalProgress: 0.35,
    onStart: () => {
      launchIntroState.allSystemsGo = true;
      launchIntroState.statusHeadline = "ALL SYSTEMS GO";
      launchIntroState.statusSubline = "ALL 7 SUBSYSTEMS VERIFIED // COUNTDOWN AUTHORIZED";
      launchIntroState.cameraShake = 0.15;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // Phase 3: THE COUNTDOWN (T-3, T-2, T-1, T-0) - On screen after auto checks
  // T - 3
  tl.to(launchIntroState, {
    duration: 1.0,
    onStart: () => {
      launchIntroState.phase = "COUNTDOWN";
      launchIntroState.countdown = 3;
      launchIntroState.countdownLabel = "T - 3";
      launchIntroState.statusHeadline = "T - 3";
      launchIntroState.statusSubline = "UMBILICAL SWING ARMS RETRACTING";
      launchIntroState.cameraShake = 0.25;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // T - 2
  tl.to(launchIntroState, {
    duration: 1.0,
    onStart: () => {
      launchIntroState.countdown = 2;
      launchIntroState.countdownLabel = "T - 2";
      launchIntroState.statusHeadline = "T - 2";
      launchIntroState.statusSubline = "CRYOGENIC CHILLDOWN COMPLETE // IGNITERS ARMED";
      launchIntroState.cameraShake = 0.45;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // T - 1
  tl.to(launchIntroState, {
    duration: 1.0,
    onStart: () => {
      launchIntroState.countdown = 1;
      launchIntroState.countdownLabel = "T - 1";
      launchIntroState.statusHeadline = "T - 1";
      launchIntroState.statusSubline = "CHAMBER PRESSURIZATION // BLAST DOORS OPEN";
      launchIntroState.cameraShake = 0.65;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // T - 0
  tl.to(launchIntroState, {
    duration: 0.8,
    onStart: () => {
      launchIntroState.countdown = 0;
      launchIntroState.countdownLabel = "T - 0";
      launchIntroState.statusHeadline = "T - 0";
      launchIntroState.statusSubline = "IGNITION SEQUENCE START";
      launchIntroState.cameraShake = 0.85;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // Phase 4: ENGINE IGNITION & THRUST RAMP (1.8s)
  tl.to(launchIntroState, {
    duration: 1.8,
    engineThrust: 1, // Smoothly ramps up thrust
    cameraShake: 0.95,
    onStart: () => {
      launchIntroState.phase = "IGNITION";
      launchIntroState.statusHeadline = "ENGINE IGNITION";
      launchIntroState.statusSubline = "SOLID BOOSTERS & VIKAS CORE IGNITED";
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
    ease: "power2.in",
  });

  // Phase 5: MAJESTIC ISRO ROCKET LIFTOFF (6.8s) - Deliberate, realistic ascent
  // "Launching of the isro spaceship is happening too fast, slow it down"
  tl.to(launchIntroState, {
    duration: 6.8,
    rocketY: 38,
    rocketVelocity: 2150,
    rocketAltitudeMeters: 36000,
    cameraShake: 0.9,
    totalProgress: 0.78,
    onStart: () => {
      launchIntroState.phase = "LIFTOFF";
      launchIntroState.countdown = -1;
      launchIntroState.statusHeadline = "LIFTOFF";
      launchIntroState.statusSubline = "SRIHARIKOTA TOWER CLEARED // ASCENT NOMINAL";
      notifyLaunchIntro();
    },
    onUpdate: function () {
      const p = this.progress();

      // 1. Tower Clearance & Base structure visibility
      if (p >= 0.45 && launchIntroState.baseVisible) {
        launchIntroState.baseVisible = false;
      }

      // 2. Camera begins smooth dive into thruster nozzles
      if (p < 0.40) {
        launchIntroState.thrusterZoom = 0;
      } else if (p <= 0.92) {
        const zProg = (p - 0.40) / 0.52;
        launchIntroState.thrusterZoom = zProg * zProg * (3 - 2 * zProg);
      } else {
        launchIntroState.thrusterZoom = 1;
      }

      // 3. Preload website DOM safely behind the black wall at p >= 0.55
      if (p >= 0.55 && !launchIntroState.heroPreloaded) {
        launchIntroState.heroPreloaded = true;
        launchIntroState.cosmosLoaded = 1;
      }

      // 4. Orange screen wall ramps up to 100% full-screen coverage
      if (p < 0.68) {
        launchIntroState.orangeWall = 0;
      } else {
        const wallP = Math.min(1, (p - 0.68) / 0.28);
        launchIntroState.orangeWall = wallP * wallP;
      }
      launchIntroState.fogCover = launchIntroState.orangeWall;

      // 5. Fade telemetry HUD completely as orange wall fills the screen
      if (launchIntroState.orangeWall >= 0.65 && launchIntroState.hudVisible) {
        launchIntroState.hudVisible = false;
      }

      notifyLaunchIntro();
    },
    ease: "power2.inOut",
  });

  // Phase 6: FULL-SCREEN RADIANT ORANGE WALL (0.45s)
  // Whole screen filled with blazing orange plasma; website ready behind wall
  tl.to(launchIntroState, {
    duration: 0.45,
    orangeWall: 1,
    fogCover: 1,
    thrusterZoom: 1,
    baseVisible: false,
    heroPreloaded: true,
    cosmosLoaded: 1,
    stardustMorph: 1,
    exhaustExpansion: 1,
    hudVisible: false,
    cameraShake: 0.2,
    zipProgress: 0,
    onStart: () => {
      launchIntroState.phase = "TRANSITION";
      launchIntroState.heroReveal = 1;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
  });

  // Phase 7: TEAR FROM BOTTOM MIDDLE AND SEPARATE LIKE OPENING ZIP WITHOUT ZIPPER (2.6s)
  // "after the orange fill out the entire screen it will tear from bottom middle and seperate like opening zip without zipper to reveal the hero section of the website"
  tl.to(launchIntroState, {
    duration: 2.6,
    zipProgress: 1, // 0 -> 1 tears from bottom middle and separates left & right
    cameraShake: 0,
    totalProgress: 1,
    ease: "power2.inOut",
    onUpdate: notifyLaunchIntro,
  });

  // Settle and complete
  tl.to(launchIntroState, {
    duration: 0.2,
    onComplete: () => {
      completeLaunchSequence();
    },
  });
}

/**
 * Cleanly completes the launch sequence and hands back normal site control.
 */
export function completeLaunchSequence(): void {
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  launchIntroState.isActive = false;
  launchIntroState.isComplete = true;
  launchIntroState.phase = "COMPLETE";
  launchIntroState.hudVisible = false;
  launchIntroState.baseVisible = false;
  launchIntroState.heroPreloaded = true;
  launchIntroState.orangeWall = 0;
  launchIntroState.zipProgress = 1;
  launchIntroState.thrusterZoom = 1;
  launchIntroState.cosmosLoaded = 1;
  launchIntroState.fogCover = 0;
  launchIntroState.heroReveal = 1;
  launchIntroState.exhaustExpansion = 1;
  launchIntroState.stardustMorph = 1;
  launchIntroState.cameraShake = 0;
  launchIntroState.engineThrust = 0;

  // Unpause Lenis if available
  if (typeof window !== "undefined") {
    const w = window as unknown as { __lenis?: { start: () => void } };
    w.__lenis?.start();
  }

  notifyLaunchIntro();
}

/**
 * User skips the intro sequence immediately.
 */
export async function skipLaunchIntro(): Promise<void> {
  if (launchIntroState.isComplete) return;

  const { getGsap } = await import("@/lib/gsap-client");
  const { gsap } = getGsap();

  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  launchIntroState.baseVisible = false;
  launchIntroState.heroPreloaded = true;

  // Smooth skip transition
  gsap.to(launchIntroState, {
    duration: 0.5,
    orangeWall: 0,
    zipProgress: 1,
    exhaustExpansion: 1,
    stardustMorph: 1,
    fogCover: 0,
    cosmosLoaded: 1,
    heroReveal: 1,
    cameraShake: 0,
    onStart: () => {
      launchIntroState.hudVisible = false;
      notifyLaunchIntro();
    },
    onUpdate: notifyLaunchIntro,
    onComplete: () => {
      completeLaunchSequence();
    },
  });
}
