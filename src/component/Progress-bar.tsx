import React from "react";

interface ProgressBarProps {
  value: number;
  height?: number;
  showLabel?: boolean;
  label?: React.ReactNode;
  /** 'percent' | 'dollar' | 'score' */
  variant?: "percent" | "dollar" | "score";
  maxScore?: number; // score variant용
  className?: string;
}

export default function ProgressBar({
  value,
  height = 8,
  showLabel = true,
  label,
  variant = "percent",
  maxScore = 100,
  className = "",
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-black">
          <div>{label}</div>
          <span>
            {variant === "dollar" && `$${safeValue}`}
            {variant === "score" && `${safeValue}/100`}
          </span>
        </div>
      )}

      <div
        className="w-full rounded-full bg-gray-1 overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full bg-gradient-blue-2 transition-all duration-300"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
