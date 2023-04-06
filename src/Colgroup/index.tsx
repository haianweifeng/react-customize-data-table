import React from 'react';
import type { PrivateColumnsType } from '../interface';

interface ColgroupProps<T> {
  columns: PrivateColumnsType<T>;
}

function Colgroup<T>(props: ColgroupProps<T>) {
  const { columns } = props;

  return (
    <colgroup>
      {columns.map((c, i) => {
        return <col key={i} style={{ width: c?._width }} />;
      })}
    </colgroup>
  );
}

export default Colgroup;
