'use client';

import Image from "next/image";
import { usePathname } from "next/navigation";
import useLotusJourney from "@/hooks/useLotusJourney";

const LOTUS_ID = "lotus-motif";

/**
 * Global decorative layer.
 *
 * This is deliberately a sibling of <main>, not a child of any page section.
 * Two reasons:
 *
 *  1. A lotus rendered inside the hero is trapped in the hero's stacking
 *     context, so it disappears the moment the next section paints over it. As
 *     a fixed, top-level layer it can cross section boundaries freely, which is
 *     the whole point of the journey.
 *  2. `position: fixed` resolves against the nearest ancestor with a transform,
 *     and the page-level <PageTransition> wrapper animates `y`. Mounted inside
 *     it, the layer would be positioned against that wrapper instead of the
 *     viewport and would scroll away.
 *
 * `overflow-hidden` here is safe and intentional: the layer is exactly the size
 * of the viewport, so clipping at its edge is indistinguishable from being off
 * screen, and it removes any chance of the motif causing horizontal scroll. It
 * is the content sections that must not clip, and they don't.
 */
export default function LotusJourney() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Called unconditionally to keep hook order stable; the hook no-ops on null.
  useLotusJourney(isHome ? LOTUS_ID : null);

  if (!isHome) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
    >
      <div
        id={LOTUS_ID}
        className="absolute left-1/2 top-0 w-[clamp(120px,14vw,240px)] aspect-square will-change-transform"
        /**
         * Matches the first waypoint so the motif is already in the right place
         * on the very first paint — otherwise it appears at the top of the
         * screen for a frame and then jumps once GSAP initialises. GSAP
         * overwrites this transform wholesale on mount.
         */
        style={{ transform: "translate(-50%, -50%) translateY(100svh)", opacity: 0.9 }}
      >
        <Image
          src="/images/lotus2.svg"
          alt=""
          fill
          priority
          unoptimized
          className="object-contain"
        />
      </div>
    </div>
  );
}
