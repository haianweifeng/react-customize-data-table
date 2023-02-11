import React, { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import VirtualScrollBar from '../VirtualScrollBar';
import { getParent, getScrollbarWidth } from '../utils/util';
import './index.less';

interface ScrollBarsProps {
  style?: React.CSSProperties;
  wrapClass?: string;
  viewClass?: string;
  children: React.ReactNode;
  noresize?: Boolean;
}

const ScrollBars = (props: ScrollBarsProps) => {
  const { children, style = {}, wrapClass = '', viewClass = '' } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const barYRef = useRef<HTMLDivElement>(null);
  const barXRef = useRef<HTMLDivElement>(null);

  const scrollEndTimer = useRef<number>(0);
  const isLeave = useRef<boolean>(true);

  const [clientWidth, setClientWidth] = useState<number>(0);
  const [scrollWidth, setScrollWidth] = useState<number>(0);

  const [clientHeight, setClientHeight] = useState<number>(0);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  const [showScrollbarY, setShowScrollbarY] = useState<boolean>(false);
  const [showScrollbarX, setShowScrollbarX] = useState<boolean>(false);

  useEffect(() => {
    if (wrapRef.current) {
      const wrapNode = wrapRef.current;
      setClientWidth(wrapNode.clientWidth);
      setScrollWidth(wrapNode.scrollWidth);
      setClientHeight(wrapNode.clientHeight);
      setScrollHeight(wrapNode.scrollHeight);
      setShowScrollbarY(wrapNode.scrollHeight > wrapNode.clientHeight);
      setShowScrollbarX(wrapNode.scrollWidth > wrapNode.clientWidth);
    }
  }, []);

  const handleVerticalScroll = () => {};

  const handleHorizontalScroll = () => {};

  useEffect(() => {
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

    const handleScroll = () => {
      if (wrapRef.current) {
        const wrapEl = wrapRef.current;
        const deltaY = wrapEl.scrollTop - lastScrollTop;
        const deltaX = wrapEl.scrollLeft - lastScrollLeft;

        if (deltaY || deltaX) {
          const thumbEl = deltaY ? barYRef.current : barXRef.current;
          if (thumbEl) {
            const barEl = thumbEl.parentNode as HTMLElement;
            if (barEl) {
              barEl.classList.add('scrollbar-track-scrolling');
            }
            scrollEndDetector(barEl);
          }
        }

        lastScrollTop = wrapEl.scrollTop;
        lastScrollLeft = wrapEl.scrollLeft;
      }
    };

    wrapRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      wrapRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
  // todo getScrollbarWidth 有没有用
  const scrollbarWidth = getScrollbarWidth();

  return (
    <div className="scrollbar">
      <div
        ref={wrapRef}
        style={{
          ...style,
          marginLeft: `-${scrollbarWidth}px`,
          marginRight: `-${scrollbarWidth}px`,
        }}
        className={classnames({
          'scrollbar-wrap': true,
          'scrollbar-wrap-hidden-default': !scrollbarWidth,
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
