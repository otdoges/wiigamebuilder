@echo off
echo Starting Wii Game Builder...
echo.
echo This will start the Next.js frontend and Electron application
echo Press Ctrl+C to stop the application
echo.

set NODE_ENV=development
concurrently "cd frontend && npm run dev" "wait-on http://localhost:3000 && set NODE_ENV=development && vite"