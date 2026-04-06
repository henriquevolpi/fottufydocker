import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
  enabled?: boolean;
}

interface VirtualizationResult<T> {
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
  containerRef: React.RefObject<HTMLDivElement>;
  itemsPerRow: number;
  isVirtualizationActive: boolean;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { itemHeight, containerHeight, buffer = 5, enabled = true } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const itemsPerRow = useMemo(() => {
    if (containerWidth === 0) return 4;
    if (containerWidth < 640) return 2;
    if (containerWidth < 768) return 2;
    if (containerWidth < 1024) return 3;
    if (containerWidth < 1280) return 4;
    if (containerWidth < 1536) return 5;
    return Math.min(Math.floor(containerWidth / 320), 6);
  }, [containerWidth]);
  
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * itemHeight;
  
  const visibleRowStart = enabled ? Math.max(0, Math.floor(scrollTop / itemHeight) - buffer) : 0;
  const visibleRowEnd = enabled ? 
    Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer)
    : totalRows;
  
  const offsetY = enabled ? visibleRowStart * itemHeight : 0;
  
  const visibleItems = useMemo(() => {
    if (!enabled) return items;
    const startIndex = visibleRowStart * itemsPerRow;
    const endIndex = Math.min(items.length, visibleRowEnd * itemsPerRow);
    return items.slice(startIndex, endIndex);
  }, [items, visibleRowStart, visibleRowEnd, itemsPerRow, enabled]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;
    const handleScroll = () => setScrollTop(container.scrollTop);
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [enabled]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);
  
  const isVirtualizationActive = enabled && items.length > 0;
  
  return { visibleItems, totalHeight, offsetY, containerRef, itemsPerRow, isVirtualizationActive };
}

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    isLowEnd: false,
    hasGoodPerformance: true,
    maxPhotosPerPage: 144,
    shouldUseVirtualization: false
  });
  
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
    
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isLowEnd = hardwareConcurrency <= 2 || memory <= 2;
    const hasGoodPerformance = hardwareConcurrency >= 4 && memory >= 4;

    // Virtualização habilitada para desktop (não mobile, que tem conflito de scroll)
    const shouldUseVirtualization = !isMobile;
    
    setCapabilities({
      isMobile,
      isLowEnd,
      hasGoodPerformance,
      maxPhotosPerPage: isLowEnd ? 50 : 500,
      shouldUseVirtualization
    });
  }, []);
  
  return capabilities;
}
