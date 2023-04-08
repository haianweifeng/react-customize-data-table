import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { TreeExpandable } from '../interface';

function useTreeExpand<T extends { key?: React.Key; children?: T[] }>(
  allKeys: React.Key[],
  treeProps?: TreeExpandable<T>,
) {
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
      if (treeProps && !treeProps?.expandedRowKeys) {
        setTreeExpandKeys((prevKeys) => {
          if (!treeExpanded) {
            return prevKeys.filter((key) => key !== recordKey);
          } else {
            return [...prevKeys, recordKey];
          }
        });
      }
      if (typeof treeProps?.onExpand === 'function') {
        treeProps.onExpand(treeExpanded, record);
      }
    },
    [treeProps],
  );

  useEffect(() => {
    if (treeProps && 'expandedRowKeys' in treeProps && treeProps.expandedRowKeys) {
      setTreeExpandKeys(treeProps?.expandedRowKeys || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeProps?.expandedRowKeys]);

  return [treeExpandKeys, handleTreeExpand] as const;
}
export default useTreeExpand;
