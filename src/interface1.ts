import React from 'react';

export type CellType = { colSpan?: number; rowSpan?: number };

export type FilterMenusType = { label: string; value: string };

export type SorterType<T> = {
  compare: (rowA: T, rowB: T) => number;
  weight: number;
};

export type TooltipType = {
  /** tooltip 用 Tooltip 组件显示完整内容 */
  tooltip: boolean;
  /** tooltipTheme 配置 Tooltip 的主题 */
  tooltipTheme: 'dark' | 'light';
  /** 自定义渲染tooltip 气泡框 */
  renderTooltip: (trigger: React.ReactNode, tip: React.ReactNode) => React.ReactNode;
};

export interface RowSelectionType<T> {
  /** 自定义列表选择框标题 */
  columnTitle?: React.ReactNode;
  /** 自定义列表选择框宽度 todo 不支持百分比 */
  columnWidth?: string | number;
  /** 选择框的默认属性配置 */
  getCheckboxProps?: (record: T) => any;
  /** 渲染表体的勾选框 */
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
  /** 多选/单选 */
  type?: 'radio' | 'checkbox';
  /** 选中项发生变化时的回调 */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  /** 用户手动选择/取消选择某行的回调 */
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  /** 用户手动选择/取消选择所有行的回调 */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
}

export interface BaseExpandableType<T> {
  /** 初始时，是否展开所有行 */
  defaultExpandAllRows?: boolean;
  /** 默认展开的行 */
  defaultExpandedRowKeys?: string[] | number[];
  /** 展开的行，控制属性 */
  expandedRowKeys?: string[] | number[];
  /** 自定义展开图标 */
  expandIcon?: (
    record: T,
    expanded: boolean,
    onExpand?: (expanded: boolean, record: T) => void,
  ) => React.ReactNode;
  /** 点击展开图标时触发 */
  onExpand?: (expanded: boolean, record: T) => void;
}

export interface ExpandableType<T> extends BaseExpandableType<T> {
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

export type ColumnType<T> = {
  /** 设置列的类型 */
  type?: 'expand' | 'checkbox' | 'radio' | 'default';
  /** 设置列的对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列样式类名 */
  className?: string;
  /** 列对应字段名 */
  dataIndex?: string;
  /** React 需要的 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性 */
  key?: string;
  /** 列固定 如果相邻的多列需要锁定，只需指定最外侧的column即可，需要配合横向滚动才生效 */
  fixed?: 'left' | 'right';
  /** 生成复杂数据的渲染函数 */
  render?: (text: any, record: T, index: number) => React.ReactNode;
  /** 列头显示文字 */
  title?: React.ReactNode;
  /** 列宽度 */
  width?: number | string;
  // width?: string | number;
  /** 最大列宽 不支持百分比 如果是表头分组的话只支持设置在底层的列宽 todo */
  maxWidth?: number | string;
  /** 最小列宽 不支持百分比 如果是表头分组的话只支持设置在底层的列宽 todo */
  minWidth?: number | string;
  /** 超过宽度将自动省略 */
  ellipsis?: boolean | TooltipType;
  /** 表头列合并 todo 表头不考虑设置onHeaderCell */
  colSpan?: number;
  // headerColSpan?: number;
  /** 是否允许拖拽调整宽度 需开启 border 属性，且设置 width 不支持表头分组的调整宽度 */
  resizable?: boolean;
  /** 设置单元格属性 */
  onCell?: (record: T, rowIndex: number) => CellType;
  // /** 支持的排序方式 todo 好像不需要 */
  // sortDirections?: ['ascend', 'descend'];
  /** 默认排序 defaultSortOrder */
  defaultSortOrder?: 'asc' | 'desc';
  // /** 排序的受控属性,外界可用此控制列的排序 */
  // sortOrder?: 'ascend' | 'descend' | null;
  /** 排序函数 */
  sorter?: (rowA: T, rowB: T) => number | SorterType<T>;
  /** 默认筛选值 */
  defaultFilteredValue?: string[];
  /** 筛选的受控属性 */
  filteredValue?: string[];
  /** 筛选是否多选 */
  filterMultiple?: boolean;
  /** 自定义 filter 图标 */
  filterIcon?: (filtered: boolean) => React.ReactNode;
  /** 筛选菜单项是否可搜索 */
  filterSearch?: (value: string, record: FilterMenusType) => boolean | boolean;
  /** 表头的筛选菜单项 */
  filters?: FilterMenusType[];
  // /** 可以自定义筛选菜单 */
  // filterDropdown?: () => React.ReactNode;
  // /** 用于控制自定义筛选菜单是否可见 */
  // filterDropdownOpen?: boolean;
  /** 筛选函数 */
  filterMethod?: (value: string, record: T) => boolean;
  // /** 自定义筛选菜单可见变化时调用 */
  // onFilterDropdownOpenChange?: (open: boolean) => any;
};

export type ColumnGroupType<T> = Omit<ColumnType<T>, 'dataIndex'> & { children: ColumnsType<T> };

export type ColumnsType<T> = (ColumnGroupType<T> | ColumnType<T>)[];

export type PrivateColumnType<T> = ColumnType<T> & {
  ignoreRightBorder?: boolean;
  lastLeftFixed?: boolean;
  fistRightFixed?: boolean;
  _width?: number;
};

export type PrivateColumnGroupType<T> = Omit<PrivateColumnType<T>, 'dataIndex'> & {
  children: PrivateColumnsType<T>;
};

export type PrivateColumnsType<T> = (PrivateColumnGroupType<T> | PrivateColumnType<T>)[];

export interface CellProps {
  /** 列的类型 */
  type?: 'expand' | 'checkbox' | 'radio' | 'default';
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
  content: React.ReactNode | (() => React.ReactNode);
  /** 是否是最后一列向左固定的列 */
  lastLeftFixed?: boolean;
  /** 是否是向右固定的第一列 */
  fistRightFixed?: boolean;
  /** 超过宽度将自动省略 */
  ellipsis?: boolean | TooltipType;
  /** 列宽度 */
  width?: number | string;
}
