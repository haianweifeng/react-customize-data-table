import React from 'react';

export interface SelectionType {
  key: string;
  /** 选择项显示的文字 */
  text: React.ReactNode;
  // todo 类型
  /** 选择项点击回调 */
  onSelect: (changeableRowKeys: any) => void;
}

export interface RowSelectionType {
  /** 自定义列表选择框标题 */
  columnTitle?: React.ReactNode;
  /** 自定义列表选择框宽度 */
  columnWidth?: string | number;
  /** 选择框的默认属性配置 */
  getCheckboxProps?: (record: any) => any;
  /** 渲染除了表头的勾选框 */
  renderCell?: (
    checked: boolean,
    record: any,
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
  /** 选中项发生变化时的回调 todo 类型 */
  onChange?: (selectedRowKeys: string[] | number[], selectedRows: any, info: any) => void;
  /** 用户手动选择/取消选择某行的回调 todo 类型 */
  onSelect?: (record: any, selected: boolean, selectedRows: any, nativeEvent: any) => void;
  /** 用户手动选择/取消选择所有行的回调 todo 类型 */
  onSelectAll?: (selected: boolean, selectedRows: any, changeRows: any) => void;
  /** 用户手动选择反选的回调 todo 类型 */
  onSelectInvert?: (selectedRowKeys: string[] | number[]) => void;
  /** 用户清空选择的回调 todo 类型 */
  onSelectNone?: () => void;
}

export interface SorterType {
  compare: (rowA: any, rowB: any) => any;
  weight: number;
}

export interface ColumnsType {
  /** 设置列的对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列样式类名 */
  className?: string;
  /** 列固定 */
  fixed?: 'left' | 'right';
  /** 生成复杂数据的渲染函数 */
  render?: (text: string, record: any, index: number) => any;
  /** 列头显示文字 */
  title?: React.ReactNode;
  /** 列宽度 */
  width?: string | number;
  /** 最大可拖动列宽 */
  maxWidth?: string | number;
  /** 最小列宽 */
  minWidth?: string | number;
  /** 默认排序 */
  defaultOrder?: 'asc' | 'desc';
  /** 排序函数 */
  sorter?: (rowA: any, rowB: any) => void | SorterType;
  // todo 表头列合并 是否需要还是放到onHeaderCell 中处理
  colSpan?: number;
  /** 设置单元格属性 */
  onCell?: (record: any, rowIndex: number) => any;
  /** 设置头部单元格属性 */
  onHeaderCell?: (column: any) => any;
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
  onFilter: () => any;
  /** 自定义筛选菜单可见变化时调用 */
  onFilterDropdownOpenChange?: (open: boolean) => any;
}

export interface ExpandableType {
  /** 自定义展开列表头 */
  columnTitle?: React.ReactNode;
  /** 自定义展开列宽度 */
  columnWidth?: string | number;
  /** 树形数据每层的缩进 */
  indentSize?: number;
  /** 初始时，是否展开所有行 */
  defaultExpandAllRows?: boolean;
  /** 默认展开的行 */
  defaultExpandedRowKeys?: string[];
  /** 展开行的 className todo indent 是否需要 */
  expandedRowClassName?: (record: any, index: number, indent: number) => string;
  /** 展开的行，控制属性 */
  expandedRowKeys?: string[];
  /** 渲染不是树形数据展开行的内容 */
  expandedRowRender?: (
    record: any,
    index: number,
    indent: number,
    expanded: boolean,
  ) => React.ReactNode;
  /** 自定义展开图标 */
  expandIcon?: (props: any) => React.ReactNode;
  /** 设置是否允许行展开 */
  rowExpandable?: (record: any) => boolean;
  /** 设置是否展示行展开列 */
  onExpand?: (expanded: boolean, record: any) => void;
}
