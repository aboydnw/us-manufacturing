import { createRoot } from "react-dom/client";
import { RiffrecProvider, RiffrecRecorder } from "riffrec";

export function mountDevFeedback() {
  const container = document.createElement("div");
  container.id = "riffrec-root";
  document.body.appendChild(container);

  createRoot(container).render(
    <RiffrecProvider>
      <RiffrecRecorder startLabel="Record product feedback" />
    </RiffrecProvider>,
  );
}
