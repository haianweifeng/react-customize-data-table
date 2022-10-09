import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType, TreeLevelType } from '../interface';
import Tr from '../Tr';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<T extends { children?: T[] }>(props: TbodyProps<T>) {
  const { dataSource, columns, startRowIndex, rowKey, rowSelection, expandable, treeProps } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);

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

  // todo 考虑dataSource
  const getAllExpandKeys = useCallback(() => {
    return dataSource.map((d, i) => {
      return getRowKey(d, i);
    });
  }, [dataSource]);

  const getAllTreeKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d, i) => {
      const key = getRowKey(d, i);
      keys.push(key);
      if (d?.children && d.children.length) {
        keys.push(...getAllTreeKeys(d.children));
      }
    });
    return keys;
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

  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return getAllTreeKeys(dataSource);
    }
    return treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys || [];
  });

  const getSelectedRowData = useCallback(
    (keys: (string | number)[]) => {
      return dataSource.filter((d, index) => {
        const key = getRowKey(d, index);
        return keys.indexOf(key) >= 0;
      });
    },
    [dataSource],
  );

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

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(keys, getSelectedRowData(keys));
    }

    if (!rowSelection?.selectedRowKeys) {
      setSelectedKeys(keys);
    }
  };

  const handleExpand = (expanded: boolean, record: T, rowIndex: number) => {
    const key = getRowKey(record, rowIndex);
    if (!expandable?.expandedRowKeys) {
      setExpandedRowKeys((prev) => {
        const isExist = prev.indexOf(key) >= 0;
        return isExist ? prev.filter((p) => p !== key) : [...prev, key];
      });
    }
    expandable?.onExpand && expandable.onExpand(expanded, record);
  };

  const handleTreeExpand = (treeExpanded: boolean, record: T, rowIndex: number) => {
    const key = getRowKey(record, rowIndex);
    if (!treeProps?.expandedRowKeys) {
      setTreeExpandKeys((prev) => {
        const isExist = prev.indexOf(key) >= 0;
        return isExist ? prev.filter((p) => p !== key) : [...prev, key];
      });
    }
    treeProps?.onExpand && treeProps?.onExpand(treeExpanded, record);
  };

  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      setExpandedRowKeys(expandable.expandedRowKeys);
    }
  }, [expandable]);

  useEffect(() => {
    if (rowSelection?.selectedRowKeys) {
      setSelectedKeys(rowSelection.selectedRowKeys);
    }
  }, [rowSelection]);

  useEffect(() => {
    if (treeProps?.expandedRowKeys) {
      setTreeExpandKeys(treeProps.expandedRowKeys);
    }
  }, [treeProps]);

  const getChildrenData = (parentKey: string | number, data?: T[], level: number = 0) => {
    const arr: T[] = [];
    if (data && data.length && treeExpandKeys.indexOf(parentKey) >= 0) {
      data?.forEach((item, i) => {
        const key = getRowKey(item, i);
        arr.push(item);
        treeLevel.current[key] = level + 1;
        const records = getChildrenData(key, item?.children, level + 1);
        arr.push(...records);
      });
    }
    return arr;
  };

  const getData = useCallback(() => {
    const arr: T[] = [];
    treeLevel.current = {};
    const parentLevel = 0;
    dataSource?.forEach((d, i) => {
      const key = getRowKey(d, i);
      arr.push(d);
      treeLevel.current[key] = parentLevel;
      const childrenData = getChildrenData(key, d?.children, parentLevel);
      arr.push(...childrenData);
    });
    return arr;
  }, [dataSource, treeExpandKeys, getChildrenData]);

  const isTree = useMemo(() => {
    const data = dataSource.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [dataSource]);

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
        treeExpanded={treeExpandKeys.indexOf(key) >= 0}
        treeLevel={treeLevel.current[key]}
        isTree={isTree}
        {...props}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onTreeExpand={handleTreeExpand}
      />
    );
  };

  keysRef.current = {};

  return <tbody>{getData()?.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
