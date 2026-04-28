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
    let resizeObserver: ResizeObserver | null = null;

    const img = new window.Image();

    const performDraw = () => {
      if (cancelled) return;

      const wrapper = wrapperRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || img.naturalWidth === 0) return;

      if (fit === 'cover') {
        const cw = wrapper?.offsetWidth ?? 0;
        const ch = wrapper?.offsetHeight ?? 0;

        // Guard: if layout hasn't resolved yet on mobile, wait via ResizeObserver
        if ((cw === 0 || ch === 0) && wrapper) {
          if (typeof ResizeObserver !== 'undefined') {
            resizeObserver?.disconnect();
            resizeObserver = new ResizeObserver(() => {
              if (cancelled) { resizeObserver?.disconnect(); return; }
              const w = wrapper.offsetWidth;
              const h = wrapper.offsetHeight;
              if (w > 0 && h > 0) {
                resizeObserver?.disconnect();
                resizeObserver = null;
                performDraw();
              }
            });
            resizeObserver.observe(wrapper);
            return;
          }
          // Fallback when ResizeObserver not available: use natural image dimensions
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        } else {
          const finalW = cw || img.naturalWidth;
          const finalH = ch || img.naturalHeight;
          canvas.width = finalW;
          canvas.height = finalH;
          const scale = Math.max(finalW / img.naturalWidth, finalH / img.naturalHeight);
          const dx = (finalW - img.naturalWidth * scale) / 2;
          const dy = (finalH - img.naturalHeight * scale) / 2;
          ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
        }
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

    img.onload = performDraw;

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
      resizeObserver?.disconnect();
      resizeObserver = null;
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
