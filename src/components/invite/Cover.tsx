import { useRef, useState, type CSSProperties } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import doorL from "@/assets/arch-door-left.webp.asset.json";
import doorR from "@/assets/arch-door-right.webp.asset.json";
import doorMask from "@/assets/arch-door-mask.webp.asset.json";
import wallPortrait from "@/assets/nature-wall-rb-portrait.webp.asset.json";
import wallLandscape from "@/assets/nature-wall-rb-landscape.webp.asset.json";
import openBtn from "@/assets/open-btn.png.asset.json";
import gardenView from "@/assets/garden-bg.webp";
import { PetalRain } from "./LiveOrnaments";
import { ButterflyFlock } from "./Butterfly";
import { WEDDING } from "@/lib/wedding";

const EASE = [0.65, 0, 0.35, 1] as const;
const maskStyle: CSSProperties = { maskImage: `url(${doorMask.url})`, WebkitMaskImage: `url(${doorMask.url})` };

/**
 * Scene 1–2: a sunlit garden wall of cream stone, ivy and climbing roses, with a carved
 * arched double door standing on the pavement. Through the door the garden of the film is
 * already visible, so opening it leads straight into the journey that follows.
 */
export function Cover({ guest, onOpenStart, onOpened }: { guest: string; onOpenStart: () => void; onOpened: () => void }) {
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const doorRef = useRef<HTMLDivElement>(null);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const r = useMotionValue(-120);
  const r2 = useTransform(r, (v) => v + 120);
  const mask = useMotionTemplate`radial-gradient(circle at ${cx}px ${cy}px, transparent ${r}px, black ${r2}px)`;
  const origin = useMotionTemplate`${cx}px ${cy}px`;

  const DOOR = reduce ? 0.6 : 2.6;

  const open = () => {
    if (opening) return;
    const rect = doorRef.current?.getBoundingClientRect();
    if (rect) {
      cx.set(rect.left + rect.width / 2);
      cy.set(rect.top + rect.height * 0.55);
    }
    setOpening(true);
    onOpenStart();
    const max = Math.hypot(window.innerWidth, window.innerHeight) * 1.1;
    animate(r, max, { duration: reduce ? 0.8 : 2.2, delay: reduce ? 0 : 1.3, ease: [0.5, 0, 0.3, 1] });
    window.setTimeout(onOpened, (reduce ? 0.9 : DOOR + 1.1) * 1000);
  };

  return (
    <motion.div className="fixed inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <motion.div className="absolute inset-0" style={opening ? { WebkitMaskImage: mask, maskImage: mask } : {}}>
        <motion.div
          className="nature-wall absolute inset-0"
          style={{
            transformOrigin: origin,
            ["--wall-portrait" as string]: `url(${wallPortrait.url})`,
            ["--wall-landscape" as string]: `url(${wallLandscape.url})`,
          }}
          animate={opening && !reduce ? { scale: 1.25 } : { scale: 1 }}
          transition={{ duration: DOOR + 1, ease: EASE }}
        >
          <div className="nature-wall-light absolute inset-0" />
          <PetalRain count={7} seed={3} />
          <ButterflyFlock count={3} />

          {/* the names, on a frosted ivory card over the stone */}
          <div className="relative z-10 flex justify-center px-5 pt-[max(3.5dvh,18px)] text-center">
            <motion.div
              className="garden-plaque flex w-full max-w-sm flex-col items-center rounded-2xl px-5 py-[clamp(10px,2dvh,18px)] sm:max-w-md"
              animate={opening ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[10px] uppercase tracking-[0.45em] text-garden-leaf sm:text-[11px]">The Wedding of</p>
              <h1 className="font-script text-[clamp(2.1rem,min(10vw,7dvh),3.4rem)] leading-tight text-garden-leaf-deep">
                {WEDDING.bride} & {WEDDING.groom}
              </h1>
              <p className="font-display text-base italic text-gold-deep sm:text-lg">18 & 20 Desember 2026</p>
              <div className="mt-[clamp(6px,1.2dvh,12px)] h-px w-24 bg-gold-grad opacity-70" />
              <p className="mt-[clamp(6px,1.2dvh,12px)] text-[10px] uppercase tracking-[0.35em] text-garden-leaf">Kepada Yth.</p>
              <p className="max-w-full truncate font-display text-xl font-semibold text-garden-leaf-deep">{guest}</p>
            </motion.div>
          </div>

          {/* the arched door, standing on the garden pavement */}
          <div ref={doorRef} className="arch-door absolute left-1/2 z-10 -translate-x-1/2">
            <div aria-hidden className="arch-door-ground absolute -bottom-[5%] left-1/2 h-[10%] w-[135%] -translate-x-1/2" />
            <div aria-hidden className="arch-surround absolute -bottom-[1%] left-1/2 h-[104.5%] w-[109%] -translate-x-1/2" style={maskStyle} />
            <button
              type="button"
              onClick={open}
              aria-label="Buka pintu undangan"
              className="group relative block h-full w-full cursor-pointer"
              style={{ perspective: 1300 }}
            >
              {/* the garden waiting behind the door */}
              <div className="arch-opening absolute inset-[1.5%] overflow-hidden" style={maskStyle}>
                <img src={gardenView} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <motion.div
                  className="arch-light absolute inset-0"
                  initial={{ opacity: 0.2 }}
                  animate={opening ? { opacity: 1, scale: 1.2 } : { opacity: 0.2 }}
                  transition={{ duration: 1.8 }}
                />
              </div>
              <motion.img
                src={doorL.url}
                alt=""
                draggable={false}
                className="arch-leaf absolute left-0 top-0 h-full w-1/2 object-fill transition-[filter] duration-500 group-hover:brightness-110"
                style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
                animate={opening ? { rotateY: 82 } : { rotateY: 0 }}
                transition={{ duration: DOOR, ease: EASE }}
              />
              <motion.img
                src={doorR.url}
                alt=""
                draggable={false}
                className="arch-leaf absolute right-0 top-0 h-full w-1/2 object-fill transition-[filter] duration-500 group-hover:brightness-110"
                style={{ transformOrigin: "right center", backfaceVisibility: "hidden" }}
                animate={opening ? { rotateY: -82 } : { rotateY: 0 }}
                transition={{ duration: DOOR, ease: EASE }}
              />
              {/* wax seal under the door rings: "Buka Undangan" */}
              <motion.img
                src={openBtn.url}
                alt="Buka Undangan"
                className="floaty absolute left-1/2 top-[64%] w-[26%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_10px_oklch(0.2_0.04_30/0.6)]"
                animate={opening ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </button>
          </div>

          <motion.p
            className="cover-hint absolute inset-x-0 bottom-[1.6dvh] z-10 text-center text-[10px] uppercase tracking-[0.3em] text-ivory"
            animate={opening ? { opacity: 0 } : { opacity: 1 }}
          >
            Sentuh pintu untuk masuk
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
