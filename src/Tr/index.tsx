import React from 'react';
import Td from '../Td';
import type { ColumnsType } from '../interface';
import type { CellType } from '../interface';
import type { TableProps } from '../Table';
import styles from './index.less';

interface TrProps<T> extends TableProps<T> {
  rowData: T;
  rowIndex: number;
}
function Tr<T>(props: TrProps<T>) {
  const { rowData, columns, rowSelection, rowIndex } = props;

  const renderTds = () => {
    const tds = [];
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const { dataIndex } = column;
      let colSpan = 1;
      if (typeof column.onCell === 'function') {
        const cellProps = column.onCell(rowData, rowIndex);
        if (!cellProps.colSpan) continue;
        colSpan = cellProps.colSpan;
      }
      tds.push(
        <Td
          key={dataIndex as React.Key}
          data={rowData}
          colSpan={colSpan}
          {...column}
          rowIndex={rowIndex}
        />,
      );
    }
    return tds;
  };

  return <tr>{renderTds()}</tr>;
}
export default Tr;
