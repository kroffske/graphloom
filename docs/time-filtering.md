# Time-Based Edge Filtering

This guide explains how to use the time-based edge filtering feature.

## Overview

The time filtering feature allows you to filter edges based on timestamp data using an interactive time range slider. Edges outside the selected time range will disappear from the graph view.

## How It Works

### Automatic Timestamp Detection

When you load CSV data with edges, the system automatically:
1. Scans for timestamp fields (e.g., `timestamp`, `created_at`, `date`, etc.)
2. Selects the field with the highest coverage
3. Calculates the min/max time range
4. Displays the time slider below the graph

### Supported Timestamp Formats

- ISO 8601: `2024-05-01T10:00:00Z`
- Unix timestamp (seconds): `1714561200`
- Unix timestamp (milliseconds): `1714561200000`
- Date strings parseable by JavaScript: `2024-05-01 10:00:00`

## Using the Time Slider

### Basic Controls

- **Dual Handles**: Drag the handles to select a time range
- **Play/Pause**: Animate through time to see edges appear chronologically
- **Speed Control**: Toggle between 1x, 2x, 5x, and 10x playback speed
- **Reset**: Return to the full time range

### Visual Feedback

- **Active Edges Count**: Shows "X / Y edges" to indicate how many edges are visible
- **Time Labels**: Displays the current selected range
- **Min/Max Labels**: Shows the full data time range

## CSV Format

Add a timestamp column to your edges CSV:

```csv
source,target,edge_type,label,timestamp
user1,event1,triggered,User Login,2024-05-01T10:00:00Z
event1,app,initiated,Process Login,2024-05-01T10:00:05Z
```

### Multiple Timestamp Fields

If your data has multiple timestamp fields, the system will automatically select the one with the most valid timestamps. Common field names:
- `timestamp`
- `created_at` / `createdAt`
- `updated_at` / `updatedAt`
- `date` / `datetime`
- `occurred` / `occurred_at`

## Example Use Cases

### 1. Event Sequence Analysis
See the order of events in a system by playing the animation from start to finish.

### 2. Time Window Investigation
Focus on a specific time period where an incident occurred.

### 3. Pattern Detection
Identify temporal patterns by observing when edges appear/disappear.

### 4. Data Quality Check
Quickly identify edges without timestamps (they remain visible throughout).

## Performance Considerations

- Filtering is performed in real-time as you move the slider
- Large datasets (5000+ edges) remain responsive
- Edges without timestamps are always shown

## Keyboard Shortcuts

- **Space**: Play/Pause animation (when slider is focused)
- **Left/Right Arrow**: Fine-tune the selection
- **Home/End**: Jump to min/max range

## Future Enhancements

The time filtering infrastructure is designed to be extensible:
- Node filtering by timestamp (coming soon)
- Time-based styling (fade older edges)
- Histogram visualization of edge distribution
- Export time-filtered snapshots

## Troubleshooting

### No Time Slider Appears
- Ensure your edges have at least one timestamp field
- Check that timestamps are in a supported format
- Verify timestamps are valid dates (not "null" or "undefined")

### All Edges Disappear
- Check if your selected range is too narrow
- Use the reset button to return to full range
- Edges without timestamps should always remain visible

### Performance Issues
- Reduce the total number of edges
- Use the simplified rendering mode (zoom out)
- Close other panels to free up resources