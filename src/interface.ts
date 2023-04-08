import type React from 'react';

export type FilterState<T> = {
  key: React.Key;
  filteredValue: React.Key[];
  filterMethod?: (value: React.Key, record: T) => boolean;
};

export type SortState<T> = {
  key: React.Key;
  order: 'asc' | 'desc' | null;
  weight?: number;
  sorter: (rowA: T, rowB: T) => number;
};

export type RowKeyType<T> = string | ((row: T) => string | number);

export type LocalType = {
  filterSearchPlaceholder: string;
  filterEmptyText: string;
  filterResult: string;
  filterConfirm: string;
  filterReset: string;
};

export type CellType = { colSpan?: number; rowSpan?: number };

export type FilterMenus = { label: string; value: string };

export type ResizeInfo = { startPosX: number; resizingRect: DOMRect };

export type CachePosition = { index: number; top: number; bottom: number; height: number };

export type Sorter<T> = {
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

export interface RowSelection<T> {
  /** 自定义列表选择框标题 */
  columnTitle?: React.ReactNode;
  /** 自定义列表选择框宽度 */
  columnWidth?: string | number;
  /** 选择框的默认属性配置 */
  getCheckboxProps?: (record: T) => any;
  /** 渲染表体的勾选框 适合不是树形数据中允许用户自定义 */
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

export interface BaseExpandable<T> {
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

export interface Expandable<T> extends BaseExpandable<T> {
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

export interface TreeExpandable<T> extends BaseExpandable<T> {
  /** 树形数据每层的缩进 */
  indentSize?: number;
  /** 展开图标所在列名 */
  treeColumnsName?: string;
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
  /** 最大列宽 如果是表头分组的话只支持设置在底层的列宽 */
  maxWidth?: number | string;
  /** 最小列宽 如果是表头分组的话只支持设置在底层的列宽 */
  minWidth?: number | string;
  /** 超过宽度将自动省略 */
  ellipsis?: boolean | TooltipType;
  /** 表头列合并 */
  colSpan?: number;
  /** 是否允许拖拽调整宽度 需开启 border 属性，对于多级表头只支持最后一级表头拖拽调整宽度 */
  resizable?: boolean;
  /** 设置单元格属性 */
  onCell?: (record: T, rowIndex: number) => CellType;
  /** 默认排序 defaultSortOrder */
  defaultSortOrder?: 'asc' | 'desc';
  /** 排序的受控属性,外界可用此控制列的排序 */
  sortOrder?: 'asc' | 'desc' | null;
  /** 排序函数 */
  sorter?: (rowA: T, rowB: T) => number | Sorter<T>;
  /** 自定义排序图标 */
  renderSorter?: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: (event: React.MouseEvent) => void;
    triggerDesc: (event: React.MouseEvent) => void;
  }) => React.ReactNode;
  /** 默认筛选值 */
  defaultFilteredValue?: string[];
  /** 筛选的受控属性 */
  filteredValue?: string[];
  /** 筛选是否多选 */
  filterMultiple?: boolean;
  /** 自定义 filter 图标 */
  filterIcon?: (filtered: boolean) => React.ReactNode;
  /** 筛选菜单项是否可搜索 */
  filterSearch?: (value: string, record: FilterMenus) => boolean | boolean;
  /** 表头的筛选菜单项 */
  filters?: FilterMenus[];
  /** 筛选函数 */
  filterMethod?: (value: React.Key, record: T) => boolean;
};

export type ColumnGroupType<T> = Omit<ColumnType<T>, 'dataIndex' | 'type'> & {
  children: Omit<ColumnsType<T>, 'type'>;
};

export type ColumnsType<T> = (ColumnGroupType<T> | ColumnType<T>)[];

export type PrivateColumnType<T> = ColumnType<T> & {
  _width?: number;
  _columnKey: React.Key;
  _lastLeftFixed?: boolean;
  _firstRightFixed?: boolean;
  _ignoreRightBorder?: boolean;
};

export type PrivateColumnGroupType<T> = Omit<PrivateColumnType<T>, 'dataIndex' | 'type'> & {
  children: Omit<PrivateColumnsType<T>, 'type'>;
};

export type PrivateColumnsType<T> = (PrivateColumnGroupType<T> | PrivateColumnType<T>)[];
