import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export function AnimatedCounter({ target, suffix = "+", duration = 2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    // Round to 1 decimal place if it's a "K" value, otherwise whole number
    if (suffix.includes('K')) {
        return Math.floor(latest * 10) / 10;
    }
    return Math.floor(latest);
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (suffix.includes('K')) {
            setDisplayValue((Math.floor(latest * 10) / 10).toFixed(1).replace('.0', ''));
        } else {
            setDisplayValue(Math.floor(latest));
        }
      }
    });

    return () => controls.stop();
  }, [target, duration, count, suffix]);

  return (
    <span>
      {displayValue}{suffix}
    </span>
  );
}
