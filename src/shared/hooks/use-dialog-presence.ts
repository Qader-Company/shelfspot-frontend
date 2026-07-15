"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Manages mount/unmount lifecycle for dialogs with exit animations.
 * Returns `isMounted` (controls rendering) and `isExiting` (triggers exit CSS class).
 *
 * @param isOpen - Whether the dialog is logically open
 * @param exitDurationMs - How long the exit animation takes before unmounting (default 200ms)
 */
export function useDialogPresence(isOpen: boolean, exitDurationMs = 200) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsExiting(false);
      setIsMounted(true);
    } else {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setIsMounted(false);
        setIsExiting(false);
      }, exitDurationMs);
    }

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, [isOpen, exitDurationMs]);

  return { isMounted, isExiting };
}
