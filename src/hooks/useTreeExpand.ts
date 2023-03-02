import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TreeExpandable } from '../interface1';

function useTreeExpand<T extends { key?: React.Key; children?: T[] }>(
  flattenRecords: T[],
  getRecordKey: (record: T) => any,
  treeProps?: TreeExpandable<T>,
) {
  const allKeys = useMemo(() => {
    return flattenRecords.map((record) => {
      return getRecordKey(record);
    });
  }, [flattenRecords, getRecordKey]);

  const [treeExpandKeys, setTreeExpandKeys] = useState<React.Key[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return allKeys;
    }
    return treeProps?.expandedRowKeys || treeProps?.defaultExpandedRowKeys || [];
  });

  const handleTreeExpand = useCallback(
    (treeExpanded: boolean, record: T, recordKey: number | string) => {
      if (treeProps && !('expandedRowKeys' in treeProps)) {
        setTreeExpandKeys((prevKeys) => {
          if (prevKeys.indexOf(recordKey) >= 0) {
            return prevKeys.filter((key) => key !== recordKey);
          } else {
            return [...prevKeys, recordKey];
          }
        });
      }
      if (treeProps?.onExpand) {
        treeProps.onExpand(treeExpanded, record);
      }
    },
    [treeProps],
  );

  useEffect(() => {
    if (treeProps && 'expandedRowKeys' in treeProps) {
      setTreeExpandKeys(treeProps?.expandedRowKeys || []);
    }
  }, [treeProps]);

  return [treeExpandKeys, handleTreeExpand] as const;
}
export default useTreeExpand;
