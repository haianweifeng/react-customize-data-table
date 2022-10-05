import React from 'react';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
import type { ColumnsType, RowSelectionType } from '../interface';
import styles from './index.less';
import { TableProps } from '../Table';

interface TdProps<T> {
  data: T;
  dataIndex?: string;
  rowIndex: number;
  colSpan: number;
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
  const { data, type, render, dataIndex, rowIndex, checked, checkboxProps, renderCell, onSelect } =
    props;

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
    if (typeof render === 'function' && dataIndex) {
      return render(data[dataIndex as keyof T] as string, data, rowIndex);
    }
    return dataIndex && data[dataIndex as keyof T];
  };

  return <td>{renderContent() as React.ReactNode}</td>;
}
export default Td;
