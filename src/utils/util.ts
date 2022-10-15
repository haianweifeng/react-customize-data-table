import omit from 'omit.js';

export function generateUUID() {
  const time = new Date().getTime().toString(36);
  let random = Math.random().toString(36);
  random = random.substring(2, random.length);
  return `${random}${time}`;
}

export function omitRowsProps(data: any = []) {
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
