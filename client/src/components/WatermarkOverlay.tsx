import { memo, useMemo } from 'react';

interface WatermarkOverlayProps {
  children: React.ReactNode;
  enabled: boolean;
  className?: string;
  reuseCanvas?: boolean;
}

const WATERMARK_SVG = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="290" height="115">` +
    `<text x="145" y="38" text-anchor="middle" dominant-baseline="middle" ` +
    `transform="rotate(-30 145 38)" font-size="13" font-family="Arial,sans-serif" ` +
    `font-weight="bold" fill="rgba(0,0,0,0.28)">COPIA NAO AUTORIZADA</text>` +
    `<text x="145" y="82" text-anchor="middle" dominant-baseline="middle" ` +
    `transform="rotate(-30 145 82)" font-size="13" font-family="Arial,sans-serif" ` +
    `font-weight="bold" fill="rgba(255,255,255,0.25)">COPIA NAO AUTORIZADA</text>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

const WATERMARK_STYLE: React.CSSProperties = {
  backgroundImage: WATERMARK_SVG,
  backgroundRepeat: 'repeat',
  backgroundSize: '290px 115px',
};

const WatermarkOverlay = memo(function WatermarkOverlay({
  children,
  enabled,
  className = '',
}: WatermarkOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {enabled && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={WATERMARK_STYLE}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

export { WatermarkOverlay };
