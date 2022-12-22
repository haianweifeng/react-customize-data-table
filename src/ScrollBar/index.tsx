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

  // 计算小滚动条每次移动的距离 把最新移动的距离传给回调函数this.props.nScroll
  // handleMouseMove(event) {
  //   const x = event.clientX - this.mouseX
  //   const y = event.clientY - this.mouseY
  //   this.mouseX = event.clientX
  //   this.mouseY = event.clientY
  //
  //   // 含有滚动条的情况下 滚动到底部时候，最大滚动距离是 length - barLength
  //   // value 是滚动距离 所以 value / (length - barLength) 值为此次滚动百分比
  //
  //   const { direction, length, onScroll, barLength } = this.props
  //   const value = direction === 'x' ? x : y
  //   let newOffset
  //   if (direction === 'x' && isRTL()) {
  //     newOffset = this.cacheOffset - value / (length - barLength)
  //   } else {
  //     newOffset = this.cacheOffset + value / (length - barLength)
  //   }
  //
  //   if (newOffset < 0) newOffset = 0
  //   if (newOffset > 1) newOffset = 1
  //   if (newOffset === this.cacheOffset) return
  //   this.cacheOffset = newOffset
  //   onScroll(newOffset)
  // }

  const thumbSize = useMemo(() => {
    const value = (size / contentSize) * size;
    return value >= BAR_SIZE ? value : BAR_SIZE;
  }, [size, contentSize]);

  const ratio = useMemo(() => {
    return (contentSize - size) / (size - thumbSize);
  }, [contentSize, size, thumbSize]);
  // console.log(`ratio: ${ratio}`);

  const handleMouseMoveThumb = (event: any) => {
    let deltaX = event.clientX - lastedClientX.current;
    let deltaY = event.clientY - lastedClientY.current;
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
  // console.log(`size: ${size}`);
  // console.log(`contentSize: ${contentSize}`);

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
    >
      <div className="scrollbar-thumb" style={styles} onMouseDown={handleMouseDownThumb} />
    </div>
  );
};
export default Scrollbar;
