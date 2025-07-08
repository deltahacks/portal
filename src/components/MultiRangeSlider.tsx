import React, { useState, useCallback, useEffect } from "react";

interface MultiRangeSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({
  min,
  max,
  onChange,
}) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

  // Update min and max values
  useEffect(() => {
    onChange(minVal, maxVal);
  }, [minVal, maxVal, onChange]);

  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
        }}
        className=" w-full h-1 bg-purple-400 appearance-none"
        style={{ zIndex: minVal > max - 100 ? "5" : undefined }}
      />
      <input
        type="range"
        min={min}
        step={0.1}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
        }}
        className="w-full h-1 bg-purple-400 appearance-none"
      />

      <div className="relative w-full h-1 bg-gray-300">
        <div
          className="absolute h-1 bg-blue-500"
          style={{
            left: `${getPercent(minVal)}%`,
            width: `${getPercent(maxVal) - getPercent(minVal)}%`,
          }}
        />
      </div>
    </div>
  );
};

export default MultiRangeSlider;
