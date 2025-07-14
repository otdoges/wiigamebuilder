# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Wii Game Builder - a Squarespace-like drag-and-drop interface for creating Wii games:

- **Wii Game Builder Frontend**: Located in `frontend/` - Next.js 15 application with drag-and-drop components, Monaco editor, and game canvas
- **Legacy React App**: Located in `src/` - Original React + Vite application (now secondary)
- **Electron Process**: Located in `electron/` - Main process (`main.ts`) with Wii game build IPC handlers and preload script (`preload.ts`)

### Wii Game Builder Features
- **Component Palette**: Drag-and-drop game components (player, enemies, platforms, etc.)
- **Game Canvas**: Visual game designer with real-time component manipulation
- **Monaco Code Editor**: JavaScript scripting with Wii Remote API and component-specific snippets
- **Build System**: Converts visual game design + code into Wii game packages
- **Electron Integration**: File save/load, build processing, and export functionality

The project uses Next.js for the main builder interface and electron-builder for desktop app packaging.

## Development Commands

### Wii Game Builder (Primary Application)
- `npm run dev:wii-builder` - Start complete Wii Game Builder (Next.js + Electron)
- `node start-wii-builder.js` - Alternative start script with better logging
- `npm run build:full` - Build both Next.js frontend and Electron app
- `npm run lint:all` - Run linting on both frontend and main app

### Individual Components
- `npm run dev:nextjs` - Start Next.js frontend only (port 3000)
- `npm run dev:electron` - Start Electron with Vite for legacy React app
- `npm run dev` - Start legacy Vite React app (not the main Wii builder)
- `npm run build` - Build legacy React app + Electron packaging
- `npm run build:nextjs` - Build Next.js frontend only

### Frontend Subdirectory (Next.js)
Navigate to `frontend/` directory first:
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build Next.js application for production
- `npm run start` - Start Next.js production server
- `npm run lint` - Run Next.js ESLint configuration

## Key Configuration Files

- `vite.config.ts` - Vite configuration with electron plugins
- `electron-builder.json5` - Electron Builder configuration for packaging (supports Mac dmg, Windows nsis, Linux AppImage)
- `frontend/next.config.ts` - Next.js configuration
- `frontend/eslint.config.mjs` - Next.js ESLint configuration
- `tsconfig.json` / `tsconfig.node.json` - TypeScript configurations

## Build Output Structure

```
frontend/.next/     # Next.js build output (Wii Game Builder)
dist/               # Legacy Vite build output
dist-electron/      # Electron main/preload build output  
release/            # Final packaged Wii Game Builder application
```

## Wii Game Builder Development

### Component Structure
- `frontend/src/app/components/WiiGameBuilder.tsx` - Main builder interface
- `frontend/src/app/components/ComponentPalette.tsx` - Draggable game components
- `frontend/src/app/components/GameCanvas.tsx` - Visual game designer
- `frontend/src/app/components/CodeEditor.tsx` - Monaco-based script editor
- `frontend/src/app/components/BuildButton.tsx` - Build system interface
- `frontend/src/app/types/WiiComponent.ts` - Component type definitions

### IPC Communication
The Electron main process handles:
- `build-wii-game` - Process game build requests
- `save-project` / `load-project` - Project file management
- `export-game` - Game package export
- `open-dev-tools` - Development tools access

## Technology Stack

### Wii Game Builder (Primary)
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: Framer Motion (animations), @dnd-kit (drag-and-drop), Lucide React (icons)
- **Code Editor**: Monaco Editor with JavaScript syntax highlighting
- **Notifications**: React Hot Toast
- **Desktop**: Electron 30 with IPC for build system integration

### Legacy React App
- **Framework**: React 18 + TypeScript + Vite
- **Build Tools**: Vite, electron-builder, ESLint

### Build & Development
- **Process Management**: Concurrently, wait-on
- **Packaging**: electron-builder