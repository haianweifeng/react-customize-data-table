import React, { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import type { CellProps } from '../interface1';
import Tooltip from '../Tooltip';
import { getPropertyValueSum } from '../utils/util';
import '../style/index.less';

type TdProps = CellProps & { scrollLeft: number; offsetRight: number; ignoreRightBorder: boolean };

function Td(props: TdProps) {
  const {
    colSpan,
    rowSpan,
    align,
    className = '',
    fixed,
    lastLeftFixed,
    fistRightFixed,
    content,
    type,
    scrollLeft,
    offsetRight,
    ignoreRightBorder,
    ellipsis,
  } = props;

  const cellRef = useRef<HTMLTableCellElement>(null);

  const [isOverflow, setIsOverflow] = useState<boolean>(false);

  // todo 依赖项content 是不是换成col col 中包含width
  useEffect(() => {
    const cellEl = cellRef.current;
    if (cellEl && ellipsis) {
      const firstChild = cellEl.firstElementChild;
      if (firstChild) {
        const values = getPropertyValueSum(cellEl, [
          'padding-left',
          'padding-right',
          'border-left-width',
          'border-right-width',
        ]);
        const range = document.createRange();
        range.setStart(firstChild, 0);
        range.setEnd(firstChild, firstChild.childNodes.length);
        const { width: rangeWidth } = range.getBoundingClientRect();
        const { width: cellWidth } = cellEl.getBoundingClientRect();
        const realWidth = cellWidth - values;
        setIsOverflow(rangeWidth > realWidth);
      }
    }
  }, [ellipsis, content]);

  const fixedLeft = fixed === 'left';
  const fixedRight = fixed === 'right';

  const cls = classnames({
    'cell-ellipsis': !!ellipsis,
    'cell-fixed-left': fixedLeft,
    'cell-fixed-right': fixedRight,
    'cell-is-last-fixedLeft': !!lastLeftFixed,
    'cell-is-first-fixedRight': !!fistRightFixed,
    // 'cell-fixed-last-left': !!lastLeftFixed && !!scrollLeft,
    // 'cell-fixed-first-right': !!fistRightFixed && !!offsetRight,
    [`cell-align-${align}`]: !!align,
    'selection-expand-column': type !== 'default',
    'cell-ignore-right-border': ignoreRightBorder,
    [className]: !!className,
  });
  const styles: any = {};
  // if (fixedLeft) {
  //   styles.transform = `translate(${scrollLeft}px, 0)`;
  // }
  // if (fixedRight) {
  //   styles.transform = `translate(-${offsetRight}px, 0)`;
  // }

  const cellContent = typeof content === 'function' ? content() : content;

  const showTooltip = typeof ellipsis === 'object' && ellipsis?.tooltip;

  const renderTooltip = () => {
    if (typeof ellipsis === 'object') {
      const triggerEl = <span className="cell-tooltip-content">{cellContent}</span>;
      if (ellipsis.renderTooltip) {
        return ellipsis.renderTooltip(triggerEl, cellContent);
      }
      return (
        <Tooltip tip={cellContent} theme={ellipsis?.tooltipTheme}>
          {triggerEl}
        </Tooltip>
      );
    }
  };

  return (
    <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} ref={cellRef}>
      {showTooltip && isOverflow ? (
        renderTooltip()
      ) : !!ellipsis ? (
        <span className="cell-tooltip-content">{cellContent}</span>
      ) : (
        cellContent
      )}
    </td>
  );
}
export default Td;
