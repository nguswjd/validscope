import React from "react";

interface ProgressBarProps {
  value: number;
  height?: number;
  showLabel?: boolean;
  label?: React.ReactNode;
  variant?: "percent" | "dollar" | "score";
  className?: string;
}

export default function ProgressBar({
  value,
  height = 8,
  showLabel = true,
  label,
  variant = "percent",
  className = "",
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-black">
          <div className="flex gap-1 items-center">
            <p className="w-1.5 h-1.5 bg-blue-2 rounded-full"></p>
            {label}
          </div>
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
