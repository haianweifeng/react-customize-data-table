import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Expandable } from '../interface';

function useExpand<T extends Record<string, any> = any>(
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
      if (expandable && !expandable?.expandedRowKeys) {
        setExpandedRowKeys((prevKeys) => {
          if (!expanded) {
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
    if (expandable && 'expandedRowKeys' in expandable && expandable.expandedRowKeys) {
      setExpandedRowKeys(expandable?.expandedRowKeys || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandable?.expandedRowKeys]);

  return [expandedRowKeys, handleExpand] as const;
}
export default useExpand;
