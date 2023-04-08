import type React from 'react';
import omit from 'omit.js';
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  PrivateColumnGroupType,
  PrivateColumnType,
} from '../interface';

export function generateUUID() {
  const time = new Date().getTime().toString(36);
  let random = Math.random().toString(36);
  random = random.substring(2, random.length);
  return `${random}${time}`;
}

export function getColumnKey<T>(column: ColumnGroupType<T> | ColumnType<T>, defaultKey: React.Key) {
  if ('key' in column && column.key !== null && column.key !== undefined) {
    return column.key;
  }
  if ('dataIndex' in column && column.dataIndex) {
    return column.dataIndex;
  }
  return defaultKey;
}

export function omitColumnProps<T>(column: PrivateColumnGroupType<T> | PrivateColumnType<T>) {
  if ('children' in column && column.children.length) {
    const formatChildColumns: ColumnsType<T> = column.children.map((col) => {
      return omitColumnProps(col);
    });
    return omit({ ...column, children: formatChildColumns }, [
      '_width',
      '_columnKey',
      '_lastLeftFixed',
      '_firstRightFixed',
      '_ignoreRightBorder',
    ]);
  }
  return omit(column, [
    '_width',
    '_columnKey',
    '_lastLeftFixed',
    '_firstRightFixed',
    '_ignoreRightBorder',
  ]);
}

export function omitRowsProps<T>(data: T[] | T = []) {
  const arr: any = [];
  data = Array.isArray(data) ? data : [data];
  data.forEach((d: any) => {
    const obj = omit(d, ['treeLevel', 'rowKey', 'parentKey']);
    if (obj?.children && obj.children.length) {
      obj.children = omitRowsProps(obj.children);
    }
    arr.push(obj);
  });
  return arr;
}

export function getParent(el: HTMLElement, target: HTMLElement | string | null) {
  if (!target) return null;

  let temp: HTMLElement | null = el;
  while (temp) {
    if (typeof target === 'string') {
      // 当前DOW节点是否能完全匹配对应的css选择器
      if (temp.matches && temp.matches(target)) {
        return temp;
      }
    }
    if (temp === target) return temp;
    temp = temp.parentElement;
  }

  return null;
}

export function getPropertyValueSum(el: HTMLElement, names: string[]) {
  const styles = window.getComputedStyle(el);
  return names.reduce((prev, prop) => {
    const val = parseInt(styles.getPropertyValue(prop));
    return prev + val;
  }, 0);
}

export function extractPixel(value?: string) {
  if (value) {
    const result = value.match(/[\d|.]+(?=px)/);
    return result ? Number(result[0]) : 0;
  }
  return 0;
}
