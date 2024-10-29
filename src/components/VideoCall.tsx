import React, { useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useStore } from '../store';

interface VideoCallProps {
  userId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ userId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer>();
  const { isMuted, isVideoOff } = useStore();

  useEffect(() => {
    const initPeer = async () => {
      const peer = new Peer(userId);
      peerRef.current = peer;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });
      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    initPeer();

    return () => {
      peerRef.current?.destroy();
    };
  }, [userId]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
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