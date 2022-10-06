import React from 'react';
import classnames from 'classnames';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
import '../style/index.less';
import type { ColumnsType, RowSelectionType } from '../interface';
import { TableProps } from '../Table';

interface TdProps<T> {
  data: T;
  dataIndex?: string;
  rowIndex: number;
  colSpan: number;
  rowSpan: number;
  type?: string;
  checked?: boolean;
  checkboxProps?: any;
  fixed?: boolean | 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  className?: string;
  renderCell?: (
    checked: boolean,
    record: T,
    index: number,
    originNode: React.ReactNode,
  ) => React.ReactNode;
  render?: (text: string, record: T, index: number) => React.ReactNode;
  onSelect?: (record: T, selected: boolean, nativeEvent: Event) => void;
}

function Td<T>(props: TdProps<T>) {
  const {
    data,
    type,
    render,
    dataIndex,
    rowIndex,
    colSpan,
    rowSpan,
    checked,
    checkboxProps,
    renderCell,
    onSelect,
    align,
    className = '',
    fixed,
  } = props;

  const handleChange = (selected: boolean, event: Event) => {
    if (typeof onSelect === 'function') {
      onSelect(data, selected, event);
    }
  };

  const renderRadio = () => {
    const defaultContent = <Radio {...checkboxProps} checked={!!checked} onChange={handleChange} />;
    if (typeof renderCell === 'function') {
      return renderCell(!!checked, data, rowIndex, defaultContent);
    }
    return defaultContent;
  };

  const renderCheckbox = () => {
    const defaultContent = (
      <Checkbox {...checkboxProps} checked={!!checked} onChange={handleChange} />
    );
    if (typeof renderCell === 'function') {
      return renderCell(!!checked, data, rowIndex, defaultContent);
    }
    return defaultContent;
  };

  const renderContent = () => {
    if (type) {
      if (type === 'radio') {
        return renderRadio();
      }
      return renderCheckbox();
    }
    if (dataIndex) {
      if (typeof render === 'function') {
        return render(data[dataIndex as keyof T] as string, data, rowIndex);
      }
      return data[dataIndex as keyof T];
    }
    return null;
  };

  // const className = classnames(
  //   this.props.className,
  //   tableClass(
  //     fixed === 'left' && CLASS_FIXED_LEFT,
  //     fixed === 'right' && CLASS_FIXED_RIGHT,
  //     firstFixed && 'fixed-first',
  //     lastFixed && 'fixed-last',
  //     (type === 'checkbox' || type === 'expand' || type === 'row-expand') && 'checkbox',
  //     align !== 'left' && `align-${align}`,
  //     ignoreBorderRight && 'ignore-right-border'
  //   )
  // )

  // todo 选择框的fixed  固定列的样式还没写
  const cls = classnames({
    'fixed-left': fixed === 'left',
    'fixed-right': fixed === 'right',
    [`align-${align}`]: !!align,
    'selection-column': !!type,
    [className]: !!className,
  });

  return (
    <td colSpan={colSpan} rowSpan={rowSpan} className={cls}>
      {renderContent() as React.ReactNode}
    </td>
  );
}
export default Td;
