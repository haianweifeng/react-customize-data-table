import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import classnames from 'classnames';

interface VirtualScrollBarProps {
  size: number;
  contentSize: number;
  orientation: 'vertical' | 'horizontal';
  onScroll: (offset: number) => void;
}

const VirtualScrollBar = forwardRef<HTMLDivElement, VirtualScrollBarProps>((props, ref) => {
  const BAR_SIZE = 20;
  const { orientation, size, contentSize, onScroll } = props;

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const thumbSize = useMemo(() => {
    const value = (size / contentSize) * size;
    return value >= BAR_SIZE ? value : BAR_SIZE;
  }, [size, contentSize]);

  const ratio = useMemo(() => {
    return (contentSize - size) / (size - thumbSize);
  }, [contentSize, size, thumbSize]);

  useEffect(() => {
    let y = 0;
    let lastedClientY = 0;

    let thumbRef: HTMLDivElement | null;

    const getValue = (value?: string) => {
      if (value) {
        const result = value.match(/[\d|.]+(?=px)/);
        return result ? Number(result[0]) : 0;
      }
      return 0;
    };

    const handleMouseMoveThumb = (event: MouseEvent) => {
      let deltaY = event.clientY - lastedClientY;
      y += deltaY;
      y = Math.max(0, y);
      y = Math.min(y, size - thumbSize);
      if (thumbRef) {
        thumbRef.style.transform = `translateY(${y}px)`;
      }
      onScroll && onScroll(y * ratio);
      lastedClientY = event.clientY;
    };

    const handleMouseUpThumb = () => {
      document.removeEventListener('mousemove', handleMouseMoveThumb);
      document.removeEventListener('mouseup', handleMouseUpThumb);
      document.onselectstart = null;
    };

    const handleMouseDownThumb = (event: MouseEvent) => {
      y = getValue(thumbRef?.style.transform);
      lastedClientY = event.clientY;

      document.addEventListener('mousemove', handleMouseMoveThumb, false);
      document.addEventListener('mouseup', handleMouseUpThumb, false);

      document.onselectstart = () => false;
    };

    if (ref !== null && typeof ref !== 'function') {
      thumbRef = ref.current;
      thumbRef?.addEventListener('mousedown', handleMouseDownThumb);
    }

    return () => {
      thumbRef?.removeEventListener('mousedown', handleMouseDownThumb);
    };
  }, [thumbSize, size, ratio]);

  useEffect(() => {
    // todo 抽取到公共方法里
    const getValue = (value?: string) => {
      if (value) {
        const result = value.match(/[\d|.]+(?=px)/);
        return result ? Number(result[0]) : 0;
      }
      return 0;
    };

    const handleMouseDownTrack = (event: MouseEvent) => {
      let thumbRef: HTMLDivElement | null = null;
      if (ref !== null && typeof ref !== 'function') {
        thumbRef = ref.current;
      }
      if (thumbRef) {
        if (event.target === thumbRef) return;
        let y = getValue(thumbRef?.style.transform);
        const rect = thumbRef.getBoundingClientRect();
        // 每次移动距离是一屏可视区域的高度
        const moveY = size / ratio;
        if (event.clientY > rect.top) {
          y += moveY;
        } else if (event.clientY < rect.top) {
          y -= moveY;
        }
        y = Math.max(0, y);
        y = Math.min(y, size - thumbSize);
        thumbRef.style.transform = `translateY(${y}px)`;
        onScroll && onScroll(y * ratio);
      }
    };

    scrollTrackRef.current?.addEventListener('mousedown', handleMouseDownTrack);

    return () => {
      scrollTrackRef.current?.removeEventListener('mousedown', handleMouseDownTrack);
    };
  }, [size, contentSize, ratio]);

  return (
    <div
      className={classnames({
        'scrollbar-track': true,
        [`scrollbar-track-${orientation}`]: !!orientation,
      })}
      ref={scrollTrackRef}
    >
      <div
        className="scrollbar-thumb"
        ref={ref}
        style={{
          height: `${(size / contentSize) * 100}%`,
          minHeight: `${BAR_SIZE}px`,
        }}
      />
    </div>
  );
});
export default VirtualScrollBar;
