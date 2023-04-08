// import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
// import classnames from 'classnames';
// import { throttle } from 'lodash';
// import normalizeWheel from 'normalize-wheel';
// import ScrollBar from '../ScrollBar';
// import { getParent } from '../utils/util';
// import { BAR_WIDTH } from '../utils/constant';

// interface VirtualListProps {
//   scrollWidth: number;
//   scrollHeight: number;
//   scrollTop: number;
//   scrollLeft: number;
//   showScrollbarX: boolean;
//   showScrollbarY: boolean;
//   children: React.ReactNode;
//   onScrollVertical: (offset: number, availableSize: number) => void;
//   onScrollHorizontal: (offset: number) => void;
//   onMount: (containerWidth: number, containerHeight: number) => void;
// }

const VirtualList = () => {
  // const {
  //   scrollWidth,
  //   scrollHeight,
  //   scrollTop,
  //   scrollLeft,
  //   showScrollbarY,
  //   showScrollbarX,
  //   onScrollVertical,
  //   onScrollHorizontal,
  //   onMount,
  //   children,
  // } = props;
  // // console.log(`scrollTop外层: ${scrollTop}`);
  //
  // const pixelX = useRef<number>(0);
  // const pixelY = useRef<number>(0);
  //
  // const touchStartX = useRef<number>(0);
  // const touchStartY = useRef<number>(0);
  //
  // const virtualContainerRef = useRef<HTMLDivElement>(null);
  // const virtualContentRef = useRef<HTMLDivElement>(null);
  //
  // // const ticking = useRef<boolean>(false);
  // const [ticking, setTicking] = useState<boolean>(false);
  //
  // const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);
  // const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);
  //
  // useEffect(() => {
  //   setTimeout(() => {
  //     if (virtualContainerRef.current) {
  //       const { width: containerWidth, height: containerHeight } =
  //         virtualContainerRef.current.getBoundingClientRect();
  //       setVirtualContainerWidth(containerWidth);
  //       setVirtualContainerHeight(containerHeight);
  //       onMount && onMount(containerWidth, containerHeight);
  //     }
  //   }, 0);
  // }, []);
  //
  // // const showScrollbarX = useMemo(() => {
  // //   return scrollWidth > virtualContainerWidth;
  // // }, [scrollWidth, virtualContainerWidth]);
  //
  // const { virtualContainerAvailableWidth, virtualContainerAvailableHeight } = useMemo(() => {
  //   return {
  //     virtualContainerAvailableWidth:
  //       virtualContainerWidth === 0 ? 0 : virtualContainerWidth - (showScrollbarY ? BAR_WIDTH : 0),
  //     virtualContainerAvailableHeight:
  //       virtualContainerHeight === 0
  //         ? 0
  //         : virtualContainerHeight - (showScrollbarX ? BAR_WIDTH : 0),
  //   };
  // }, [virtualContainerWidth, virtualContainerHeight, showScrollbarY, showScrollbarX]);
  //
  // const handleVerticalScroll = useCallback(
  //   (deltaY: number) => {
  //     onScrollVertical && onScrollVertical(deltaY);
  //   },
  //   [onScrollVertical],
  // );
  //
  // const handleHorizontalScroll = useCallback(
  //   (deltaX: number) => {
  //     onScrollHorizontal && onScrollHorizontal(deltaX);
  //   },
  //   [onScrollHorizontal],
  // );
  //
  // const handleScroll = useCallback(() => {
  //   if (Math.abs(pixelX.current) > Math.abs(pixelY.current)) {
  //     pixelY.current = 0;
  //   } else {
  //     pixelX.current = 0;
  //   }
  //
  //   // vertical wheel
  //   if (pixelX.current === 0) {
  //     // console.log(`scrollTop---: ${scrollTop}`);
  //     let offset = scrollTop + pixelY.current;
  //     offset = Math.max(0, offset);
  //     offset = Math.min(offset, scrollHeight - virtualContainerAvailableHeight);
  //     // console.log(`offset: ${offset}`);
  //     if (offset === scrollTop) return;
  //     handleVerticalScroll(offset);
  //     pixelY.current = 0;
  //   }
  //
  //   // horizontal wheel
  //   if (pixelY.current === 0) {
  //     let offset = scrollLeft + pixelX.current;
  //     offset = Math.max(0, offset);
  //     offset = Math.min(offset, scrollWidth - virtualContainerAvailableWidth);
  //     if (offset === scrollLeft) return;
  //     handleHorizontalScroll(offset);
  //     pixelX.current = 0;
  //   }
  // }, [
  //   scrollTop,
  //   scrollHeight,
  //   virtualContainerAvailableHeight,
  //   handleVerticalScroll,
  //   scrollLeft,
  //   scrollWidth,
  //   virtualContainerAvailableWidth,
  //   handleHorizontalScroll,
  // ]);
  //
  // const createScheduler = useCallback((callback: any, scheduler: any) => {
  //   let ticking = false;
  //
  //   const update = () => {
  //     ticking = false;
  //     callback();
  //   };
  //
  //   const requestTick = () => {
  //     if (!ticking) {
  //       scheduler(update);
  //     }
  //     ticking = true;
  //   };
  //
  //   return requestTick;
  // }, []);
  //
  // const handleWheel = useCallback(
  //   (event: any) => {
  //     // if (ticking) {
  //     //   return;
  //     // }
  //     // setTicking(true);
  //     // // ticking.current = true;
  //     // requestAnimationFrame(() => {
  //     //   // ticking.current = false;
  //     //   setTicking(false);
  //     // });
  //     if (!showScrollbarX && !showScrollbarY) return;
  //     // event.persist();
  //
  //     // todo 控制下滚动速度
  //     const speed = 1;
  //     const target = getParent(event.target, virtualContainerRef.current);
  //     if (target !== virtualContainerRef.current) return;
  //     const normalized = normalizeWheel(event);
  //     pixelX.current = normalized.pixelX / speed;
  //     pixelY.current = normalized.pixelY / speed;
  //
  //     const isHorizontal = Math.abs(pixelX.current) > Math.abs(pixelY.current);
  //
  //     if (isHorizontal) {
  //       showScrollbarX && event.preventDefault();
  //     } else {
  //       showScrollbarY && event.preventDefault();
  //     }
  //     handleScroll();
  //     // setTicking(false);
  //     // ticking.current = false;
  //   },
  //   [showScrollbarX, showScrollbarY, handleScroll],
  // );
  //
  // // const wheelListener = throttle(handleWheel, 1000 / 60);
  // // const wheelListener = throttle(createScheduler(handleWheel, window.requestAnimationFrame), 100, { trailing: true });
  //
  // const wheelListener = useCallback(
  //   (event: any) => {
  //     // console.log(`ticking.current: ${ticking.current}`);
  //     if (!ticking) {
  //       requestAnimationFrame(() => {
  //         // console.log(new Date().getTime());
  //         handleWheel(event);
  //         setTicking(false);
  //         // ticking.current = false;
  //       });
  //       setTicking(true);
  //       // ticking.current = true;
  //     }
  //     event.preventDefault();
  //   },
  //   [handleWheel, ticking],
  // );
  //
  // // useEffect(() => {
  // //   if (!showScrollbarX && !showScrollbarY) return;
  // //   virtualContainerRef.current?.addEventListener('wheel', wheelListener, { passive: false });
  // //
  // //   return () => {
  // //     virtualContainerRef.current?.removeEventListener('wheel', wheelListener);
  // //   };
  // // }, [wheelListener, showScrollbarX, showScrollbarY]);
  //
  // useEffect(() => {
  //   if (!showScrollbarX && !showScrollbarY) return;
  //
  //   let ticking = false;
  //
  //   const handleWheel = (event: any) => {
  //     const target = getParent(event.target, virtualContainerRef.current);
  //     if (target !== virtualContainerRef.current) return;
  //     const normalized = normalizeWheel(event);
  //     pixelX.current = normalized.pixelX;
  //     pixelY.current = normalized.pixelY;
  //
  //     if (Math.abs(pixelX.current) > Math.abs(pixelY.current)) {
  //       pixelY.current = 0;
  //     } else {
  //       pixelX.current = 0;
  //     }
  //
  //     // vertical wheel
  //     if (pixelX.current === 0) {
  //       onScrollVertical && onScrollVertical(pixelY.current, virtualContainerAvailableHeight);
  //       // console.log(`scrollTop---: ${scrollTop}`);
  //       // let offset = scrollTop + pixelY.current;
  //       // offset = Math.max(0, offset);
  //       // offset = Math.min(offset, scrollHeight - virtualContainerAvailableHeight);
  //       // if (offset === scrollTop) return;
  //       // handleVerticalScroll(offset);
  //       pixelY.current = 0;
  //     }
  //
  //     // horizontal wheel
  //     // if (pixelY.current === 0) {
  //     //   let offset = scrollLeft + pixelX.current;
  //     //   offset = Math.max(0, offset);
  //     //   offset = Math.min(offset, scrollWidth - virtualContainerAvailableWidth);
  //     //   if (offset === scrollLeft) return;
  //     //   handleHorizontalScroll(offset);
  //     //   pixelX.current = 0;
  //     // }
  //     ticking = false;
  //   };
  //
  //   const wheelListener = (event: any) => {
  //     if (!ticking) {
  //       requestAnimationFrame(() => {
  //         handleWheel(event);
  //       });
  //       ticking = true;
  //     }
  //     event.preventDefault();
  //   };
  //
  //   virtualContainerRef.current?.addEventListener('wheel', wheelListener, { passive: false });
  //
  //   return () => {
  //     virtualContainerRef.current?.removeEventListener('wheel', wheelListener);
  //   };
  // }, [showScrollbarX, showScrollbarY, virtualContainerAvailableHeight]);
  //
  // const handleTouchStart = (event: any) => {
  //   const position = event.changedTouches[0];
  //   touchStartX.current = position.clientX;
  //   touchStartY.current = position.clientY;
  // };
  //
  // // todo 待测试移动端
  // const handleTouchMove = (event: any) => {
  //   const position = event.changedTouches[0];
  //   const deltaX = position.clientX - touchStartX.current;
  //   const deltaY = position.clientY - touchStartY.current;
  //   touchStartX.current = position.clientX;
  //   touchStartY.current = position.clientY;
  //   pixelX.current = deltaX;
  //   pixelY.current = deltaY;
  //   event.preventDefault();
  //   handleScroll();
  // };
  //
  // // console.log(`virtualContainerAvailableWidth: ${virtualContainerAvailableWidth}`);
  // // console.log(`virtualContainerAvailableHeight: ${virtualContainerAvailableHeight}`);
  //
  // return (
  //   <div
  //     className={classnames({
  //       'virtual-container': true,
  //       'virtual-container-scroll-vertical': showScrollbarY,
  //       'virtual-container-scroll-horizontal': showScrollbarX,
  //       'virtual-container-vertical-gutter': showScrollbarY,
  //       'virtual-container-horizontal-gutter': showScrollbarX,
  //     })}
  //     ref={virtualContainerRef}
  //     // onWheel={handleWheel}
  //     // onWheel={wheelListener}
  //     // onTouchStart={handleTouchStart}
  //     // onTouchMove={handleTouchMove}
  //   >
  //     <div className="virtual-content" ref={virtualContentRef}>
  //       {children}
  //     </div>
  //     {showScrollbarY ? (
  //       <ScrollBar
  //         orientation="vertical"
  //         size={virtualContainerAvailableHeight}
  //         contentSize={scrollHeight}
  //         offset={scrollTop}
  //         onScroll={handleVerticalScroll}
  //       />
  //     ) : null}
  //     {showScrollbarX ? (
  //       <ScrollBar
  //         orientation="horizontal"
  //         size={virtualContainerAvailableWidth}
  //         contentSize={scrollWidth}
  //         offset={scrollLeft}
  //         onScroll={handleHorizontalScroll}
  //       />
  //     ) : null}
  //   </div>
  // );
  return 'virtual list';
};
export default VirtualList;
