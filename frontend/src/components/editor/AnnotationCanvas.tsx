// Annotation Canvas Component - Draw circles, boxes, arrows on screenshots
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Annotation, AnnotationShapeType } from '../../api/client';

type AnnotationTool = AnnotationShapeType | 'select';

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export function AnnotationCanvas({ imageUrl, annotations, onAnnotationsChange }: AnnotationCanvasProps) {
  const [tool, setTool] = useState<AnnotationTool>('circle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw annotations on canvas
  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageSize.width) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all annotations
    [...annotations, currentAnnotation].filter(Boolean).forEach((ann) => {
      if (!ann) return;
      ctx.strokeStyle = '#8b5cf6';
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 2;

      const shapeType = ann.shape_type;
      if (shapeType === 'circle' && ann.radius) {
        ctx.beginPath();
        ctx.arc(ann.x ?? 0, ann.y ?? 0, ann.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shapeType === 'box' && ann.width && ann.height) {
        ctx.fillRect(ann.x ?? 0, ann.y ?? 0, ann.width, ann.height);
        ctx.strokeRect(ann.x ?? 0, ann.y ?? 0, ann.width, ann.height);
      } else if (shapeType === 'arrow' && ann.to_x !== undefined && ann.to_y !== undefined) {
        drawArrow(ctx, ann.x ?? 0, ann.y ?? 0, ann.to_x, ann.to_y);
      }
    });
  }, [annotations, currentAnnotation, imageSize]);

  useEffect(() => {
    drawAnnotations();
  }, [drawAnnotations]);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLen = 15;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return;
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    if (tool === 'circle') {
      setCurrentAnnotation({ shape_type: 'circle', x, y, radius: 0 });
    } else if (tool === 'box') {
      setCurrentAnnotation({ shape_type: 'box', x, y, width: 0, height: 0 });
    } else if (tool === 'arrow') {
      setCurrentAnnotation({ shape_type: 'arrow', x, y, to_x: x, to_y: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const { x, y } = getCanvasCoords(e);

    if (tool === 'circle') {
      const radius = Math.sqrt((x - startPoint.x) ** 2 + (y - startPoint.y) ** 2);
      setCurrentAnnotation((prev) => prev ? { ...prev, radius } : null);
    } else if (tool === 'box') {
      setCurrentAnnotation((prev) => prev ? {
        ...prev,
        width: x - startPoint.x,
        height: y - startPoint.y,
      } : null);
    } else if (tool === 'arrow') {
      setCurrentAnnotation((prev) => prev ? { ...prev, to_x: x, to_y: y } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) {
      setIsDrawing(false);
      setStartPoint(null);
      return;
    }

    // Only add if annotation has meaningful size
    const isValid = (
      (currentAnnotation.shape_type === 'circle' && currentAnnotation.radius && currentAnnotation.radius > 5) ||
      (currentAnnotation.shape_type === 'box' && Math.abs(currentAnnotation.width || 0) > 5 && Math.abs(currentAnnotation.height || 0) > 5) ||
      (currentAnnotation.shape_type === 'arrow' && currentAnnotation.to_x !== undefined && currentAnnotation.to_y !== undefined)
    );

    if (isValid) {
      onAnnotationsChange([...annotations, currentAnnotation as Annotation]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentAnnotation(null);
  };

  const handleAnnotationClick = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index);
    onAnnotationsChange(newAnnotations);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">标注工具:</span>
        {(['select', 'circle', 'box', 'arrow'] as AnnotationTool[]).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`px-3 py-1 text-xs rounded ${
              tool === t ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'select' && '选择'}
            {t === 'circle' && '圆圈'}
            {t === 'box' && '方框'}
            {t === 'arrow' && '箭头'}
          </button>
        ))}
      </div>

      {/* Canvas Container */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Screenshot"
          className="w-full h-auto"
          onLoad={() => {
            if (imageRef.current) {
              setImageSize({ width: imageRef.current.width, height: imageRef.current.height });
            }
          }}
        />
        <canvas
          ref={canvasRef}
          width={imageSize.width}
          height={imageSize.height}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Annotation List */}
      {annotations.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-gray-500">已标注 ({annotations.length})</span>
          <div className="max-h-32 overflow-y-auto">
            {annotations.map((ann, index) => (
              <div
                key={ann.id || index}
                onClick={() => handleAnnotationClick(index)}
                className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-50 rounded cursor-pointer hover:bg-red-50"
              >
                <span className="text-purple-600">
                  {ann.shape_type === 'circle' && '○'}
                  {ann.shape_type === 'box' && '□'}
                  {ann.shape_type === 'arrow' && '→'}
                </span>
                <span className="text-gray-600">
                  {ann.shape_type === 'circle' && `圆 (${Math.round(ann.radius || 0)}px)`}
                  {ann.shape_type === 'box' && `框 ${Math.round(ann.width || 0)}×${Math.round(ann.height || 0)}`}
                  {ann.shape_type === 'arrow' && `箭头`}
                </span>
                {ann.target_selector && (
                  <span className="text-gray-400 truncate">{ann.target_selector}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnotationCanvas;