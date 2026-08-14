"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function subscribe(callback: () => void) {
  const pointerMql = window.matchMedia("(pointer: fine)");
  const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
  pointerMql.addEventListener("change", callback);
  motionMql.addEventListener("change", callback);
  return () => {
    pointerMql.removeEventListener("change", callback);
    motionMql.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getServerSnapshot() {
  return false;
}

/**
 * A single frosted-glass dot that replaces the native pointer on the public
 * site — fixed size and shape at all times, no hover resize/morphing. Same
 * light-glass recipe as Badge/SkillPill (backdrop-blur + translucent fill),
 * not the heavier .glass used on big panels, since this one is on screen
 * constantly. Only active on fine-pointer devices that don't prefer reduced
 * motion.
 */
export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springConfig = { stiffness: 900, damping: 45, mass: 0.3 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor-active");

    function handleMove(event: MouseEvent) {
      setVisible(true);
      x.set(event.clientX);
      y.set(event.clientY);
    }

    function handleLeaveWindow() {
      setVisible(false);
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[300] flex size-[26px] items-center justify-center rounded-full border border-black/10 bg-white/40 shadow-lg shadow-black/10 backdrop-blur-md backdrop-saturate-150 dark:border-white/15 dark:bg-white/10"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="size-1.5 rounded-full bg-accent" />
    </motion.div>
  );
}
