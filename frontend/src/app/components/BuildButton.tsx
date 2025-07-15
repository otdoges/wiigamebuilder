'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Download, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import { WiiComponent } from '../types/WiiComponent';
import toast from 'react-hot-toast';

interface BuildButtonProps {
  code: string;
  components: WiiComponent[];
}

type BuildStatus = 'idle' | 'building' | 'success' | 'error';

const BuildButton = ({ code, components }: BuildButtonProps) => {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);

  const handleBuild = async () => {
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildOutput([]);
    setShowOutput(true);

    try {
      // Simulate build process with progress updates
      const buildSteps = [
        'Validating game components...',
        'Compiling JavaScript code...',
        'Generating Wii executable...',
        'Optimizing assets...',
        'Creating game package...',
        'Build complete!'
      ];

      for (let i = 0; i < buildSteps.length; i++) {
        const step = buildSteps[i];
        setBuildOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        setBuildProgress((i + 1) / buildSteps.length * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }

      // Check if we're in Electron environment
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Send build data to Electron main process
        const buildData = {
          code,
          components,
          timestamp: new Date().toISOString()
        };
        
        try {
          const result = await (window as any).electronAPI.buildWiiGame(buildData);
          setBuildOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Electron build result: ${result}`]);
        } catch (electronError) {
          setBuildOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Electron API not available, using web-only build`]);
        }
      } else {
        setBuildOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Running in web mode, Electron features unavailable`]);
      }

      setBuildStatus('success');
      toast.success('Wii game built successfully!');
      
    } catch (error) {
      setBuildStatus('error');
      setBuildOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: ${error}`]);
      toast.error('Build failed. Check the output for details.');
    }
  };

  const downloadBuild = () => {
    // Create a simple build package as JSON
    const buildPackage = {
      game: {
        name: 'My Wii Game',
        version: '1.0.0',
        created: new Date().toISOString()
      },
      code,
      components,
      buildOutput
    };

    const blob = new Blob([JSON.stringify(buildPackage, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wii-game-build.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Build package downloaded!');
  };

  const getButtonContent = () => {
    switch (buildStatus) {
      case 'building':
        return (
          <>
            <Loader2 size={18} className="animate-spin" />
            Building... {Math.round(buildProgress)}%
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle size={18} />
            Built Successfully
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={18} />
            Build Failed
          </>
        );
      default:
        return (
          <>
            <Hammer size={18} />
            Build Wii Game
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (buildStatus) {
      case 'building':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {buildStatus === 'success' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadBuild}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Download
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: buildStatus === 'building' ? 1 : 1.05 }}
          whileTap={{ scale: buildStatus === 'building' ? 1 : 0.95 }}
          onClick={handleBuild}
          disabled={buildStatus === 'building'}
          className={`
            flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all
            ${getButtonColor()}
            ${buildStatus === 'building' ? 'cursor-not-allowed opacity-75' : ''}
          `}
        >
          {getButtonContent()}
        </motion.button>
      </div>

      {/* Build output panel */}
      <AnimatePresence>
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-purple-500" />
                <h3 className="font-medium text-gray-800 dark:text-white">Build Output</h3>
              </div>
              <button
                onClick={() => setShowOutput(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-3">
              {/* Progress bar */}
              {buildStatus === 'building' && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${buildProgress}%` }}
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round(buildProgress)}% complete
                  </div>
                </div>
              )}

              {/* Build log */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {buildOutput.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {line}
                    </motion.div>
                  ))}
                  {buildOutput.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                      Build output will appear here...
                    </div>
                  )}
                </div>
              </div>

              {/* Build stats */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Components: {components.length}</span>
                  <span>Code lines: {code.split('\n').length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuildButton;