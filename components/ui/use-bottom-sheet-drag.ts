"use client";

import { useCallback } from "react";
import { type PanInfo, useDragControls } from "framer-motion";

const CLOSE_OFFSET = 96;
const CLOSE_VELOCITY = 700;

export function useBottomSheetDrag(onClose: () => void) {
  const dragControls = useDragControls();

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      dragControls.start(event);
    },
    [dragControls],
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y >= CLOSE_OFFSET || info.velocity.y >= CLOSE_VELOCITY) {
        onClose();
      }
    },
    [onClose],
  );

  return {
    dragControls,
    handleDragEnd,
    startDrag,
  };
}
