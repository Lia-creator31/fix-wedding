import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { GardenHandle, GardenStateSnapshot } from "@/lib/garden-scene";
import { STORY_DURATION } from "@/lib/story-timeline";

/**
 * The 3D cinematic transition between the cover door and the main page:
 *   Scene 1 (0–4.8s)    the couple walks 8 steps forward down the sunlit rose-garden path
 *   Scene 2 (4.8–6.8s)  they stop and turn to face each other beneath the rose arch
 *   Scene 3 (6.8–11.4s) fawns, rabbits, and a squirrel hop/walk in to gather around them
 *   Scene 4 (11.4–15.2s) blue & maroon-gold butterflies emerge and dance in the air
 *   Scene 5 (15.2–18s)  finale under the rose arch before dissolving into the main page
 *
 * Mounted under the Cover from initial load so all WebGL textures are ready before the guest taps.
 */

/** Seconds after the tap — the moment the doorway light in the cover begins to open. */
const PLAY_AT = 0.9;
/** Mount the main page this many seconds before the story ends, so it is painted when revealed. */
const MAIN_LEAD = 1.2;
/** Dissolve from the 3D garden into the main page. */
const FADE = 1.2;
/** Safety timeout so a guest is never stuck if WebGL or timers stall. */
const SAFETY = 30;

export function Journey({
  playing,
  onCovered,
  onDone,
}: {
  playing: boolean;
  onCovered: () => void;
  onDone: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GardenHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const cb = useRef({ onCovered, onDone });
  cb.current = { onCovered, onDone };
  const covered = useRef(false);
  const finished = useRef(false);
  const shouldPlayRef = useRef(false);

  const cover = useCallback(() => {
    if (covered.current) return;
    covered.current = true;
    cb.current.onCovered();
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    cover();
    setEnding(true);
  }, [cover]);

  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onStateChange = (state: GardenStateSnapshot) => {
      if (cancelled) return;
      if (state.time >= STORY_DURATION - MAIN_LEAD) {
        cover();
      }
    };

    import("@/lib/garden-scene")
      .then(({ createGardenScene }) => {
        if (cancelled) return;
        const handle = createGardenScene(el, {
          reducedMotion,
          autoPlay: shouldPlayRef.current,
          loop: false,
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange,
          onComplete: () => {
            if (!cancelled) finish();
          },
        });
        handleRef.current = handle;
        if (shouldPlayRef.current) {
          handle.restart();
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) finish();
      });

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [cover, finish]);

  useEffect(() => {
    if (!playing) return;
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        shouldPlayRef.current = true;
        if (handleRef.current) {
          handleRef.current.restart();
        }
      }, PLAY_AT * 1000),
    );
    timers.push(window.setTimeout(finish, SAFETY * 1000));
    return () => timers.forEach(clearTimeout);
  }, [playing, finish]);

  const skip = () => {
    handleRef.current?.pause();
    cover();
    cb.current.onDone();
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden bg-[#1c2a17]"
      initial={false}
      animate={
        ending
          ? { opacity: 0, scale: 1.06, filter: "blur(6px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: FADE, ease: [0.45, 0, 0.25, 1] }}
      onAnimationComplete={() => {
        if (ending) cb.current.onDone();
      }}
      aria-hidden={!playing}
    >
      <div
        ref={mountRef}
        className="absolute inset-0"
        aria-label="Animasi 3D taman mawar: kedua mempelai berjalan di taman, saling berhadapan, dikelilingi kijang, kelinci, tupai, dan tarian kupu-kupu"
        role="img"
      />
      <div className="garden-3d-vignette pointer-events-none absolute inset-0" />

      <div
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1c2a17] transition-opacity duration-1000 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="loader-petal" />
      </div>

      {playing && !ending && (
        <button
          onClick={skip}
          className="btn-ghost-gold absolute bottom-6 right-6 z-30 px-4 py-1.5 text-[11px] uppercase tracking-widest backdrop-blur"
        >
          Lewati
        </button>
      )}
    </motion.div>
  );
}
