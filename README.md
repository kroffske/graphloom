# GraphLoom Explorer

Weave your data into interactive network visualizations. GraphLoom is a powerful graph visualization tool for exploring network data with advanced filtering, layouts, and time-based analysis.

## Features

- **Interactive Graph Visualization**: Explore nodes and edges with drag-and-drop functionality
- **Multiple Layout Algorithms**: Force-directed, ForceAtlas2, OpenOrd, Circle, Hierarchy, Radial, and Fast layouts
- **Time-based Filtering**: Filter edges based on timestamps with an interactive timeline slider
- **Node & Edge Customization**: Customize appearance with colors, sizes, icons, and emojis
- **Performance Optimized**: Handles graphs with 5000+ nodes using viewport culling and LOD rendering
- **CSV Import**: Upload your own graph data in CSV format
- **Real-time Tooltips**: Hover over nodes and edges to see detailed information

## Installation

### Prerequisites

- Node.js (v16 or higher) & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kroffske/graphloom.git
   cd graphloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Usage

### Quick Start

1. **Load Test Data**: Click on "Load 50/500/5000 Nodes" buttons to load sample graphs
2. **Upload Your Data**: Go to "Upload & Explore" tab to import CSV files
3. **Interact with the Graph**:
   - Drag nodes to reposition them
   - Scroll to zoom in/out
   - Right-click nodes for context menu
   - Hover over nodes/edges to see details

### CSV Data Format

The application expects two CSV files:

**Nodes CSV**:
```csv
id,type,label,icon,color,size
node1,person,John Doe,👤,#3b82f6,40
node2,company,Acme Corp,🏢,#10b981,50
```

**Edges CSV**:
```csv
id,source,target,type,timestamp
edge1,node1,node2,WORKS_AT,2024-01-15T10:30:00Z
```

### Time Filtering

If your edges contain timestamp data, a timeline slider will automatically appear:
- Use the slider to filter edges by time range
- Play/pause animation to see the graph evolve over time
- Adjust playback speed (1x, 2x, 5x, 10x)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Technologies

- **React 18** with TypeScript
- **Vite** for fast development
- **D3.js** for graph physics and layouts
- **Zustand** for state management
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling

## Documentation

See the `docs/` directory for detailed guides:
- [Node Customization Guide](docs/node-customization.md)
- [Performance Optimization](docs/performance-optimization.md)
- [Layout Algorithms](docs/layouts.md)
- [Time-based Filtering](docs/time-filtering.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.