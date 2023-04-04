import React from 'react';
import type { PrivateColumnsType } from '../interface1';
import type { ColumnsWithType } from '../interface';

interface ColgroupProps<T> {
  // colWidths: number[];
  // columns: ColumnsType<T>;
  columns: PrivateColumnsType<T>;
  // columns: ColumnsWithType<T>[];
}

function Colgroup<T>(props: ColgroupProps<T>) {
  const { columns } = props;

  // if (colWidths && colWidths.length === columns.length) {
  //   return (
  //     <colgroup>
  //       {colWidths.map((c, i) => {
  //         return <col key={`${columns[i].dataIndex}_${i}`} style={{ width: c }} />;
  //       })}
  //     </colgroup>
  //   );
  // }
  return (
    <colgroup>
      {columns.map((c, i) => {
        return <col key={i} style={{ width: c?._width }} />;
      })}
    </colgroup>
  );
}

export default Colgroup;
