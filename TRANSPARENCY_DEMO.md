# Node Transparency and Emoji Demo

## How to Use Transparent Backgrounds

You can create transparent node backgrounds using RGBA colors:

### Examples:

1. **Fully Transparent Background**
   - Set backgroundColor to: `transparent` or `rgba(0,0,0,0)`
   - The emoji/icon will appear without any background circle

2. **Semi-Transparent Backgrounds**
   - Light blue 50% opacity: `rgba(59, 130, 246, 0.5)`
   - Light green 30% opacity: `rgba(34, 197, 94, 0.3)`
   - Light red 20% opacity: `rgba(239, 68, 68, 0.2)`

3. **Glass Effect**
   - White with 10% opacity: `rgba(255, 255, 255, 0.1)`
   - Black with 5% opacity: `rgba(0, 0, 0, 0.05)`

## Using Emojis

1. In the Node Type Appearance settings, select "Emoji" from the icon group
2. Choose from common emojis like:
   - 👤 person
   - 🏢 company
   - 📦 product
   - 📍 location
   - 💻 computer
   - 🔒 security
   - And many more!

3. Or directly set an emoji in the icon field when creating nodes

## Example Node Appearances

```javascript
// Transparent background with emoji
{
  icon: '🏢',
  backgroundColor: 'transparent',
  iconColor: '#000000' // Note: emoji colors can't be changed
}

// Semi-transparent blue with user emoji
{
  icon: '👤',
  backgroundColor: 'rgba(59, 130, 246, 0.3)',
  borderEnabled: true,
  borderColor: 'rgba(59, 130, 246, 0.8)'
}

// Glass effect with lock emoji
{
  icon: '🔒',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderEnabled: true,
  borderColor: 'rgba(255, 255, 255, 0.3)'
}
```

## Notes

- Emojis maintain their original colors and cannot be recolored
- Transparency works best with borderEnabled=true to maintain node visibility
- Use higher opacity (0.8-1.0) for borders when background is very transparent
- The `iconColor` property only affects icon components, not emojis