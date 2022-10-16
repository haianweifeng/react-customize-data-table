import React from 'react';
import classnames from 'classnames';
import type { CellProps } from '../interface';
import type { TableProps } from '../Table';
import Td from '../Td';

interface TrProps<T> extends TableProps<T> {
  cols: CellProps[];
  rowData: T;
  rowIndex: number;
  checked: 'indeterminate' | boolean;
  expanded: boolean;
}
function Tr<T>(props: TrProps<T>) {
  const { cols, rowData, rowIndex, checked, expandable, expanded, striped, rowClassName } = props;

  const renderTds = () => {
    const tds = [];
    for (let i = 0; i < cols.length; i++) {
      const column = cols[i];
      if (!column.colSpan || !column.rowSpan) continue;
      tds.push(<Td key={i} {...column} />);
    }

    return tds;
  };

  const renderExpandRow = () => {
    if (
      !expandable ||
      !expandable?.expandedRowRender ||
      !expanded ||
      (expandable?.rowExpandable && !expandable?.rowExpandable(rowData))
    )
      return;
    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(rowData, rowIndex);
    return (
      <tr key="1" className={cls}>
        <td colSpan={cols.length}>{expandable.expandedRowRender(rowData, rowIndex, expanded)}</td>
      </tr>
    );
  };

  const clsInfo: any = {
    'row-even': striped && rowIndex % 2 !== 0,
    'row-odd': striped && rowIndex % 2 === 0,
    'row-selected': checked,
  };

  if (rowClassName && rowClassName(rowData, rowIndex)) {
    clsInfo[rowClassName(rowData, rowIndex)] = !!rowClassName(rowData, rowIndex);
  }

  const cls = classnames(clsInfo);

  return (
    <>
      <tr key="0" className={cls}>
        {renderTds()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
