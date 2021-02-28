/**
 * SkoshX (https://skoshx.com)
 * Progress component (loading bar on the top of the viewport)
 */

import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import { EventEmitter } from "../event";
import { animation, PropertySetter, fadeOut, fadeIn } from "../animation";

export enum ProgressEvents {
  Progress = "PROGRESS_EVENT_PROGRESS",
  AddProgress = "PROGRESS_EVENT_PROGRESS_ADD",
  Finished = "PROGRESS_EVENT_FINISHED",
}

export const Progress = () => {
  const progressRef = useRef<HTMLDivElement>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate according to progress
    const width = parseFloat(getComputedStyle(progressRef.current).width);
    fadeIn(progressRef.current);
    animation(
      { from: width, to: progress * 100 },
      progressRef.current,
      PropertySetter("width", "%")
    );
  }, [progress]);
  EventEmitter.on(ProgressEvents.AddProgress, (add: number) => {
    setProgress(progress + add);
  });
  EventEmitter.on(ProgressEvents.Progress, (progress: number) => {
    setProgress(progress);
  });

  EventEmitter.on(ProgressEvents.Finished, async () => {
    const width = parseFloat(progressRef.current.style.width);
    await animation(
      { from: width, to: 100 },
      progressRef.current,
      PropertySetter("width", "%")
    );
    await fadeOut(progressRef.current);
    progressRef.current.style.width = "0";
    setProgress(0); // Reset progress
  });

  return (
    <div
      ref={progressRef}
      id="progress"
      className="u-shadow"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={Math.round(progress * 100)}
    ></div>
  );
};
