import React from "react";

interface ProgressBarProps {
  value: number;
  height?: number;
  showLabel?: boolean;
  label?: React.ReactNode;
  variant?: "percent" | "dollar" | "score";
  className?: string;
  color?: string;
}

export default function ProgressBar({
  value,
  height = 8,
  showLabel = true,
  label,
  variant = "percent",
  className = "",
  color = "#5da4ef",
}: ProgressBarProps) {
  const displayValue =
    variant === "dollar"
      ? Math.max(0, value)
      : Math.min(100, Math.max(0, value));
  const barWidth = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-black">
          <div className="flex gap-1 items-center">
            <p
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            ></p>
            {label}
          </div>
          <span>
            {variant === "dollar" && `$${displayValue.toFixed(2)}`}
            {variant === "score" && `${displayValue.toFixed(2)}/100`}
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full bg-gray-1 overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          }}
        />
      </div>
    </div>
  );
}
