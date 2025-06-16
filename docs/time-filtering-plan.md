# Time-Based Edge Filtering Feature Plan

## Overview
Implement a time-based filtering system that allows users to filter edges based on timestamp data using a time range slider below the graph.

## Architecture

### 1. Data Flow
```
CSV Import → Timestamp Detection → Parse Min/Max → Store State → UI Slider → Filter Edges → Update Graph
```

### 2. Core Components

#### A. Timestamp Utilities (`src/utils/timestampUtils.ts`)
```typescript
// Functions to implement:
- detectTimestampFields(data: any[]): string[]
- parseTimestamp(value: any): number | null
- findTimeRange(edges: Edge[]): { min: number, max: number } | null
- formatTimestamp(timestamp: number, format?: string): string
```

#### B. Store Updates (`src/state/useGraphStore.ts`)
```typescript
// New state:
- timeRange: { min: number, max: number } | null
- selectedTimeRange: { start: number, end: number } | null
- timestampField: string | null

// New actions:
- setTimeRange(range: { min: number, max: number } | null)
- setSelectedTimeRange(range: { start: number, end: number } | null)
- setTimestampField(field: string | null)
```

#### C. TimeRangeSlider Component (`src/components/TimeRangeSlider.tsx`)
- Dual-handle range slider
- Min/max labels with formatted dates
- Play/pause button for animation
- Speed control for playback
- Current selection display

#### D. Graph Integration
- Filter edges in GraphCanvasV2 based on selectedTimeRange
- Smooth transitions when edges appear/disappear
- Performance optimization for large datasets

### 3. File Structure
```
src/
├── components/
│   ├── TimeRangeSlider.tsx          # Main slider component
│   ├── TimeRangeControls.tsx        # Play/pause, speed controls
│   └── TimeRangeDisplay.tsx         # Current selection display
├── hooks/
│   └── useTimeFiltering.ts          # Hook for time filtering logic
├── utils/
│   ├── timestampUtils.ts            # Timestamp parsing utilities
│   └── timeFormatters.ts            # Date/time formatting helpers
└── types/
    └── timeFiltering.types.ts       # TypeScript types for time filtering
```

## Implementation Steps

### Phase 1: Foundation (Core Infrastructure)
1. Create timestamp utility functions
2. Update graph store with time-related state
3. Modify CSV parser to detect timestamp fields
4. Store min/max timestamps when data is loaded

### Phase 2: UI Components
1. Create basic TimeRangeSlider component
2. Add slider below graph (in GraphCanvasV2 or Index page)
3. Connect slider to store state
4. Style with Tailwind/shadcn-ui

### Phase 3: Filtering Logic
1. Implement edge filtering based on time range
2. Update GraphCanvasV2 to use filtered edges
3. Add smooth transitions for edge visibility
4. Optimize performance for large datasets

### Phase 4: Enhanced Features
1. Add play/pause animation
2. Implement speed control
3. Add date format options
4. Create keyboard shortcuts

### Phase 5: Future Extensions
1. Node filtering by timestamp
2. Time-based node/edge styling
3. Export filtered graph
4. Time-based layouts

## Technical Considerations

### Timestamp Detection
- Support multiple formats: ISO 8601, Unix timestamp, custom formats
- Handle timezone considerations
- Detect fields: created_at, timestamp, date, time, created, updated, etc.

### Performance
- Use React.memo for TimeRangeSlider
- Throttle slider updates
- Use virtual rendering for large edge sets
- Cache filtered results

### Edge Attributes
Edges might have timestamps in:
- `edge.timestamp`
- `edge.attributes.timestamp`
- `edge.attributes.created_at`
- `edge.properties.date`

### UI/UX
- Slider positioned below graph, above panels
- Responsive design
- Clear visual feedback
- Tooltips showing exact dates
- Accessibility (keyboard navigation)

## API Design

### TimeRangeSlider Props
```typescript
interface TimeRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
  speed?: number;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  height?: number;
  className?: string;
}
```

### Hook Usage
```typescript
const {
  timeRange,
  selectedRange,
  filteredEdges,
  isPlaying,
  play,
  pause,
  setSelectedRange
} = useTimeFiltering(edges);
```

## Visual Design
- Horizontal slider with dual handles
- Timeline visualization above slider
- Min/max dates at ends
- Current selection in center
- Play button on left
- Speed control on right
- Subtle animations for state changes

## Testing Strategy
1. Unit tests for timestamp parsing
2. Component tests for slider
3. Integration tests for filtering
4. Performance tests with large datasets
5. E2E tests for user workflows

## Future Enhancements
1. **Multi-field filtering**: Filter by multiple timestamp fields
2. **Presets**: Common time ranges (last hour, day, week)
3. **Histogram**: Show edge distribution over time
4. **Patterns**: Detect and highlight temporal patterns
5. **Export**: Save time-filtered snapshots
6. **Sync**: Coordinate with other filters/selections

## Success Criteria
- [ ] Edges with timestamps are automatically detected
- [ ] Min/max range is calculated and displayed
- [ ] Slider filters edges smoothly
- [ ] Performance remains good with 5000+ edges
- [ ] UI is intuitive and responsive
- [ ] Feature is extensible for nodes