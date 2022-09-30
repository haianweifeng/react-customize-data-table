import React, { useRef } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType } from '../interface';
import styles from './index.less';

interface TbodyProps<T> extends TableProps<T> {
  data: T[];
  columns: ColumnsType<T>[];
  startRowIndex: number;
  rowKey: string | ((rowData: T) => string | number);
}

function Tbody<T>(props: Partial<TbodyProps<T>>) {
  const { data, columns, startRowIndex, rowKey } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const getRowKey = (rowData: any) => {
    if (typeof rowKey === 'string') {
      return rowData[rowKey];
    } else if (typeof rowKey === 'function') {
      return rowKey(rowData);
    }
    return undefined;
  };

  const renderTr = (rowData: any, i: number) => {
    let key = getRowKey(rowData);
    if (!(typeof key === 'string' || typeof key === 'number')) {
      console.error(new Error(`expect Tr has a string or a number key, get '${typeof key}'`));
    }
    if (keysRef.current[key]) {
      const converted = `converted_${i}`;
      console.warn(
        `Tr has same key: (${key}). Already converted with (${converted}), Please sure Tr has unique key.`,
      );
      key = converted;
    }
    keysRef.current = key;
    return (
      <tr key={key}>
        <td>hhahah</td>
      </tr>
    );
  };

  return <tbody>{data?.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
