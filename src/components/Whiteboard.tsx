import React, { useRef, useState, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface WhiteboardProps {
  sessionId: string | null;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(2);
  const providerRef = useRef<WebrtcProvider | null>(null);

  useEffect(() => {
    if (!sessionId || !canvasRef.current) return;

    const doc = new Y.Doc();
    const provider = new WebrtcProvider(`${sessionId}-whiteboard`, doc);
    providerRef.current = provider;

    const awareness = provider.awareness;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set up shared drawing data
    const drawingArray = doc.getArray('drawing');

    drawingArray.observe(() => {
      // Clear canvas and redraw all paths
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawingArray.forEach((path: any) => {
        context.beginPath();
        context.strokeStyle = path.color;
        context.lineWidth = path.size;
        context.lineCap = 'round';
        
        path.points.forEach((point: any, index: number) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
      });
    });

    return () => {
      provider.destroy();
    };
  }, [sessionId]);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !sessionId) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !sessionId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();

    // Sync drawing data
    if (providerRef.current) {
      const doc = providerRef.current.doc;
      const drawingArray = doc.getArray('drawing');
      drawingArray.push([{
        color,
        size: brushSize,
        points: [{ x, y }]
      }]);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (providerRef.current) {
        const doc = providerRef.current.doc;
        const drawingArray = doc.getArray('drawing');
        drawingArray.delete(0, drawingArray.length);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded"
        />
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32"
        />
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="bg-gray-800 rounded-lg flex-1 w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;