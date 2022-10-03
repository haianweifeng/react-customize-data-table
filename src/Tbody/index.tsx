import React, { useRef } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType } from '../interface';
import Tr from '../Tr';
import styles from './index.less';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<T>(props: TbodyProps<T>) {
  const { dataSource, columns, startRowIndex, rowKey } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const getRowKey = (rowData: any) => {
    if (typeof rowKey === 'string') {
      return rowData[rowKey];
    } else if (typeof rowKey === 'function') {
      return rowKey(rowData);
    }
    return undefined;
  };

  const renderTr = (rowData: T, i: number) => {
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
    return <Tr key={key} rowData={rowData} rowIndex={i} {...props} />;
  };

  return <tbody>{dataSource?.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
