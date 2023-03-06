import React, { useRef, useEffect, useState, useMemo } from 'react';
import classnames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import VirtualScrollBar from '../VirtualScrollBar';
import { extractPixel, getParent, getScrollbarWidth } from '../utils/util';
import './index.less';
import normalizeWheel from 'normalize-wheel';

interface ScrollBarsProps {
  style?: React.CSSProperties;
  wrapClass?: string;
  viewClass?: string;
  children: React.ReactNode;
  noresize?: Boolean;
  onVerticalScroll?: (offset: number) => void;
  onHorizontalScroll?: (offset: number) => void;
}

const ScrollBars = (props: ScrollBarsProps) => {
  const {
    noresize = false,
    children,
    style = {},
    wrapClass = '',
    viewClass = '',
    onHorizontalScroll,
    onVerticalScroll,
  } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const barYRef = useRef<HTMLDivElement>(null);
  const barXRef = useRef<HTMLDivElement>(null);

  const wheelXEndTimer = useRef<number>(0);
  const wheelYEndTimer = useRef<number>(0);
  const scrollEndTimer = useRef<number>(0);
  const isLeave = useRef<boolean>(true);

  const lastScrollTop = useRef<number>(0);
  const lastScrollLeft = useRef<number>(0);
  // 如果有列冻结的话会导致在滚动时候获取到的scrollWidth 偏小
  const lastScrollWidth = useRef<number>(0);

  const [clientWidth, setClientWidth] = useState<number>(0);
  const [scrollWidth, setScrollWidth] = useState<number>(0);

  const [clientHeight, setClientHeight] = useState<number>(0);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  const [showScrollbarY, setShowScrollbarY] = useState<boolean>(false);
  const [showScrollbarX, setShowScrollbarX] = useState<boolean>(false);
  // console.log(`clientHeight: ${clientHeight}`);
  // console.log(`scrollHeight: ${scrollHeight}`);
  // console.log(`scrollWidth: ${scrollWidth}`);
  // todo 是否执行update 时候也需要执行滑块位置的更新
  useEffect(() => {
    const update = () => {
      if (wrapRef.current) {
        const wrapNode = wrapRef.current;
        const widthChange = wrapNode.scrollWidth !== lastScrollWidth.current;
        lastScrollWidth.current = wrapNode.scrollWidth;
        setClientWidth(wrapNode.clientWidth);
        setScrollWidth(wrapNode.scrollWidth);
        setClientHeight(wrapNode.clientHeight);
        setScrollHeight(wrapNode.scrollHeight);
        setShowScrollbarY(wrapNode.scrollHeight > wrapNode.clientHeight);
        setShowScrollbarX(wrapNode.scrollWidth > wrapNode.clientWidth);
        if (widthChange) {
          onHorizontalScroll && onHorizontalScroll(lastScrollLeft.current);
        }
      }
    };

    const resizeObserver = () => {
      const resizeObserver = new ResizeObserver((entries) => {
        // console.log(entries);
        let contentRect = entries[0].contentRect;
        if (!(contentRect.width || contentRect.height)) return;
        // console.log('hhaha');
        update();
      });
      wrapRef.current && resizeObserver.observe(wrapRef.current);
      viewRef.current && resizeObserver.observe(viewRef.current);
    };

    if (!noresize) {
      resizeObserver();
    } else {
      update();
    }
  }, [noresize, onHorizontalScroll]);

  const handleVerticalScroll = (offset: number) => {
    // if (wrapRef.current) {
    //   const wrapEl = wrapRef.current;
    //   wrapEl.scrollTop = offset;
    // }
    // onVerticalScroll && onVerticalScroll(offset);
    if (offset !== lastScrollTop.current) {
      viewRef.current!.style.transform = `translate(-${lastScrollLeft.current}px, -${offset}px)`;
      onVerticalScroll && onVerticalScroll(offset);
      lastScrollTop.current = offset;
    }
  };

  const handleHorizontalScroll = (offset: number) => {
    // if (wrapRef.current) {
    //   const wrapEl = wrapRef.current;
    //   wrapEl.scrollLeft = offset;
    // }
    // onHorizontalScroll && onHorizontalScroll(offset);
    if (offset !== lastScrollLeft.current) {
      viewRef.current!.style.transform = `translate(-${offset}px, -${lastScrollTop.current}px)`;
      onHorizontalScroll && onHorizontalScroll(offset);
      lastScrollLeft.current = offset;
    }
  };
  // 由于表头表体是通过div 包裹 会导致滚动时候表体先有了scrollLeft 然后表头才有导致更新不同步 表头总是慢于标题 所以采用自定义wheel 事件触发滚动
  useEffect(() => {
    let ticking = false;
    let lastScrollTop = wrapRef.current?.scrollTop || 0;
    let lastScrollLeft = wrapRef.current?.scrollLeft || 0;

    const scrollEndDetector = (target: HTMLElement) => {
      window.clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = window.setTimeout(() => {
        target.classList.remove('scrollbar-track-scrolling');
        if (isLeave.current) {
          target.classList.remove('scrollbar-track-active');
        }
      }, 600);
    };

    const handleScroll = (e: any) => {
      const { scrollTop, scrollLeft } = e.target;

      const deltaY = scrollTop - lastScrollTop;
      const deltaX = scrollLeft - lastScrollLeft;

      if (wrapRef.current) {
        const wrapEl = wrapRef.current;

        const clientW = wrapEl.clientWidth;
        const scrollW = wrapEl.scrollWidth;

        const clientH = wrapEl.clientHeight;
        const scrollH = wrapEl.scrollHeight;

        if (deltaY || deltaX) {
          const thumbEl = deltaY ? barYRef.current : barXRef.current;
          if (thumbEl) {
            const thumbSize = deltaY ? thumbEl.offsetHeight : thumbEl.offsetWidth;
            const scale = deltaY
              ? (scrollH - clientH) / (clientH - thumbSize)
              : (scrollW - clientW) / (clientW - thumbSize);
            thumbEl.style.transform = `translate${deltaY ? 'Y' : 'X'}(${
              (deltaY ? scrollTop : scrollLeft) / scale
            }px)`;
            const barEl = thumbEl.parentNode as HTMLElement;
            if (barEl) {
              barEl.classList.add('scrollbar-track-scrolling');
            }
            scrollEndDetector(barEl);
          }
        }
      }
      lastScrollTop = scrollTop;
      lastScrollLeft = scrollLeft;

      onVerticalScroll && onVerticalScroll(scrollTop);
      onHorizontalScroll && onHorizontalScroll(scrollLeft);
    };

    const scrollListener = (event: any) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(event);
          ticking = false;
        });
        ticking = true;
      }
      event.preventDefault();
    };

    wrapRef.current?.addEventListener('scroll', scrollListener);
    return () => {
      wrapRef.current?.removeEventListener('scroll', scrollListener);
    };
  }, []);

  // todo 需要考虑存在滚动条时候才wheel 事件
  useEffect(() => {
    let moveY = 0;
    let moveX = 0;
    let ticking = false;

    let pixelX = 0;
    let pixelY = 0;

    const wheelEndDetector = (target: HTMLElement, isVertical: boolean) => {
      window.clearTimeout(isVertical ? wheelYEndTimer.current : wheelXEndTimer.current);
      const wheelEndTimer = window.setTimeout(() => {
        target.classList.remove('scrollbar-track-scrolling');
        if (isLeave.current) {
          target.classList.remove('scrollbar-track-active');
        }
      }, 600);
      if (isVertical) {
        wheelYEndTimer.current = wheelEndTimer;
      } else {
        wheelXEndTimer.current = wheelEndTimer;
      }
    };

    const handleWheel = (event: any) => {
      const normalized = normalizeWheel(event);
      pixelX = normalized.pixelX;
      pixelY = normalized.pixelY;

      if (Math.abs(pixelX) > Math.abs(pixelY)) {
        pixelY = 0;
      } else {
        pixelX = 0;
      }

      const isVertical = pixelX === 0;

      const thumbEl = isVertical ? barYRef.current : barXRef.current;

      if (wrapRef.current) {
        const wrapEl = wrapRef.current;

        const clientW = wrapEl.clientWidth;

        const clientH = wrapEl.clientHeight;
        const scrollH = wrapEl.scrollHeight;

        // vertical wheel
        if (isVertical) {
          moveY = lastScrollTop.current;
          moveY += pixelY;
          moveY = Math.max(0, moveY);
          moveY = Math.min(moveY, scrollH - clientH);

          if (moveY !== lastScrollTop.current) {
            const thumbSize = thumbEl!.offsetHeight;
            const scale = (scrollH - clientH) / (clientH - thumbSize);
            thumbEl!.style.transform = `translateY(${moveY / scale}px)`;
            viewRef.current!.style.transform = `translate(-${lastScrollLeft.current}px, -${moveY}px)`;
            onVerticalScroll && onVerticalScroll(moveY);
            lastScrollTop.current = moveY;
          }

          pixelY = 0;
        } else {
          // horizontal wheel
          moveX = lastScrollLeft.current;
          moveX += pixelX;
          moveX = Math.max(0, moveX);
          moveX = Math.min(moveX, lastScrollWidth.current - clientW);

          if (moveX !== lastScrollLeft.current) {
            const thumbSize = thumbEl!.offsetWidth;
            const scale = (lastScrollWidth.current - clientW) / (clientW - thumbSize);
            thumbEl!.style.transform = `translateX(${moveX / scale}px)`;
            viewRef.current!.style.transform = `translate(-${moveX}px, -${lastScrollTop.current}px)`;
            onHorizontalScroll && onHorizontalScroll(moveX);
            lastScrollLeft.current = moveX;
          }

          pixelX = 0;
        }
      }

      const barEl = thumbEl!.parentNode as HTMLElement;
      if (barEl) {
        barEl.classList.add('scrollbar-track-scrolling');
      }
      wheelEndDetector(barEl, isVertical);

      ticking = false;
    };

    const wheelListener = (event: any) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleWheel(event);
        });
        ticking = true;
      }
      event.preventDefault();
    };

    wrapRef.current?.addEventListener('wheel', wheelListener, { passive: false });
    return () => {
      wrapRef.current?.removeEventListener('wheel', wheelListener);
    };
  }, [onVerticalScroll, onHorizontalScroll]);

  useEffect(() => {
    const handleMouseEnter = (event: any) => {
      isLeave.current = false;
      const targetNode = getParent(event.target, '.scrollbar-track');
      if (targetNode && targetNode.classList.contains('scrollbar-track-scrolling')) {
        targetNode.classList.remove('scrollbar-track-scrolling');
        targetNode.classList.add('scrollbar-track-active');
      }
    };

    const handleMouseLeave = (event: any) => {
      isLeave.current = true;
      const targetNode = getParent(event.target, '.scrollbar-track');
      if (targetNode) {
        setTimeout(() => {
          if (!targetNode.classList.contains('scrollbar-track-scrolling')) {
            targetNode.classList.remove('scrollbar-track-active');
          }
        }, 600);
      }
    };

    barYRef.current?.parentNode?.addEventListener('mouseenter', handleMouseEnter);
    barXRef.current?.parentNode?.addEventListener('mouseenter', handleMouseEnter);

    barYRef.current?.parentNode?.addEventListener('mouseleave', handleMouseLeave);
    barXRef.current?.parentNode?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      barYRef.current?.parentNode?.removeEventListener('mouseenter', handleMouseEnter);
      barXRef.current?.parentNode?.removeEventListener('mouseenter', handleMouseEnter);

      barYRef.current?.parentNode?.removeEventListener('mouseleave', handleMouseLeave);
      barXRef.current?.parentNode?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showScrollbarY, showScrollbarX]);

  // const scrollbarWidth = getScrollbarWidth();

  return (
    <div className="scrollbar">
      <div
        ref={wrapRef}
        style={{
          ...style,
          // marginLeft: `-${scrollbarWidth}px`,
          // marginRight: `-${scrollbarWidth}px`,
        }}
        className={classnames({
          'scrollbar-wrap': true,
          // 'scrollbar-wrap-hidden-default': !scrollbarWidth,
          wrapClass: !!wrapClass,
        })}
      >
        <div className="scrollbar-view" ref={viewRef}>
          {children}
        </div>
        {showScrollbarY && (
          <VirtualScrollBar
            className="scrollbar-show-x"
            orientation="vertical"
            size={clientHeight}
            contentSize={scrollHeight}
            ref={barYRef}
            onScroll={handleVerticalScroll}
          />
        )}
        {showScrollbarX && (
          <VirtualScrollBar
            className="scrollbar-show-y"
            orientation="horizontal"
            size={clientWidth}
            contentSize={scrollWidth}
            ref={barXRef}
            onScroll={handleHorizontalScroll}
          />
        )}
      </div>
    </div>
  );
};
export default ScrollBars;