"use client";

import { useEffect } from "react";

export function TouchDebugger() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const enabled = params.get("touchDebug") === "1";

    if (!enabled) return;

    const outlineElement = (element: Element | null) => {
      console.log("TOUCH TOP ELEMENT:", element);

      if (!(element instanceof HTMLElement)) return;

      const previousOutline = element.style.outline;
      const previousOutlineOffset = element.style.outlineOffset;
      element.style.outline = "2px solid red";
      element.style.outlineOffset = "-2px";

      window.setTimeout(() => {
        element.style.outline = previousOutline;
        element.style.outlineOffset = previousOutlineOffset;
      }, 1000);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const topElement = document.elementFromPoint(touch.clientX, touch.clientY);
      console.log("TOUCH TARGET:", event.target);
      outlineElement(topElement);
    };

    const handleClick = (event: MouseEvent) => {
      console.log("CLICK TARGET:", event.target);
    };

    const handleError = (event: ErrorEvent) => {
      console.log("CLIENT ERROR:", event.message, event.error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.log("CLIENT PROMISE REJECTION:", event.reason);
    };

    document.addEventListener("touchstart", handleTouchStart, true);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
