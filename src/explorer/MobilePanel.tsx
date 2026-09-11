import { useState } from "react";
import type { ReactNode } from "react";

export function MobilePanel({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<"peek" | "half" | "full">("half");
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
