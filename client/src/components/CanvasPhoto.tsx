import { useEffect, useRef, useState, memo } from 'react';

interface CanvasPhotoProps {
  src: string;
  fallbackSrcs?: string[];
  watermark?: boolean;
  fit?: 'cover' | 'contain';
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLoad?: () => void;
  onError?: () => void;
  title?: string;
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const tileW = 290;
  const tileH = 115;
  ctx.save();
  ctx.font = 'bold 13px Arial,sans-serif';
  ctx.textAlign = 'center';
  for (let ty = -tileH; ty < h + tileH; ty += tileH) {
    for (let tx = -tileW; tx < w + tileW; tx += tileW) {
      const cx = tx + tileW / 2;
      const cy = ty + tileH / 2;
      ctx.save();
      ctx.translate(cx, cy - 20);
      ctx.rotate(-30 * Math.PI / 180);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillText('COPIA NAO AUTORIZADA', 0, 0);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillText('COPIA NAO AUTORIZADA', 1, 1);
      ctx.restore();
    }
  }
  ctx.restore();
}

export const CanvasPhoto = memo(function CanvasPhoto({
  src,
  fallbackSrcs = [],
  watermark = false,
  fit = 'cover',
  className = '',
  style,
  onClick,
  onLoad,
  onError,
  title,
}: CanvasPhotoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setDrawn(false);
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    const allSrcs = [src, ...fallbackSrcs];
    let urlIdx = 0;
    let cancelled = false;

    const img = new window.Image();

    const tryDraw = () => {
      if (cancelled) return;

      const wrapper = wrapperRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (fit === 'cover') {
        const cw = wrapper?.offsetWidth ?? img.naturalWidth;
        const ch = wrapper?.offsetHeight ?? img.naturalHeight;
        canvas.width = cw;
        canvas.height = ch;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dx = (cw - img.naturalWidth * scale) / 2;
        const dy = (ch - img.naturalHeight * scale) / 2;
        ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
      } else {
        const maxW = window.innerWidth * 0.92;
        const maxH = window.innerHeight * 0.88;
        const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
        const cw = Math.round(img.naturalWidth * scale);
        const ch = Math.round(img.naturalHeight * scale);
        canvas.width = cw;
        canvas.height = ch;
        ctx.drawImage(img, 0, 0, cw, ch);
      }

      if (watermark) drawWatermark(ctx, canvas.width, canvas.height);

      setDrawn(true);
      onLoad?.();
    };

    img.onload = tryDraw;

    img.onerror = () => {
      if (cancelled) return;
      urlIdx += 1;
      if (urlIdx < allSrcs.length) {
        img.src = allSrcs[urlIdx];
      } else {
        onError?.();
      }
    };

    img.src = allSrcs[urlIdx];

    return () => {
      cancelled = true;
    };
  }, [src, watermark, fit]);

  if (fit === 'cover') {
    return (
      <div
        ref={wrapperRef}
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={style}
        onClick={onClick}
        onContextMenu={e => e.preventDefault()}
        title={title}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block', opacity: drawn ? 1 : 0, transition: 'opacity 0.25s' }}
          onContextMenu={e => e.preventDefault()}
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={style}
      onClick={onClick}
      onContextMenu={e => e.preventDefault()}
      title={title}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', borderRadius: 'inherit' }}
        onContextMenu={e => e.preventDefault()}
      />
    </div>
  );
});
