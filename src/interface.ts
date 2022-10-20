import React from 'react';

export interface SelectionType {
  key: string;
  /** 选择项显示的文字 */
  text: React.ReactNode;
  /** 选择项点击回调 */
  onSelect: (changeableRowKeys: React.Key[]) => void;
}

export interface RowSelectionType<T> {
  /** 自定义列表选择框标题 */
  columnTitle?: React.ReactNode;
  /** 自定义列表选择框宽度 todo 把这个宽度设置到colgroup 中 */
  columnWidth?: string | number;
  /** 把选择框列固定在左边 */
  fixed?: boolean;
  /** 选择框的默认属性配置 */
  getCheckboxProps?: (record: T) => any;
  /** 渲染除了表头的勾选框 */
  renderCell?: (
    checked: boolean,
    record: T,
    index: number,
    originNode: React.ReactNode,
  ) => React.ReactNode;
  /** 指定选中项的 key 数组 */
  selectedRowKeys?: string[] | number[];
  /** 默认选中项的 key 数组 */
  defaultSelectedRowKeys?: string[] | number[];
  /** 自定义选择项配置项 */
  selections?: boolean | SelectionType[];
  /** 多选/单选 */
  type: 'radio' | 'checkbox';
  /** 选中项发生变化时的回调 */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  /** 用户手动选择/取消选择某行的回调 */
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  /** 用户手动选择/取消选择所有行的回调 */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  /** 用户手动选择反选的回调 */
  onSelectInvert?: (selectedRowKeys: string[] | number[]) => void;
  /** 用户清空选择的回调 */
  onSelectNone?: () => void;
}

export interface SorterType<T> {
  compare: (rowA: T, rowB: T) => any;
  weight: number;
}

export type CellType = { colSpan?: number; rowSpan?: number };

export interface ColumnsType<T> {
  /** 设置列的对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列样式类名 */
  className?: string;
  /** 列对应字段名 */
  dataIndex: string;
  /** 列固定 */
  fixed?: 'left' | 'right';
  /** 生成复杂数据的渲染函数 */
  render?: (text: string, record: T, index: number) => React.ReactNode;
  /** 列头显示文字 */
  title: React.ReactNode;
  /** 列宽度 */
  width?: string | number;
  // /** 最大可拖动列宽 */
  // maxWidth?: string | number;
  // /** 最小列宽 */
  // minWidth?: string | number;
  /** 超过宽度将自动省略 todo */
  ellipsis?: boolean | { showTitle: boolean };
  // todo 表头列合并 是否需要还是放到onHeaderCell 中处理
  colSpan?: number;
  /** 设置单元格属性 */
  onCell?: (record: T, rowIndex: number) => CellType;
  /** 设置头部单元格属性 todo header */
  onHeaderCell?: (column: T) => any;
  /** 默认排序 */
  defaultOrder?: 'asc' | 'desc';
  /** 排序函数 */
  sorter?: (rowA: T, rowB: T) => void | SorterType<T>;
  /** 默认筛选值 */
  defaultFilteredValue?: string[];
  /** 可以自定义筛选菜单 todo */
  filterDropdown?: () => React.ReactNode;
  /** 用于控制自定义筛选菜单是否可见 */
  filterDropdownOpen?: boolean;
  /** 筛选的受控属性 */
  filteredValue?: string[];
  /** 自定义 filter 图标 */
  filterIcon?: () => React.ReactNode;
  /** 筛选菜单项是否可搜索 */
  filterSearch?: boolean;
  /** 表头的筛选菜单项 */
  filters?: any[];
  /** 筛选函数 */
  onFilter?: () => any;
  /** 自定义筛选菜单可见变化时调用 */
  onFilterDropdownOpenChange?: (open: boolean) => any;
}

export interface ColumnsGroupType<T> extends Omit<ColumnsType<T>, 'dataIndex'> {
  children: ColumnsType<T>[];
}

export interface ColumnsWithType<T> extends ColumnsType<T> {
  type: string;
}

export interface ColumnsGroupWithType<T> extends ColumnsGroupType<T> {
  type: string;
}

export interface BaseExpandableType<T> {
  /** 初始时，是否展开所有行 */
  defaultExpandAllRows?: boolean;
  /** 默认展开的行 */
  defaultExpandedRowKeys?: string[] | number[];
  /** 展开的行，控制属性 */
  expandedRowKeys?: string[] | number[];
  /** 自定义展开图标 */
  expandIcon?: (record: T, expanded: boolean) => React.ReactNode;
  /** 点击展开图标时触发 */
  onExpand?: (expanded: boolean, record: T) => void;
}

export interface ExpandableType<T> extends BaseExpandableType<T> {
  // todo fixed 属性
  /** 可展开行嵌入哪一列之前 */
  insertBeforeColumnName?: string;
  /** 自定义展开列表头 */
  columnTitle?: React.ReactNode;
  /** 自定义展开列宽度 */
  columnWidth?: string | number;
  /** 渲染展开行的内容 */
  expandedRowRender?: (record: T, index: number, expanded: boolean) => React.ReactNode;
  /** 展开行的 className */
  expandedRowClassName?: (record: T, index: number) => string;
  /** 设置是否允许行展开 */
  rowExpandable?: (record: T) => boolean;
}

export interface TreeExpandableType<T> extends BaseExpandableType<T> {
  /** 树形数据每层的缩进 */
  indentSize?: number;
  /** 展开图标所在列名 */
  treeColumnsName?: string;
}

export interface CellProps {
  /** 列的类型 'checkbox' | 'radio' | 'expanded' | '' */
  type: string;
  /** 设置对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 样式类名 */
  className?: string;
  /** 列固定 */
  fixed?: 'left' | 'right';
  /** 单元格占据的列数 */
  colSpan: number;
  /** 单元格占据的行数 */
  rowSpan: number;
  /** 单元格渲染内容 */
  content: React.ReactNode;
}

export interface ScrollType {
  /** 设置横向滚动时table 的宽度 */
  width?: number;
  /** 设置纵向滚动时table 的高度 */
  height?: number;
}

export type KeysRefType = { [key: string]: boolean };
