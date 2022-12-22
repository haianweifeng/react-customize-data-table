import React, { useMemo, useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import ScrollBar from '../ScrollBar';

interface VirtualListProps {
  width?: number;
  scrollHeight: number;
  scrollTop: number;
  scrollLeft: number;
  showScrollbarY: boolean;
  children: React.ReactNode;
  onScrollVertical: (offset: number) => void;
}

// 在Mac下，滚动条是不占位的，所以宽度始终是为0的，在windows系统下，是占位的。
const VirtualList = (props: VirtualListProps) => {
  const { width, scrollHeight, scrollTop, scrollLeft, showScrollbarY, children, onScrollVertical } =
    props;

  const BAR_WIDTH = 16;

  const virtualContainerRef = useRef<HTMLDivElement>(null);
  const virtualContentRef = useRef<HTMLDivElement>(null);

  const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);
  const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);
  const [scrollWidth, setScrollWidth] = useState<number>(width || 0);
  // console.log(`scrollWidth: ${scrollWidth}`);

  useEffect(() => {
    if (virtualContainerRef.current) {
      const { width: containerWidth, height: containerHeight } =
        virtualContainerRef.current.getBoundingClientRect();
      setVirtualContainerWidth(containerWidth);
      setVirtualContainerHeight(containerHeight);
    }
  }, []);

  useEffect(() => {
    setScrollWidth(width || virtualContentRef.current?.offsetWidth || 0);
  }, [width]);

  const showScrollbarX = useMemo(() => {
    return width === undefined
      ? scrollWidth > virtualContainerWidth
      : width > virtualContainerWidth;
  }, [scrollWidth, width, virtualContainerWidth]);
  // console.log(`showScrollbarX: ${showScrollbarX}`);

  const { virtualContainerAvailableWidth, virtualContainerAvailableHeight } = useMemo(() => {
    return {
      virtualContainerAvailableWidth:
        virtualContainerWidth === 0 ? 0 : virtualContainerWidth - (showScrollbarY ? BAR_WIDTH : 0),
      virtualContainerAvailableHeight:
        virtualContainerHeight === 0
          ? 0
          : virtualContainerHeight - (showScrollbarX ? BAR_WIDTH : 0),
    };
  }, [virtualContainerWidth, virtualContainerHeight, showScrollbarY, showScrollbarX]);

  const handleVerticalScroll = (deltaY: number) => {
    onScrollVertical && onScrollVertical(deltaY);
  };

  const handleHorizontalScroll = (deltaX: number) => {};

  // console.log(`virtualContainerAvailableWidth: ${virtualContainerAvailableWidth}`);
  // console.log(`virtualContainerAvailableHeight: ${virtualContainerAvailableHeight}`);

  return (
    <div
      className={classnames({
        'virtual-container': true,
        'virtual-container-scroll-vertical': showScrollbarY,
        'virtual-container-scroll-horizontal': showScrollbarX,
      })}
      ref={virtualContainerRef}
    >
      <div className="virtual-content" ref={virtualContentRef}>
        {children}
      </div>
      {showScrollbarY ? (
        <ScrollBar
          orientation="vertical"
          size={virtualContainerAvailableHeight}
          contentSize={scrollHeight}
          offset={scrollTop}
          onScroll={handleVerticalScroll}
        />
      ) : null}
      {showScrollbarX ? (
        <ScrollBar
          orientation="horizontal"
          size={virtualContainerAvailableWidth}
          contentSize={scrollWidth}
          offset={scrollLeft}
          onScroll={handleHorizontalScroll}
        />
      ) : null}
    </div>
  );
};
export default VirtualList;
