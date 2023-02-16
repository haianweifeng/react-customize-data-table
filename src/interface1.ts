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

export type ColumnType<T> = {
  /** 设置列的对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列样式类名 */
  className?: string;
  /** 列对应字段名 */
  dataIndex: string;
  /** 列固定 如果相邻的多列需要锁定，只需指定最外侧的column即可，需要配合横向滚动才生效 */
  fixed?: 'left' | 'right';
  /** 生成复杂数据的渲染函数 */
  render?: (text: string, record: T, index: number) => React.ReactNode;
  /** 列头显示文字 */
  title: React.ReactNode;
  /** 列宽度 */
  width?: number | string;
  // width?: string | number;
  /** 最大列宽 不支持百分比 如果是表头分组的话只支持设置在底层的列宽 todo */
  maxWidth?: number | string;
  /** 最小列宽 不支持百分比 如果是表头分组的话只支持设置在底层的列宽 todo */
  minWidth?: number | string;
  /** 超过宽度将自动省略 */
  ellipsis?: boolean | TooltipType;
  /** 表头列合并 todo 是不是要换成 onHeaderCell */
  headerColSpan?: number;
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

export type ColumnsType<T> = ColumnType<T>[];

export type ColumnGroupType<T> = Omit<ColumnsType<T>, 'dataIndex'> & { children: ColumnsType<T> };

export type ColumnGroupsType<T> = ColumnGroupType<T>[];
