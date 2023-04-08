// import React, { useEffect, useRef, useState, useMemo } from 'react';
// import classnames from 'classnames';
// import ScrollBar from '../ScrollBar';

// interface VirtualBodyProps {
//   scrollHeight: number;
//   children: React.ReactNode;
// }

const VirtualBody = () => {
  // const { scrollHeight, children } = props;
  //
  // const virtualContainerRef = useRef<HTMLDivElement>(null);
  //
  // const [scrollTop, setScrollTop] = useState<number>(0);
  //
  // const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);
  //
  // useEffect(() => {
  //   if (virtualContainerRef.current) {
  //     const { height: containerHeight } = virtualContainerRef.current.getBoundingClientRect();
  //     setVirtualContainerHeight(containerHeight);
  //   }
  // }, []);
  //
  // const showScrollbarY = useMemo(() => {
  //   return scrollHeight > virtualContainerHeight;
  // }, [scrollHeight, virtualContainerHeight]);
  //
  // const handleVerticalScroll = (deltaY: number) => {};
  //
  // useEffect(() => {
  //   virtualContainerRef.current?.addEventListener('wheel', wheelListener, { passive: false });
  //
  //   return () => {
  //     virtualContainerRef.current?.removeEventListener('wheel', wheelListener);
  //   };
  // }, []);
  //
  // return (
  //   <div
  //     className={classnames({
  //       'virtual-container': true,
  //     })}
  //     ref={virtualContainerRef}
  //     // onWheel={handleWheel}
  //     // onWheel={wheelListener}
  //     // onTouchStart={handleTouchStart}
  //     // onTouchMove={handleTouchMove}
  //   >
  //     <div className="virtual-content">{children}</div>
  //     {showScrollbarY ? (
  //       <ScrollBar
  //         orientation="vertical"
  //         size={virtualContainerHeight}
  //         contentSize={scrollHeight}
  //         offset={scrollTop}
  //         onScroll={handleVerticalScroll}
  //       />
  //     ) : null}
  //   </div>
  // );
  return 'virtual body';
};
export default VirtualBody;
