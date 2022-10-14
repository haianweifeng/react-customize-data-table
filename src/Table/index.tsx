import React, { useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import Tbody from '../Tbody';
import type {
  RowSelectionType,
  ColumnsType,
  ExpandableType,
  TreeExpandableType,
  KeysRefType,
} from '../interface';
import '../style/index.less';
// import styles from './index.less';

export interface TableProps<T> {
  /** 表格的样式类名 */
  className?: string;
  /** 表格的行内样式 */
  style?: React.CSSProperties;
  /** 表格的子元素 */
  children?: React.ReactNode;
  /** 表格展示的数据源 */
  dataSource: T[];
  /** 表格列的配置 */
  columns: ColumnsType<T>[];
  /** 表格行 key */
  rowKey: string | ((row: T) => string | number);
  /** 是否显示交错斑马底纹 */
  striped?: boolean;
  /** 是否展示外边框和列边框 */
  bordered?: boolean;
  /** 页面是否加载中 */
  loading?: boolean;
  /** 是否显示表头 */
  showHeader?: boolean;
  /** 表格大小 */
  size?: 'default' | 'small';
  /** 表格行的类名 */
  rowClassName?: (record: T, index: number) => string;
  /** 设置头部行属性 */
  onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行事件监听器集合属性 */
  onRowEvents?: (columns: any, index: number) => any;
  // todo
  pagination?: any;
  /** disabled 为 true，禁用全部选项 todo 好像不需要 */
  disabled?: (data: any) => boolean | boolean;
  /** 空数据文案 */
  empty?: string | React.ReactNode;
  /** 超过宽度将自动省略 */
  ellipsis?: { showTitle: boolean; width: number | string };
  /** 单行表格的预期高度 */
  rowHeight?: number;
  /** 单次render的最大行数 */
  rowsInView?: number;
  /** 虚拟滚动条方向 不设置则使用原生滚动条 */
  scroll?: 'both' | 'x' | 'y';
  /** 滚动条滚动后回调函数 */
  onScroll?: (x: number, y: number) => void;
  /** 列宽伸缩后的回调 */
  onColumnResize?: (newColumns: any) => void;
  /** 表格行是否可选择配置项 */
  rowSelection?: RowSelectionType<T>;
  /** 支持的排序方式 */
  sortDirections?: ['ascend', 'descend'];
  /** 排序取消事件 */
  onSortCancel?: (cancelName: string, order: 'ascend' | 'descend') => void;
  /** 排序事件 todo 防止向服务端请求时候需要带上相应的字段 */
  onSort: (column: any, order: 'ascend' | 'descend') => void;
  /** 配置展开属性 */
  expandable?: ExpandableType<T>;
  /** 配置树形数据属性 */
  treeProps?: TreeExpandableType<T>;
}

function Table<
  T extends {
    children?: T[];
    rowKey: number | string;
    parentKey?: number | string;
    treeLevel: number;
  },
>(props: TableProps<T>) {
  const { className = '', style = {}, size = 'default', bordered, rowKey, dataSource } = props;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  const getRowKey = (rowData: T, i: number | string) => {
    let key;
    if (typeof rowKey === 'string') {
      key = rowData[rowKey as keyof T] as string;
    } else if (typeof rowKey === 'function') {
      key = rowKey(rowData);
    }

    if (key) {
      if (!(typeof key === 'string' || typeof key === 'number')) {
        console.error(new Error(`expect Tr has a string or a number key, get '${typeof key}'`));
      }
    } else {
      key = i;
      console.warn(
        `Tr has no set unique key.Already converted with ${i},Please sure Tr has unique key.`,
      );
    }

    if (keysRef.current[key]) {
      const converted = `converted_key_${i}`;
      let tips = `Tr has same key:(${key}).Already converted with (${converted}), Please sure Tr has unique key.`;
      console.warn(tips);
      key = converted;
    }
    keysRef.current[key] = true;

    return key;
  };

  const formatChildrenData = (parent: T, parentIndex: string | number, level: number = 0) => {
    const arr: T[] = [];
    const data = parent?.children || [];
    data.map((d, i) => {
      const key = getRowKey(d, `${parentIndex}_${i}`);
      const obj = { ...d, parentKey: parent.rowKey, rowKey: key, treeLevel: level + 1 };
      const res = formatChildrenData(obj, `${parentIndex}_${i}`, level + 1);
      if (res && res.length) {
        obj.children = res;
      }
      arr.push(obj);
    });
    return arr;
  };

  const formatData = useMemo(() => {
    const arr: T[] = [];
    keysRef.current = {};
    const parentLevel = 0;

    dataSource.forEach((d, i) => {
      const key = getRowKey(d, i);
      const obj = { ...d, rowKey: key, treeLevel: parentLevel };
      if (obj?.children && obj.children.length) {
        obj.children = formatChildrenData(obj, i, parentLevel);
      }
      arr.push(obj);
    });
    return arr;
  }, [dataSource, getRowKey]);

  const renderBody = () => {
    const { dataSource, columns, ...others } = props;
    return (
      <div>
        <table>
          <Tbody startRowIndex={startRowIndex} {...props} dataSource={formatData} />
        </table>
      </div>
    );
  };

  // todo
  const tableWrapClass = classnames({
    size: true,
    bordered: bordered,
    [className]: !!className,
  });
  return (
    <div style={style} className={tableWrapClass}>
      {renderBody()}
    </div>
  );
}

export default Table;
