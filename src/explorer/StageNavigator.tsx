import { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { Stage } from "../data/schema";

interface Props {
  stages: Stage[];
  activeStageId: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSelect: (stageId: string) => void;
}

const stageSymbols: Record<string, string> = {
  "raw-materials": "◆",
  silicon: "Si",
  wafers: "◒",
  cells: "▦",
  modules: "▤",
  structures: "⌁",
  inverters: "↯",
  electrical: "⌇",
  installed: "☀",
  cdte: "Cd",
};

function branchName(stage: Stage) {
  if (stage.technology === "c-si") return "Crystalline silicon";
  if (stage.technology === "cdte") return "Thin film";
  return "Shared system";
}

export function StageNavigator({
  stages,
  activeStageId,
  expanded,
  onExpandedChange,
  onSelect,
}: Props) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStageId),
  );
  const nextStage = stages[(activeIndex + 1) % stages.length];

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const focusedIndex = buttonsRef.current.findIndex(
      (button) => button === document.activeElement,
    );
    if (event.key === "Escape") {
      onExpandedChange(false);
      return;
    }
    if (focusedIndex < 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const target = (focusedIndex + direction + stages.length) % stages.length;
      buttonsRef.current[target]?.focus();
    }
  }

  return (
    <nav
      className={`stage-navigator${expanded ? " stage-navigator--expanded" : ""}`}
      aria-label="Solar manufacturing stages"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
      onFocus={() => onExpandedChange(true)}
    >
      <button
        type="button"
        className="stage-navigator__toggle"
        aria-expanded={expanded}
        aria-controls="stage-navigator-options"
        aria-label={expanded ? "Hide stage choices" : "Show all stages"}
        onClick={() => onExpandedChange(!expanded)}
      >
        Stages <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div className="stage-navigator__branches" aria-hidden="true">
        <span>Shared system</span>
        <span>Crystalline silicon</span>
        <span>Thin film</span>
      </div>
      <ol id="stage-navigator-options" className="stage-navigator__list">
        {stages.map((stage, index) => {
          const active = stage.id === activeStageId;
          const branch = branchName(stage);
          return (
            <li key={stage.id}>
              <button
                ref={(button) => {
                  buttonsRef.current[index] = button;
                }}
                type="button"
                className={active ? "is-active" : ""}
                aria-current={active ? "step" : undefined}
                aria-label={`${stage.shortTitle}, ${branch}`}
                onClick={() => onSelect(stage.id)}
              >
                <span className="stage-navigator__symbol" aria-hidden="true">
                  {stageSymbols[stage.id] ?? "•"}
                </span>
                <span className="stage-navigator__label">
                  {stage.shortTitle}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        className="stage-navigator__next"
        aria-label={`Next: ${nextStage.shortTitle}`}
        onClick={() => onSelect(nextStage.id)}
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
