const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for development
app.use(cors());
app.use(express.json());

// ANSI color codes for terminal
const colors = {
  timestamp: '\x1b[90m',  // gray
  portal: '\x1b[36m',     // cyan
  d3: '\x1b[33m',         // yellow
  reset: '\x1b[0m'
};

// Debug log endpoint
app.post('/debug-log', (req, res) => {
  const { timestamp, message } = req.body;
  
  // Color code based on message prefix
  let color = colors.reset;
  if (message.includes('[Portal]')) color = colors.portal;
  else if (message.includes('[D3]')) color = colors.d3;
  
  // Print to terminal with colors
  console.log(
    `${colors.timestamp}[${new Date(timestamp).toLocaleTimeString()}]${colors.reset} ${color}${message}${colors.reset}`
  );
  
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Debug server running on http://localhost:${PORT}`);
  console.log('Logs will appear here...\n');
});