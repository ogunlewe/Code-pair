import React, { useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useStore } from '../store';

interface VideoCallProps {
  userId: string;
  sessionId: string | null;
  roomCode: string | null;
}

const VideoCall: React.FC<VideoCallProps> = ({ userId, sessionId, roomCode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();
  const { isMuted, isVideoOff, addParticipant, removeParticipant, updateParticipant } = useStore();

  useEffect(() => {
    if (!sessionId || !roomCode) return;

    const initPeer = async () => {
      const peer = new Peer(`${roomCode}-${userId}`);
      peerRef.current = peer;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Handle incoming calls
        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });

        // Connect to existing peers
        peer.on('open', () => {
          addParticipant({
            id: userId,
            name: `User ${userId.slice(0, 4)}`,
            isHost: window.location.search === '',
            peerId: peer.id
          });

          // Connect to all existing peers
          peer.listAllPeers((peers) => {
            peers.forEach((peerId) => {
              if (peerId !== peer.id) {
                const conn = peer.connect(peerId);
                conn.on('open', () => {
                  conn.send({
                    type: 'userJoined',
                    userId,
                    peerId: peer.id
                  });

                  // Make video call
                  const call = peer.call(peerId, stream);
                  call.on('stream', (remoteStream) => {
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.srcObject = remoteStream;
                    }
                  });
                });
              }
            });
          });
        });

        peer.on('connection', (conn) => {
          conn.on('data', (data: any) => {
            if (data.type === 'userJoined') {
              addParticipant({
                id: data.userId,
                name: `User ${data.userId.slice(0, 4)}`,
                peerId: data.peerId
              });
            }
          });
        });

        peer.on('error', (err) => {
          console.error('PeerJS error:', err);
        });

      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    initPeer();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
      removeParticipant(userId);
    };
  }, [userId, sessionId, roomCode, addParticipant, removeParticipant]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        className={`w-full ${isVideoOff ? 'hidden' : ''}`}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        className="w-full"
      />
    </div>
  );
};

export default VideoCall;