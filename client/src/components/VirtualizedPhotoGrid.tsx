import React, { memo, useMemo } from 'react';
import { PhotoCard } from './PhotoCard';
import { useVirtualization, useDeviceCapabilities } from '@/hooks/useVirtualization';

interface Photo {
  id: string;
  url: string;
  filename: string;
  originalName?: string;
  selected: boolean;
}

interface VirtualizedPhotoGridProps {
  photos: Photo[];
  selectedPhotos: Set<string>;
  isFinalized: boolean;
  showWatermark: boolean;
  showOnlySelected: boolean;
  commentTexts: Record<string, string>;
  photoComments: Record<string, any[]>;
  expandedCommentPhoto: string | null;
  isCommentMutationPending: boolean;
  onToggleSelection: (photoId: string) => void;
  onOpenModal: (url: string, index: number, event: React.MouseEvent) => void;
  onToggleCommentSection: (photoId: string) => void;
  onCommentTextChange: (photoId: string, text: string) => void;
  onSubmitComment: (photoId: string) => void;
  photoIndexMap?: Map<string, number>;
}

const GRID_BASE = "grid gap-4 sm:gap-5 px-2 sm:px-4 lg:px-6";
const GRID_CLASSES: Record<number, string> = {
  1: `${GRID_BASE} grid-cols-2 sm:grid-cols-1`,
  2: `${GRID_BASE} grid-cols-2`,
  3: `${GRID_BASE} grid-cols-2 sm:grid-cols-2 lg:grid-cols-3`,
  4: `${GRID_BASE} grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`,
  5: `${GRID_BASE} grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`,
  6: `${GRID_BASE} grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6`,
};

export const VirtualizedPhotoGrid = memo(function VirtualizedPhotoGrid({
  photos,
  selectedPhotos,
  isFinalized,
  showWatermark,
  showOnlySelected,
  commentTexts,
  photoComments,
  expandedCommentPhoto,
  isCommentMutationPending,
  onToggleSelection,
  onOpenModal,
  onToggleCommentSection,
  onCommentTextChange,
  onSubmitComment,
  photoIndexMap
}: VirtualizedPhotoGridProps) {
  
  const deviceCapabilities = useDeviceCapabilities();
  
  const filteredPhotos = useMemo(() => {
    return showOnlySelected 
      ? photos.filter(photo => selectedPhotos.has(photo.id))
      : photos;
  }, [photos, showOnlySelected, selectedPhotos]);
  
  const localPhotoIndexMap = useMemo(() => {
    if (photoIndexMap && photoIndexMap.size > 0) return photoIndexMap;
    const map = new Map<string, number>();
    photos.forEach((photo, index) => map.set(photo.id, index));
    return map;
  }, [photos, photoIndexMap]);
  
  // Enable virtualization on desktop for any meaningful photo count
  // Mobile is excluded because fixed-height scroll conflicts with native mobile scroll
  const shouldEnableVirtualization = useMemo(() => {
    if (deviceCapabilities.isMobile) return false;
    return deviceCapabilities.shouldUseVirtualization && filteredPhotos.length > 50;
  }, [deviceCapabilities.isMobile, deviceCapabilities.shouldUseVirtualization, filteredPhotos.length]);

  const containerHeight = useMemo(() => {
    if (typeof window === 'undefined') return 800;
    return Math.max(600, window.innerHeight - 250);
  }, []);
  
  const virtualization = useVirtualization(filteredPhotos, {
    itemHeight: 430,
    containerHeight,
    buffer: 3,
    enabled: shouldEnableVirtualization
  });
  
  const { visibleItems, totalHeight, offsetY, containerRef, itemsPerRow, isVirtualizationActive } = virtualization;
  
  const gridClass = GRID_CLASSES[itemsPerRow] ?? GRID_CLASSES[4];
  
  const renderCard = (photo: Photo) => {
    const originalIndex = localPhotoIndexMap.get(photo.id) ?? 0;
    return (
      <PhotoCard
        key={photo.id}
        photo={photo}
        isSelected={selectedPhotos.has(photo.id)}
        isFinalized={isFinalized}
        showWatermark={showWatermark}
        originalIndex={originalIndex}
        commentText={commentTexts[photo.id] || ""}
        photoComments={photoComments[photo.id] || []}
        isCommentExpanded={expandedCommentPhoto === photo.id}
        isCommentMutationPending={isCommentMutationPending}
        onToggleSelection={onToggleSelection}
        onOpenModal={onOpenModal}
        onToggleCommentSection={onToggleCommentSection}
        onCommentTextChange={onCommentTextChange}
        onSubmitComment={onSubmitComment}
      />
    );
  };

  if (!isVirtualizationActive) {
    return (
      <div className={gridClass}>
        {filteredPhotos.map(renderCard)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto"
      style={{ height: containerHeight, maxHeight: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          className={gridClass}
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(renderCard)}
        </div>
      </div>
    </div>
  );
});
