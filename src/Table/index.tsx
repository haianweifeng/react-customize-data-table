import React, { useMemo, useRef, useState, useEffect, useCallback, useContext } from 'react';
import classnames from 'classnames';
import Thead from '../Thead';
import Tbody from '../Tbody';
import Colgroup from '../Colgroup';
import Pagination from '../Pagination';
import Spin from '../Spin';
import type {
  RowSelectionType,
  ColumnsType,
  ColumnsGroupType,
  ExpandableType,
  TreeExpandableType,
  ColumnsWithType,
  ColumnsGroupWithType,
  SelectedRowWithKey,
  TreeLevelType,
  LevelRecordType,
  RowKeyType,
  SorterStateType,
  SorterType,
  SortInfoType,
  FilterStateType,
  FilterInfoType,
  CachePositionType,
  ResizeInfoType,
  LocalType,
} from '../interface';
import VirtualList from '../VirtualList';
import type { PaginationProps } from '../index';
import '../style/index.less';
import { getRowKey, toPoint, findParentByKey, parseValue } from '../utils/util';
import { BAR_WIDTH } from '../utils/constant';
import LocaleContext from '../LocalProvider/context';
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
  /** 表格行 key 默认取值key */
  rowKey: RowKeyType<T>;
  /** 是否显示交错斑马底纹 */
  striped?: boolean;
  /** 是否展示外边框和列边框 */
  bordered?: boolean;
  /** 页面是否加载中 */
  loading?: boolean | React.ReactNode;
  /** 是否显示表头 */
  showHeader?: boolean;
  /** 表格大小 */
  size?: 'default' | 'small' | 'large';
  /** 表格行的类名 */
  rowClassName?: (record: T, index: number) => string;
  // /** 设置头部行属性 todo */
  // onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行属性 */
  onRow?: (record: T, index: number) => any;
  /** 分页 */
  pagination?: PaginationProps;
  // /** disabled 为 true，禁用全部选项 todo 好像不需要 */
  // disabled?: (data: any) => boolean | boolean;
  /** 空数据文案 */
  empty?: string | React.ReactNode;
  /** 默认文案设置 */
  locale?: LocalType;
  /** 单行表格的预期高度 todo */
  rowHeight?: number;
  /** 单次render的最大行数 如果单次渲染的行数不足以撑开容器的高度则renderMaxRows 自动取值为容器可容纳的行数值 todo */
  // rowsInView?: number;
  renderMaxRows?: number;
  /** 表格宽度 固定列或者产生横向滚动一定要设置width */
  width?: number;
  /** 表格高度，默认为自动高度，如果表格内容大于此值，会固定表头 */
  height?: number;
  /** 是否开启虚拟列表 todo */
  virtual?: boolean;
  // /** 表格是否可以滚动 超过最大宽高时候就可以滚动 todo */
  // scroll?: ScrollType;
  /** 滚动条滚动后回调函数 todo */
  onScroll?: (x: number, y: number) => void;
  /** 列宽伸缩后的回调 */
  onColumnResize?: (
    newWidth: number,
    oldWidth: number,
    column: ColumnsType<T>,
    event: Event,
  ) => void;
  /** 表格行是否可选择配置项 todo header 需要表头空一行 */
  rowSelection?: RowSelectionType<T>;
  /** 自定义排序图标 */
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  // /** 排序取消事件 */
  // onSortCancel?: (col: ColumnsType<T>, order: 'asc' | 'desc') => void;
  /** 排序事件 */
  onSort?: (sortInfo: SortInfoType[]) => void;
  /** 筛选事件 */
  onFilter?: (filterInfo: FilterInfoType) => void;
  /** 配置展开属性 todo header 需要表头空一行 */
  expandable?: ExpandableType<T>;
  /** 配置树形数据属性 */
  treeProps?: TreeExpandableType<T>;
}
// todo 还未测试列宽设为百分比的情况
// todo bug columnWidth: '160' 不起作用
// todo bug 如果dataIndex 在data 中找不到对应字段数据 是不是要加个key 给用户自己设置
// 设置colgroup 列的宽度  然后获取每个单元格最后渲染的宽度 重新设置 colgroup 的宽度
function Table<T extends { key?: number | string; children?: T[] }>(props: TableProps<T>) {
  const localeContext = useContext(LocaleContext);

  const {
    className = '',
    style = {},
    width,
    height,
    size = 'default',
    showHeader = true,
    bordered,
    rowKey = 'key',
    dataSource,
    // columns,
    columns: originColumns,
    expandable,
    rowSelection,
    treeProps,
    renderSorter,
    onSort,
    onFilter,
    pagination,
    loading,
    renderMaxRows = 20,
    rowHeight = 46,
    virtual,
    empty = 'No data',
    onColumnResize,
    locale = localeContext.table,
    onHeaderRow,
  } = props;

  const SELECTION_EXPAND_COLUMN_WIDTH = 44;

  const resizeLineRef = useRef<HTMLDivElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<any>(null);
  const maxTreeLevel = useRef<number>(0);
  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);
  const levelRecord = useRef<LevelRecordType<T>>({} as LevelRecordType<T>);

  // const cachePosition = useRef<CachePositionType[]>([]);
  const [cachePosition, setCachePosition] = useState<CachePositionType[]>(() => {
    return dataSource.map((d, index) => {
      return {
        index,
        top: index * rowHeight,
        bottom: (index + 1) * rowHeight,
        height: rowHeight,
      };
    });
  });

  const [columns, setColumns] = useState<(ColumnsType<T> | ColumnsGroupType<T>)[]>(originColumns);

  const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);

  const isRadio = rowSelection?.type === 'radio';

  const removeUselessKeys = useCallback(
    (keys: (string | number)[], halfSelectKeys: (string | number)[]) => {
      const checkedRowWithKey: SelectedRowWithKey<T> = {} as SelectedRowWithKey<T>;
      const checkedKeys = new Set<number | string>(keys);
      let halfCheckedKeys = new Set<number | string>(halfSelectKeys);

      if (isRadio) {
        return {
          checkedRowWithKey,
          checkedKeys: Array.from(checkedKeys),
          halfCheckedKeys: Array.from(halfCheckedKeys),
        };
      }

      // from top to bottom
      for (let i = 0; i <= maxTreeLevel.current; i++) {
        const records = levelRecord.current[i];
        records.forEach((r) => {
          const key = getRowKey(rowKey, r);
          if (key === undefined) return;
          const checked = checkedKeys.has(key);
          if (!checked && !halfCheckedKeys.has(key)) {
            (r?.children || []).forEach((c) => {
              const cKey = getRowKey(rowKey, c);
              if (cKey === undefined) return;
              checkedKeys.delete(cKey);
              halfCheckedKeys.delete(cKey);
            });
          }
        });
      }

      const existKeys = new Set<number | string>();
      halfCheckedKeys = new Set<number | string>();
      for (let i = maxTreeLevel.current; i >= 0; i--) {
        const records = levelRecord.current[i];

        records.forEach((r) => {
          const key = getRowKey(rowKey, r);
          if (key === undefined) return;

          if (checkedKeys.has(key)) {
            checkedRowWithKey[key] = r;
          }
          const parent = findParentByKey<T>(dataSource, key, rowKey);
          if (!parent) return;
          const parentKey = getRowKey(rowKey, parent);
          if (parentKey === undefined) return;
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;

          (parent.children || []).forEach((c) => {
            const cKey = getRowKey(rowKey, c);
            if (cKey === undefined) return;

            if ((checkedKeys.has(cKey) || halfCheckedKeys.has(cKey)) && !isHalfChecked) {
              isHalfChecked = true;
            }
            if (allChecked && !checkedKeys.has(cKey)) {
              allChecked = false;
            }
          });

          if (!allChecked) {
            checkedKeys.delete(parentKey);
          }
          if (isHalfChecked) {
            halfCheckedKeys.add(parentKey);
          }
          existKeys.add(parentKey);
        });
      }

      return {
        checkedRowWithKey,
        checkedKeys: Array.from(checkedKeys),
        halfCheckedKeys: Array.from(halfCheckedKeys),
      };
    },
    [isRadio, rowKey, dataSource],
  );

  const fillMissSelectedKeys = useCallback(
    (keys: (string | number)[]) => {
      const checkedRowWithKey: SelectedRowWithKey<T> = {} as SelectedRowWithKey<T>;
      const checkedKeys = new Set<number | string>(keys);
      const halfCheckedKeys = new Set<number | string>();

      if (isRadio) {
        return {
          checkedRowWithKey,
          checkedKeys: Array.from(checkedKeys),
          halfCheckedKeys: Array.from(halfCheckedKeys),
        };
      }

      // from top to bottom
      for (let i = 0; i <= maxTreeLevel.current; i++) {
        const records = levelRecord.current[i];
        records.forEach((r) => {
          const key = getRowKey(rowKey, r);
          if (key === undefined) return;
          if (checkedKeys.has(key)) {
            checkedRowWithKey[key] = r;
            (r?.children || []).forEach((c) => {
              const cKey = getRowKey(rowKey, c);
              if (cKey === undefined) return;
              checkedKeys.add(cKey);
              checkedRowWithKey[cKey] = c;
            });
          }
        });
      }

      // from bottom to top
      const existKeys = new Set<number | string>();
      for (let i = maxTreeLevel.current; i >= 0; i--) {
        const records = levelRecord.current[i];

        records.forEach((r) => {
          const key = getRowKey(rowKey, r);
          if (key === undefined) return;
          const parent = findParentByKey<T>(dataSource, key, rowKey);
          if (!parent) return;
          const parentKey = getRowKey(rowKey, parent);
          if (parentKey === undefined) return;
          if (existKeys.has(parentKey)) return;

          let allChecked = true;
          let isHalfChecked = false;
          (parent.children || []).forEach((c) => {
            const cKey = getRowKey(rowKey, c);
            if (cKey === undefined) return;
            const exist = checkedKeys.has(cKey);
            if ((exist || halfCheckedKeys.has(cKey)) && !isHalfChecked) {
              isHalfChecked = true;
            }
            if (allChecked && !exist) {
              allChecked = false;
            }
          });

          if (allChecked) {
            checkedKeys.add(parentKey);
            if (!checkedRowWithKey[parentKey]) {
              checkedRowWithKey[parentKey] = parent;
            }
          }
          if (isHalfChecked) {
            halfCheckedKeys.add(parentKey);
          }
          existKeys.add(parentKey);
        });
      }

      return {
        checkedRowWithKey,
        checkedKeys: Array.from(checkedKeys),
        halfCheckedKeys: Array.from(halfCheckedKeys),
      };
    },
    [dataSource, isRadio, rowKey],
  );

  const flatData = useCallback(
    (data: T[], level: number = 0) => {
      const records: T[] = [];
      const keys: (string | number)[] = [];

      maxTreeLevel.current = level;

      data.forEach((d) => {
        const key = getRowKey(rowKey, d);
        if (key !== undefined) {
          keys.push(key);
          treeLevel.current[key] = level;
        }
        records.push(d);
        if (!Array.isArray(levelRecord.current[level])) {
          levelRecord.current[level] = [];
        }
        levelRecord.current[level].push(d);
        if (d?.children && d.children.length) {
          const infos = flatData(d.children, level + 1);
          records.push(...infos.records);
          keys.push(...infos.keys);
        }
      });

      return { records, keys };
    },
    [rowKey],
  );

  // todo columns
  const formatColumns = useMemo(() => {
    // todo insertBeforeColumnName 如果是放到最后一列
    let insertIndex = 0;
    const cols = columns.map((column, index: number) => {
      const { title } = column;
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
        title: rowSelection?.columnTitle || '',
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
        title: expandable?.columnTitle || '',
        width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });
    }

    return cols;
  }, [columns, expandable, rowSelection]);

  const addFixedToColumn: any = useCallback(
    (columns: ColumnsType<T>[] | ColumnsGroupType<T>[], fixed: 'left' | 'right') => {
      return columns.map((c) => {
        if (typeof (c as ColumnsGroupWithType<T>).children !== 'undefined') {
          return {
            ...c,
            fixed,
            children: addFixedToColumn((c as ColumnsGroupWithType<T>).children, fixed),
          };
        }
        return { ...c, fixed };
      });
    },
    [],
  );

  const existFixedInColumn = useCallback(
    (columns: ColumnsType<T>[] | ColumnsGroupType<T>[]): boolean => {
      let exist: boolean;
      const lastColumn = columns[columns.length - 1];
      if ((lastColumn as ColumnsGroupWithType<T>).children) {
        exist = existFixedInColumn((lastColumn as ColumnsGroupWithType<T>).children);
      } else {
        exist = !!lastColumn.fixed;
      }
      return exist;
    },
    [],
  );

  const columnsWithFixed = useMemo(() => {
    let left = -1;
    let right = -1;
    const cols = formatColumns.map((column, index: number) => {
      if (typeof (column as ColumnsGroupWithType<T>).children !== 'undefined') {
        const isFixedLeft = column.fixed === 'left';
        const isFixedRight = column.fixed === 'right';

        if (isFixedLeft || !column.fixed) {
          let exist = false;
          if (!column.fixed) {
            exist = existFixedInColumn((column as ColumnsGroupWithType<T>).children);
          }
          if (isFixedLeft || exist) {
            left = index;
            const children = addFixedToColumn((column as ColumnsGroupWithType<T>).children, 'left');
            (column as ColumnsGroupWithType<T>).children = children;
            column.fixed = 'left';
          }
        }

        if (isFixedRight || !column.fixed) {
          let exist = false;
          if (!column.fixed) {
            exist = existFixedInColumn((column as ColumnsGroupWithType<T>).children);
          }
          if (isFixedRight || exist) {
            if (right < 0) right = index;
            const children = addFixedToColumn(
              (column as ColumnsGroupWithType<T>).children,
              'right',
            );
            (column as ColumnsGroupWithType<T>).children = children;
            column.fixed = 'right';
          }
        }
      } else {
        if (column.fixed === 'left') left = index;
        if (column.fixed === 'right' && right < 0) right = index;
      }
      return column;
    });
    return cols.map((c, i: number) => {
      if (i <= left) c.fixed = 'left';
      if (i === left) c.lastLeftFixed = true;
      if (i >= right && right > 0) c.fixed = 'right';
      if (i === right) c.fistRightFixed = true;
      return c;
    });
  }, [formatColumns, addFixedToColumn, existFixedInColumn]);

  const getFlatColumns = useCallback((cols: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[]) => {
    const flatColumns: ColumnsWithType<T>[] = [];
    cols.map((column: any) => {
      if (column?.children) {
        flatColumns.push(...getFlatColumns(column.children));
      } else {
        flatColumns.push(column);
      }
    });
    return flatColumns;
  }, []);

  const flatColumns = useMemo(() => {
    return getFlatColumns(columnsWithFixed);
  }, [getFlatColumns, columnsWithFixed]);

  const [currentPage, setCurrentPage] = useState(() => {
    return pagination?.current || pagination?.defaultCurrent || 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    return pagination?.pageSize || pagination?.defaultPageSize || 10;
  });

  const [filterState, setFilterState] = useState<FilterStateType<T>[]>(() => {
    const filter: FilterStateType<T>[] = [];
    flatColumns.forEach((col) => {
      if (col?.filters || typeof col?.filterMethod === 'function') {
        filter.push({
          filteredValue: col?.filteredValue || col?.defaultFilteredValue || [],
          dataIndex: col.dataIndex,
          filterMethod: col?.filterMethod,
        });
      }
    });
    return filter;
  });

  const [sorterState, setSorterState] = useState<SorterStateType<T>[]>(() => {
    const sorter: SorterStateType<T>[] = [];
    flatColumns.forEach((col) => {
      if (col?.sorter && col?.defaultSortOrder) {
        const obj: SorterStateType<T> = {
          order: col.defaultSortOrder,
          dataIndex: col.dataIndex,
        } as SorterStateType<T>;
        if (typeof col.sorter === 'object') {
          obj.sorter = (col.sorter as SorterType<T>).compare;
          obj.weight = (col.sorter as SorterType<T>).weight;
        } else {
          obj.sorter = col.sorter as (rowA: T, rowB: T) => number;
        }
        sorter.push(obj);
      }
    });
    return sorter;
  });

  const totalData = useMemo(() => {
    let records: T[] = [...dataSource];
    filterState.forEach((f) => {
      records = records.filter((r) => {
        let result = !f.filteredValue.length;
        for (let i = 0; i < f.filteredValue.length; i++) {
          if (typeof f?.filterMethod === 'function') {
            result = f.filterMethod(f.filteredValue[i], r);
            if (result) break;
          }
        }
        return result;
      });
    });

    sorterState.forEach((s) => {
      records.sort((a, b) => {
        const compareResult = s.sorter(a, b);
        if (compareResult !== 0) {
          return s.order === 'asc' ? compareResult : -compareResult;
        }
        return compareResult;
      });
    });
    return records;
  }, [dataSource, filterState, sorterState]);

  const currentPageData = useMemo(() => {
    if (pagination) {
      if (totalData.length <= pageSize) {
        return totalData;
      } else {
        const start = (currentPage - 1) * pageSize;
        return totalData.slice(start, start + pageSize);
      }
    }
    return totalData;
  }, [pagination, pageSize, currentPage, totalData]);

  const { records: currPageRecords, keys: currPageKeys } = useMemo(() => {
    return flatData(currentPageData);
  }, [flatData, currentPageData]);

  const [colWidths, setColWidths] = useState<number[]>([]);

  const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  const [scrollTop, setScrollTop] = useState<number>(0);

  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const [startOffset, setStartOffset] = useState<number>(0);

  // const [resizeLineVisible, setResizeLineVisible] = useState<boolean>(false);

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    const initSelectedKeys =
      rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
    if (initSelectedKeys.length) {
      return fillMissSelectedKeys(initSelectedKeys).checkedKeys;
    }
    return initSelectedKeys;
  });

  const [halfSelectedKeys, setHalfSelectedKeys] = useState(() => {
    const initSelectedKeys =
      rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
    if (initSelectedKeys.length) {
      return fillMissSelectedKeys(initSelectedKeys).halfCheckedKeys;
    }
    return initSelectedKeys;
  });
  // 1.测试列表-分页情况下 展开的也是只展开当前页的
  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return currPageKeys;
    }
    return treeProps?.expandedRowKeys || treeProps?.defaultExpandedRowKeys || [];
  });

  const getTreeChildrenData = useCallback(
    (parent: T) => {
      const records: T[] = [];
      const data = parent?.children;
      const parentKey = getRowKey(rowKey, parent);
      if (
        parentKey !== undefined &&
        data &&
        data.length &&
        treeExpandKeys &&
        treeExpandKeys.indexOf(parentKey) >= 0
      ) {
        data.forEach((item) => {
          records.push(item);
          const childrenRecords = getTreeChildrenData(item);
          records.push(...childrenRecords);
        });
      }
      return records;
    },
    [rowKey, treeExpandKeys],
  );

  const getSumHeight = useCallback(
    (start: number, end: number) => {
      let sumHeight = 0;
      for (let i = start; i < end; i++) {
        sumHeight += cachePosition[i]?.height || rowHeight;
      }
      return sumHeight;
    },
    [cachePosition, rowHeight],
  );

  const list = useMemo(() => {
    const records: T[] = [];

    currentPageData.forEach((d) => {
      records.push(d);
      const childrenRecords = getTreeChildrenData(d);
      records.push(...childrenRecords);
    });

    return records;
  }, [currentPageData, getTreeChildrenData]);

  // todo 点击扩展行后引起cachePosition 变化后 scrollTop 的更新计算 setRowHeight
  // todo 滚动到底部了但是改变了列宽引起的高度变化 scrollTop 的更新计算 width: 150 -> 180
  // todo 考虑点击树形的第一行和最后一行折叠icon 虚拟滚动会不会出现空白 等到handleUpdateRowHeight 修复了
  // todo 待测试如果是可变行高会不会触发重新计算
  const scrollHeight = useMemo(() => {
    return getSumHeight(0, list.length);
  }, [getSumHeight, list]);

  const showScrollbarY = useMemo(() => {
    if (height) {
      if (!virtualContainerHeight) return false;
      return virtualContainerHeight < scrollHeight;
    }
    return false;
  }, [scrollHeight, height, virtualContainerHeight]);

  // 1.如果所有列设置了宽度 表格总宽度计算
  // todo 2.单元格word-break 样式更改
  // todo 考虑如果后面要是把滚动条改动后 tbodyWidth 这个计算要优化 现在没有扣除BAR_WIDTH
  const columnsWithWidth = useMemo(() => {
    const allColumnHasWidth = flatColumns.every((c) => typeof parseValue(c.width) === 'number');
    if (allColumnHasWidth) return flatColumns;
    if (tbodyRef.current) {
      let widthSum = 0;
      let count = 0;
      const noMaxColumns: ColumnsWithType<T>[] = [];
      // const tbodyWidth = Number(parseValue(width)) || (virtualContainerWidth - (showScrollbarY ? BAR_WIDTH : 0));
      const tbodyWidth = Number(parseValue(width)) || virtualContainerWidth;

      flatColumns.map((c) => {
        if (c.width) {
          let parseWidth = parseValue(c.width);
          if (typeof parseWidth === 'string') {
            parseWidth = toPoint(parseWidth);
            parseWidth = parseWidth! * tbodyWidth;
          }
          widthSum += Number(parseWidth);
        } else {
          count++;
          if (!c.maxWidth) {
            noMaxColumns.push(c);
          }
        }
      });

      let remainWidth = tbodyWidth - widthSum;
      let averageWidth = 0;
      if (count > 0) {
        averageWidth = parseInt(`${remainWidth / count}`, 10);
      }

      let widthColumns = flatColumns.map((c) => {
        if (c.width) {
          let parseWidth = parseValue(c.width);
          if (typeof parseWidth === 'string') {
            parseWidth = toPoint(parseWidth);
            parseWidth = parseWidth! * tbodyWidth;
          }
          return Object.assign({}, c, { width: parseWidth });
        }
        let colWidth = averageWidth;
        if (c.minWidth) {
          colWidth = Math.max(averageWidth, Number(parseValue(c.minWidth)));
        }
        if (c.maxWidth) {
          colWidth = Math.min(averageWidth, Number(parseValue(c.maxWidth)));
        }
        remainWidth -= colWidth;
        count--;
        const diff = averageWidth - colWidth;
        if (diff) {
          if (count > 0) {
            averageWidth = parseInt(`${remainWidth / count}`, 10);
          }
        }
        return Object.assign({}, c, { width: colWidth });
      });

      if (remainWidth > 0) {
        averageWidth = parseInt(`${remainWidth / noMaxColumns.length}`, 10);
        widthColumns = widthColumns.map((c) => {
          const item = noMaxColumns.find((col) => col.dataIndex === c.dataIndex);
          if (item) {
            let colWidth = Number(parseValue(c.width)) + averageWidth;
            return Object.assign({}, c, { width: colWidth });
          }
          return c;
        });
      }
      return widthColumns;
    }
    return flatColumns;
  }, [flatColumns, virtualContainerWidth, width, showScrollbarY]);

  const converToPixel = useCallback((val: string | number | undefined) => {
    if (typeof val === 'number' || val === undefined) return val;
    const res = toPoint(val);
    const { width } = tbodyRef.current.getBoundingClientRect();
    return width * res;
  }, []);

  // 不考虑用handleBodyRender 可以删除相关代码
  const handleBodyRender = useCallback(
    (tds: HTMLElement[]) => {
      const widths = [];

      for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        const { width } = td.getBoundingClientRect();

        const colSpan = Number(td.getAttribute('colspan'));

        if (colSpan === 1) {
          widths.push(width);
        } else {
          let sum = 0;
          let count = 0;
          const colWidth: (number | undefined)[] = [];
          for (let j = 0; j < colSpan; j++) {
            const w = converToPixel(flatColumns[i + j].width);
            // console.log(w);
            // todo 待测试列宽设为0
            // 如果表头是文字 td 是数字就可能产生不对齐 width: 0
            // 等到做完滚动后再来考虑 是否需要设置表格的宽度
            // ellipsis 如果设置了表格宽度后是否能生效
            // ellipsis 是否需要设置ellipsis.maxWidth 来促使表头超出可以截断
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
      // setColWidths(widths);
    },
    [converToPixel, flatColumns],
  );
  // console.log(colWidths);

  // todo 参数height 名字要更改
  const handleUpdateRowHeight = (height: number, rowIndex: number) => {
    // console.log(`height: ${height}`);
    const copyCachePosition = [...cachePosition];
    const index = copyCachePosition.findIndex((c) => c.index === rowIndex);
    if (index >= 0) {
      const item = { ...copyCachePosition[index] };
      const diff = item.height - height;
      if (diff) {
        // todo 如果存在差距的话得更新下scrollTop  startOffset
        item.height = height;
        item.bottom = item.bottom - diff;
        for (let j = index + 1; j < copyCachePosition.length; j++) {
          copyCachePosition[j].top = copyCachePosition[j - 1].bottom;
          copyCachePosition[j].bottom = copyCachePosition[j].bottom - diff;
        }
      }
      copyCachePosition.splice(index, 1, item);
    }
    setCachePosition(copyCachePosition);
  };
  // console.log(cachePosition);

  const handleSelect = (
    keys: (number | string)[],
    halfKeys: (number | string)[],
    record: T,
    selected: boolean,
    event: Event,
  ) => {
    let selectedRows: T[];
    let selectKeys: (number | string)[];
    if (selected) {
      const { checkedKeys, checkedRowWithKey, halfCheckedKeys } = fillMissSelectedKeys(keys);
      selectKeys = isRadio ? keys : checkedKeys;
      selectedRows = isRadio ? [record] : Object.values(checkedRowWithKey);
      setHalfSelectedKeys(halfCheckedKeys);
    } else {
      const { checkedKeys, checkedRowWithKey, halfCheckedKeys } = removeUselessKeys(keys, halfKeys);
      selectKeys = isRadio ? [] : checkedKeys;
      selectedRows = isRadio ? [] : Object.values(checkedRowWithKey);
      setHalfSelectedKeys(halfCheckedKeys);
    }
    if (!('selectedRowKeys' in rowSelection!) || rowSelection?.selectedRowKeys === undefined) {
      setSelectedKeys(selectKeys);
    }

    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(selectKeys, selectedRows);
    }
  };

  // 2.待测试--分页的话只勾选当页的数据
  const handleSelectAll = (selected: boolean) => {
    let selectedRows: T[];
    let selectKeys: (number | string)[];
    if (selected) {
      const { checkedKeys, checkedRowWithKey, halfCheckedKeys } =
        fillMissSelectedKeys(currPageKeys);
      selectKeys = checkedKeys;
      selectedRows = Object.values(checkedRowWithKey);
      setHalfSelectedKeys(halfCheckedKeys);
    } else {
      selectKeys = [];
      selectedRows = [];
      setHalfSelectedKeys([]);
    }

    if (rowSelection?.onSelectAll) {
      // 3. 待测试--分页情况下currPageRecords 也是当前current页面操作的数据
      rowSelection.onSelectAll(selected, selectedRows, currPageRecords);
    }
    if (rowSelection?.onChange) {
      rowSelection.onChange(selectKeys, selectedRows);
    }

    if (!('selectedRowKeys' in rowSelection!) || rowSelection?.selectedRowKeys === undefined) {
      setSelectedKeys(selectKeys);
    }
  };

  const handleTreeExpand = (treeExpanded: boolean, record: T, recordKey: number | string) => {
    if (!treeProps?.expandedRowKeys) {
      setTreeExpandKeys((prev) => {
        const isExist = prev.indexOf(recordKey) >= 0;
        return isExist ? prev.filter((p) => p !== recordKey) : [...prev, recordKey];
      });
    }
    if (treeProps?.onExpand) {
      treeProps.onExpand(treeExpanded, record);
    }
  };

  const handleSortChange = (
    col: ColumnsWithType<T> & { colSpan: number },
    order: 'asc' | 'desc',
  ) => {
    const index = sorterState.findIndex((s) => s.dataIndex === col.dataIndex);
    const isCancel = index >= 0 && sorterState[index].order === order;

    if (isCancel) {
      const filterResult = sorterState.filter((s) => s.dataIndex !== col.dataIndex);
      setSorterState(filterResult);
      // setSorterState((prev) => {
      //   return prev.filter((p) => p.dataIndex !== col.dataIndex);
      // });
      // if (typeof onSortCancel === 'function') {
      //   onSortCancel(omit(col, ['colSpan', 'type']) as ColumnsType<T>, order);
      // }
      const sortInfos = filterResult.map((f) => ({ field: f.dataIndex, order: f.order }));
      onSort && onSort(sortInfos);
      return;
    }
    if (typeof col?.sorter === 'object') {
      if (index >= 0) {
        const copyList = [...sorterState];
        const item = sorterState[index];
        item.order = order;
        copyList.splice(index, 1, item);
        setSorterState(copyList);
        onSort && onSort(copyList.map((c) => ({ field: c.dataIndex, order: c.order })));
      } else {
        const list =
          sorterState.length === 1 && sorterState[0]?.weight === undefined ? [] : [...sorterState];
        list.push({
          order,
          dataIndex: col.dataIndex,
          sorter: (col.sorter as SorterType<T>).compare,
          weight: (col.sorter as SorterType<T>).weight,
        });
        list.sort((a, b) => {
          const a1 = (a.weight || 0).toString();
          const b1 = (b.weight || 0).toString();
          return a1.localeCompare(b1);
        });
        setSorterState(list);
        const sortInfo = list.map((l) => {
          return { field: l.dataIndex, order: l.order };
        });
        onSort && onSort(sortInfo);
      }
      return;
    }
    if (typeof col?.sorter === 'function') {
      setSorterState([
        {
          order,
          dataIndex: col.dataIndex,
          sorter: col.sorter as (rowA: T, rowB: T) => number,
        },
      ]);
      onSort && onSort([{ field: col.dataIndex, order }]);
    }

    // if (typeof onSort === 'function') {
    //   // (column: ColumnsType<T>, order: 'ascend' | 'descend') => void;
    //   onSort(omit(col, ['colSpan', 'type']) as ColumnsType<T>, order);
    // }
  };

  const handleFilterChange = (
    col: ColumnsWithType<T> & { colSpan: number },
    checkedValue: string[],
  ) => {
    const index = filterState.findIndex((f) => f.dataIndex === col.dataIndex);
    if (index >= 0) {
      const copyFilterState = [...filterState];
      const item = copyFilterState[index];
      item.filteredValue = [...checkedValue];
      copyFilterState.splice(index, 1, item);
      if (!('filteredValue' in col)) {
        setFilterState(copyFilterState);
      }
      if (typeof onFilter === 'function') {
        const filterInfo: FilterInfoType = {};
        copyFilterState.forEach((f) => {
          filterInfo[f.dataIndex] = f.filteredValue;
        });
        onFilter(filterInfo);
      }
      if (pagination && !('current' in pagination)) {
        setCurrentPage(1);
      }
      if (typeof pagination?.onChange === 'function') {
        pagination.onChange(1, pageSize);
      }
    }
  };

  const handleHeaderMouseDown = (
    resizeInfo: ResizeInfoType,
    col: ColumnsWithType<T>,
    colIndex: number,
  ) => {
    const resizeEl = resizeLineRef.current;
    const { resizingRect, startPosX } = resizeInfo;
    if (!resizeEl || !tableContainer.current) return;

    const tableContainerRect = tableContainer.current.getBoundingClientRect();
    const initLeft = resizingRect.right - tableContainerRect.left;
    resizeEl.style.cssText = `left: ${initLeft}px; display: block`;

    document.onselectstart = () => false;
    document.ondragstart = () => false;

    const handleHeaderMouseMove = (event: any) => {
      const deltaX = event.clientX - startPosX;
      resizeEl.style.cssText = `left: ${initLeft + deltaX}px; display: block`;
    };

    const handleHeaderMouseUp = (event: Event) => {
      const columnWidth =
        parseInt(resizeEl.style.left, 10) - (resizingRect.left - tableContainerRect.left);
      const copyColumns = [...columns];
      const oldWidth = columnsWithWidth[colIndex].width;
      copyColumns[colIndex] = { ...col, width: columnWidth };
      // setColWidths([]);
      setColumns(copyColumns);
      resizeEl.style.cssText = `display: none`;

      const column = copyColumns[colIndex] as ColumnsType<T>;
      onColumnResize && onColumnResize(columnWidth, oldWidth as number, column, event);

      document.removeEventListener('mousemove', handleHeaderMouseMove);
      document.removeEventListener('mouseup', handleHeaderMouseUp);
      document.onselectstart = null;
      document.ondragstart = null;
    };

    document.addEventListener('mousemove', handleHeaderMouseMove);
    document.addEventListener('mouseup', handleHeaderMouseUp);
  };

  const handlePaginationChange = (current: number, size: number) => {
    if (pagination && !('current' in pagination)) {
      setCurrentPage(current);
    }
    if (pagination && 'pageSize' in pagination) {
      setPageSize(size);
    }
    if (typeof pagination?.onChange === 'function') {
      pagination.onChange(current, size);
    }
  };

  // console.log(`startRowIndex: ${startRowIndex}`);
  // console.log(`scrollTop: ${scrollTop}`);

  const handleScrollVertical = (offset: number) => {
    const item = cachePosition.find((p) => p.bottom >= offset);
    if (item) {
      setStartOffset(item.top);
      setStartRowIndex(item.index);
      setScrollTop(offset);
    }
  };
  // console.log(`scrollTop: ${scrollTop}`)

  const handleScrollHorizontal = (offset: number) => {
    // console.log(offset);
    setScrollLeft(offset);
  };
  // console.log(cachePosition);

  useEffect(() => {
    const positions = dataSource.map((d, index) => {
      return {
        index,
        top: index * rowHeight,
        bottom: (index + 1) * rowHeight,
        height: rowHeight,
      };
    });
    setCachePosition(positions);
  }, [dataSource]);

  useEffect(() => {
    if (pagination && 'current' in pagination) {
      setCurrentPage(pagination?.current || 1);
    }
    if (pagination && 'pageSize' in pagination) {
      setPageSize(pagination?.pageSize || 10);
    }
  }, [pagination]);

  useEffect(() => {
    if (rowSelection && 'selectedRowKeys' in rowSelection) {
      const { checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(
        rowSelection.selectedRowKeys || [],
      );
      setSelectedKeys(checkedKeys);
      setHalfSelectedKeys(halfCheckedKeys);
    }
  }, [rowSelection, fillMissSelectedKeys]);

  useEffect(() => {
    if (treeProps?.expandedRowKeys) {
      setTreeExpandKeys(treeProps.expandedRowKeys);
    }
  }, [treeProps]);

  useEffect(() => {
    setColumns(originColumns);
  }, [originColumns]);

  // column
  useEffect(() => {
    let exist = false;
    const filter: FilterStateType<T>[] = [];
    flatColumns.forEach((col) => {
      if ('filteredValue' in col) {
        exist = true;
        filter.push({
          filteredValue: col?.filteredValue || [],
          dataIndex: col.dataIndex,
          filterMethod: col?.filterMethod,
        });
      }
    });
    exist && setFilterState(filter);
  }, [flatColumns]);

  // 4. 待测试-分页情况下表头的全选只针对当前页面数据
  const checked = useMemo(() => {
    if (!selectedKeys.length) {
      return false;
    }
    const isSame = currPageKeys.every((key) => {
      return selectedKeys.indexOf(key) >= 0;
    });
    const isExist = currPageKeys.some((key) => {
      return selectedKeys.indexOf(key) >= 0;
    });
    return isSame ? true : isExist ? 'indeterminate' : false;
  }, [selectedKeys, currPageKeys]);

  const isTree = useMemo(() => {
    const data = list.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [list]);

  const scrollWidth = useMemo(() => {
    if (width) return width;
    return columnsWithWidth.reduce((total, col) => {
      return total + (Number(parseValue(col.width)) || 0);
    }, 0);
  }, [width, columnsWithWidth]);

  // const getScrollWidth = useCallback(() => {
  //   if (width) return width;
  //   if (tbodyRef.current) return tbodyRef.current.offsetWidth;
  //   return 0;
  // }, [width]);

  const showScrollbarX = useMemo(() => {
    // const scrollWidth = getScrollWidth();
    return scrollWidth > virtualContainerWidth;
  }, [scrollWidth, virtualContainerWidth]);

  const handleMount = (vWidth: number, vHeight: number) => {
    setVirtualContainerWidth(vWidth);
    setVirtualContainerHeight(vHeight);
  };

  // todo offsetRight 需要优化成有需要fixed='right'时候才更新
  const offsetRight = useMemo(() => {
    // const scrollWidth = getScrollWidth();
    const availableWidth =
      virtualContainerWidth === 0 ? 0 : virtualContainerWidth - (showScrollbarY ? BAR_WIDTH : 0);
    const maxScrollWidth = scrollWidth - availableWidth;
    return maxScrollWidth - scrollLeft;
  }, [scrollWidth, virtualContainerWidth, showScrollbarY, scrollLeft]);

  // 考虑renderMaxRows 小于容器高度时候会出现底部空白
  const getRenderMaxRows = useCallback(() => {
    if (renderMaxRows <= 0 || renderMaxRows > list.length || !showScrollbarY) {
      return list.length;
    }
    if (virtualContainerHeight) {
      const virtualContainerAvailableHeight =
        virtualContainerHeight - (showScrollbarX ? BAR_WIDTH : 0);
      const start = (currentPage - 1) * pageSize + startRowIndex;
      const sumHeight = getSumHeight(start, start + renderMaxRows);
      if (sumHeight > virtualContainerAvailableHeight) {
        return renderMaxRows;
      } else {
        const item = cachePosition.find((c) => c.top >= virtualContainerAvailableHeight);
        return item?.index ?? renderMaxRows;
      }
    }
    return renderMaxRows;
  }, [
    renderMaxRows,
    list,
    showScrollbarY,
    virtualContainerHeight,
    showScrollbarX,
    cachePosition,
    startRowIndex,
    getSumHeight,
    currentPage,
    pageSize,
  ]);

  // 已修复bug 分页滚动到底部 切换到最后一页发现是空白的 在于 startRowIndex 大于数据开始行数
  // 考虑分页后最后一列的数据的高度小于容器的高度 滚动条是否会出现
  useEffect(() => {
    // 如果没有垂直滚动条 startRowIndex 永远为0
    if (startRowIndex >= list.length) {
      setStartRowIndex(0);
      setStartOffset(0);
      setStartRowIndex(0);
      setScrollTop(0);
    }
  }, [list, startRowIndex]);

  // 1. 考虑没有设置height 时候展示数据范围 没有设置height 就不展示滚动条 设置了height 需要和容器的高度做对比
  // 2. 考虑分页时候设置pageSize 大于renderMaxRows
  const renderBody = () => {
    return (
      <VirtualList
        scrollWidth={scrollWidth}
        // scrollWidth={getScrollWidth()}
        scrollHeight={scrollHeight}
        scrollTop={scrollTop}
        scrollLeft={scrollLeft}
        showScrollbarX={showScrollbarX}
        showScrollbarY={showScrollbarY}
        onMount={handleMount}
        onScrollVertical={handleScrollVertical}
        onScrollHorizontal={handleScrollHorizontal}
      >
        <div
          className="table-tbody"
          ref={tbodyRef}
          style={{
            width: scrollWidth,
            marginTop: `${startOffset}px`,
            transform: `translate(-${scrollLeft}px, -${scrollTop}px)`,
          }}
        >
          <table style={{ width: scrollWidth }}>
            <Colgroup colWidths={colWidths} columns={columnsWithWidth} />
            <Tbody
              {...props}
              bordered
              empty={empty}
              isTree={isTree}
              scrollLeft={scrollLeft}
              offsetRight={offsetRight}
              startRowIndex={startRowIndex}
              // startRowIndex={0}
              // dataSource={list}
              dataSource={list.slice(startRowIndex, startRowIndex + getRenderMaxRows())}
              // columns={flatColumns}
              columns={columnsWithWidth}
              treeLevelMap={treeLevel.current}
              treeExpandKeys={treeExpandKeys}
              selectedKeys={selectedKeys}
              halfSelectedKeys={halfSelectedKeys}
              onSelect={handleSelect}
              onTreeExpand={handleTreeExpand}
              onBodyRender={handleBodyRender}
              onUpdateRowHeight={handleUpdateRowHeight}
            />
          </table>
        </div>
      </VirtualList>
    );
  };

  const renderHeader = () => {
    return (
      <div
        className={classnames({
          'table-thead': true,
          'table-head-gutter': showScrollbarY,
        })}
      >
        <table
          style={{
            width: scrollWidth,
            transform: `translate(-${scrollLeft}px, 0)`,
          }}
        >
          <Colgroup colWidths={colWidths} columns={columnsWithWidth} />
          <Thead
            bordered
            checked={checked}
            locale={locale}
            columns={columnsWithFixed}
            scrollLeft={scrollLeft}
            offsetRight={offsetRight}
            sorterState={sorterState}
            filterState={filterState}
            expandable={expandable}
            rowSelection={rowSelection}
            renderSorter={renderSorter}
            onSelectAll={handleSelectAll}
            onSort={handleSortChange}
            onFilterChange={handleFilterChange}
            onMouseDown={handleHeaderMouseDown}
          />
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination) {
      const pageProps = Object.assign(
        {
          current: currentPage,
          pageSize: pageSize,
          total: totalData.length,
          disabled: !!loading,
        },
        pagination,
        { onChange: handlePaginationChange },
      );
      return <Pagination {...pageProps} className="table-pagination" />;
    }
    return null;
  };

  const tableWrapClass = classnames({
    'table-container': true,
    'table-small': size === 'small',
    'table-large': size === 'large',
    'table-bordered': bordered,
    [className]: !!className,
  });

  const styles = Object.assign(
    {
      height: height || '100%',
    },
    style,
    {
      overflow: loading ? 'hidden' : 'auto',
    },
  );
  return (
    <>
      <div style={styles} className={tableWrapClass} ref={tableContainer}>
        {showHeader ? renderHeader() : null}
        {renderBody()}
        {loading ? (
          <div className="table-loading">{typeof loading === 'boolean' ? <Spin /> : loading}</div>
        ) : null}
        <div ref={resizeLineRef} className="table-resize-line" style={{ display: 'none' }} />
      </div>
      {renderPagination()}
    </>
  );
}

export default Table;
