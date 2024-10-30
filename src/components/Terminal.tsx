import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const { sessionId, isHost } = useStore();

  useEffect(() => {
    if (!sessionId) return;

    const doc = new Y.Doc();
    const provider = new WebrtcProvider(`${sessionId}-terminal`, doc);
    providerRef.current = provider;

    const yOutput = doc.getArray('terminal-output');
    
    // Initialize output from shared state
    setOutput(yOutput.toArray() as string[]);

    // Listen for changes
    yOutput.observe(() => {
      setOutput(yOutput.toArray() as string[]);
    });

    return () => {
      provider.destroy();
    };
  }, [sessionId]);

  const handleCommand = (command: string) => {
    if (!sessionId || !providerRef.current) return;

    const response = `$ ${command}\n> Command executed`;
    const doc = providerRef.current.doc;
    const yOutput = doc.getArray('terminal-output');
    yOutput.push([response]);
    
    setInput('');

    // Auto scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input.trim());
    }
  };

  return (
    <div className="h-full bg-gray-900 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gray-800 px-4 py-2 text-sm">
        Terminal {isHost ? '(Host)' : '(Read-only)'}
      </div>
      <div 
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto"
      >
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400 mr-2">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isHost}
            className="flex-1 bg-transparent outline-none"
            placeholder={isHost ? 'Enter command...' : 'Only host can execute commands'}
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;