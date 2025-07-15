'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, RotateCcw, FileText } from 'lucide-react';
import { WiiComponent } from '../types/WiiComponent';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  selectedComponent: WiiComponent | null;
}

const CodeEditor = ({ value, onChange, selectedComponent }: CodeEditorProps) => {
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showComponentHelp, setShowComponentHelp] = useState(false);

  // Example code snippets for Wii game development
  const snippets = {
    player: `// Player component functions
function movePlayer(direction) {
  player.position.x += direction === 'left' ? -player.speed : player.speed;
}

function playerJump() {
  if (player.onGround) {
    player.velocity.y = -player.jumpPower;
    player.onGround = false;
  }
}`,

    enemy: `// Enemy AI behavior
function updateEnemy(enemy) {
  // Simple AI: move towards player
  if (enemy.position.x < player.position.x) {
    enemy.position.x += enemy.speed;
  } else {
    enemy.position.x -= enemy.speed;
  }
  
  // Attack if close to player
  if (Math.abs(enemy.position.x - player.position.x) < 30) {
    attackPlayer(enemy.damage);
  }
}`,

    collectible: `// Collectible interaction
function onCollectibleTouch(collectible) {
  // Add points
  score += collectible.points || 10;
  
  // Play sound effect
  playSound('collect.wav');
  
  // Remove collectible
  removeComponent(collectible.id);
  
  // Particle effect
  createParticles(collectible.position, 'gold');
}`
  };

  const insertSnippet = (snippet: string) => {
    const newValue = value + '\n\n' + snippet;
    onChange(newValue);
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const resetCode = () => {
    const defaultCode = `// Wii Game Script
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
}`;
    onChange(defaultCode);
  };

  useEffect(() => {
    // Auto-show component help when a component is selected
    if (selectedComponent) {
      setShowComponentHelp(true);
    }
  }, [selectedComponent]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Script Editor
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetCode}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset to default code"
          >
            <RotateCcw size={14} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComponentHelp(!showComponentHelp)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle component help"
          >
            <FileText size={14} />
          </motion.button>
        </div>
      </div>

      {/* Component-specific help panel */}
      {showComponentHelp && selectedComponent && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)} Component
            </h4>
            <button
              onClick={() => setShowComponentHelp(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            Add code for this component:
          </p>
          {snippets[selectedComponent.type as keyof typeof snippets] && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => insertSnippet(snippets[selectedComponent.type as keyof typeof snippets])}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Insert {selectedComponent.type} code
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme={editorTheme}
          value={value}
          onChange={handleEditorChange}
          options={{
            fontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            selectOnLineNumbers: true,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            bracketPairColorization: {
              enabled: true
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true
            }
          }}
        />
      </div>

      {/* Quick actions */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {value.split('\n').length} lines • JavaScript
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              <Play size={12} />
              Test Script
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;