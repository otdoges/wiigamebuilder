import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// Development and production URLs
export const NEXTJS_DEV_URL = process.env['NEXTJS_DEV_URL'] || 'http://localhost:3000'
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    titleBarStyle: 'default',
    title: 'Wii Game Builder'
  })

  // Load the Next.js frontend
  if (process.env.NODE_ENV === 'development') {
    // In development, load from Next.js dev server
    win.loadURL(NEXTJS_DEV_URL)
    // Open DevTools in development
    win.webContents.openDevTools()
  } else {
    // In production, load from built Next.js files
    // For now, we'll use the dev server - in production you'd need to export Next.js
    win.loadURL(NEXTJS_DEV_URL)
  }

  // Handle window events
  win.webContents.on('did-finish-load', () => {
    console.log('Wii Game Builder loaded successfully')
    win?.webContents.send('main-process-message', {
      type: 'app-ready',
      timestamp: new Date().toISOString()
    })
  })

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// --------- IPC Handlers for Wii Game Builder ---------

ipcMain.handle('build-wii-game', async (event, buildData) => {
  try {
    console.log('Building Wii game with data:', buildData)
    
    // Simulate build process
    const buildResult = {
      success: true,
      message: 'Wii game built successfully!',
      timestamp: new Date().toISOString(),
      components: buildData.components?.length || 0,
      codeLines: buildData.code?.split('\n').length || 0
    }
    
    return buildResult
  } catch (error) {
    console.error('Build error:', error)
    return {
      success: false,
      message: `Build failed: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
})

ipcMain.handle('open-dev-tools', async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.webContents.openDevTools()
  }
})

ipcMain.handle('save-project', async (event, projectData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Save Wii Game Project',
      defaultPath: 'wii-game-project.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePath) {
      await fs.promises.writeFile(result.filePath, JSON.stringify(projectData, null, 2))
      return { success: true, filePath: result.filePath }
    }
    
    return { success: false, message: 'Save cancelled' }
  } catch (error) {
    return { success: false, message: `Save failed: ${error}` }
  }
})

ipcMain.handle('load-project', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Load Wii Game Project',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      const fileContent = await fs.promises.readFile(result.filePaths[0], 'utf-8')
      const projectData = JSON.parse(fileContent)
      return { success: true, data: projectData }
    }
    
    return { success: false, message: 'Load cancelled' }
  } catch (error) {
    return { success: false, message: `Load failed: ${error}` }
  }
})

ipcMain.handle('export-game', async (event, gameData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Export Wii Game',
      defaultPath: 'wii-game.wbf',
      filters: [
        { name: 'Wii Build File', extensions: ['wbf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePath) {
      // Create a more structured export format
      const exportData = {
        format: 'Wii Game Builder',
        version: '1.0.0',
        exported: new Date().toISOString(),
        game: gameData
      }
      
      await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2))
      return { success: true, filePath: result.filePath }
    }
    
    return { success: false, message: 'Export cancelled' }
  } catch (error) {
    return { success: false, message: `Export failed: ${error}` }
  }
})
