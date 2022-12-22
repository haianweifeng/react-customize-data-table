import React, { useMemo, useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import normalizeWheel from 'normalize-wheel';
import ScrollBar from '../ScrollBar';
import { getParent } from '../utils/util';

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
  // console.log(`scrollTop: ${scrollTop}`);

  const BAR_WIDTH = 16;

  const pixelX = useRef<number>(0);
  const pixelY = useRef<number>(0);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const virtualContainerRef = useRef<HTMLDivElement>(null);
  const virtualContentRef = useRef<HTMLDivElement>(null);

  const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);
  const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);
  const [scrollWidth, setScrollWidth] = useState<number>(width || 0);
  // console.log(`scrollWidth: ${scrollWidth}`);

  // useEffect(() => {
  //   virtualContainerRef.current?.addEventListener('wheel', handleWheel, { passive: false });
  //
  //   return () => {
  //     virtualContainerRef.current?.removeEventListener('wheel', handleWheel)
  //   };
  // }, [scrollTop]);

  useEffect(() => {
    if (virtualContainerRef.current) {
      const { width: containerWidth, height: containerHeight } =
        virtualContainerRef.current.getBoundingClientRect();
      setVirtualContainerWidth(containerWidth);
      setVirtualContainerHeight(containerHeight);
    }
  }, []);

  useEffect(() => {
    // todo 这里是offsetWidth 还是scrollWidth
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

  const handleScroll = () => {
    if (Math.abs(pixelX.current) > Math.abs(pixelY.current)) {
      pixelY.current = 0;
    } else {
      pixelX.current = 0;
    }

    // vertical wheel
    if (pixelX.current === 0) {
      let offset = scrollTop + pixelY.current;
      offset = Math.max(0, offset);
      offset = Math.min(offset, scrollHeight - virtualContainerAvailableHeight);
      if (offset === scrollTop) return;
      handleVerticalScroll(offset);
      pixelY.current = 0;
    }

    // todo horizontal wheel
  };

  const handleWheel = (event: any) => {
    if (!showScrollbarX && !showScrollbarY) return;

    const target = getParent(event.target, virtualContainerRef.current);
    if (target !== virtualContainerRef.current) return;
    const normalized = normalizeWheel(event);
    pixelX.current = normalized.pixelX;
    pixelY.current = normalized.pixelY;
    handleScroll();
    event.preventDefault();
  };

  const handleTouchStart = (event: any) => {
    const position = event.changedTouches[0];
    touchStartX.current = position.clientX;
    touchStartY.current = position.clientY;
  };

  // todo 待测试移动端
  const handleTouchMove = (event: any) => {
    const position = event.changedTouches[0];
    const deltaX = position.clientX - touchStartX.current;
    const deltaY = position.clientY - touchStartY.current;
    touchStartX.current = position.clientX;
    touchStartY.current = position.clientY;
    pixelX.current = deltaX;
    pixelY.current = deltaY;
    handleScroll();
    event.preventDefault();
  };

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
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
