import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  unit?: string | number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, unit, ...props }, ref) => (
  <div className="w-full">
    <div className="flex justify-between mb-1 text-xs text-black">
      <span>{label}</span>
      <span>{unit}</span>
    </div>

    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-blue-1">
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-1 bg-blue-10 rounded-full" />
    </SliderPrimitive.Root>
  </div>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
