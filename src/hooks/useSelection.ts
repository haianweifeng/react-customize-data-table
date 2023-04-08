import type React from 'react';
import { useCallback, useState, useMemo, useEffect } from 'react';
import type { RowSelection } from '../interface';

function useSelection<T extends { key?: React.Key; children?: T[] }>(
  dataSource: T[],
  maxTreeLevel: number,
  levelRecordMap: Map<number, Set<T>>,
  getRecordKey: (record: T) => any,
  rowSelection?: RowSelection<T>,
  selectionType?: 'checkbox' | 'radio',
) {
  const isRadio = selectionType === 'radio';

  const findParentByKey = useCallback(
    (data: T[], targetKey: React.Key, parentData?: T): T | undefined => {
      for (let i = 0; i < data.length; i++) {
        const currData = data[i];
        const key = getRecordKey(currData);
        if (key === targetKey) return parentData;
        if (currData?.children && currData.children.length) {
          const res = findParentByKey(currData.children, targetKey, currData);
          if (res) return res;
        }
      }
      return undefined;
    },
    [getRecordKey],
  );

  const fillMissSelectedKeys = useCallback(
    (keys: React.Key[]) => {
      const checkedKeyRecordMap = new Map<React.Key, T>();
      const checkedKeys = new Set<React.Key>(keys);
      const halfCheckedKeys = new Set<React.Key>();

      if (!keys.length) {
        return {
          checkedKeyRecordMap,
          checkedKeys: Array.from(checkedKeys),
          halfCheckedKeys: Array.from(halfCheckedKeys),
        };
      }

      // from top to bottom
      for (let level = 0; level <= maxTreeLevel; level++) {
        const records = levelRecordMap.get(level) || new Set<T>();
        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          if (checkedKeys.has(recordKey)) {
            checkedKeyRecordMap.set(recordKey, record);
            (record?.children || []).forEach((r) => {
              const childRecordKey = getRecordKey(r);
              checkedKeys.add(childRecordKey);
              checkedKeyRecordMap.set(childRecordKey, r);
            });
          }
        });
      }

      // from bottom to top
      const existKeys = new Set<React.Key>();
      for (let level = maxTreeLevel; level >= 0; level--) {
        const records = levelRecordMap.get(level) || new Set<T>();
        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          const parentData = findParentByKey(dataSource, recordKey);
          if (!parentData) return;
          const parentKey = getRecordKey(parentData);
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;
          (parentData.children || []).forEach((c) => {
            const childKey = getRecordKey(c);
            const exist = checkedKeys.has(childKey);
            if ((exist || halfCheckedKeys.has(childKey)) && !isHalfChecked) {
              isHalfChecked = true;
            }
            if (allChecked && !exist) {
              allChecked = false;
            }
          });

          if (allChecked) {
            checkedKeys.add(parentKey);
            checkedKeyRecordMap.set(parentKey, parentData);
          }
          if (isHalfChecked) {
            halfCheckedKeys.add(parentKey);
          }
          existKeys.add(parentKey);
        });
      }

      return {
        checkedKeyRecordMap,
        checkedKeys: Array.from(checkedKeys),
        halfCheckedKeys: Array.from(halfCheckedKeys),
      };
    },
    [dataSource, getRecordKey, maxTreeLevel, levelRecordMap, findParentByKey],
  );

  const removeUselessKeys = useCallback(
    (keys: React.Key[], halfSelectKeys: React.Key[]) => {
      const checkedKeyRecordMap = new Map<React.Key, T>();
      const checkedKeys = new Set<number | string>(keys);
      let halfCheckedKeys = new Set<number | string>(halfSelectKeys);

      // from top to bottom
      for (let level = 0; level <= maxTreeLevel; level++) {
        const records = levelRecordMap.get(level) || new Set<T>();
        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          const checked = checkedKeys.has(recordKey);
          if (!checked && !halfCheckedKeys.has(recordKey)) {
            (record?.children || []).forEach((r) => {
              const childRecordKey = getRecordKey(r);
              checkedKeys.delete(childRecordKey);
              halfCheckedKeys.delete(childRecordKey);
            });
          }
        });
      }

      const existKeys = new Set<React.Key>();
      halfCheckedKeys = new Set<React.Key>();
      for (let level = maxTreeLevel; level >= 0; level--) {
        const records = levelRecordMap.get(level) || new Set<T>();

        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          if (checkedKeys.has(recordKey)) {
            checkedKeyRecordMap.set(recordKey, record);
          }
          const parentData = findParentByKey(dataSource, recordKey);
          if (!parentData) return;
          const parentKey = getRecordKey(parentData);
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;

          (parentData.children || []).forEach((c) => {
            const childRecordKey = getRecordKey(c);
            if (
              (checkedKeys.has(childRecordKey) || halfCheckedKeys.has(childRecordKey)) &&
              !isHalfChecked
            ) {
              isHalfChecked = true;
            }
            if (allChecked && !checkedKeys.has(childRecordKey)) {
              allChecked = false;
            }
          });

          if (!allChecked) {
            checkedKeys.delete(parentKey);
          }
          if (isHalfChecked) {
            halfCheckedKeys.add(parentKey);
          }
          existKeys.add(parentKey);
        });
      }

      return {
        checkedKeyRecordMap,
        checkedKeys: Array.from(checkedKeys),
        halfCheckedKeys: Array.from(halfCheckedKeys),
      };
    },
    [dataSource, getRecordKey, maxTreeLevel, levelRecordMap, findParentByKey],
  );

  const initSelectedKeys = useMemo(() => {
    return rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  }, [rowSelection?.selectedRowKeys, rowSelection?.defaultSelectedRowKeys]);

  const { checkedKeys: initCheckedKeys, halfCheckedKeys: initHalfCheckedKeys } = useMemo(() => {
    return fillMissSelectedKeys(initSelectedKeys);
  }, [initSelectedKeys, fillMissSelectedKeys]);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(() => {
    return isRadio ? initSelectedKeys : initCheckedKeys;
  });

  const [halfSelectedKeys, setHalfSelectedKeys] = useState<React.Key[]>(() => {
    return isRadio ? initSelectedKeys : initHalfCheckedKeys;
  });

  const updateHalfSelectedKeys = useCallback((keys: React.Key[]) => {
    setHalfSelectedKeys(keys);
  }, []);

  const updateSelectedKeys = useCallback((keys: React.Key[]) => {
    setSelectedKeys(keys);
  }, []);

  const handleSelect = useCallback(
    (
      radio: boolean,
      isChecked: boolean,
      record: T,
      recordKey: React.Key,
      selected: boolean,
      event: Event,
    ) => {
      let keys: React.Key[];
      let halfKeys: React.Key[] = [...halfSelectedKeys];
      let selectedRecords: T[];
      let finalSelectedKeys: React.Key[];
      if (!isChecked) {
        keys = radio ? [recordKey] : [...selectedKeys, recordKey];
      } else {
        keys = selectedKeys.filter((key) => key !== recordKey);
        halfKeys = halfSelectedKeys.filter((halfKey) => halfKey !== recordKey);
      }
      if (selected) {
        if (!radio) {
          const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(keys);
          finalSelectedKeys = checkedKeys;
          selectedRecords = [...checkedKeyRecordMap.values()];
          setHalfSelectedKeys(halfCheckedKeys);
        } else {
          finalSelectedKeys = [...keys];
          selectedRecords = [record];
          setHalfSelectedKeys([]);
        }
      } else {
        if (!radio) {
          const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = removeUselessKeys(
            keys,
            halfKeys,
          );
          finalSelectedKeys = checkedKeys;
          selectedRecords = [...checkedKeyRecordMap.values()];
          setHalfSelectedKeys(halfCheckedKeys);
        } else {
          finalSelectedKeys = [];
          selectedRecords = [];
          setHalfSelectedKeys([]);
        }
      }

      if (!rowSelection?.selectedRowKeys) {
        setSelectedKeys(finalSelectedKeys);
      }

      if (typeof rowSelection?.onSelect === 'function') {
        rowSelection.onSelect(record, selected, selectedRecords, event);
      }

      if (typeof rowSelection?.onChange === 'function') {
        rowSelection?.onChange(finalSelectedKeys, selectedRecords);
      }
    },
    [selectedKeys, halfSelectedKeys, rowSelection, fillMissSelectedKeys, removeUselessKeys],
  );

  useEffect(() => {
    if (rowSelection && rowSelection?.selectedRowKeys) {
      if (selectionType === 'checkbox') {
        const { checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(
          rowSelection.selectedRowKeys || [],
        );
        setSelectedKeys(checkedKeys);
        setHalfSelectedKeys(halfCheckedKeys);
      } else {
        setHalfSelectedKeys([]);
        setSelectedKeys(rowSelection.selectedRowKeys || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionType, rowSelection?.selectedRowKeys, fillMissSelectedKeys]);

  return [
    selectedKeys,
    halfSelectedKeys,
    fillMissSelectedKeys,
    handleSelect,
    updateHalfSelectedKeys,
    updateSelectedKeys,
  ] as const;
}
export default useSelection;
