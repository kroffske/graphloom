
import * as React from "react";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

type TimeRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
};

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  className,
}) => {
  const handleValueChange = (newValue: number[]) => {
    onChange([newValue[0], newValue[1]]);
  };
  
  if (min >= max) {
    return <div className="text-sm text-muted-foreground p-2 text-center">Not enough time data to create a filter range.</div>;
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{format(new Date(value[0]), "MMM d, yyyy HH:mm")}</span>
        <span>{format(new Date(value[1]), "MMM d, yyyy HH:mm")}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1000 * 60} // 1 minute steps
        value={value}
        onValueChange={handleValueChange}
      />
    </div>
  );
};

export default TimeRangeSlider;
