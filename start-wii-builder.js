#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎮 Starting Wii Game Builder...\n');

// Start the Wii Game Builder with both Next.js frontend and Electron
const wiiBuilder = spawn('npm', ['run', 'dev:wii-builder'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

wiiBuilder.on('close', (code) => {
  console.log(`\n🎮 Wii Game Builder exited with code ${code}`);
});

wiiBuilder.on('error', (error) => {
  console.error('❌ Error starting Wii Game Builder:', error);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Wii Game Builder...');
  wiiBuilder.kill('SIGINT');
  process.exit(0);
});