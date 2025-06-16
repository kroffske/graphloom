export interface TimeRange {
  min: number;
  max: number;
}

export interface SelectedTimeRange {
  start: number;
  end: number;
}

export interface TimeFilteringState {
  timeRange: TimeRange | null;
  selectedTimeRange: SelectedTimeRange | null;
  timestampField: string | null;
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 5x, etc.
}

export interface TimestampFieldInfo {
  field: string;
  count: number; // Number of valid timestamps found
  coverage: number; // Percentage of items with valid timestamps
  sample: number[]; // Sample of parsed timestamps
}

export type TimeFormat = 'date' | 'time' | 'datetime' | 'relative' | 'unix';

export interface TimeSliderConfig {
  format: TimeFormat;
  showHistogram: boolean;
  animationDuration: number; // ms per step
  stepSize: number; // minimum time increment
}