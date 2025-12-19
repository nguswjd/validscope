import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronsUpDown } from "lucide-react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    const isNumber = type === "number";

    const internalRef = React.useRef<HTMLInputElement>(null);

    const setRefs = (node: HTMLInputElement) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const clamp = (value: number) => {
      if (Number.isNaN(value)) return 0;
      return Math.min(Math.max(value, 0), 100);
    };

    const changeValue = (delta: number) => {
      const input = internalRef.current;
      if (!input) return;

      const step = Number(input.step) || 1;
      let next = (Number(input.value) || 0) + delta * step;

      if (isNumber) next = clamp(next);

      input.value = String(next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    return (
      <div className="relative w-full">
        <input
          ref={setRefs}
          type={isNumber ? "number" : type}
          inputMode={isNumber ? "numeric" : undefined}
          min={isNumber ? 0 : undefined}
          max={isNumber ? 100 : undefined}
          step={isNumber ? 1 : undefined}
          className={cn(
            "flex h-12 w-full rounded-md border border-gray-2 px-3 pr-10 text-sm",
            "placeholder:text-gray-3",
            "focus:outline-none focus:border-gray-2",
            className
          )}
          onKeyDown={(e) => {
            if (isNumber && (e.key === "-" || e.key === "e")) {
              e.preventDefault();
            }
            props.onKeyDown?.(e);
          }}
          onChange={(e) => {
            if (!isNumber) {
              props.onChange?.(e);
              return;
            }

            const value = clamp(Number(e.target.value));
            e.target.value = String(value);

            props.onChange?.(e);
          }}
          {...props}
        />

        {isNumber && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-3">
            %
          </span>
        )}

        {isNumber && (
          <button
            type="button"
            aria-label="increase or decrease"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = e.clientY - rect.top;
              changeValue(clickY < rect.height / 2 ? 1 : -1);
            }}
            className="absolute right-1 top-1 bottom-1 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <ChevronsUpDown size={16} />
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
