'use client';

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextAnimationProps {
  text: string;
  as?: React.ElementType;
  classname?: string;
  direction?: "up" | "down" | "left" | "right";
  letterAnime?: boolean;
  lineAnime?: boolean;
  variants?: {
    hidden: Variants["hidden"];
    visible: Variants["visible"];
  };
}

export default function TextAnimation({
  text,
  as: Component = "h2",
  classname,
  direction = "up",
  letterAnime = false,
  lineAnime = false,
  variants,
}: TextAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  // Default directional offsets
  const getDirectionOffset = () => {
    switch (direction) {
      case "down":
        return { y: -20, x: 0 };
      case "left":
        return { x: 20, y: 0 };
      case "right":
        return { x: -20, y: 0 };
      case "up":
      default:
        return { y: 20, x: 0 };
    }
  };

  const defaultOffset = getDirectionOffset();

  const defaultVariants: Variants = {
    hidden: {
      filter: "blur(8px)",
      opacity: 0,
      ...defaultOffset,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const finalVariants = variants || defaultVariants;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: letterAnime ? 0.03 : 0.08,
      },
    },
  };

  // 1. Line-by-line animation mode
  if (lineAnime) {
    const lines = text.split("\n");
    return (
      <Component ref={ref} className={cn("inline-block", classname)}>
        <motion.span
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="inline-block w-full"
        >
          {lines.map((line, idx) => (
            <motion.span
              key={idx}
              variants={finalVariants}
              className="block w-full"
            >
              {line}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  // 2. Letter-by-letter animation mode
  if (letterAnime) {
    const letters = Array.from(text);
    return (
      <Component ref={ref} className={cn("inline-block", classname)}>
        <motion.span
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="inline-block"
        >
          {letters.map((char, idx) => (
            <motion.span
              key={idx}
              variants={finalVariants}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  // 3. Word-by-word default animation mode
  const words = text.split(" ");
  return (
    <Component ref={ref} className={cn("inline-block", classname)}>
      <motion.span
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="inline-block"
      >
        {words.map((word, idx) => (
          <React.Fragment key={idx}>
            <motion.span variants={finalVariants} className="inline-block">
              {word}
            </motion.span>
            {idx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </React.Fragment>
        ))}
      </motion.span>
    </Component>
  );
}
