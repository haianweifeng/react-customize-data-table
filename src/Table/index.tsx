import React, { useMemo, useRef, useState, useEffect } from 'react';
import classnames from 'classnames';
import Thead from '../Thead';
import Tbody from '../Tbody';
import Colgroup from '../Colgroup';
import type {
  RowSelectionType,
  ColumnsType,
  ColumnsGroupType,
  ExpandableType,
  TreeExpandableType,
  KeysRefType,
  ScrollType,
  ColumnsWithType,
  ColumnsGroupWithType,
} from '../interface';
import '../style/index.less';
import { omitRowsProps, toPoint } from '../utils/util';
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
  columns: ColumnsType<T>[] | ColumnsGroupType<T>[];
  /** 表格行 key */
  rowKey: string | ((row: T) => string | number);
  /** 是否显示交错斑马底纹 */
  striped?: boolean;
  /** 是否展示外边框和列边框 */
  bordered?: boolean;
  /** 页面是否加载中 */
  loading?: boolean;
  /** 是否显示表头  todo header */
  showHeader?: boolean;
  /** 表格大小 */
  size?: 'default' | 'small';
  /** 表格行的类名 */
  rowClassName?: (record: T, index: number) => string;
  /** 设置头部行属性 todo 和 onRow 用法一样是事件集合器 需要确定是不是需要 header */
  onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行事件监听器集合属性 todo columns 发生了改变 */
  onRowEvents?: (columns: any, index: number) => any;
  // todo
  pagination?: any;
  /** disabled 为 true，禁用全部选项 todo 好像不需要 */
  disabled?: (data: any) => boolean | boolean;
  /** 空数据文案 */
  empty?: string | React.ReactNode;
  /** 单行表格的预期高度 */
  rowHeight?: number;
  /** 单次render的最大行数 */
  rowsInView?: number;
  /** 表格是否可以滚动 设置滚动时表格的宽 高 */
  scroll?: ScrollType;
  /** 滚动条滚动后回调函数 */
  onScroll?: (x: number, y: number) => void;
  /** 列宽伸缩后的回调 */
  onColumnResize?: (newColumns: any) => void;
  /** 表格行是否可选择配置项 todo header 需要表头空一行 */
  rowSelection?: RowSelectionType<T>;
  /** 支持的排序方式 */
  sortDirections?: ['ascend', 'descend'];
  /** 排序取消事件 */
  onSortCancel?: (cancelName: string, order: 'ascend' | 'descend') => void;
  /** 排序事件 todo 防止向服务端请求时候需要带上相应的字段 */
  onSort: (column: any, order: 'ascend' | 'descend') => void;
  /** 配置展开属性 todo header 需要表头空一行 */
  expandable?: ExpandableType<T>;
  /** 配置树形数据属性 */
  treeProps?: TreeExpandableType<T>;
}
// todo 还未测试列宽设为百分比的情况
// todo scroll: { width, height } 设置滚动时候表格的宽度 高度
// 设置colgroup 列的宽度  然后获取每个单元格最后渲染的宽度 重新设置 colgroup 的宽度
function Table<
  T extends {
    children?: T[];
    rowKey: number | string;
    parentKey?: number | string;
    treeLevel: number;
  },
>(props: TableProps<T>) {
  const {
    className = '',
    style = {},
    size = 'default',
    scroll = {},
    showHeader = true,
    bordered,
    rowKey,
    dataSource,
    columns,
    expandable,
    rowSelection,
    treeProps,
  } = props;

  const SELECTION_EXPAND_COLUMN_WIDTH = 48;

  const keysRef = useRef<KeysRefType>({} as KeysRefType);
  const tbodyTableRef = useRef<any>(null);

  const [colWidths, setColWidths] = useState<number[]>([]);

  const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  });

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  const getRowKey = (rowData: T, i: number | string) => {
    let key;
    if (typeof rowKey === 'string') {
      key = rowData[rowKey as keyof T] as string;
    } else if (typeof rowKey === 'function') {
      key = rowKey(rowData);
    }

    if (key || key === 0) {
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
  }, [dataSource, getRowKey, formatChildrenData]);

  const getAllTreeKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d) => {
      keys.push(d.rowKey);
      if (d?.children && d.children.length) {
        keys.push(...getAllTreeKeys(d.children));
      }
    });
    return keys;
  };

  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return getAllTreeKeys(formatData);
    }
    return treeProps?.expandedRowKeys || treeProps?.defaultExpandedRowKeys || [];
  });

  const getTreeChildrenData = (parent: T) => {
    const arr: T[] = [];
    const data = parent?.children;
    if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parent.rowKey) >= 0) {
      data.forEach((item) => {
        arr.push(item);
        const records = getTreeChildrenData(item);
        arr.push(...records);
      });
    }
    return arr;
  };

  const list = useMemo(() => {
    if (!treeExpandKeys.length) return formatData;

    const arr: T[] = [];

    formatData.forEach((d) => {
      arr.push(d);
      const childrenData = getTreeChildrenData(d);
      arr.push(...childrenData);
    });

    return arr;
  }, [formatData, getTreeChildrenData]);

  const formatColumns = useMemo(() => {
    let insertIndex = 0;
    const cols = columns.map((column, index: number) => {
      const { title } = column;
      // todo 待测试 insertBeforeColumnName 在嵌套表头 只能放在最外层的columns中
      if (expandable?.insertBeforeColumnName === title) insertIndex = index;
      const cell: ColumnsWithType<T> | ColumnsGroupWithType<T> = {
        type: '',
        ...column,
      };

      return cell;
    });

    if (rowSelection) {
      cols.unshift({
        type: rowSelection.type || 'checkbox',
        dataIndex: 'checkbox',
        title: '',
        width: rowSelection?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });

      if (expandable?.insertBeforeColumnName) {
        insertIndex += 1;
      }
    }

    if (expandable && expandable?.expandedRowRender) {
      cols.splice(insertIndex, 0, {
        type: 'expanded',
        dataIndex: 'expanded',
        title: '',
        width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });
    }

    return cols;
  }, [columns, expandable, rowSelection]);

  const getFlatColumns = (cols: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[]) => {
    const temp: ColumnsWithType<T>[] = [];
    cols.map((column: any) => {
      if (column?.children) {
        temp.push(...getFlatColumns(column.children));
      } else {
        temp.push(column);
      }
    });
    return temp;
  };

  const flatColumns = useMemo(() => {
    return getFlatColumns(formatColumns);
  }, [getFlatColumns, formatColumns]);

  const converToPixel = (val: string | number | undefined) => {
    if (typeof val === 'number' || val === undefined) return val;
    const res = toPoint(val);
    const { width } = tbodyTableRef.current.getBoundingClientRect();
    return width * res;
  };
  // todo 不同例子之间切换时候头部和body 之间没有对齐
  const handleBodyRender = (tds: HTMLElement[]) => {
    const widths = [];
    for (let i = 0; i < tds.length; i++) {
      const td = tds[i];
      const { width } = td.getBoundingClientRect();
      const colSpan = Number(td.getAttribute('colspan'));

      if (colSpan === 1) {
        widths.push(width);
      } else {
        let count = 0;
        let sum = 0;
        const colWidth: any = [];
        for (let j = 0; j < colSpan; j++) {
          const w = converToPixel(flatColumns[i + j].width);
          // todo 待测试列宽设为0
          if (w) {
            count++;
            sum += w;
          }
          colWidth.push(w);
        }
        const remain = width - sum;
        const averageWidth = remain / (colSpan - count);
        const formatColWidth = colWidth.map((c: number | undefined) => {
          return c || averageWidth;
        });
        widths.push(...formatColWidth);
      }
    }
    setColWidths(widths);
  };

  const handleSelect = (keys: (number | string)[], selectAll: boolean) => {
    if (!rowSelection?.selectedRowKeys) {
      setSelectedKeys(keys);
    }
    setChecked(selectAll ? true : keys.length ? 'indeterminate' : false);
  };

  const handleTreeExpand = (treeExpanded: boolean, record: T) => {
    if (!treeProps?.expandedRowKeys) {
      setTreeExpandKeys((prev) => {
        const isExist = prev.indexOf(record.rowKey) >= 0;
        return isExist ? prev.filter((p) => p !== record.rowKey) : [...prev, record.rowKey];
      });
    }
    treeProps?.onExpand && treeProps.onExpand(treeExpanded, omitRowsProps(record)[0]);
  };

  useEffect(() => {
    if (rowSelection?.selectedRowKeys) {
      setSelectedKeys(rowSelection.selectedRowKeys);
    }
  }, [rowSelection]);

  useEffect(() => {
    if (treeProps?.expandedRowKeys) {
      setTreeExpandKeys(treeProps.expandedRowKeys);
    }
  }, [treeProps]);

  const renderBody = () => {
    return (
      <div className="table-tbody">
        <table style={{ width: scroll.width }}>
          <Colgroup colWidths={colWidths} columns={flatColumns} />
          <Tbody
            {...props}
            startRowIndex={startRowIndex}
            // dataSource={formatData}
            dataSource={list}
            columns={flatColumns}
            treeExpandKeys={treeExpandKeys}
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
            onTreeExpand={handleTreeExpand}
            onBodyRender={handleBodyRender}
          />
        </table>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="table-thead">
        <table style={{ width: scroll.width }}>
          <Colgroup colWidths={colWidths} columns={flatColumns} />
          <Thead
            checked={checked}
            columns={formatColumns}
            expandable={expandable}
            rowSelection={rowSelection}
          />
        </table>
      </div>
    );
  };

  // todo
  const tableWrapClass = classnames({
    'table-container': true,
    size: true,
    bordered: bordered,
    [className]: !!className,
  });
  return (
    <div style={style} className={tableWrapClass}>
      {showHeader ? renderHeader() : null}
      {renderBody()}
    </div>
  );
}

export default Table;
