'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Settings, Move } from 'lucide-react';
import { WiiComponent } from '../types/WiiComponent';
import { useState } from 'react';

interface GameCanvasProps {
  components: WiiComponent[];
  onComponentUpdate: (componentId: string, updates: Partial<WiiComponent>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentSelect: (component: WiiComponent | null) => void;
  selectedComponent: WiiComponent | null;
}

interface CanvasComponentProps {
  component: WiiComponent;
  isSelected: boolean;
  onUpdate: (updates: Partial<WiiComponent>) => void;
  onDelete: () => void;
  onSelect: () => void;
}

const CanvasComponent = ({ component, isSelected, onUpdate, onDelete, onSelect }: CanvasComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y
    });
    onSelect();
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    onUpdate({
      position: {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse listeners when dragging
  if (typeof window !== 'undefined') {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  const renderComponent = () => {
    const baseStyle = {
      width: component.properties.width || 50,
      height: component.properties.height || 50,
      backgroundColor: component.properties.color || '#3b82f6'
    };

    switch (component.type) {
      case 'player':
        return (
          <div 
            className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={baseStyle}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );

      case 'enemy':
        return (
          <div 
            className="rounded-lg border-2 border-red-700 shadow-lg flex items-center justify-center"
            style={baseStyle}
          >
            <div className="w-3 h-1 bg-red-700 rounded"></div>
          </div>
        );

      case 'platform':
        return (
          <div 
            className="border border-gray-400 shadow-md"
            style={baseStyle}
          />
        );

      case 'collectible':
        return (
          <div 
            className="transform rotate-45 border-2 border-yellow-400 shadow-lg"
            style={{
              ...baseStyle,
              borderRadius: '20%'
            }}
          />
        );

      case 'button':
        return (
          <div 
            className="rounded-lg border-2 border-gray-300 shadow-lg flex items-center justify-center font-semibold text-white text-xs"
            style={baseStyle}
          >
            {component.properties.text || 'Button'}
          </div>
        );

      case 'text':
        return (
          <div 
            className="flex items-center justify-center font-medium text-sm"
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
              color: component.properties.color || '#1f2937'
            }}
          >
            {component.properties.text || 'Text'}
          </div>
        );

      case 'background':
        return (
          <div 
            className="border border-dashed border-gray-400 opacity-70"
            style={baseStyle}
          />
        );

      case 'sprite':
        return (
          <div 
            className="border-2 border-dashed border-purple-400 shadow-md flex items-center justify-center text-xs text-purple-600"
            style={baseStyle}
          >
            IMG
          </div>
        );

      case 'particle':
        return (
          <div 
            className="rounded-full border-2 border-pink-400 shadow-lg animate-pulse"
            style={baseStyle}
          />
        );

      default:
        return (
          <div 
            className="border-2 border-gray-400 shadow-md"
            style={baseStyle}
          />
        );
    }
  };

  return (
    <motion.div
      layout
      className={`
        absolute select-none cursor-move group
        ${isSelected ? 'z-20' : 'z-10'}
      `}
      style={{
        left: component.position.x,
        top: component.position.y
      }}
      onMouseDown={handleMouseDown}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {renderComponent()}
      
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-2 border-2 border-blue-500 border-dashed rounded pointer-events-none"
        />
      )}

      {/* Component controls */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-10 left-0 flex gap-1 pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Open properties panel
              }}
              className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              <Settings size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const GameCanvas = ({ 
  components, 
  onComponentUpdate, 
  onComponentDelete, 
  onComponentSelect,
  selectedComponent 
}: GameCanvasProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'game-canvas'
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onComponentSelect(null);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      onClick={handleCanvasClick}
      className={`
        relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900
        border-2 border-dashed transition-colors overflow-hidden
        ${isOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 dark:border-gray-600'}
      `}
    >
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Canvas info */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Move size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Game Canvas</h3>
            <p className="text-sm">Drag components from the left panel to start building your Wii game</p>
          </div>
        </div>
      )}

      {/* Render components */}
      <AnimatePresence>
        {components.map((component) => (
          <CanvasComponent
            key={component.id}
            component={component}
            isSelected={selectedComponent?.id === component.id}
            onUpdate={(updates) => onComponentUpdate(component.id, updates)}
            onDelete={() => onComponentDelete(component.id)}
            onSelect={() => onComponentSelect(component)}
          />
        ))}
      </AnimatePresence>

      {/* Drop indicator */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-4 border-2 border-blue-400 border-dashed rounded-lg bg-blue-50/20 flex items-center justify-center"
        >
          <div className="text-blue-600 font-medium">Drop component here</div>
        </motion.div>
      )}
    </div>
  );
};

export default GameCanvas;