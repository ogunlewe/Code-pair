import React, { useEffect, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, Code2, Layout, Pencil, Link, Terminal as TerminalIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import Editor from '@monaco-editor/react';
import { Rnd } from 'react-rnd';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';
import { useStore } from './store';
import VideoCall from './components/VideoCall';
import Whiteboard from './components/Whiteboard';
import Terminal from './components/Terminal';
import ParticipantsList from './components/ParticipantsList';

function App() {
  const [userId] = useState(() => nanoid(10));
  const [activeTab, setActiveTab] = useState('code');
  const [code, setCode] = useState('// Start coding here\n');
  const [editorInstance, setEditorInstance] = useState(null);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);

  const {
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    sessionId,
    setSessionId,
    isHost,
    setIsHost,
    participants,
    roomCode,
    setRoomCode
  } = useStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    const room = urlParams.get('room');
    
    if (session && room) {
      setSessionId(session);
      setRoomCode(room);
      setIsHost(false);
    } else {
      const newSessionId = nanoid(10);
      const newRoomCode = nanoid(6).toUpperCase();
      setSessionId(newSessionId);
      setRoomCode(newRoomCode);
      setIsHost(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionId || !roomCode) return;

    const doc = new Y.Doc();
    const webrtcProvider = new WebrtcProvider(`${roomCode}-editor`, doc);
    
    setYDoc(doc);
    setProvider(webrtcProvider);

    return () => {
      webrtcProvider.destroy();
    };
  }, [sessionId, roomCode]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorInstance(editor);
    
    if (yDoc && provider) {
      const type = yDoc.getText('monaco');
      new MonacoBinding(
        type,
        editor.getModel(),
        new Set([editor]),
        provider.awareness
      );
    }
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?session=${sessionId}&room=${roomCode}`;
  };

  const copyInviteLink = async () => {
    const link = generateInviteLink();
    await navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard! Share this with participants to join the session.');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">CodeTutor Live</h1>
          {roomCode && (
            <span className="ml-4 px-3 py-1 bg-blue-500 rounded text-sm">
              Room: {roomCode}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isHost && (
            <button
              onClick={copyInviteLink}
              className="flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Link className="w-4 h-4" />
              <span>Share Session</span>
            </button>
          )}
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
            {isHost ? 'Host' : 'Participant'} ID: {userId}
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
            onClick={() => setActiveTab('terminal')}
            className={`p-3 rounded-xl ${activeTab === 'terminal' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
          >
            <TerminalIcon />
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
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  wordWrap: 'on',
                  readOnly: !isHost && !participants.some(p => p.id === userId)
                }}
              />
            </div>
          )}
          
          {activeTab === 'whiteboard' && <Whiteboard sessionId={sessionId} roomCode={roomCode} />}
          
          {activeTab === 'terminal' && <Terminal roomCode={roomCode} />}
          
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
            <VideoCall userId={userId} sessionId={sessionId} roomCode={roomCode} />
          </Rnd>

          {/* Participants List */}
          <Rnd
            default={{
              x: window.innerWidth - 320,
              y: 0,
              width: 250,
              height: 400
            }}
            minWidth={200}
            minHeight={300}
            bounds="parent"
            className="absolute"
          >
            <ParticipantsList participants={participants} />
          </Rnd>
        </div>
      </div>
    </div>
  );
}

export default App;