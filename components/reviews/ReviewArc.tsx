'use client';

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import { ReviewItemData } from "./ReviewCard";

interface ReviewArcProps {
  reviews: ReviewItemData[];
}

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
  cardWidth: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    const cardWidth = Math.min(width - 48, 300);
    const xMultiplier = cardWidth + 20; // 20px whitespace gap
    return {
      distanceDivisor: xMultiplier,
      velocityDivisor: 600,
      sensitivity: xMultiplier,
      xMultiplier,
      rotationMultiplier: 1.5,
      scaleReduction: 0.04,
      cardWidth,
    };
  }
  if (width < 1024) {
    const cardWidth = 300;
    const xMultiplier = cardWidth + 32; // 32px whitespace gap
    return {
      distanceDivisor: xMultiplier,
      velocityDivisor: 750,
      sensitivity: xMultiplier,
      xMultiplier,
      rotationMultiplier: 2.0,
      scaleReduction: 0.04,
      cardWidth,
    };
  }
  const cardWidth = 320;
  const xMultiplier = cardWidth + 36; // 36px whitespace gap
  return {
    distanceDivisor: xMultiplier,
    velocityDivisor: 850,
    sensitivity: xMultiplier,
    xMultiplier,
    rotationMultiplier: 2.0,
    scaleReduction: 0.04,
    cardWidth,
  };
};

export default function ReviewArc({ reviews }: ReviewArcProps) {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(1280);

  const total = reviews.length;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth]
  );

  const handleDragStart = () => {
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-2, Math.min(2, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 220,
      damping: 28,
      mass: 1,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-6 select-none relative z-20 overflow-visible">
      <div className="relative w-full max-w-7xl h-[310px] sm:h-[330px] lg:h-[340px] flex items-center justify-center">
        {/* Transparent Interactive Drag Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {/* Horizontal Inline Editorial Review Cards */}
        {reviews.map((review, i) => (
          <EditorialReviewCard
            key={review.id}
            review={review}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>

      {/* Editorial Navigation Drag Hint */}
      <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#FAF7F2]/60 mt-8 font-sans">
        ← Drag to explore patron stories →
      </p>
    </div>
  );
}

interface EditorialReviewCardProps {
  review: ReviewItemData;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const EditorialReviewCard = ({
  review,
  index,
  total,
  progress,
  config,
}: EditorialReviewCardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  // 1. Horizontal position strictly spaced with whitespace gaps
  const x = useTransform(offset, (o) => o * config.xMultiplier);

  // 2. ZERO vertical offset — all cards remain strictly aligned on the same vertical axis
  const y = useTransform(offset, () => 0);

  // 3. Subtle rotation during motion (max ±2 degrees)
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return Math.max(-2.5, Math.min(2.5, o * config.rotationMultiplier));
  });

  // 4. Subtle active vs adjacent scaling (1.0 active, ~0.96 adjacent)
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction
  );

  // 5. Fade out distant cards cleanly at outer margins
  const opacity = useTransform(
    offset,
    [-2.2, -1.5, -0.8, 0, 0.8, 1.5, 2.2],
    [0, 0.5, 0.88, 1, 0.88, 0.5, 0]
  );

  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10)
  );

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
        width: config.cardWidth,
      }}
      className="absolute h-[290px] sm:h-[310px] lg:h-[320px] bg-[#FAF7F2] text-[#161616] border border-[#161616]/12 rounded-[2px] p-6 sm:p-7 shadow-xs pointer-events-none flex flex-col justify-between text-left shrink-0 select-none"
    >
      <div>
        {/* Top Header: Rating Stars & Verified Purchase Badge */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-1 text-[#E89AAF]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? "fill-[#E89AAF] text-[#E89AAF]"
                    : "text-[#E89AAF]/20 fill-[#E89AAF]/10"
                }`}
              />
            ))}
          </div>

          {review.isVerified && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#3F5031]">
              <ShieldCheck className="h-3 w-3 text-[#3F5031]" />
              Verified Purchase
            </span>
          )}
        </div>

        {/* Main Review Quote */}
        <p className="text-xs sm:text-[13px] text-[#161616]/90 font-sans leading-relaxed italic line-clamp-5">
          "{review.body}"
        </p>
      </div>

      {/* Bottom Footer: Reviewer Name */}
      <div className="pt-4 border-t border-[#161616]/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#161616]/70">
        <span>— {review.authorName}</span>
        <span className="text-[9px] text-[#3F5031] font-semibold">Lucknow Craft</span>
      </div>
    </motion.div>
  );
}
