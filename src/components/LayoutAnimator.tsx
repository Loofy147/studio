
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface LayoutAnimatorProps {
  children: ReactNode;
}

export function LayoutAnimator({ children }: LayoutAnimatorProps) {
  const pathname = usePathname();

  const variants = {
    hidden: { opacity: 0, y: 15 }, // Start slightly lower and faded out
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }, // Exit slightly higher and faded out
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Animate based on route change
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }} // Smooth transition
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
