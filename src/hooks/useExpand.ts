import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Expandable } from '../interface1';

function useExpand<T extends { key?: React.Key; children?: T[] }>(
  allKeys: React.Key[],
  expandable?: Expandable<T>,
) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(() => {
    if (
      expandable?.defaultExpandAllRows &&
      !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
    ) {
      return allKeys;
    }
    return expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || [];
  });

  const handleExpand = useCallback(
    (expanded: boolean, record: T, recordKey: number | string) => {
      if (expandable && !('expandedRowKeys' in expandable)) {
        setExpandedRowKeys((prevKeys) => {
          if (prevKeys.indexOf(recordKey) >= 0) {
            return prevKeys.filter((key) => key !== recordKey);
          }
          return [...prevKeys, recordKey];
        });
      }
      if (expandable?.onExpand) {
        expandable.onExpand(expanded, record);
      }
    },
    [expandable],
  );

  useEffect(() => {
    if (expandable && 'expandedRowKeys' in expandable) {
      setExpandedRowKeys(expandable?.expandedRowKeys || []);
    }
  }, [expandable]);

  return [expandedRowKeys, handleExpand] as const;
}
export default useExpand;
