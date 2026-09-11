import { createRoot } from "react-dom/client";
import { RiffrecProvider, RiffrecRecorder } from "riffrec";

export function mountDevFeedback() {
  const container = document.createElement("div");
  container.id = "riffrec-root";
  Object.assign(container.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: "2147483647",
  });
  document.body.appendChild(container);

  createRoot(container).render(
    <RiffrecProvider forceEnable>
      <RiffrecRecorder startLabel="Record product feedback" />
    </RiffrecProvider>,
  );
}
