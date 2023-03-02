import React, { useMemo, useCallback } from 'react';

function useFlattenData<T extends { key?: React.Key; children?: T[] }>(dataSource: T[]) {
  const flatRecord = useCallback((data: T[]) => {
    const records: T[] = [];
    data.map((d) => {
      records.push(d);
      if (d && Array.isArray(d.children)) {
        records.push(...flatRecord(d.children));
      }
    });
    return records;
  }, []);

  const records = useMemo(() => {
    return flatRecord(dataSource);
  }, [dataSource, flatRecord]);

  return records;
}
export default useFlattenData;
