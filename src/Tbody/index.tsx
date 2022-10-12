import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType, TreeLevelType } from '../interface';
import Tr from '../Tr';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<T extends { children?: T[]; parent?: T; rowKey: number | string }>(
  props: TbodyProps<T>,
) {
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

  const getChildrenData = (parentKey: string | number, level: number = 0, parent: T) => {
    const arr: T[] = [];
    const data = parent?.children;
    if (data && data.length && treeExpandKeys.indexOf(parentKey) >= 0) {
      data.forEach((item, i) => {
        const key = getRowKey(item, i);
        arr.push({ ...item, parent, rowKey: key });
        treeLevel.current[key] = level + 1;
        const records = getChildrenData(key, level + 1, { ...item, parent, rowKey: key });
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
      const childrenData = getChildrenData(key, parentLevel, d);
      arr.push(...childrenData);
    });
    return arr;
  }, [dataSource, getChildrenData, getRowKey]);

  const getSelectedRowData = (data: T[], keys: (string | number)[]) => {
    const arr: T[] = [];
    data.forEach((d, index) => {
      const key = getRowKey(d, index);
      if (keys.indexOf(key) >= 0) {
        arr.push(d);
      }
      if (d?.children && d.children.length) {
        arr.push(...getSelectedRowData(d.children, keys));
      }
    });
    return arr;
  };

  const getChildrenKeys = (data?: T[]) => {
    const keys: (number | string)[] = [];
    (data || []).map((c, i) => {
      keys.push(getRowKey(c, i));
      if (c?.children && c.children.length) {
        keys.push(...getChildrenKeys(c.children));
      }
    });
    return keys;
  };

  const getSelectParent = (
    d: T,
    selectKeys: (string | number)[],
    currSelectedKey: number | string,
  ) => {
    const arr: T[] = [];
    const childKeys = getChildrenKeys(d?.children);
    const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
    if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
      arr.push(d);
      if (d?.parent) {
        arr.unshift(...getSelectParent(d.parent, [...selectKeys, currSelectedKey], d.rowKey));
      }
    }
    return arr;
  };

  const getSelectedItems = (data: T[] = [], currSelectedKey?: number | string) => {
    const arr: T[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const key = getRowKey(d, i);
      if (currSelectedKey) {
        if (currSelectedKey === key) {
          if (d?.parent) {
            arr.push(...getSelectParent(d.parent, selectedKeys, currSelectedKey));
          }
          arr.push(d);
          const childrenData = getSelectedItems(d?.children);
          if (childrenData.length) {
            arr.push(...childrenData);
          }
        }
      } else {
        arr.push(d);
        const childrenData = getSelectedItems(d?.children);
        if (childrenData.length) {
          arr.push(...childrenData);
        }
      }
    }

    return arr;
  };

  // todo 还得实现半选状态 如果是勾选了最后一个子选项则父选项也需要被选中
  const handleSelect = (
    isRadio: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
    const key = getRowKey(record, rowIndex);
    const isExist = selectedKeys.indexOf(key) >= 0;
    const childrenKeys = getChildrenKeys(record?.children);

    const selectedItems = getSelectedItems(getData(), key);
    console.log(selectedItems);

    const selectedItemKeys = selectedItems.map((s, i) => {
      return getRowKey(s, i);
    });

    let keys;

    if (!isExist) {
      // keys = isRadio ? [key] : [...selectedKeys, key, ...childrenKeys];
      keys = isRadio ? [key] : [...selectedKeys, ...selectedItemKeys];
    } else {
      // todo 取消勾选的  半选状态
      keys = selectedKeys.filter((p: string | number) => {
        return [key, ...childrenKeys].indexOf(p) < 0;
      });
    }

    // const selectedRows = selectedItems;
    const selectedRows = getSelectedRowData(dataSource, keys);
    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(keys, selectedRows);
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
    treeProps?.onExpand && treeProps.onExpand(treeExpanded, record);
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

    const childrenKeys = getChildrenKeys(rowData?.children);

    const allChildrenSelected = childrenKeys.every((cKey) => {
      // if (rowData.key === 13) {
      //   console.log(childrenKeys.length);
      //   console.log(selectedKeys);
      // }
      return selectedKeys.indexOf(cKey) >= 0;
    });

    const childrenSelected = childrenKeys.some((cKey) => {
      return selectedKeys.indexOf(cKey) >= 0;
    });

    // console.log(rowData);
    // console.log(childrenKeys.length);
    // console.log(allChildrenSelected);

    let checked = false;
    // console.log(childrenKeys.length);

    if (childrenKeys.length) {
      checked = allChildrenSelected ? true : childrenSelected ? 'indeterminate' : false;
    } else {
      checked = selectedKeys.indexOf(key) >= 0;
    }

    return (
      <Tr
        key={key}
        rowData={rowData}
        rowIndex={i}
        checked={selectedKeys.indexOf(key) >= 0}
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
