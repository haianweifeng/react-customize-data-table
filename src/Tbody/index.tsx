import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType, KeysRefType, TreeLevelType } from '../interface';
import Tr from '../Tr';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<
  T extends { children?: T[]; parent?: T; rowKey: number | string; parentKey?: number | string },
>(props: TbodyProps<T>) {
  const {
    dataSource = [],
    columns,
    startRowIndex,
    rowKey,
    rowSelection,
    expandable,
    treeProps,
  } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);

  const cacheSelectedRows = useRef<T[]>([]);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys || [];
  });

  const getRowKey = (rowData: T, i: number | string) => {
    let key;
    if (typeof rowKey === 'string') {
      key = rowData[rowKey as keyof T] as string;
    } else if (typeof rowKey === 'function') {
      key = rowKey(rowData);
    }

    if (key) {
      if (!(typeof key === 'string' || typeof key === 'number')) {
        console.error(new Error(`expect Tr has a string or a number key, get '${typeof key}'`));
      }
    } else {
      key = i;
      console.warn(
        `Tr has no set unique key.Already converted with ${i},Please sure Tr has unique key.`,
      );
    }

    if (keysRef.current[key]) {
      const converted = `converted_key_${i}`;
      let tips = `Tr has same key:(${key}).Already converted with (${converted}), Please sure Tr has unique key.`;
      console.warn(tips);
      key = converted;
    }
    keysRef.current[key] = true;

    return key;
  };

  // todo 考虑dataSource  这个还没优化
  const getAllExpandKeys = useCallback(() => {
    return dataSource.map((d, i) => {
      return getRowKey(d, i);
    });
  }, [dataSource]);

  // 优化过
  const getAllTreeKeys = (data: T[], index?: number) => {
    const keys: (string | number)[] = [];
    data.forEach((d, i) => {
      const num = index ? `${index}_${i}` : i;
      const key = getRowKey(d, num);
      keys.push(key);
      if (d?.children && d.children.length) {
        keys.push(...getAllTreeKeys(d.children, i));
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
  // 优化过
  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return getAllTreeKeys(dataSource);
    }
    return treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys || [];
  });

  // 优化过
  const getTreeChildrenData = (level: number = 0, parent: T) => {
    const arr: T[] = [];
    const data = parent?.children;
    if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parent.rowKey) >= 0) {
      data.forEach((item, i) => {
        arr.push(item);
        const key = item.rowKey;
        treeLevel.current[key] = level + 1;
        const records = getTreeChildrenData(level + 1, item);
        arr.push(...records);
      });
    }
    return arr;
  };
  // 优化过
  const formatChildrenData = (parent: T, parentIndex: string | number) => {
    const arr: T[] = [];
    const data = parent?.children || [];
    data.map((d, i) => {
      const key = getRowKey(d, `${parentIndex}_${i}`);
      const obj = { ...d, parentKey: parent.rowKey, rowKey: key };
      const res = formatChildrenData(obj, `${parentIndex}_${i}`);
      if (res && res.length) {
        obj.children = res;
      }
      arr.push(obj);
    });
    return arr;
  };

  // 优化过
  const formatData = useMemo(() => {
    const arr: T[] = [];
    keysRef.current = {};
    treeLevel.current = {};
    const parentLevel = 0;
    dataSource.forEach((d, i) => {
      const key = getRowKey(d, i);
      const obj = { ...d, rowKey: key };
      if (obj?.children && obj.children.length) {
        obj.children = formatChildrenData(obj, i);
      }
      arr.push(obj);
      treeLevel.current[key] = parentLevel;
      const childrenData = getTreeChildrenData(parentLevel, obj);
      arr.push(...childrenData);
    });
    return arr;
  }, [dataSource, getTreeChildrenData, getRowKey]);

  // 优化过
  const getChildrenKeys = (data: T[] = []) => {
    const keys: (number | string)[] = [];
    data.map((c, i) => {
      keys.push(c.rowKey);
      if (c?.children && c.children.length) {
        keys.push(...getChildrenKeys(c.children));
      }
    });
    return keys;
  };
  // 优化过
  const findParentByKey = (data: T[] = [], key: string | number) => {
    let item: undefined | T;
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      if (curr.rowKey === key) {
        item = curr;
        break;
      }
      if (curr?.children && curr.children.length) {
        const res = findParentByKey(curr.children, key);
        if (res) {
          item = res;
          break;
        }
      }
    }
    return item;
  };
  // 优化过
  const getSelectParent = (
    parentKey: string | number,
    selectKeys: (string | number)[],
    currSelectedKey: number | string,
  ) => {
    const arr: T[] = [];
    const parent = findParentByKey(formatData, parentKey);
    if (!parent) return arr;
    const childKeys = getChildrenKeys(parent?.children);
    const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
    if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
      arr.push(parent);
      if (parent?.parentKey) {
        arr.push(
          ...getSelectParent(parent.parentKey, [...selectKeys, currSelectedKey], parent.rowKey),
        );
      }
    }
    return arr;
  };
  // 优化过
  const getSelectedItems = (data: T[] = [], currSelectedKey?: number | string) => {
    const arr: T[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const key = d.rowKey;
      if (currSelectedKey) {
        if (currSelectedKey === key) {
          arr.push(d);
          const childrenData = getSelectedItems(d?.children);
          if (childrenData.length) {
            arr.push(...childrenData);
          }
          if (d?.parentKey) {
            arr.push(...getSelectParent(d.parentKey, selectedKeys, currSelectedKey));
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

  // 优化过
  const handleSelect = (
    isRadio: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
    const key = record.rowKey;
    const isExist = selectedKeys.indexOf(key) >= 0;

    let keys: (string | number)[];
    let selectedRows;

    if (!isExist) {
      const selectedItems = getSelectedItems(formatData, key);

      const selectedItemKeys = selectedItems.map((s, i) => {
        return s.rowKey;
      });
      selectedRows = isRadio ? [record] : [...cacheSelectedRows.current, ...selectedItems];
      keys = isRadio ? [key] : [...selectedKeys, ...selectedItemKeys];
    } else {
      const childrenKeys = getChildrenKeys(record?.children);
      keys = [record.rowKey, ...childrenKeys];

      let parentKey = record?.parentKey;
      while (parentKey) {
        keys.push(parentKey);
        const parent = findParentByKey(formatData, parentKey);
        parentKey = parent?.parentKey;
      }

      keys = selectedKeys.filter((p: string | number) => {
        return keys.indexOf(p) < 0;
      });
      selectedRows = cacheSelectedRows.current.filter((c: T) => {
        return keys.indexOf(c.rowKey) >= 0;
      });
    }

    cacheSelectedRows.current = selectedRows;

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

  const handleExpand = (expanded: boolean, record: T) => {
    const key = record.rowKey;
    if (!expandable?.expandedRowKeys) {
      setExpandedRowKeys((prev) => {
        const isExist = prev.indexOf(key) >= 0;
        return isExist ? prev.filter((p) => p !== key) : [...prev, key];
      });
    }
    expandable?.onExpand && expandable.onExpand(expanded, record);
  };
  // 优化过
  const handleTreeExpand = (treeExpanded: boolean, record: T) => {
    if (!treeProps?.expandedRowKeys) {
      setTreeExpandKeys((prev) => {
        const isExist = prev.indexOf(record.rowKey) >= 0;
        return isExist ? prev.filter((p) => p !== record.rowKey) : [...prev, record.rowKey];
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
    const key = rowData.rowKey;
    let checked = false;

    if (rowData?.children && rowData.children.length) {
      const childrenKeys = getChildrenKeys(rowData?.children);
      const allChildrenSelected = childrenKeys.every((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      const childrenSelected = childrenKeys.some((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      if (childrenKeys.length) {
        // todo 类型处理
        checked = allChildrenSelected ? true : childrenSelected ? 'indeterminate' : false;
      }
    } else {
      checked = selectedKeys.indexOf(key) >= 0;
    }

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

  return <tbody>{formatData.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
