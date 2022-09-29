import React from 'react';
import { RowSelectionType, ColumnsType, ExpandableType } from '../interface';

interface TableProps {
  /** 表格的样式类名 */
  className?: string;
  /** 表格的行内样式 */
  style?: React.CSSProperties;
  /** 表格的子元素 */
  children?: React.ReactNode;
  /** 表格展示的数据源 */
  dataSource: any[];
  /** 表格列的配置 */
  columns: ColumnsType[];
  /** 表格行 key */
  rowKey: string | ((row: any) => string);
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
  rowClassName?: (record: any, index: number) => string;
  /** 设置头部行属性 */
  onHeaderRow?: (columns: any, index: number) => any;
  /** 设置行事件监听器集合属性 */
  onRowEvents?: (columns: any, index: number) => any;
  // todo
  pagination?: any;
  /** disabled 为 true，禁用全部选项 */
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
  rowSelection?: RowSelectionType;
  /** 支持的排序方式 */
  sortDirections?: ['ascend', 'descend'];
  /** 排序取消事件 */
  onSortCancel?: (cancelName: string, order: 'ascend' | 'descend') => void;
  /** 排序事件 todo 防止向服务端请求时候需要带上相应的字段 */
  onSort: (column: any, order: 'ascend' | 'descend') => void;
  /** 配置展开属性 */
  expandable?: ExpandableType;
  /** 配置树形数据属性 */
  treeProps?: ExpandableType;
}
