import React from 'react';
import classnames from 'classnames';
import '../style/index.less';
import type { CellProps } from '../interface';

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
  } = props;

  const fixedLeft = fixed === 'left';
  const fixedRight = fixed === 'right';

  // todo  固定列的样式还没写
  const cls = classnames({
    'cell-fixed-left': fixedLeft,
    'cell-fixed-right': fixedRight,
    'cell-fixed-last-left': !!lastLeftFixed && !!scrollLeft,
    'cell-fixed-first-right': !!fistRightFixed && !!offsetRight,
    [`cell-align-${align}`]: !!align,
    'selection-expand-column': type === 'checkbox' || type === 'radio' || type === 'expanded',
    'cell-ignore-right-border': ignoreRightBorder,
    [className]: !!className,
  });
  const styles: any = {};
  if (fixedLeft) {
    styles.transform = `translate(${scrollLeft}px, 0)`;
  }
  if (fixedRight) {
    styles.transform = `translate(-${offsetRight}px, 0)`;
  }

  return (
    <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles}>
      {content}
    </td>
  );
}
export default Td;
