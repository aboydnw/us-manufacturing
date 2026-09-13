import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function MobilePanel({
  children,
  selectionKey = null,
}: {
  children: ReactNode;
  selectionKey?: string | null;
}) {
  const [position, setPosition] = useState<"peek" | "half" | "full">("half");
  const previousSelection = useRef(selectionKey);
  useEffect(() => {
    if (selectionKey && selectionKey !== previousSelection.current) {
      setPosition((current) => (current === "peek" ? "half" : current));
    }
    previousSelection.current = selectionKey;
  }, [selectionKey]);
  const label = position === "full" ? "Collapse panel" : "Expand panel";

  function cyclePosition() {
    setPosition((current) =>
      current === "full" ? "peek" : current === "peek" ? "half" : "full",
    );
  }

  return (
    <div
      className="explorer-panel-slot"
      data-testid="mobile-panel"
      data-sheet-position={position}
    >
      <button
        type="button"
        className="mobile-panel__handle"
        aria-label={label}
        onClick={cyclePosition}
      >
        <span aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
