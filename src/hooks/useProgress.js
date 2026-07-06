import { useState, useCallback } from "react";
import { calculateProgress } from "@utils/helpers";

function useProgress(initial = { current: 0, total: 100 }) {
  const [progress, setProgress] = useState(initial);

  const updateProgress = useCallback((current, total) => {
    setProgress({ current, total });
  }, []);

  const incrementProgress = useCallback((amount = 1) => {
    setProgress((prev) => ({
      ...prev,
      current: Math.min(prev.current + amount, prev.total),
    }));
  }, []);

  const percentage = calculateProgress(progress.current, progress.total);
  const isComplete = progress.current >= progress.total;

  return {
    progress,
    percentage,
    isComplete,
    updateProgress,
    incrementProgress,
  };
}

export default useProgress;
