"use client";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** CSS animation name to resume after drag ends */
  animName: string;
  /** Total duration in seconds */
  duration: number;
  /** "left" = translateX goes 0 → -50%; "right" = -50% → 0 */
  direction: "left" | "right";
  className?: string;
}

export function DraggableMarqueeRow({ children, animName, duration, direction, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ dragging: false, startX: 0, startTX: 0 });

  function getTX(): number {
    if (!trackRef.current) return 0;
    const raw = window.getComputedStyle(trackRef.current).transform;
    if (!raw || raw === "none") return 0;
    return new DOMMatrix(raw).m41;
  }

  function onMouseDown(e: React.MouseEvent) {
    const track = trackRef.current;
    if (!track) return;

    // Freeze current animated position
    const tx = getTX();
    stateRef.current = { dragging: true, startX: e.clientX, startTX: tx };
    track.style.animation = "none";
    track.style.transform = `translateX(${tx}px)`;

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      if (!stateRef.current.dragging || !trackRef.current) return;
      const newTX = stateRef.current.startTX + ev.clientX - stateRef.current.startX;
      trackRef.current.style.transform = `translateX(${newTX}px)`;
    }

    function onUp() {
      stateRef.current.dragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);

      const track = trackRef.current;
      if (!track) return;

      // Calculate animation-delay so resuming matches the current visual position
      const tx = getTX();
      const half = track.scrollWidth / 2;
      // Normalize into 0..half range then flip for direction
      const normalised = ((Math.abs(tx) % half) + half) % half;
      const progress = normalised / half;
      const delay = -(progress * duration);

      track.style.transform = "";
      track.style.animation = `${animName} ${duration}s ${delay}s linear infinite`;
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className={`overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={onMouseDown}
    >
      <div
        ref={trackRef}
        className="flex gap-3 py-2"
        style={{
          width: "max-content",
          animation: `${animName} ${duration}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}
