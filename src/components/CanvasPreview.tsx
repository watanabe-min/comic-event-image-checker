import React, { useRef, useEffect } from "react";

interface Props {
  imageUrl: string | null;
  width?: number;
  height?: number;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

/**
 * 選択画像のプレビュー
 */
export const CanvasPreview: React.FC<Props> = ({
  imageUrl,
  width = 635,
  height = 903,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      onCanvasReady?.(canvas);
    };
  }, [imageUrl, width, height, onCanvasReady]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
};
