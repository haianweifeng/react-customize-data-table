import omit from 'omit.js';
import type { RowKeyType } from '../interface';

export function generateUUID() {
  const time = new Date().getTime().toString(36);
  let random = Math.random().toString(36);
  random = random.substring(2, random.length);
  return `${random}${time}`;
}
// todo 待测试如果用的数据不存在的字段 record.desc  desc 不存在
export function getRowKey<T>(rowKey: RowKeyType<T>, rowData: T) {
  let key;
  if (typeof rowKey === 'string') {
    key = rowData[rowKey as keyof T] as string;
  } else if (typeof rowKey === 'function') {
    key = rowKey(rowData);
  }

  if (key === undefined) {
    // key = i;
    // console.error(
    //   `Each record should have a unique "key" prop,or set "rowKey" to an unique primary key.Already converted with ${i}`,
    // );
    console.error(
      `Each record should have a unique "key" prop,or set "rowKey" to an unique primary key.`,
    );
  }
  return key;
}

export function findParentByKey<T extends { key?: number | string; children?: T[] }>(
  data: T[] = [],
  currKey: string | number,
  rowKey: RowKeyType<T>,
  parent?: T,
): T | undefined {
  for (let i = 0; i < data.length; i++) {
    const curr = data[i];
    const key = getRowKey(rowKey, curr);
    if (key === currKey) return parent;
    if (curr?.children && curr.children.length) {
      const res = findParentByKey(curr.children, currKey, rowKey, curr);
      if (res) return res;
    }
  }
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

export function parseValue(value: string | number | undefined | null) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (/^\d+(?:px)?$/.test(value)) {
      return parseInt(value, 10);
    } else {
      return value;
    }
  }
  return null;
}

export function toPoint(value: string | number | null) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const val = value.replace('%', '');
    return Number(val) / 100;
  }
  return null;
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

export function getScrollbarWidth() {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode!.removeChild(outer);

  return widthNoScroll - widthWithScroll;
}

// const getChildrenKeys = (data: T[] = [], all = true) => {
//   const keys: (number | string)[] = [];
//   data.map((c) => {
//     keys.push(c.rowKey);
//     if (c?.children && c.children.length && all) {
//       keys.push(...getChildrenKeys(c.children));
//     }
//   });
//   return keys;
// };
//
// const findParentByKey = (data: T[] = [], key: string | number) => {
//   let item: undefined | T;
//   for (let i = 0; i < data.length; i++) {
//     const curr = data[i];
//     if (curr.rowKey === key) {
//       item = curr;
//       break;
//     }
//     if (curr?.children && curr.children.length) {
//       const res = findParentByKey(curr.children, key);
//       if (res) {
//         item = res;
//         break;
//       }
//     }
//   }
//   return item;
// };
//
// const getSelectParent = (
//   parentKey: string | number,
//   selectKeys: (string | number)[],
//   currSelectedKey: number | string,
// ) => {
//   const arr: T[] = [];
//   const parent = findParentByKey(dataSource, parentKey);
//   if (!parent) return arr;
//   const childKeys = getChildrenKeys(parent?.children, false);
//   const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
//   if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
//     arr.push(parent);
//     if (parent?.parentKey) {
//       arr.push(
//         ...getSelectParent(parent.parentKey, [...selectKeys, currSelectedKey], parent.rowKey),
//       );
//     }
//   }
//   return arr;
// };
//
// export function getSelectedItems(data: T[] = [], currSelectedKey?: number | string) {
//   const arr: T[] = [];
//
//   for (let i = 0; i < data.length; i++) {
//     const d = data[i];
//     const key = d.rowKey;
//     if (currSelectedKey) {
//       if (currSelectedKey === key) {
//         arr.push(d);
//         const childrenData = getSelectedItems(d?.children);
//         if (childrenData.length) {
//           arr.push(...childrenData);
//         }
//         if (d?.parentKey) {
//           arr.push(...getSelectParent(d.parentKey, selectedKeys, currSelectedKey));
//         }
//       }
//     } else {
//       arr.push(d);
//       const childrenData = getSelectedItems(d?.children);
//       if (childrenData.length) {
//         arr.push(...childrenData);
//       }
//     }
//   }
//
//   return arr;
// }
