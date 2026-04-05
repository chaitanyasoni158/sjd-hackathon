"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export function MoodIntensitySlider({ initialValue }: { initialValue: number }) {
  const [intensity, setIntensity] = useState(initialValue);

  return (
    <div className="slider-row">
      <span className="slider-label">Mild</span>
      <input
        className="styled-slider"
        min={1}
        max={10}
        name="intensity"
        type="range"
        value={intensity}
        onChange={(event) => setIntensity(Number(event.target.value))}
        style={{ "--slider-fill": `${((intensity - 1) / 9) * 100}%` } as CSSProperties}
      />
      <span className="slider-label">Intense</span>
      <span className="slider-val">{intensity}</span>
    </div>
  );
}
