# Debugging Node Drag Issues

## Changes Made

1. **Added Comprehensive Console Logging**:
   - `[Index]` - Shows if React-First approach is active
   - `[GraphCanvasV2]` - Logs node rendering and drag callbacks
   - `[GraphNodeV2]` - Logs all mouse events and drag calculations

2. **Fixed Pointer Events**:
   - Added `pointerEvents: 'all'` to both the `<g>` wrapper and `<circle>` element
   - Added `touchAction: 'none'` to SVG for better touch support
   - Added `onMouseDown` handler to the `<g>` element as backup

3. **Improved Coordinate Calculation**:
   - Switched to using SVG's native `createSVGPoint()` and `getScreenCTM()` for accurate coordinate transformation
   - This is more reliable than manual transform parsing

4. **Added Debug Events**:
   - Added `onPointerDown` to circle element to verify events are firing

## Testing Steps

1. **Open the app with the React-First feature flag**:
   ```
   http://localhost:8081/?feature_USE_REACT_FIRST_GRAPH=true
   ```

2. **Load Test Data**:
   - Click "Load 50 Nodes" button
   - Verify nodes appear

3. **Check Console for Initial Logs**:
   - Should see: `[Index] Using React-First approach: true`
   - Should see: `[GraphCanvasV2] Rendering node: [id] at position: {x, y}`

4. **Test Node Interaction**:
   - Move mouse over a node
   - Should see: `[GraphNodeV2] Mouse over circle: [id]`
   
   - Click on a node (left mouse button)
   - Should see:
     - `[GraphNodeV2] Pointer down on circle: [id]`
     - `[GraphNodeV2] handleMouseDown called, button: 0 onDrag available: true`
     - `[GraphNodeV2] Mouse down on node: [id] at position: [x, y]`
     - `[GraphCanvasV2] handleNodeDrag called: {nodeId, dx, dy, type: 'start'}`

5. **Test Drag Movement**:
   - While holding mouse down, move the cursor
   - Should see continuous logs:
     - `[GraphNodeV2] Drag move: {nodeId, clientX, clientY, worldX, worldY}`
     - `[GraphCanvasV2] handleNodeDrag called: {nodeId, dx, dy, type: 'drag'}`

6. **Test Drag End**:
   - Release mouse button
   - Should see:
     - `[GraphNodeV2] Mouse up, ending drag for node: [id]`
     - `[GraphCanvasV2] handleNodeDrag called: {nodeId, dx: 0, dy: 0, type: 'end'}`

## Common Issues to Check

1. **No events firing at all**:
   - Check if there's a CSS overlay blocking pointer events
   - Check browser dev tools for any JavaScript errors
   - Verify the feature flag is active

2. **Events fire but drag doesn't work**:
   - Check if simulation is initialized (look for warning about "No simulation available")
   - Check if node positions are being updated
   - Look for coordinate calculation errors

3. **Drag is jumpy or incorrect**:
   - Check the transform calculations in the console logs
   - Verify SVG viewBox matches expected dimensions (900x530)
   - Check if zoom/pan transforms are being applied correctly

## Next Debugging Steps

If issues persist after checking the above:

1. Add breakpoints in browser DevTools at:
   - `handleMouseDown` in GraphNodeV2.tsx
   - `handleNodeDrag` in GraphCanvasV2.tsx

2. Check if D3 simulation is running:
   - In browser console: `document.querySelector('svg').__data__`
   - Should see simulation data if properly initialized

3. Verify React component updates:
   - Use React DevTools to check if GraphNodeV2 components are receiving position updates
   - Check if `positionsVersion` state in GraphCanvasV2 is incrementing