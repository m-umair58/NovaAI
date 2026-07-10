import type { Variants } from "framer-motion";
import { theme } from "@/constants/theme";

const fadeEase = theme.motion.fadeUpEase;
const fadeDuration = theme.motion.fadeUpDuration;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: fadeDuration, ease: [...fadeEase] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: fadeDuration, ease: [...fadeEase] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const heroFloat: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: theme.motion.heroFloatDuration,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
