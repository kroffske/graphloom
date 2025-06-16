# Changelog

All notable changes to GraphLoom will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-16

### Changed
- **BREAKING**: Removed feature flag system - React-first approach (GraphCanvasV2) is now the default
- Removed old D3-first implementation completely (~2100 lines of code removed)
- Simplified codebase with single graph implementation
- TestDataLoader is now always visible

### Removed
- All GraphD3* components
- useFeatureFlag hook
- Portal-based rendering system
- TestDragNode experimental component

## [0.0.1] - 2024-12-16

### Added
- Initial release of GraphLoom Explorer
- Interactive graph visualization with drag-and-drop functionality
- Multiple layout algorithms:
  - Force-directed layout
  - ForceAtlas2 layout
  - OpenOrd layout (optimized for large graphs)
  - Circle layout
  - Hierarchy layout
  - Radial layout
  - Fast layout (for quick positioning)
- Time-based edge filtering with interactive timeline slider
  - Play/pause animation controls
  - Variable playback speed (1x, 2x, 5x, 10x)
  - Visual indicators for filtered state
- Node and edge customization:
  - Custom colors, sizes, and borders
  - Icon support (Classic, Lucide, and Emoji icons)
  - Transparency support
- Performance optimizations:
  - Viewport culling for large graphs
  - Level of detail (LOD) rendering
  - Handles 5000+ nodes efficiently
- CSV import functionality for custom data
- Hover tooltips showing node/edge attributes
- Toggle for showing/hiding isolated nodes
- Dark mode support
- Performance and timeline indicators

### Fixed
- React hooks ordering issues
- Layout overflow problems with timeline slider
- Icon centering and color application
- Transparency rendering for node backgrounds

### Changed
- Renamed project from "Graph Explorer" to "GraphLoom Explorer"
- Removed debug console.log statements
- Removed external branding references