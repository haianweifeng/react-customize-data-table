import React from 'react';
import classnames from 'classnames';
import '../style/index.less';
import type { CellProps } from '../interface';

interface TdProps<T> extends CellProps {}

function Td<T>(props: TdProps<T>) {
  const { colSpan, rowSpan, align, className = '', fixed, content, type } = props;

  // todo 选择框的fixed  固定列的样式还没写
  const cls = classnames({
    'fixed-left': fixed === 'left',
    'fixed-right': fixed === 'right',
    [`align-${align}`]: !!align,
    'selection-expand-column': type === 'checkbox' || type === 'radio' || type === 'expanded',
    [className]: !!className,
  });

  return (
    <td colSpan={colSpan} rowSpan={rowSpan} className={cls}>
      {content}
    </td>
  );
}
export default Td;
