const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = 8081;

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Start Go MCP server as a subprocess
const goProc = spawn('./github-mcp-server', ['stdio'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

goProc.stdout.on('data', (data) => {
  // Optionally, route Go server output/logs somewhere
  console.log(`[Go MCP] ${data}`);
});

goProc.on('close', (code) => {
  console.error(`Go MCP server exited with code ${code}`);
  process.exit(1);
});

// Example endpoint that would send/receive data to/from Go MCP server
app.post('/', express.json(), (req, res) => {
  // Forward JSON-RPC request to Go MCP server via stdio
  goProc.stdin.write(JSON.stringify(req.body) + '\n');

  // For demo: just echo back what was sent
  // In production, implement logic to read from goProc.stdout and send response
  res.json({ status: 'forwarded', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Node.js HTTP wrapper listening on port ${PORT}`);
});
