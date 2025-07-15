'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Build, Play, Save, Settings } from 'lucide-react';
import GameCanvas from './GameCanvas';
import ComponentPalette from './ComponentPalette';
import CodeEditor from './CodeEditor';
import BuildButton from './BuildButton';
import { WiiComponent } from '../types/WiiComponent';

const WiiGameBuilder = () => {
  const [canvasComponents, setCanvasComponents] = useState<WiiComponent[]>([]);
  const [code, setCode] = useState(`// Wii Game Script
function onStart() {
  // Initialize your game here
  console.log("Game starting!");
}

function onUpdate() {
  // Game loop logic
}

function onButtonPress(button) {
  // Handle Wii Remote button presses
  switch(button) {
    case 'A':
      // A button action
      break;
    case 'B':
      // B button action
      break;
    case '1':
      // 1 button action
      break;
    case '2':
      // 2 button action
      break;
  }
}

function onMotion(x, y, z) {
  // Handle Wii Remote motion
  console.log(\`Motion: \${x}, \${y}, \${z}\`);
}`);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<WiiComponent | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    if (over.id === 'game-canvas') {
      // Adding component to canvas
      if (active.data.current?.type === 'palette-item') {
        const newComponent: WiiComponent = {
          id: `${active.id}-${Date.now()}`,
          type: active.id as string,
          position: { x: 100, y: 100 },
          properties: active.data.current.defaultProperties || {}
        };
        setCanvasComponents(prev => [...prev, newComponent]);
      }
    } else if (over.id !== active.id) {
      // Reordering components
      const oldIndex = canvasComponents.findIndex(item => item.id === active.id);
      const newIndex = canvasComponents.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setCanvasComponents(prev => arrayMove(prev, oldIndex, newIndex));
      }
    }

    setActiveId(null);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleComponentUpdate = (componentId: string, updates: Partial<WiiComponent>) => {
    setCanvasComponents(prev => 
      prev.map(comp => comp.id === componentId ? { ...comp, ...updates } : comp)
    );
  };

  const handleComponentDelete = (componentId: string) => {
    setCanvasComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Wii Game Builder</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Save size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Play size={18} />
              Test
            </motion.button>
            <BuildButton code={code} components={canvasComponents} />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Palette */}
          <motion.div 
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
          >
            <ComponentPalette />
          </motion.div>

          {/* Game Canvas */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 bg-white/50 dark:bg-gray-900/50">
              <GameCanvas 
                components={canvasComponents}
                onComponentUpdate={handleComponentUpdate}
                onComponentDelete={handleComponentDelete}
                onComponentSelect={setSelectedComponent}
                selectedComponent={selectedComponent}
              />
            </div>
          </motion.div>

          {/* Code Editor */}
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">Game Script</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Write your Wii game logic</p>
            </div>
            <div className="flex-1">
              <CodeEditor 
                value={code} 
                onChange={setCode}
                selectedComponent={selectedComponent}
              />
            </div>
          </motion.div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-blue-500 text-white p-2 rounded shadow-lg opacity-75">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default WiiGameBuilder;