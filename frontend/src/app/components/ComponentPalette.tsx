'use client';

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { 
  User, 
  Zap, 
  Square, 
  Star, 
  Image as ImageIcon, 
  MousePointer, 
  Type, 
  Gamepad2,
  Volume2,
  Sparkles,
  Mountain
} from 'lucide-react';
import { PaletteItem } from '../types/WiiComponent';

const paletteItems: PaletteItem[] = [
  {
    id: 'player',
    name: 'Player',
    icon: 'User',
    description: 'Main character controlled by Wii Remote',
    category: 'gameplay',
    defaultProperties: {
      width: 32,
      height: 32,
      color: '#3b82f6',
      health: 100,
      speed: 5,
      interactive: true
    }
  },
  {
    id: 'enemy',
    name: 'Enemy',
    icon: 'Zap',
    description: 'AI-controlled opponent',
    category: 'gameplay',
    defaultProperties: {
      width: 28,
      height: 28,
      color: '#ef4444',
      health: 50,
      damage: 10,
      speed: 3,
      interactive: true
    }
  },
  {
    id: 'platform',
    name: 'Platform',
    icon: 'Square',
    description: 'Solid ground for characters to stand on',
    category: 'environment',
    defaultProperties: {
      width: 120,
      height: 20,
      color: '#8b5cf6',
      interactive: false
    }
  },
  {
    id: 'collectible',
    name: 'Collectible',
    icon: 'Star',
    description: 'Items that can be collected for points',
    category: 'gameplay',
    defaultProperties: {
      width: 20,
      height: 20,
      color: '#f59e0b',
      interactive: true
    }
  },
  {
    id: 'background',
    name: 'Background',
    icon: 'Mountain',
    description: 'Background scenery element',
    category: 'environment',
    defaultProperties: {
      width: 200,
      height: 150,
      color: '#10b981',
      interactive: false
    }
  },
  {
    id: 'button',
    name: 'UI Button',
    icon: 'MousePointer',
    description: 'Interactive button for menus',
    category: 'ui',
    defaultProperties: {
      width: 100,
      height: 40,
      text: 'Button',
      color: '#6366f1',
      interactive: true
    }
  },
  {
    id: 'text',
    name: 'Text Label',
    icon: 'Type',
    description: 'Display text information',
    category: 'ui',
    defaultProperties: {
      width: 120,
      height: 30,
      text: 'Sample Text',
      color: '#1f2937',
      interactive: false
    }
  },
  {
    id: 'sprite',
    name: 'Sprite',
    icon: 'ImageIcon',
    description: 'Custom image sprite',
    category: 'environment',
    defaultProperties: {
      width: 64,
      height: 64,
      src: '',
      animation: 'none',
      interactive: false
    }
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: 'Volume2',
    description: 'Audio effect or music',
    category: 'effects',
    defaultProperties: {
      sound: '',
      volume: 1.0,
      loop: false,
      interactive: false
    }
  },
  {
    id: 'particle',
    name: 'Particle Effect',
    icon: 'Sparkles',
    description: 'Visual particle system',
    category: 'effects',
    defaultProperties: {
      width: 50,
      height: 50,
      color: '#ec4899',
      animation: 'sparkle',
      interactive: false
    }
  }
];

const iconMap = {
  User,
  Zap,
  Square,
  Star,
  ImageIcon,
  MousePointer,
  Type,
  Gamepad2,
  Volume2,
  Sparkles,
  Mountain
};

interface DraggableItemProps {
  item: PaletteItem;
}

const DraggableItem = ({ item }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: 'palette-item',
      defaultProperties: item.defaultProperties
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Square;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600
        shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <IconComponent size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
            {item.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ComponentPalette = () => {
  const categories = [
    { id: 'gameplay', name: 'Gameplay', items: paletteItems.filter(item => item.category === 'gameplay') },
    { id: 'environment', name: 'Environment', items: paletteItems.filter(item => item.category === 'environment') },
    { id: 'ui', name: 'UI Elements', items: paletteItems.filter(item => item.category === 'ui') },
    { id: 'effects', name: 'Effects', items: paletteItems.filter(item => item.category === 'effects') }
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        Components
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Drag components to the canvas to build your Wii game
      </p>

      <div className="space-y-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              {category.name}
            </h3>
            <div className="space-y-2">
              {category.items.map((item) => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;