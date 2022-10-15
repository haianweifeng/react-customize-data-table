import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { TableProps } from '../Table';
import type { ColumnsType } from '../interface';
import Tr from '../Tr';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsType<T>[];
  startRowIndex: number;
}

function Tbody<
  T extends {
    children?: T[];
    rowKey: number | string;
    parentKey?: number | string;
    treeLevel: number;
  },
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

  const cacheSelectedRows = useRef<T[]>([]);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  });

  const getAllTreeKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d) => {
      keys.push(d.rowKey);
      if (d?.children && d.children.length) {
        keys.push(...getAllTreeKeys(d.children));
      }
    });
    return keys;
  };

  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return getAllTreeKeys(dataSource);
    }
    return treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys || [];
  });

  const getTreeChildrenKeys = (parent: T) => {
    const keys: (string | number)[] = [];
    const data = parent?.children;
    if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parent.rowKey) >= 0) {
      data.forEach((item) => {
        keys.push(item.rowKey);
        const treeKeys = getTreeChildrenKeys(item);
        keys.push(...treeKeys);
      });
    }
    return keys;
  };

  const getAllExpandKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d) => {
      keys.push(d.rowKey);
      if (d?.children && d.children.length) {
        const treeChildrenData = getTreeChildrenKeys(d);
        treeChildrenData.length && keys.push(...treeChildrenData);
      }
    });
    return keys;
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(() => {
    if (
      expandable?.defaultExpandAllRows &&
      !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
    ) {
      return getAllExpandKeys(dataSource);
    }
    return expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || [];
  });

  const getTreeChildrenData = (parent: T) => {
    const arr: T[] = [];
    const data = parent?.children;
    if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parent.rowKey) >= 0) {
      data.forEach((item) => {
        arr.push(item);
        const records = getTreeChildrenData(item);
        arr.push(...records);
      });
    }
    return arr;
  };

  const list = useMemo(() => {
    if (!treeExpandKeys.length) return dataSource;

    const arr: T[] = [];

    dataSource.forEach((d) => {
      arr.push(d);
      const childrenData = getTreeChildrenData(d);
      arr.push(...childrenData);
    });

    return arr;
  }, [dataSource, getTreeChildrenData]);

  const getChildrenKeys = (data: T[] = [], all = true) => {
    const keys: (number | string)[] = [];
    data.map((c) => {
      keys.push(c.rowKey);
      if (c?.children && c.children.length && all) {
        keys.push(...getChildrenKeys(c.children));
      }
    });
    return keys;
  };

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

  const getSelectParent = (
    parentKey: string | number,
    selectKeys: (string | number)[],
    currSelectedKey: number | string,
  ) => {
    const arr: T[] = [];
    const parent = findParentByKey(list, parentKey);
    if (!parent) return arr;
    const childKeys = getChildrenKeys(parent?.children, false);
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

  const handleSelect = (isRadio: boolean, record: T, selected: boolean, event: Event) => {
    const key = record.rowKey;
    const isExist = selectedKeys.indexOf(key) >= 0;

    let keys: (string | number)[];
    let selectedRows;

    if (!isExist) {
      const selectedItems = getSelectedItems(list, key);

      const selectedItemKeys = selectedItems.map((s) => {
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
        const parent = findParentByKey(list, parentKey);
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
    let checked: boolean | 'indeterminate' = false;

    if (rowData?.children && rowData.children.length) {
      const childrenKeys = getChildrenKeys(rowData?.children);
      const allChildrenSelected = childrenKeys.every((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      const childrenSelected = childrenKeys.some((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      if (childrenKeys.length) {
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
        isTree={isTree}
        {...props}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onTreeExpand={handleTreeExpand}
      />
    );
  };

  return <tbody>{list.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
