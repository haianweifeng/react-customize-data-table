import React, { useCallback, useState, useMemo } from 'react';

function useSelection<T extends { key?: React.Key; children?: T[] }>(
  dataSource: T[],
  maxTreeLevel: number,
  levelRecordMap: Map<number, Set<T>>,
  getRecordKey: (record: T) => any,
  initSelectedKeys: React.Key[],
  selectionType?: 'checkbox' | 'radio',
) {
  const isRadio = selectionType === 'radio';
  // const isRadio = rowSelection?.type === 'radio';
  // const initSelectedKeys =
  //   rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];

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
      // const checkedRowWithKey: SelectedRowWithKey<T> = {} as SelectedRowWithKey<T>;
      const checkedKeys = new Set<React.Key>(keys);
      const halfCheckedKeys = new Set<React.Key>();

      if (!keys.length) {
        return {
          checkedKeyRecordMap,
          checkedKeys: Array.from(checkedKeys),
          halfCheckedKeys: Array.from(halfCheckedKeys),
        };
      }

      // if (isRadio) {
      //   return {
      //     checkedRowWithKey,
      //     checkedKeys: Array.from(checkedKeys),
      //     halfCheckedKeys: Array.from(halfCheckedKeys),
      //   };
      // }

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
          // const parent = findParentByKey<T>(dataSource, key, rowKey);
          if (!parentData) return;
          const parentKey = getRecordKey(parentData);
          // if (parentKey === undefined) return;
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;
          (parentData.children || []).forEach((c) => {
            const childKey = getRecordKey(c);
            // const cKey = getRowKey(rowKey, c);
            // if (cKey === undefined) return;
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
            // if (!checkedRowWithKey[parentKey]) {
            //   checkedRowWithKey[parentKey] = parent;
            // }
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
      // const checkedRowWithKey: SelectedRowWithKey<T> = {} as SelectedRowWithKey<T>;
      const checkedKeys = new Set<number | string>(keys);
      let halfCheckedKeys = new Set<number | string>(halfSelectKeys);

      // if (isRadio) {
      //   return {
      //     checkedRowWithKey,
      //     checkedKeys: Array.from(checkedKeys),
      //     halfCheckedKeys: Array.from(halfCheckedKeys),
      //   };
      // }

      // from top to bottom
      for (let level = 0; level <= maxTreeLevel; level++) {
        const records = levelRecordMap.get(level) || new Set<T>();
        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          // const key = getRowKey(rowKey, r);
          // if (key === undefined) return;
          const checked = checkedKeys.has(recordKey);
          if (!checked && !halfCheckedKeys.has(recordKey)) {
            (record?.children || []).forEach((r) => {
              const childRecordKey = getRecordKey(r);
              // const cKey = getRowKey(rowKey, c);
              // if (cKey === undefined) return;
              checkedKeys.delete(childRecordKey);
              halfCheckedKeys.delete(childRecordKey);
            });
          }
        });
      }

      const existKeys = new Set<React.Key>();
      halfCheckedKeys = new Set<React.Key>();
      for (let level = maxTreeLevel; level >= 0; level--) {
        // const records = levelRecord.current[i];
        const records = levelRecordMap.get(level) || new Set<T>();

        Array.from(records).forEach((record) => {
          const recordKey = getRecordKey(record);
          // const key = getRowKey(rowKey, r);
          // if (key === undefined) return;

          if (checkedKeys.has(recordKey)) {
            checkedKeyRecordMap.set(recordKey, record);
            // checkedRowWithKey[key] = r;
          }
          const parentData = findParentByKey(dataSource, recordKey);
          if (!parentData) return;
          const parentKey = getRecordKey(parentData);
          // const parentKey = getRowKey(rowKey, parent);
          // if (parentKey === undefined) return;
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;

          (parentData.children || []).forEach((c) => {
            const childRecordKey = getRecordKey(c);
            // const cKey = getRowKey(rowKey, c);
            // if (cKey === undefined) return;

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

  return [
    selectedKeys,
    halfSelectedKeys,
    fillMissSelectedKeys,
    removeUselessKeys,
    updateHalfSelectedKeys,
    updateSelectedKeys,
  ] as const;
}
export default useSelection;
