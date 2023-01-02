import React from 'react';
import type { ColumnsWithType } from '../interface';

interface ColgroupProps<T> {
  colWidths: number[];
  columns: ColumnsWithType<T>[];
}

function Colgroup<T>(props: ColgroupProps<T>) {
  const { colWidths, columns } = props;

  if (colWidths && colWidths.length === columns.length) {
    return (
      <colgroup>
        {colWidths.map((c, i) => {
          return <col key={`${columns[i].dataIndex}_${i}`} style={{ width: c }} />;
        })}
      </colgroup>
    );
  }
  return (
    <colgroup>
      {columns.map((c, i) => {
        return (
          <col
            key={`${c.dataIndex}_${i}`}
            style={{ width: c?.width, minWidth: c?.minWidth, maxWidth: c?.maxWidth }}
          />
        );
      })}
    </colgroup>
  );
}

export default Colgroup;
