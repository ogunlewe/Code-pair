import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, Code2, Layout, Pencil } from 'lucide-react';
import { nanoid } from 'nanoid';
import Editor from '@monaco-editor/react';
import { Rnd } from 'react-rnd';
import { useStore } from './store';
import VideoCall from './components/VideoCall';
import Whiteboard from './components/Whiteboard';

function App() {
  const [userId] = useState(() => nanoid(10));
  const [activeTab, setActiveTab] = useState('code');
  const [code, setCode] = useState('// Start coding here\n');
  const {
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    connectionStatus,
    setConnectionStatus
  } = useStore();

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">CodeTutor Live</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
          <div className="bg-gray-700 px-4 py-2 rounded-lg">
            ID: {userId}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-6">
          <button
            onClick={() => setActiveTab('code')}
            className={`p-3 rounded-xl ${activeTab === 'code' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
          >
            <Code2 />
          </button>
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`p-3 rounded-xl ${activeTab === 'whiteboard' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
          >
            <Pencil />
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`p-3 rounded-xl ${activeTab === 'layout' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
          >
            <Layout />
          </button>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-4 relative">
          {activeTab === 'code' && (
            <div className="h-full rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  wordWrap: 'on'
                }}
              />
            </div>
          )}
          
          {activeTab === 'whiteboard' && <Whiteboard />}
          
          {activeTab === 'layout' && (
            <div className="h-full bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Custom Layout</h2>
              <p>Drag and resize windows to create your perfect workspace.</p>
            </div>
          )}

          {/* Floating Video Windows */}
          <Rnd
            default={{
              x: 0,
              y: 0,
              width: 320,
              height: 240
            }}
            minWidth={240}
            minHeight={180}
            bounds="parent"
            className="absolute"
          >
            <VideoCall userId={userId} />
          </Rnd>
        </div>
      </div>
    </div>
  );
}

export default App;