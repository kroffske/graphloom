# Icon Graph Explorer Documentation

This directory contains detailed documentation for the Icon Graph Explorer application.

## Available Guides

### 📐 [Node Customization Guide](node-customization.md)
Learn how to customize node appearance including:
- Changing node sizes and circle radius
- Configuring icon systems (Classic, Lucide, Emoji)
- Setting transparency and colors
- Performance considerations for different node sizes

### ⚡ [Performance Optimization Guide](performance-optimization.md)
Optimize graph rendering for large datasets:
- Viewport culling and LOD rendering
- Layout algorithm optimizations
- Memory management techniques
- Browser performance tips
- Strategies by graph size (100 to 10,000+ nodes)

### 🔀 [Layout Algorithms Guide](layouts.md)
Understand and choose the right layout:
- 7 available layouts with use cases
- Performance characteristics
- Parameter tuning
- Layout selection strategy
- Combining and transitioning layouts

### 🧪 [Test Data Generation Guide](test-data-generation.md)
Generate realistic test data:
- Quick start with pre-defined generators
- Customizing node types and attributes
- Adjusting edge density and connections
- Creating subgraph structures
- Performance testing scenarios

### ⏱️ [Time-Based Edge Filtering](time-filtering.md)
Filter edges by timestamp:
- Automatic timestamp detection
- Interactive time range slider
- Play/pause animation controls
- Support for multiple timestamp formats
- Performance optimized for large datasets

## Quick Start

For most common tasks:

1. **Make nodes smaller/larger**: See [Node Customization Guide](node-customization.md#changing-node-sizes)
2. **Improve performance**: See [Performance Optimization Guide](performance-optimization.md#optimization-strategies-by-graph-size)
3. **Choose a layout**: See [Layout Algorithms Guide](layouts.md#layout-selection-strategy)
4. **Generate test data**: See [Test Data Generation Guide](test-data-generation.md#quick-start)

## Architecture References

For code architecture and development workflow, see the main [CLAUDE.md](../CLAUDE.md) file in the project root.