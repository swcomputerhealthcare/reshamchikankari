'use client';

import * as React from "react";
import Image from "next/image";
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

interface RadialConfig {
  radius: number;
  angleStepDeg: number;
  cardWidth: number;
  cardHeight: number;
  sensitivity: number;
  maxVisibleOffset: number;
}

const FALLBACK_GARMENTS = [
  { photo: "/images/reshamchikankari/New%20folder%203/IMG_3001.JPG", name: "HAND-EMBROIDERED GEORGETTE KURTA" },
  { photo: "/images/reshamchikankari/New%20folder/IMG_2685.JPG", name: "LUCKNOWI MUSLIN CO-ORD SET" },
  { photo: "/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG", name: "VISCOSE CHANDERI ANARKALI" },
  { photo: "/images/reshamchikankari/New%20folder%205/IMG_3230.JPG", name: "MODAL SHADOW-WORK TUNIC" },
  { photo: "/images/reshamchikankari/New%20folder%202/IMG_3250.JPG", name: "STRUCTURED COTTON KURTI" },
];

const getRadialConfig = (width: number): RadialConfig => {
  if (width < 640) {
    const cardWidth = Math.min(width - 64, 240);
    return {
      radius: 460,
      angleStepDeg: 22,
      cardWidth,
      cardHeight: 340,
      sensitivity: cardWidth * 0.8,
      maxVisibleOffset: 1.8,
    };
  }
  if (width < 1024) {
    const cardWidth = 270;
    return {
      radius: 600,
      angleStepDeg: 18,
      cardWidth,
      cardHeight: 380,
      sensitivity: cardWidth * 0.85,
      maxVisibleOffset: 2.2,
    };
  }
  const cardWidth = 300;
  return {
    radius: 720,
    angleStepDeg: 16,
    cardWidth,
    cardHeight: 410,
    sensitivity: cardWidth * 0.9,
    maxVisibleOffset: 2.6,
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
    () => getRadialConfig(windowWidth),
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

    const distanceShift = -dragDistance / config.sensitivity;
    const velocityShift = -velocity / 600;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-2, Math.min(2, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 180,
      damping: 24,
      mass: 1,
    });
  };

  return (
    <div className="reviews-carousel-container relative w-full h-[520px] sm:h-[580px] lg:h-[630px] select-none z-20 overflow-hidden my-2">
      {/* Transparent Interactive Drag Overlay */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDrag={(_, info) => {
          const delta = -info.delta.x / config.sensitivity;
          scrollProgress.set(scrollProgress.get() + delta);
        }}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y" }}
        className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing touch-pan-y"
      />

      {/* Radial Cards Attached to Bounded Semicircular Arc Container */}
      <div className="relative w-full h-full flex items-start justify-center pt-2">
        {reviews.map((review, i) => (
          <RadialArcCard
            key={review.id}
            review={review}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}

interface RadialArcCardProps {
  review: ReviewItemData;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: RadialConfig;
}

const RadialArcCard = ({
  review,
  index,
  total,
  progress,
  config,
}: RadialArcCardProps) => {
  const garmentFallback = FALLBACK_GARMENTS[index % FALLBACK_GARMENTS.length];
  const photoUrl = review.photoUrl || garmentFallback.photo;
  const productName = review.productName || garmentFallback.name;

  // Infinite Wrap Mathematics for Seamless Continuous Loop
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  // 1. RADIAL X POSITION (x = R * sin(offset * angleStep))
  const x = useTransform(offset, (o) => {
    const angleRad = (o * config.angleStepDeg * Math.PI) / 180;
    return config.radius * Math.sin(angleRad);
  });

  // 2. RADIAL Y POSITION (y = R * (1 - cos(offset * angleStep)))
  const y = useTransform(offset, (o) => {
    const angleRad = (o * config.angleStepDeg * Math.PI) / 180;
    return config.radius * (1 - Math.cos(angleRad));
  });

  // 3. TANGENT ROTATION (Follows arc curve, max ±14 deg)
  const rotate = useTransform(offset, (o) => {
    const rawRotate = o * config.angleStepDeg * 0.7;
    return Math.max(-14, Math.min(14, rawRotate));
  });

  // 4. SCALE (Center: 1.0, Adjacent: ~0.95, Outer: ~0.88)
  const scale = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    return Math.max(0.85, 1 - absO * 0.05);
  });

  // 5. OPACITY (Center: 1.0, Adjacent: 0.92, Outer: 0.75, Hidden: 0)
  const opacity = useTransform(
    offset,
    [
      -config.maxVisibleOffset - 0.4,
      -config.maxVisibleOffset,
      -1,
      0,
      1,
      config.maxVisibleOffset,
      config.maxVisibleOffset + 0.4,
    ],
    [0, 0.7, 0.92, 1, 0.92, 0.7, 0]
  );

  // 6. Z-INDEX STACKING
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 15)
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
        height: config.cardHeight,
        transformOrigin: "center 110%",
        touchAction: "pan-y",
      }}
      className="absolute top-[10px] sm:top-[15px] lg:top-[20px] bg-[#FAF7F2] text-[#161616] border border-[#161616]/12 rounded-[12px] p-4 sm:p-5 shadow-2xl pointer-events-none flex flex-col justify-between text-left shrink-0 select-none"
    >
      {/* Top 50% — Fashion Editorial Photography */}
      <div className="relative w-full h-[50%] rounded-[8px] overflow-hidden bg-[#EAE5DC] border border-[#161616]/8 shrink-0">
        <Image
          src={photoUrl}
          alt={review.authorName}
          fill
          priority
          unoptimized
          sizes="(max-width: 640px) 240px, 300px"
          className="object-cover object-top filter brightness-102"
        />
      </div>

      {/* Bottom 50% — Review Content & Customer Info */}
      <div className="flex flex-col justify-between flex-1 pt-3">
        <div>
          {/* Rating Stars & Verified Purchase Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 text-[#E694AA]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.rating
                      ? "fill-[#E694AA] text-[#E694AA]"
                      : "text-[#E694AA]/20 fill-[#E694AA]/10"
                  }`}
                />
              ))}
            </div>

            {review.isVerified && (
              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-widest text-[#3F5031]">
                <ShieldCheck className="h-3 w-3 text-[#3F5031]" />
                VERIFIED PURCHASE
              </span>
            )}
          </div>

          {/* Short Review Body */}
          <p className="text-[11px] sm:text-xs text-[#161616]/90 font-sans leading-relaxed italic line-clamp-3 mb-2">
            "{review.body}"
          </p>
        </div>

        {/* Customer Name & Product Title */}
        <div className="pt-2 border-t border-[#161616]/10 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#161616]/85 font-sans truncate">
            — {review.authorName}
          </span>
          <span className="text-[9px] font-semibold text-[#3F5031] uppercase tracking-wider font-sans truncate">
            {productName}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
