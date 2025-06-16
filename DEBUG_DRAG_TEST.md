# Debug Node Dragging Test

## Test URL
http://localhost:8080/?feature_USE_REACT_FIRST_GRAPH=true

## Steps to Test

1. Open browser console (F12)
2. Clear console
3. Load test data (click "Load 50 Nodes" button)
4. Try to drag a node with left mouse button

## Expected Console Output

When clicking on a node, you should see:

1. `[GraphNodeV2] handleMouseDown called, button: 0, onDrag available: true`
2. `[GraphNodeV2] Mouse down on node: <nodeId>, at position: <x>, <y>`
3. `[GraphCanvasV2] handleNodeDrag called: {nodeId: ..., dx: ..., dy: ..., type: "start"}`

When moving the mouse while dragging:

4. `[GraphNodeV2] Drag move: {nodeId: ..., clientX: ..., clientY: ..., worldX: ..., worldY: ...}`
5. `[GraphCanvasV2] handleNodeDrag called: {nodeId: ..., dx: ..., dy: ..., type: "drag"}`

When releasing the mouse:

6. `[GraphNodeV2] Mouse up, ending drag for node: <nodeId>`
7. `[GraphCanvasV2] handleNodeDrag called: {nodeId: ..., dx: 0, dy: 0, type: "end"}`

## Debugging Issues

### If you see no logs at all:
- The feature flag might not be active (check URL)
- The GraphNodeV2 component might not be rendering
- Add this to browser console to check: `document.querySelectorAll('.graph-node-svg').length`

### If you see "handleMouseDown called" but no drag:
- The onDrag prop might not be passed correctly
- Check if you see "onDrag available: true" in the log

### If you see all logs but nodes don't move:
- The D3 simulation might not be updating
- The positions might not be re-rendering

## Quick Fix to Try

If dragging is completely broken, try this in the browser console:

```javascript
// Force enable pointer events on all nodes
document.querySelectorAll('circle').forEach(c => {
  c.style.pointerEvents = 'all';
  c.style.cursor = 'grab';
});

// Check if nodes exist
console.log('Nodes found:', document.querySelectorAll('.graph-node-svg').length);

// Check transform
const g = document.querySelector('svg g');
console.log('Transform:', g?.getAttribute('transform'));
```