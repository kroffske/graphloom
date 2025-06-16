# Node Customization Guide

This guide explains how to customize node appearance, including icon sizes, icons, and visual properties.

## Node Size Configuration

### Default Sizes

The application uses two rendering systems with different size configurations:

1. **GraphNodeV2 (SVG-based)** - Uses hardcoded values:
   - Circle radius: `19px`
   - Selection circle radius: `22px`
   - Icon container: `20x20px`
   - Emoji font size: `14px`
   - Label position: `y=35` (below the node)

2. **GraphD3Node (HTML-based)** - Uses configurable values:
   - Default node size: `38px` (radius = 19px)
   - Size is configurable via `appearance.size` property
   - Icon size: calculated as `nodeSize * 0.54`

### Changing Node Sizes

#### Method 1: Global Changes (Code Modification)

To change the default node sizes globally, modify these files:

**For GraphNodeV2** (`src/components/GraphNodeV2.tsx`):
```tsx
// Line 167: Main circle radius
<circle r={19} />  // Change this value

// Line 258: Selection circle
<circle r={22} />  // Change this value

// Lines 208-211: Icon container size
<foreignObject
  x={-10}      // Adjust to center icon
  y={-10}      // Adjust to center icon
  width={20}    // Icon container width
  height={20}   // Icon container height
/>

// Line 194: Emoji font size
fontSize={14}  // Change for emoji size
```

**For GraphD3Node** (`src/components/GraphD3Node.tsx`):
```tsx
// Line 37: Default node size
const nodeSize = appearance.size ?? 38;  // Change default
```

#### Method 2: Appearance System (Runtime Configuration)

Use the appearance system to configure sizes per node type:

```typescript
// In appearance presets or node type settings
{
  size: 48,  // Node diameter in pixels
  icon: '🏢',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  // ... other properties
}
```

### Force Simulation Adjustments

When changing node sizes, update the force simulation parameters:

**In `src/components/GraphCanvasV2.tsx`:**
```tsx
// Collision radius should match node size
.force('collision', d3.forceCollide()
  .radius(isLargeGraph ? 16 : 22)  // Adjust based on node radius
)

// Link distances
.distance((d: any) => {
  return d.type === 'INTER_SUBGRAPH' ? 150 : 60;  // Adjust spacing
})
```

## Icon System

### Available Icon Sets

1. **Classic Icons** - Built-in Lucide React icons
2. **Lucide Icons** - Extended Lucide icon set
3. **Emoji Icons** - Unicode emoji characters

### Adding Custom Icons

#### Adding Emojis

Edit `src/config/emojiIcons.ts`:
```typescript
export const EMOJI_ICONS = {
  person: '👤',
  company: '🏢',
  server: '🖥️',
  // Add your custom emojis here
  customType: '🎯',
};
```

#### Icon Selection Priority

The system selects icons in this order:
1. Node-specific icon (`node.appearance.icon`)
2. Node type icon (`nodeTypeAppearances[node.type].icon`)
3. Fallback to node type as text

### Icon Rendering

Icons are rendered differently based on type:

1. **Emoji Icons** - Rendered as text with configurable color
2. **SVG Icons** - Rendered as React components from Lucide
3. **Fallback** - Node type displayed as text

## Transparency and Colors

### Background Transparency

Nodes support transparent backgrounds:

```typescript
// Fully transparent
backgroundColor: 'transparent'

// Semi-transparent with color
backgroundColor: 'rgba(34, 197, 94, 0.1)'  // 10% opacity green

// Solid color
backgroundColor: '#22c55e'
```

### Important Notes on Transparency

- GraphNodeV2 defaults to `'transparent'` when backgroundColor is undefined
- GraphD3Node respects the transparency value from appearance settings
- Emojis can be displayed on transparent backgrounds without issues

## Performance Considerations

### Level of Detail (LOD) Rendering

The system automatically adjusts rendering based on zoom level:

```typescript
// In GraphCanvasV2.tsx
const showLabels = transform.k > 0.6;      // Hide labels when zoomed out
const showIcons = transform.k > 0.3;       // Hide icons when very zoomed out
const simplifiedRendering = transform.k < 0.5;  // Use simple circles
```

### Simplified Rendering

When zoomed out (zoom < 0.5), nodes render as simple circles:
- Radius: `5px`
- No icons or labels
- Minimal stroke width
- Reduced opacity for edges

## Common Customization Scenarios

### Smaller, Denser Graphs

For graphs with many nodes that need to fit in view:
1. Reduce node radius to 15-20px
2. Decrease collision radius in force simulation
3. Reduce link distances
4. Use simplified rendering at higher zoom levels

### Larger, More Readable Nodes

For presentation or detailed analysis:
1. Increase node radius to 30-40px
2. Increase font sizes for labels and emojis
3. Add more padding in force simulation
4. Increase edge widths for visibility

### High-Performance Settings

For graphs with 5000+ nodes:
1. Use smaller node sizes (radius ~15px)
2. Enable aggressive LOD (hide details earlier)
3. Reduce edge density in test data
4. Use "Fast" layout for immediate positioning

## Troubleshooting

### Icons Not Showing

1. Check if icon exists in registry
2. Verify icon name matches exactly
3. Check zoom level (icons hidden when k < 0.3)
4. Ensure icon color contrasts with background

### Overlapping Nodes

1. Increase collision radius in force simulation
2. Reduce edge attraction strength
3. Use "Fast" layout for initial separation
4. Increase `preventOverlap` spacing

### Performance Issues

1. Reduce node size for faster rendering
2. Lower edge density
3. Use viewport culling (automatic)
4. Switch to "Fast" layout for large graphs