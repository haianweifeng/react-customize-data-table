import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import classnames from 'classnames';
import './index.less';
import { extractPixel } from '../utils/util';
import { BAR_THUMB_SIZE, CLASS_SCROLLBAR_TRACK, PREFIXCLS } from '../utils/constant';
// todo 考虑移动端touch事件
interface VirtualScrollBarProps {
  className?: string;
  size: number;
  contentSize: number;
  orientation: 'vertical' | 'horizontal';
  onScroll?: (offset: number) => void;
}

const VirtualScrollBar = forwardRef<HTMLDivElement, VirtualScrollBarProps>((props, ref) => {
  const { orientation, size, contentSize, className = '', onScroll } = props;

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const lastClient = useRef<number>(0);

  const lastPosition = useRef<number>(0);

  const isVertical = orientation === 'vertical';

  const thumbSize = useMemo(() => {
    const value = (size / contentSize) * size;
    return value >= BAR_THUMB_SIZE ? value : BAR_THUMB_SIZE;
  }, [size, contentSize]);

  const ratio = useMemo(() => {
    return (contentSize - size) / (size - thumbSize);
  }, [contentSize, size, thumbSize]);

  useEffect(() => {
    let thumbNode: HTMLDivElement | null;

    const handleMouseMoveThumb = (event: MouseEvent) => {
      let delta = (isVertical ? event.clientY : event.clientX) - lastClient.current;
      lastPosition.current += delta;
      lastPosition.current = Math.max(0, lastPosition.current);
      lastPosition.current = Math.min(lastPosition.current, size - thumbSize);
      if (thumbNode) {
        thumbNode.style.transform = `translate${isVertical ? 'Y' : 'X'}(${lastPosition.current}px)`;
      }
      onScroll && onScroll(lastPosition.current * ratio);
      lastClient.current = isVertical ? event.clientY : event.clientX;
    };

    const handleMouseUpThumb = () => {
      document.removeEventListener('mousemove', handleMouseMoveThumb);
      document.removeEventListener('mouseup', handleMouseUpThumb);
      document.onselectstart = null;
    };

    const handleMouseDownThumb = (event: MouseEvent) => {
      if (event.ctrlKey || event.button === 2) {
        return;
      }
      event.stopImmediatePropagation();
      lastPosition.current = extractPixel(thumbNode?.style.transform);
      lastClient.current = isVertical ? event.clientY : event.clientX;

      document.addEventListener('mousemove', handleMouseMoveThumb, false);
      document.addEventListener('mouseup', handleMouseUpThumb, false);

      document.onselectstart = () => false;
    };

    if (ref !== null && typeof ref !== 'function') {
      thumbNode = ref.current;
      thumbNode?.addEventListener('mousedown', handleMouseDownThumb);
    }

    return () => {
      thumbNode?.removeEventListener('mousedown', handleMouseDownThumb);
    };
  }, [ref, thumbSize, size, ratio, orientation, isVertical]);

  useEffect(() => {
    const handleMouseDownTrack = (event: any) => {
      let thumbNode: HTMLDivElement | null = null;
      if (ref !== null && typeof ref !== 'function') {
        thumbNode = ref.current;
      }
      if (thumbNode) {
        const { left, top } = event.target.getBoundingClientRect();

        const delta = (isVertical ? event.clientY : event.clientX) - (isVertical ? top : left);

        let newOffset = (delta - thumbSize / 2) * ratio;
        newOffset = Math.max(0, newOffset);
        newOffset = Math.min(newOffset, contentSize - size);
        thumbNode.style.transform = `translate${isVertical ? 'Y' : 'X'}(${newOffset / ratio}px)`;
        onScroll && onScroll(newOffset);
      }
    };

    scrollTrackRef.current?.addEventListener('mousedown', handleMouseDownTrack);

    return () => {
      scrollTrackRef.current?.removeEventListener('mousedown', handleMouseDownTrack);
    };
  }, [ref, size, contentSize, thumbSize, ratio, isVertical, onScroll]);

  const thumbStyle: Record<string, string> = {};
  if (orientation === 'vertical') {
    thumbStyle.height = `${(size / contentSize) * 100}%`;
    thumbStyle.minHeight = `${BAR_THUMB_SIZE}px`;
  } else {
    thumbStyle.width = `${(size / contentSize) * 100}%`;
    thumbStyle.minWidth = `${BAR_THUMB_SIZE}px`;
  }

  return (
    <div
      className={classnames({
        [CLASS_SCROLLBAR_TRACK]: true,
        [`${PREFIXCLS}-scrollbar-track-${orientation}`]: !!orientation,
        [className]: !!className,
      })}
      ref={scrollTrackRef}
    >
      <div className={`${PREFIXCLS}-scrollbar-thumb`} ref={ref} style={thumbStyle} />
    </div>
  );
});
export default VirtualScrollBar;
