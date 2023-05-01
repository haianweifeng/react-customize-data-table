import classnames from 'classnames';
import React from 'react';
import { PrivateColumnsType, Summary } from '../interface';
import {
  CLASS_CELL_FIXED_FIRST,
  CLASS_CELL_FIXED_LAST,
  CLASS_CELL_FIXED_LEFT,
  CLASS_CELL_FIXED_RIGHT,
  PREFIXCLS,
} from '../utils/constant';

interface TfootProps<T> {
  bordered: boolean;
  summary: Summary[][];
  columns: PrivateColumnsType<T>;
}

function Tfoot<T extends { key?: number | string; children?: T[] }>(props: TfootProps<T>) {
  const { summary, columns, bordered } = props;

  const renderTd = (summaryItem: Summary, colIndex: number) => {
    const { render, colSpan = 1, rowSpan = 1 } = summaryItem;
    const column = columns[colIndex];
    if (column && rowSpan) {
      return (
        <td
          key={colIndex}
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={classnames({
            [CLASS_CELL_FIXED_LEFT]: column?.fixed === 'left',
            [CLASS_CELL_FIXED_RIGHT]: column?.fixed === 'right',
            [CLASS_CELL_FIXED_LAST]: !!column?._lastLeftFixed,
            [CLASS_CELL_FIXED_FIRST]: !!column?._firstRightFixed,
            [`${PREFIXCLS}-cell-ignore-right-border`]:
              bordered &&
              (colIndex === columns.length - 1 || colSpan + colIndex === columns.length),
          })}
        >
          {render()}
        </td>
      );
    }
  };

  const computeTrs = () => {
    const trs: React.ReactNode[][] = [];
    for (let i = 0; i < summary.length; i++) {
      const row = summary[i];
      let colIndex = 0;
      for (let j = 0; j < row.length; j++) {
        if (!Array.isArray(trs[i])) {
          trs[i] = [];
        }
        const summaryItem = row[j];
        const cellNode = renderTd(summaryItem, colIndex);
        if (cellNode) {
          trs[i].push(cellNode);
        }
        colIndex = colIndex + (summaryItem.colSpan || 1);
      }
    }
    return trs;
  };

  const trs = computeTrs();

  return (
    <tfoot>
      {trs.map((cells, rowIndex) => {
        return <tr key={rowIndex}>{cells}</tr>;
      })}
    </tfoot>
  );
}
export default Tfoot;
