import React from 'react';
import Td from '../Td';
import type { ColumnsType } from '../interface';
import type { CellType } from '../interface';
import type { TableProps } from '../Table';
import styles from './index.less';

interface TrProps<T> extends TableProps<T> {
  rowData: T;
  rowId: string | number;
  rowIndex: number;
  type: string;
  checked: boolean;
  onSelect: (record: T, rowIndex: number, selected: boolean, event: Event) => void;
}
function Tr<T>(props: TrProps<T>) {
  const { rowData, columns, rowSelection, rowIndex, type, checked, rowId, onSelect } = props;

  const handleSelect = (record: T, selected: boolean, nativeEvent: Event) => {
    onSelect(record, rowIndex, selected, nativeEvent);
  };

  const renderSelectionTd = () => {
    if (rowSelection) {
      const { getCheckboxProps, fixed, renderCell } = rowSelection;
      const checkboxProps = typeof getCheckboxProps === 'function' ? getCheckboxProps(rowData) : {};
      return (
        <Td
          key={rowId}
          data={rowData}
          colSpan={1}
          rowIndex={rowIndex}
          checkboxProps={checkboxProps}
          type={type}
          checked={checked}
          fixed={!!fixed}
          renderCell={renderCell}
          onSelect={handleSelect}
        />
      );
    }
  };

  const renderTds = () => {
    const tds = [];
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const { dataIndex, onCell, align, className, fixed, render } = column;
      let colSpan = 1;
      let rowSpan = 1;
      if (typeof onCell === 'function') {
        const cellProps = onCell(rowData, rowIndex);
        if (!cellProps.colSpan) continue;
        colSpan = cellProps.colSpan;
        rowSpan = cellProps.rowSpan;
      }
      tds.push(
        <Td
          key={dataIndex as React.Key}
          data={rowData}
          rowIndex={rowIndex}
          dataIndex={dataIndex}
          colSpan={colSpan}
          rowSpan={rowSpan}
          align={align}
          className={className}
          fixed={fixed}
          render={render}
        />,
      );
    }

    if (type) {
      const selectionTd = renderSelectionTd();
      tds.unshift(selectionTd);
    }

    return tds;
  };

  return <tr>{renderTds()}</tr>;
}
export default Tr;
