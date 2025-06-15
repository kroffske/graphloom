# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once

### Common Development Tasks
- After making changes to TypeScript files, run `npm run lint` to ensure code quality
- The development server hot-reloads automatically when files change

## Architecture Overview

### Technology Stack
- **React 18** with TypeScript for the frontend
- **Vite** as the build tool and dev server
- **Zustand** for global state management (see `src/state/useGraphStore.ts`)
- **D3.js** for graph visualization and physics simulation
- **shadcn-ui** components (in `src/components/ui/`)
- **Tailwind CSS** for styling
- **Supabase** for backend integration

### Key Architectural Patterns

1. **Graph State Management**: The entire graph state is managed through a Zustand store at `src/state/useGraphStore.ts`. This includes nodes, edges, selected items, appearance settings, and layout configurations.

2. **Graph Visualization**: The main graph rendering happens through D3.js integration:
   - Force simulation is managed in `src/hooks/useD3Force.ts`
   - SVG rendering logic is in `src/components/GraphCanvas.tsx`
   - Node and edge components handle individual element rendering

3. **Component Structure**:
   - Page components in `src/pages/` handle routing
   - Feature components are organized by function (Graph*, Node*, Edge*, *Panel)
   - Reusable UI components from shadcn-ui are in `src/components/ui/`

4. **Type System**: Comprehensive TypeScript types are defined in `src/types/`:
   - `graph.types.ts` - Core graph data structures
   - `appearance.types.ts` - Visual styling types
   - `panel.types.ts` - UI panel state types

5. **Data Flow**:
   - CSV files are uploaded through `UploadPanel`
   - Data is parsed and validated in `src/utils/csvParser.ts`
   - Graph state is updated via Zustand actions
   - D3.js force simulation runs continuously for layout
   - React components render based on state changes

### Important Files and Their Roles

- `src/App.tsx` - Sets up routing and global providers
- `src/pages/Index.tsx` - Main application page with all panels
- `src/components/GraphCanvas.tsx` - Core graph visualization component
- `src/state/useGraphStore.ts` - Central state management
- `src/hooks/useD3Force.ts` - D3.js force simulation logic
- `src/utils/csvParser.ts` - CSV parsing and validation
- `src/config/constants.ts` - Application-wide constants

### Path Aliases
The project uses TypeScript path aliases:
- `@/*` maps to `./src/*`

Example: `import { Button } from "@/components/ui/button"`