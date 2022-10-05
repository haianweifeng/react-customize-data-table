import React, { useRef, useState, useEffect } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType } from '../interface';
import Tr from '../Tr';
import styles from './index.less';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<T>(props: TbodyProps<T>) {
  const { dataSource, columns, startRowIndex, rowKey, rowSelection } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys || [];
  });

  useEffect(() => {
    if (rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys) {
      const keys = rowSelection.defaultSelectedRowKeys || rowSelection.selectedRowKeys;
      setSelectedKeys(keys as (string | number)[]);
    }
  }, [rowSelection]);

  const getSelectionType = () => {
    if (rowSelection) {
      return rowSelection.type || 'checkbox';
    }
    return '';
  };

  const getRowKey = (rowData: T, i: number) => {
    if (typeof rowKey === 'string') {
      return rowData[rowKey as keyof T] as string;
    } else if (typeof rowKey === 'function') {
      return rowKey(rowData);
    }
    console.warn(
      `Tr has no set unique key.Already converted with ${i},Please sure Tr has unique key.`,
    );
    return i;
  };

  const getSelectedRowData = (keys: (string | number)[]) => {
    return dataSource.filter((d, index) => {
      const key = getRowKey(d, index);
      return keys.indexOf(key) >= 0;
    });
  };

  const handleSelect = (record: T, rowIndex: number, selected: boolean, event: Event) => {
    const type = getSelectionType();
    const isRadio = type === 'radio';
    const key = getRowKey(record, rowIndex);
    const isExist = selectedKeys.indexOf(key) >= 0;

    let keys;

    if (!isExist) {
      keys = isRadio ? [key] : [...selectedKeys, key];
    } else {
      keys = selectedKeys.filter((p: string | number) => p !== key);
    }

    const selectedRows = getSelectedRowData(keys);
    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
    }
    setSelectedKeys(keys);
    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(keys, getSelectedRowData(keys));
    }
  };

  const renderTr = (rowData: T, i: number) => {
    let key = getRowKey(rowData, i);
    if (!(typeof key === 'string' || typeof key === 'number')) {
      console.error(new Error(`expect Tr has a string or a number key, get '${typeof key}'`));
    }
    if (keysRef.current[key]) {
      const converted = `converted_key_${i}`;
      let tips = `Tr has same key:(${key}).Already converted with (${converted}), Please sure Tr has unique key.`;
      console.warn(tips);
      key = converted;
    }
    keysRef.current[key] = true;

    const checked = selectedKeys.indexOf(key) >= 0;

    return (
      <Tr
        key={key}
        rowId={key}
        rowData={rowData}
        rowIndex={i}
        type={getSelectionType()}
        checked={checked}
        {...props}
        onSelect={handleSelect}
      />
    );
  };

  keysRef.current = {};

  return <tbody>{dataSource?.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
