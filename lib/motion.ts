export const softSpring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
} as const;

export const quickEase = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

export const sheetSpring = {
  type: "spring",
  stiffness: 360,
  damping: 38,
  mass: 0.9,
} as const;
