import React from 'react';
import type { ColumnsType } from '../interface';
import styles from './index.less';

interface TdProps<T> extends ColumnsType<T> {
  data: T;
  rowIndex: number;
  colSpan: number;
}
function Td<T>(props: TdProps<T>) {
  const { data, render, dataIndex, rowIndex } = props;

  const renderContent = () => {
    if (typeof render === 'function') {
      return render(data[dataIndex] as string, data, rowIndex);
    }
    return data[dataIndex];
  };

  return <td>{renderContent()}</td>;
}
export default Td;
