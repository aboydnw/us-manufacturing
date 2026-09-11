interface Props {
  value: "us" | "global";
  onChange: (view: "us" | "global") => void;
}

export function MapControls({ value, onChange }: Props) {
  return (
    <div className="map-controls" role="group" aria-label="Map geography">
      <button
        type="button"
        aria-pressed={value === "us"}
        onClick={() => onChange("us")}
      >
        U.S.
      </button>
      <button
        type="button"
        aria-pressed={value === "global"}
        onClick={() => onChange("global")}
      >
        Global
      </button>
    </div>
  );
}
