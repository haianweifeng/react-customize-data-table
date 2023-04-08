import React, { useRef, useMemo } from 'react';
import classnames from 'classnames';

interface ScrollbarProps {
  size: number;
  contentSize: number;
  offset: number;
  orientation: 'vertical' | 'horizontal';
  onScroll: (offset: number) => void;
}

const Scrollbar = (props: ScrollbarProps) => {
  const BAR_SIZE = 20;
  const { orientation = 'vertical', offset, size, contentSize, onScroll } = props;

  const lastedClientX = useRef<number>(0);
  const lastedClientY = useRef<number>(0);
  const cacheOffset = useRef<number>(0);

  const thumbRef = useRef<HTMLDivElement>(null);

  const thumbSize = useMemo(() => {
    const value = (size / contentSize) * size;
    return value >= BAR_SIZE ? value : BAR_SIZE;
  }, [size, contentSize]);

  const ratio = useMemo(() => {
    return (contentSize - size) / (size - thumbSize);
  }, [contentSize, size, thumbSize]);

  const handleMouseMoveThumb = (event: any) => {
    const deltaX = event.clientX - lastedClientX.current;
    const deltaY = event.clientY - lastedClientY.current;
    lastedClientX.current = event.clientX;
    lastedClientY.current = event.clientY;

    let newOffset = (orientation === 'vertical' ? deltaY : deltaX) * ratio + cacheOffset.current;
    newOffset = Math.max(0, newOffset);
    newOffset = Math.min(newOffset, contentSize - size);

    if (cacheOffset.current === newOffset) return;

    cacheOffset.current = newOffset;

    onScroll && onScroll(newOffset);
  };

  const handleMouseUpThumb = () => {
    document.removeEventListener('mousemove', handleMouseMoveThumb);
    document.removeEventListener('mouseup', handleMouseUpThumb);
    document.onselectstart = null;
  };

  const handleMouseDownThumb = (event: any) => {
    cacheOffset.current = offset;
    lastedClientX.current = event.clientX;
    lastedClientY.current = event.clientY;

    document.addEventListener('mousemove', handleMouseMoveThumb, false);
    document.addEventListener('mouseup', handleMouseUpThumb, false);

    document.onselectstart = () => false;
  };

  const handleMouseDownTrack = (event: any) => {
    if (event.target === thumbRef.current) return;

    const { left, top } = event.target.getBoundingClientRect();

    const isVertical = orientation === 'vertical';

    const delta = (isVertical ? event.clientY : event.clientX) - (isVertical ? top : left);

    let newOffset = (delta - thumbSize / 2) * ratio;
    newOffset = Math.max(0, newOffset);
    newOffset = Math.min(newOffset, contentSize - size);

    onScroll && onScroll(newOffset);
  };

  const styles: any = {};
  if (orientation === 'vertical') {
    styles.top = Math.min(Math.max(offset / ratio, 0), size - thumbSize);
    styles.height = `${(size / contentSize) * 100}%`;
    styles.minHeight = `${BAR_SIZE}px`;
  } else {
    styles.left = Math.min(Math.max(offset / ratio, 0), size - thumbSize);
    styles.width = `${(size / contentSize) * 100}%`;
    styles.minWidth = `${BAR_SIZE}px`;
  }

  return (
    <div
      className={classnames({
        'scrollbar-track': true,
        [`scrollbar-track-${orientation}`]: !!orientation,
      })}
      onMouseDown={handleMouseDownTrack}
    >
      <div
        className="scrollbar-thumb"
        ref={thumbRef}
        style={styles}
        onMouseDown={handleMouseDownThumb}
      />
    </div>
  );
};
export default Scrollbar;
