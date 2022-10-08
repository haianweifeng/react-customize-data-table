import React, { useRef, useState, useEffect } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType } from '../interface';
import Tr from '../Tr';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<T>(props: TbodyProps<T>) {
  const { dataSource, columns, startRowIndex, rowKey, rowSelection, expandable } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys || [];
  });

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

  const getAllExpandKeys = () => {
    return dataSource.map((d, i) => {
      return getRowKey(d, i);
    });
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(() => {
    if (
      expandable?.defaultExpandAllRows &&
      !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
    ) {
      return getAllExpandKeys();
    }
    return expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys || [];
  });

  const getSelectedRowData = (keys: (string | number)[]) => {
    return dataSource.filter((d, index) => {
      const key = getRowKey(d, index);
      return keys.indexOf(key) >= 0;
    });
  };

  const handleSelect = (
    isRadio: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
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

  const handleExpand = (expanded: boolean, record: T, rowIndex: number) => {
    let key = getRowKey(record, rowIndex);
    if (expandable?.expandedRowKeys) {
      expandable?.onExpand && expandable.onExpand(expanded, record);
      return;
    }
    setExpandedRowKeys((prev) => {
      const isExist = prev.indexOf(key) >= 0;
      return isExist ? prev.filter((p) => p !== key) : [...prev, key];
    });
  };

  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      setExpandedRowKeys(expandable.expandedRowKeys);
    }
  }, [expandable]);

  useEffect(() => {
    if (rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys) {
      const keys = rowSelection.defaultSelectedRowKeys || rowSelection.selectedRowKeys;
      setSelectedKeys(keys as (string | number)[]);
    }
  }, [rowSelection]);

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
        rowData={rowData}
        rowIndex={i}
        checked={checked}
        expanded={expandedRowKeys.indexOf(key) >= 0}
        {...props}
        onExpand={handleExpand}
        onSelect={handleSelect}
      />
    );
  };

  keysRef.current = {};

  return <tbody>{dataSource?.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
