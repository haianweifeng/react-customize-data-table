import React, { useMemo, useRef, useState, useEffect, useCallback, useContext } from 'react';
import classnames from 'classnames';
import omit from 'omit.js';
import useColumns from '../hooks/useColumns';
import useSorter from '../hooks/useSorter';
import useFilter from '../hooks/useFilter';
import useSelection from '../hooks/useSelection';
import usePagination from '../hooks/usePagination';
import useTreeExpand from '../hooks/useTreeExpand';
// import useFlattenData from '../hooks/useFlattenData';
import Thead from '../Thead';
import Tbody from '../Tbody';
import VirtualBody from '../VirtualBody';
import Colgroup from '../Colgroup';
import Pagination from '../Pagination';
import Spin from '../Spin';
import type {
  // RowSelectionType,
  // ColumnsType,
  ColumnsGroupType,
  // ExpandableType,
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
import type {
  ColumnsType,
  ColumnType,
  RowSelectionType,
  Expandable,
  TreeExpandable,
  ColumnGroupType,
  PrivateColumnsType,
  PrivateColumnType,
  Sorter,
  PrivateColumnGroupType,
} from '../interface1';
import VirtualList from '../VirtualList';
import type { PaginationProps } from '../index';
import '../style/index.less';
import {
  getRowKey,
  toPoint,
  findParentByKey,
  parseValue,
  getParent,
  getColumnKey,
} from '../utils/util';
import { BAR_WIDTH } from '../utils/constant';
import LocaleContext from '../LocalProvider/context';
import ScrollBar from '../ScrollBar';
import ScrollBars from '../ScrollBars';
import VirtualScrollBar from '../VirtualScrollBar';
import normalizeWheel from 'normalize-wheel';
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
  columns: ColumnsType<T>;
  // columns: ColumnsType<T>[] | ColumnsGroupType<T>[];
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
  /** 表头单元格的类名 todo 未实现 列类型 */
  headerCellClassName?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => string | string;
  /** 表头单元格的style todo 未实现 列类型 */
  headerCellStyle?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  // /** 表头行的类名 todo 未实现 */
  // headerRowClassName?: (rowIndex: number) => string;
  // /** 设置头部行属性 todo */
  // onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行属性 todo 改成onRowEvents 表头增加 onHeaderRowEvents */
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
  virtualized?: boolean;
  // /** 表格是否可以滚动 超过最大宽高时候就可以滚动 todo */
  // scroll?: ScrollType;
  /** 滚动条滚动后回调函数 todo */
  onScroll?: (x: number, y: number) => void;
  /** 列宽伸缩后的回调 */
  // onColumnResize?: (
  //   newWidth: number,
  //   oldWidth: number,
  //   column: ColumnsType<T>,
  //   event: Event,
  // ) => void;
  onColumnResize?: (
    newWidth: number,
    oldWidth: number,
    column: ColumnType<T>,
    event: Event,
  ) => void;
  /** 表格行是否可选择配置项 todo header 需要表头空一行 */
  rowSelection?: RowSelectionType<T>;
  /** 自定义排序图标 todo 废弃 */
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  // /** 排序取消事件 */
  // onSortCancel?: (col: ColumnsType<T>, order: 'asc' | 'desc') => void;
  /** 排序事件 */
  onSort?: (sortResult: {
    column: ColumnType<T>;
    order: 'asc' | 'desc' | null;
    field: string | undefined;
  }) => void;
  /** 筛选事件 */
  onFilter?: (filterInfo: Record<React.Key, React.Key[]>) => void;
  /** 配置展开属性 todo header 需要表头空一行 */
  expandable?: Expandable<T>;
  /** 配置树形数据属性 */
  treeProps?: TreeExpandable<T>;
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
    columns,
    // columns: originColumns,
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
    virtualized,
    empty = 'No data',
    onColumnResize,
    locale = localeContext.table,
    headerCellClassName,
    headerCellStyle,
  } = props;

  const SELECTION_EXPAND_COLUMN_WIDTH = 44;

  const getRecordKey = useCallback(
    (record: T) => {
      let key;
      if (!record) {
        key = undefined;
      } else {
        key = typeof rowKey === 'function' ? rowKey(record) : (record as any)[rowKey as string];
      }
      if (process.env.NODE_ENV !== 'production') {
        if (key === undefined || key === null) {
          console.log(
            'Each record should have a unique "key" prop,or set "rowKey" to an unique primary key.',
          );
        }
      }
      return key;
    },
    [rowKey],
  );

  const getLevelInfo = useCallback(
    (data: T[], level: number = 0) => {
      let maxTreeLevel: number = level;
      const keyLevelMap = new Map<React.Key, number>();
      const levelRecordMap = new Map<number, Set<T>>();

      data.forEach((d) => {
        const recordKey = getRecordKey(d);
        keyLevelMap.set(recordKey, level);

        if (!(levelRecordMap.get(level) instanceof Set)) {
          levelRecordMap.set(level, new Set());
        }
        levelRecordMap.get(level)!.add(d);

        if (d?.children && d.children.length) {
          const {
            maxTreeLevel: childrenMaxTreeLevel,
            keyLevelMap: childrenKeyLevelMap,
            levelRecordMap: childrenLevelRecordMap,
          } = getLevelInfo(d.children, level + 1);
          maxTreeLevel = childrenMaxTreeLevel;
          for (let [key, value] of childrenKeyLevelMap.entries()) {
            keyLevelMap.set(key, value);
          }
          for (let [key, value] of childrenLevelRecordMap) {
            if (!(levelRecordMap.get(key) instanceof Set)) {
              levelRecordMap.set(key, new Set());
            }
            Array.from(value).forEach((v) => levelRecordMap.get(key)!.add(v));
          }
        }
      });
      return { maxTreeLevel, keyLevelMap, levelRecordMap };
    },
    [getRecordKey],
  );

  const flatRecords = useCallback((data: T[]) => {
    const records: T[] = [];
    data.map((d) => {
      records.push(d);
      if (d && Array.isArray(d.children)) {
        records.push(...flatRecords(d.children));
      }
    });
    return records;
  }, []);

  const { maxTreeLevel, keyLevelMap, levelRecordMap } = useMemo(() => {
    return getLevelInfo(dataSource);
  }, [dataSource, getLevelInfo]);

  const selectionType = useMemo(() => {
    const column = columns.find(
      (column) => column?.type === 'checkbox' || column?.type === 'radio',
    );
    if (column) return column.type as 'checkbox' | 'radio';
    return rowSelection ? rowSelection?.type || 'checkbox' : undefined;
  }, [columns, rowSelection?.type]);

  const initSelectedKeys = useMemo(() => {
    return rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  }, [rowSelection?.selectedRowKeys, rowSelection?.defaultSelectedRowKeys]);

  // const flattenRecords = useFlattenData(dataSource);

  const flattenDataSource = useMemo(() => {
    return flatRecords(dataSource);
  }, [dataSource]);

  const [mergeColumns, fixedColumns, flattenColumns, updateMergeColumns, initMergeColumns] =
    useColumns(columns, rowSelection, expandable);

  const [
    selectedKeys,
    halfSelectedKeys,
    fillMissSelectedKeys,
    removeUselessKeys,
    updateHalfSelectedKeys,
    updateSelectedKeys,
  ] = useSelection(
    dataSource,
    maxTreeLevel,
    levelRecordMap,
    getRecordKey,
    initSelectedKeys,
    selectionType,
  );

  const [filterStates, updateFilterStates, getFilterData] = useFilter(mergeColumns);

  const [sorterStates, updateSorterStates, getSortData] = useSorter(mergeColumns);

  const [currentPage, pageSize, updateCurrentPage, updatePageSize] = usePagination(pagination);

  const [treeExpandKeys, handleTreeExpand] = useTreeExpand(
    flattenDataSource,
    getRecordKey,
    treeProps,
  );

  const resizeLineRef = useRef<HTMLDivElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const theadRef = useRef<any>(null);
  const tbodyRef = useRef<any>(null);
  // const maxTreeLevel = useRef<number>(0);
  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);
  const levelRecord = useRef<LevelRecordType<T>>({} as LevelRecordType<T>);

  const lastStartRowIndex = useRef<number>(0);

  const virtualContainerRef = useRef<HTMLDivElement>(null);

  const scrollBarRef = useRef<HTMLDivElement>(null);

  const lastScrollTop = useRef<number>(0);

  const [isMount, setIsMount] = useState<boolean>(false);

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

  // const [columns, setColumns] = useState<(ColumnsType<T> | ColumnsGroupType<T>)[]>(originColumns);

  const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const flatData = useCallback(
    (data: T[], level: number = 0) => {
      const records: T[] = [];
      const keys: (string | number)[] = [];

      // maxTreeLevel.current = level;

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

  // todo bug 没有考虑树形中children data 的排序 过滤 getSortData
  // const totalData = useMemo(() => {
  //   let records: T[] = [...dataSource];
  //   filterStates.forEach((filterState) => {
  //     records = records.filter((r) => {
  //       let result = !filterState.filteredValue.length;
  //       for (let i = 0; i < filterState.filteredValue.length; i++) {
  //         if (typeof filterState?.filterMethod === 'function') {
  //           result = filterState.filterMethod(filterState.filteredValue[i], r);
  //           if (result) break;
  //         }
  //       }
  //       return result;
  //     });
  //   });
  //
  //   sorterStates
  //     .sort((a, b) => {
  //       const a1 = (a.weight || 0).toString();
  //       const b1 = (b.weight || 0).toString();
  //       return a1.localeCompare(b1);
  //     })
  //     .forEach((sorterState) => {
  //       records.sort((a, b) => {
  //         const compareResult = sorterState.sorter(a, b);
  //         if (compareResult !== 0) {
  //           return sorterState.order === 'asc' ? compareResult : -compareResult;
  //         }
  //         return compareResult;
  //       });
  //     });
  //
  //   return records;
  // }, [dataSource, filterStates, sorterStates]);

  const totalData = useMemo(() => {
    return getFilterData(getSortData(dataSource));
  }, [dataSource, getSortData, getFilterData]);

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

  // todo 待更改
  const { records: currPageRecords, keys: currPageKeys } = useMemo(() => {
    return flatData(currentPageData);
  }, [flatData, currentPageData]);

  const [colWidths, setColWidths] = useState<number[]>([]);

  const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);

  const [scrollWidth, setScrollWidth] = useState<number>(width || 0);

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  const [scrollTop, setScrollTop] = useState<number>(0);

  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const [startOffset, setStartOffset] = useState<number>(0);

  // 1.测试列表-分页情况下 展开的也是只展开当前页的
  // todo bug 如果分页后也是全选的话 是不是没有treeExpandKeys 这里应该针对所有数据进行操作
  // const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
  //   if (
  //     treeProps?.defaultExpandAllRows &&
  //     !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
  //   ) {
  //     return currPageKeys;
  //   }
  //   return treeProps?.expandedRowKeys || treeProps?.defaultExpandedRowKeys || [];
  // });

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

  // todo 应该是基于list 进行获取所有records keys
  // todo list 如果在这里添加了treeChilren 数据遇到虚拟列表会被切分 应该放到tbody 中处理 已处理 待测试
  const list = useMemo(() => {
    const records: T[] = [];

    currentPageData.forEach((d) => {
      records.push(d);
      // const childrenRecords = getTreeChildrenData(d);
      // records.push(...childrenRecords);
    });

    return records;
  }, [currentPageData, getTreeChildrenData]);

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

  // todo 点击扩展行后引起cachePosition 变化后 scrollTop 的更新计算 setRowHeight
  // todo 滚动到底部了但是改变了列宽引起的高度变化 scrollTop 的更新计算 width: 150 -> 180
  // todo 考虑点击树形的第一行和最后一行折叠icon 虚拟滚动会不会出现空白 等到handleUpdateRowHeight 修复了
  // todo 待测试如果是可变行高会不会触发重新计算
  // const scrollHeight = useMemo(() => {
  //   return getSumHeight(0, list.length);
  // }, [getSumHeight, list]);
  const scrollHeight = useMemo(() => {
    return getSumHeight(0, currentPageData.length);
  }, [getSumHeight, currentPageData]);

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
  // const columnsWithWidth = useMemo(() => {
  //   const allColumnHasWidth = flatColumns.every((c) => typeof parseValue(c.width) === 'number');
  //   if (allColumnHasWidth) return flatColumns;
  //   if (tbodyRef.current) {
  //     let widthSum = 0;
  //     let count = 0;
  //     const noMaxColumns: ColumnsWithType<T>[] = [];
  //     // const tbodyWidth = Number(parseValue(width)) || (virtualContainerWidth - (showScrollbarY ? BAR_WIDTH : 0));
  //     // const tbodyWidth = Number(parseValue(width)) || virtualContainerWidth;
  //     // console.log(tbodyRef.current.clientWidth);
  //     // todo 待验证是offsetWidth 还是scrollWidth
  //     // todo 考虑如果所有列设置的宽度都设置了最小值导致 remainWidth小于0 是不是意味着后面那几列宽度都为0 还是自动扩充tbodyWidth 的宽度
  //     const tbodyWidth = Number(parseValue(width)) || containerWidth;
  //
  //     flatColumns.map((c) => {
  //       if (c.width) {
  //         let parseWidth = parseValue(c.width);
  //         if (typeof parseWidth === 'string') {
  //           parseWidth = toPoint(parseWidth);
  //           parseWidth = parseWidth! * tbodyWidth;
  //         }
  //         widthSum += Number(parseWidth);
  //       } else {
  //         count++;
  //         if (!c.maxWidth) {
  //           noMaxColumns.push(c);
  //         }
  //       }
  //     });
  //
  //     let remainWidth = tbodyWidth - widthSum;
  //     let averageWidth = 0;
  //     if (count > 0) {
  //       averageWidth = parseInt(`${remainWidth / count}`, 10);
  //     }
  //
  //     let widthColumns = flatColumns.map((c) => {
  //       if (c.width) {
  //         let parseWidth = parseValue(c.width);
  //         if (typeof parseWidth === 'string') {
  //           parseWidth = toPoint(parseWidth);
  //           parseWidth = parseWidth! * tbodyWidth;
  //         }
  //         return Object.assign({}, c, { width: parseWidth });
  //       }
  //       let colWidth = averageWidth;
  //       if (c.minWidth) {
  //         colWidth = Math.max(averageWidth, Number(parseValue(c.minWidth)));
  //       }
  //       if (c.maxWidth) {
  //         colWidth = Math.min(averageWidth, Number(parseValue(c.maxWidth)));
  //       }
  //       remainWidth -= colWidth;
  //       count--;
  //       const diff = averageWidth - colWidth;
  //       if (diff) {
  //         if (count > 0) {
  //           averageWidth = parseInt(`${remainWidth / count}`, 10);
  //         }
  //       }
  //       return Object.assign({}, c, { width: colWidth });
  //     });
  //
  //     if (remainWidth > 0) {
  //       averageWidth = parseInt(`${remainWidth / noMaxColumns.length}`, 10);
  //       widthColumns = widthColumns.map((c) => {
  //         const item = noMaxColumns.find((col) => col.dataIndex === c.dataIndex);
  //         if (item) {
  //           let colWidth = Number(parseValue(c.width)) + averageWidth;
  //           return Object.assign({}, c, { width: colWidth });
  //         }
  //         return c;
  //       });
  //     }
  //     return widthColumns;
  //   }
  //   return flatColumns;
  // }, [flatColumns, virtualContainerWidth, width, containerWidth]);

  const handleResize = useCallback(
    (targetColumns: PrivateColumnsType<T>) => {
      if (tbodyRef.current) {
        let widthSum = 0;
        let noWidthColumnsCount = 0;
        const noMaxWidthColumnKeys: React.Key[] = [];
        const noMaxWidthColumnIndexs: number[] = [];
        const tbodyWidth = width || tbodyRef.current.offsetWidth;

        const columnsWidth = new Map<React.Key, number>();

        const addWidthForColumns = (targetColumns: PrivateColumnsType<T>, pos?: string) => {
          const widthColumns: PrivateColumnsType<T> = [];
          targetColumns.map((column, index) => {
            const columnKey = getColumnKey(column, pos ? `${pos}_${index}` : `${index}`);
            if ('children' in column && column.children.length) {
              if (columnsWidth.get(columnKey)) {
                widthColumns.push({
                  ...column,
                  _width: columnsWidth.get(columnKey),
                  children: addWidthForColumns(column.children, `${index}`),
                });
              } else {
                widthColumns.push({
                  ...column,
                  children: addWidthForColumns(column.children, `${index}`),
                });
              }
            } else if (columnsWidth.get(columnKey)) {
              widthColumns.push({ ...column, _width: columnsWidth.get(columnKey) });
            } else {
              widthColumns.push({ ...column });
            }
          });
          return widthColumns;
        };

        const flatColumns = (targetColumns: PrivateColumnsType<T>, pos?: string) => {
          const flattenColumns: ((PrivateColumnGroupType<T> | PrivateColumnType<T>) & {
            columnKey: React.Key;
          })[] = [];
          targetColumns.map((column, index) => {
            if ('children' in column && column?.children.length) {
              flattenColumns.push(...flatColumns(column.children, `${index}`));
            } else {
              flattenColumns.push({
                ...column,
                columnKey: getColumnKey(column, pos ? `${pos}_${index}` : `${index}`),
              });
            }
          });
          return flattenColumns;
        };

        const flattenTargetColumns = flatColumns(targetColumns);

        flattenTargetColumns.map((column, index) => {
          if (column.width) {
            widthSum += parseInt(`${column.width}`, 10);
          } else {
            noWidthColumnsCount++;
            if (!column.maxWidth) {
              noMaxWidthColumnKeys.push(column.columnKey);
              // noMaxWidthColumnIndexs.push(index);
            }
          }
        });

        let remainWidth = tbodyWidth - widthSum;
        let averageWidth = 0;
        if (noWidthColumnsCount > 0) {
          averageWidth = parseInt(`${remainWidth / noWidthColumnsCount}`, 10);
        }

        flattenTargetColumns.map((column) => {
          if (column.width) {
            columnsWidth.set(column.columnKey, parseInt(`${column.width}`, 10));
          } else {
            let columnWidth = averageWidth;
            if (column.minWidth) {
              columnWidth = Math.max(averageWidth, parseInt(`${column.minWidth}`, 10));
            }
            if (column.maxWidth) {
              columnWidth = Math.min(averageWidth, parseInt(`${column.maxWidth}`, 10));
            }
            remainWidth -= columnWidth;
            noWidthColumnsCount--;
            const diff = averageWidth - columnWidth;
            if (diff) {
              if (noWidthColumnsCount > 0) {
                averageWidth = parseInt(`${remainWidth / noWidthColumnsCount}`, 10);
              }
            }
            columnsWidth.set(column.columnKey, parseInt(`${columnWidth}`, 10));
          }
        });

        if (remainWidth > 0) {
          averageWidth = parseInt(`${remainWidth / noMaxWidthColumnKeys.length}`, 10);
          flattenTargetColumns.map((c) => {
            if (noMaxWidthColumnKeys.indexOf(c.columnKey) >= 0) {
              const oldWidth = columnsWidth.get(c.columnKey);
              columnsWidth.set(c.columnKey, parseInt(`${Number(oldWidth) + averageWidth}`, 10));
            }
          });
        }

        const tableWidth = [...columnsWidth.values()].reduce((total, columnWidth) => {
          return total + columnWidth;
        }, 0);

        const widthColumns = addWidthForColumns(targetColumns);

        // let widthColumns = targetColumns.map((column) => {
        //   if (column.width)
        //     return {
        //       ...column,
        //       width: parseInt(`${column.width}`, 10),
        //       _width: parseInt(`${column.width}`, 10),
        //     };
        //   let columnWidth = averageWidth;
        //   if (column.minWidth) {
        //     columnWidth = Math.max(averageWidth, parseInt(`${column.minWidth}`, 10));
        //   }
        //   if (column.maxWidth) {
        //     columnWidth = Math.min(averageWidth, parseInt(`${column.maxWidth}`, 10));
        //   }
        //   remainWidth -= columnWidth;
        //   noWidthColumnsCount--;
        //   const diff = averageWidth - columnWidth;
        //   if (diff) {
        //     if (noWidthColumnsCount > 0) {
        //       averageWidth = parseInt(`${remainWidth / noWidthColumnsCount}`, 10);
        //     }
        //   }
        //   return Object.assign({}, column, { _width: columnWidth });
        // });
        //
        // if (remainWidth > 0) {
        //   averageWidth = parseInt(`${remainWidth / noMaxWidthColumnIndexs.length}`, 10);
        //   widthColumns = widthColumns.map((c, index) => {
        //     if (noMaxWidthColumnIndexs.indexOf(index) >= 0) {
        //       return { ...c, _width: Number(c._width) + averageWidth };
        //     }
        //     return c;
        //   });
        // }
        // const tableWidth = widthColumns.reduce((total, column) => {
        //   return total + column._width;
        // }, 0);
        setScrollWidth(tableWidth);
        updateMergeColumns(widthColumns);
      }
    },
    [width],
  );

  // todo 这里没有添加依赖项看eslint 在提交时候会不会报错
  useEffect(() => {
    if (isMount) {
      handleResize(initMergeColumns);
    }
  }, [initMergeColumns, handleResize, isMount]);
  // console.log(mergeColumns);

  useEffect(() => {
    setIsMount(true);
  }, []);

  // const converToPixel = useCallback((val: string | number | undefined) => {
  //   if (typeof val === 'number' || val === undefined) return val;
  //   const res = toPoint(val);
  //   const { width } = tbodyRef.current.getBoundingClientRect();
  //   return width * res;
  // }, []);

  // 不考虑用handleBodyRender 可以删除相关代码
  // const handleBodyRender = useCallback(
  //   (tds: HTMLElement[]) => {
  //     const widths = [];
  //
  //     for (let i = 0; i < tds.length; i++) {
  //       const td = tds[i];
  //       const { width } = td.getBoundingClientRect();
  //
  //       const colSpan = Number(td.getAttribute('colspan'));
  //
  //       if (colSpan === 1) {
  //         widths.push(width);
  //       } else {
  //         let sum = 0;
  //         let count = 0;
  //         const colWidth: (number | undefined)[] = [];
  //         for (let j = 0; j < colSpan; j++) {
  //           const w = converToPixel(flatColumns[i + j].width);
  //           // console.log(w);
  //           // todo 待测试列宽设为0
  //           // 如果表头是文字 td 是数字就可能产生不对齐 width: 0
  //           // 等到做完滚动后再来考虑 是否需要设置表格的宽度
  //           // ellipsis 如果设置了表格宽度后是否能生效
  //           // ellipsis 是否需要设置ellipsis.maxWidth 来促使表头超出可以截断
  //           if (w) {
  //             count++;
  //             sum += w;
  //           }
  //           colWidth.push(w);
  //         }
  //         const remain = width - sum;
  //         const averageWidth = remain / (colSpan - count);
  //         const formatColWidth = colWidth.map((c: number | undefined) => {
  //           return c || averageWidth;
  //         });
  //         widths.push(...formatColWidth);
  //       }
  //     }
  //     // setColWidths(widths);
  //   },
  //   [converToPixel, flatColumns],
  // );

  const handleUpdateRowHeight = useCallback(
    (rowHeight: number, rowIndex: number) => {
      // console.log(`rowHeight: ${rowHeight}`);
      const copyCachePosition = [...cachePosition];
      const index = copyCachePosition.findIndex((c) => c.index === rowIndex);
      if (index >= 0) {
        const item = { ...copyCachePosition[index] };
        const diff = item.height - rowHeight;
        if (diff) {
          // todo 如果存在差距的话得更新下scrollTop  startOffset
          item.height = rowHeight;
          item.bottom = item.bottom - diff;
          for (let j = index + 1; j < copyCachePosition.length; j++) {
            copyCachePosition[j].top = copyCachePosition[j - 1].bottom;
            copyCachePosition[j].bottom = copyCachePosition[j].bottom - diff;
          }
          copyCachePosition.splice(index, 1, item);
          setCachePosition(copyCachePosition);
        }
      }
    },
    [cachePosition],
  );

  const handleSelect = (
    keys: React.Key[],
    halfKeys: React.Key[],
    record: T,
    selected: boolean,
    event: Event,
  ) => {
    let selectedRecords: T[];
    let finalSelectedKeys: React.Key[];
    if (selected) {
      if (selectionType === 'checkbox') {
        const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(keys);
        finalSelectedKeys = checkedKeys;
        selectedRecords = [...checkedKeyRecordMap.values()];
        updateHalfSelectedKeys(halfCheckedKeys);
      } else {
        finalSelectedKeys = [...keys];
        selectedRecords = [record];
        updateHalfSelectedKeys([]);
      }
    } else {
      if (selectionType === 'checkbox') {
        const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = removeUselessKeys(
          keys,
          halfKeys,
        );
        finalSelectedKeys = checkedKeys;
        selectedRecords = [...checkedKeyRecordMap.values()];
        updateHalfSelectedKeys(halfCheckedKeys);
      } else {
        finalSelectedKeys = [];
        selectedRecords = [];
        updateHalfSelectedKeys([]);
      }
    }

    if (!('selectedRowKeys' in rowSelection!)) {
      updateSelectedKeys(finalSelectedKeys);
    }

    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRecords, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(finalSelectedKeys, selectedRecords);
    }

    // let selectedRows: T[];
    // let selectKeys: (number | string)[];
    // if (selected) {
    //   const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(keys);
    //   selectKeys = isRadio ? keys : checkedKeys;
    //   selectedRows = isRadio ? [record] : Object.values(checkedRowWithKey);
    //   setHalfSelectedKeys(halfCheckedKeys);
    // } else {
    //   const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = removeUselessKeys(keys, halfKeys);
    //   selectKeys = isRadio ? [] : checkedKeys;
    //   selectedRows = isRadio ? [] : Object.values(checkedRowWithKey);
    //   setHalfSelectedKeys(halfCheckedKeys);
    // }
    // if (!('selectedRowKeys' in rowSelection!) || rowSelection?.selectedRowKeys === undefined) {
    //   setSelectedKeys(selectKeys);
    // }
    //
    // if (typeof rowSelection?.onSelect === 'function') {
    //   rowSelection.onSelect(record, selected, selectedRows, event);
    // }
    //
    // if (typeof rowSelection?.onChange === 'function') {
    //   rowSelection?.onChange(selectKeys, selectedRows);
    // }
  };

  const flattenCurrentPageData = useMemo(() => {
    return flatRecords(currentPageData);
  }, [flatRecords, currentPageData]);

  const currentPageAllKeys = useMemo(() => {
    return flattenCurrentPageData.map((data) => {
      return getRecordKey(data);
    });
  }, [flattenCurrentPageData, getRecordKey]);

  // 2.待测试--分页的话只勾选当页的数据
  // todo 待优化 currPageRecords currPageKeys 待测试
  // todo 选择的keys 和records 如果存在分页的话则应该选择所有的页面的 要拼接 但是currPageRecords 这里应该是指当页所有选择的数据包括展开的
  // todo currPageRecords 这里应该是指当页所有选择的数据包括展开的
  const handleSelectAll = (selected: boolean) => {
    let selectedRecords: T[];
    let finalSelectedKeys: React.Key[];

    if (selected) {
      const { checkedKeyRecordMap, checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(
        Array.from(new Set([...selectedKeys, ...currentPageAllKeys])),
      );
      finalSelectedKeys = checkedKeys;
      selectedRecords = [...checkedKeyRecordMap.values()];
      updateHalfSelectedKeys(halfCheckedKeys);
    } else {
      finalSelectedKeys = [];
      selectedRecords = [];
      updateHalfSelectedKeys([]);
    }

    if (rowSelection?.onSelectAll) {
      // 3. 待测试--分页情况下currPageRecords 也是当前current页面操作的数据
      // flatRecords(dataSource)
      // rowSelection.onSelectAll(selected, selectedRecords, currPageRecords);
      rowSelection.onSelectAll(selected, selectedRecords, flattenCurrentPageData);
    }
    if (rowSelection?.onChange) {
      rowSelection.onChange(finalSelectedKeys, selectedRecords);
    }

    if (!('selectedRowKeys' in rowSelection!)) {
      updateSelectedKeys(finalSelectedKeys);
    }

    // let selectedRows: T[];
    // let selectKeys: (number | string)[];
    // if (selected) {
    //   const { checkedKeys, checkedRowWithKey, halfCheckedKeys } =
    //     fillMissSelectedKeys(currPageKeys);
    //   selectKeys = checkedKeys;
    //   selectedRows = Object.values(checkedRowWithKey);
    //   setHalfSelectedKeys(halfCheckedKeys);
    // } else {
    //   selectKeys = [];
    //   selectedRows = [];
    //   setHalfSelectedKeys([]);
    // }
    //
    // if (rowSelection?.onSelectAll) {
    //   // 3. 待测试--分页情况下currPageRecords 也是当前current页面操作的数据
    //   rowSelection.onSelectAll(selected, selectedRows, currPageRecords);
    // }
    // if (rowSelection?.onChange) {
    //   rowSelection.onChange(selectKeys, selectedRows);
    // }
    //
    // if (!('selectedRowKeys' in rowSelection!) || rowSelection?.selectedRowKeys === undefined) {
    //   setSelectedKeys(selectKeys);
    // }
  };

  const handleSortChange = (col: ColumnType<T>, order: 'asc' | 'desc', columnKey: React.Key) => {
    const index = sorterStates.findIndex((sorterState) => sorterState.key === columnKey);
    const isCancel = index >= 0 && sorterStates[index].order === order;

    if (isCancel) {
      const filterResult = sorterStates.filter((sorterState) => sorterState.key !== columnKey);
      if (!('sortOrder' in col)) {
        updateSorterStates(filterResult);
      }
      // setSorterState(filterResult);
      // setSorterState((prev) => {
      //   return prev.filter((p) => p.dataIndex !== col.dataIndex);
      // });
      // if (typeof onSortCancel === 'function') {
      //   onSortCancel(omit(col, ['colSpan', 'type']) as ColumnsType<T>, order);
      // }
      // const sortInfos = filterResult.map((f) => ({ field: f.dataIndex, order: f.order }));
      onSort &&
        onSort({
          column: col,
          order: null,
          field: col.dataIndex,
        });
      return;
    }
    if (typeof col?.sorter === 'object') {
      if (index >= 0) {
        const copyList = [...sorterStates];
        const item = sorterStates[index];
        item.order = order;
        copyList.splice(index, 1, item);
        if (!('sortOrder' in col)) {
          updateSorterStates(copyList);
        }
        // setSorterState(copyList);
        // onSort && onSort(copyList.map((c) => ({ field: c.dataIndex, order: c.order })));
        // onSort && onSort({
        //   column: col,
        //   order,
        //   field: col.dataIndex
        // });
      } else {
        // const list =
        //   sorterStates.length === 1 && sorterStates[0]?.weight === undefined ? [] : [...sorterStates];
        // list.push({
        //   key: columnKey,
        //   order,
        //   sorter: (col.sorter as Sorter<T>).compare,
        //   weight: (col.sorter as Sorter<T>).weight,
        // });
        // // list.push({
        // //   order,
        // //   dataIndex: col.dataIndex,
        // //   sorter: (col.sorter as SorterType<T>).compare,
        // //   weight: (col.sorter as SorterType<T>).weight,
        // // });
        // list.sort((a, b) => {
        //   const a1 = (a.weight || 0).toString();
        //   const b1 = (b.weight || 0).toString();
        //   return a1.localeCompare(b1);
        // });
        // if (!('sortOrder' in col)) {
        //   updateSorterStates(list);
        // }
        // // setSorterState(list);
        // // const sortInfo = list.map((l) => {
        // //   return { field: l.dataIndex, order: l.order };
        // // });
        // // onSort && onSort(sortInfo);
      }
      onSort &&
        onSort({
          column: col,
          order,
          field: col.dataIndex,
        });
      return;
    }
    if (typeof col?.sorter === 'function') {
      if (!('sortOrder' in col)) {
        updateSorterStates([
          {
            key: columnKey,
            order,
            sorter: col.sorter as (rowA: T, rowB: T) => number,
          },
        ]);
      }
      // setSorterState([
      //   {
      //     order,
      //     dataIndex: col.dataIndex,
      //     sorter: col.sorter as (rowA: T, rowB: T) => number,
      //   },
      // ]);
      // onSort && onSort([{ field: col.dataIndex, order }]);

      onSort &&
        onSort({
          column: col,
          order,
          field: col.dataIndex,
        });
    }
  };

  const handleFilterChange = (
    col: PrivateColumnType<T>,
    checkedValue: React.Key[],
    columnKey: React.Key,
  ) => {
    const index = filterStates.findIndex((filterState) => filterState.key === columnKey);
    if (index >= 0) {
      const copyFilterState = [...filterStates];
      const item = copyFilterState[index];
      item.filteredValue = [...checkedValue];
      copyFilterState.splice(index, 1, item);
      if (!('filteredValue' in col)) {
        updateFilterStates(copyFilterState);
        // setFilterState(copyFilterState);
      }
      if (typeof onFilter === 'function') {
        const filterInfo: Record<React.Key, React.Key[]> = {};
        copyFilterState.forEach((filterState) => {
          filterInfo[filterState.key] = filterState.filteredValue;
        });
        onFilter(filterInfo);
      }
      if (pagination && !('current' in pagination)) {
        // setCurrentPage(1);
        updateCurrentPage(1);
      }
      if (typeof pagination?.onChange === 'function') {
        pagination.onChange(1, pageSize);
      }
    }
  };

  // todo
  const handleHeaderMouseDown = (
    resizeInfo: ResizeInfoType,
    col: PrivateColumnType<T>,
    // col: ColumnsWithType<T>,
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
      const copyMergeColumns = [...mergeColumns];
      const oldWidth = copyMergeColumns[colIndex]._width;
      copyMergeColumns[colIndex] = { ...col, width: columnWidth };
      handleResize(copyMergeColumns);
      // updateMergeColumns(copyMergeColumns);
      // const copyColumns = [...columns];
      // const oldWidth = columnsWithWidth[colIndex].width;
      // copyColumns[colIndex] = { ...col, width: columnWidth };
      // setColWidths([]);
      // setColumns(copyColumns);
      resizeEl.style.cssText = `display: none`;

      // const column = copyColumns[colIndex] as ColumnsType<T>;
      onColumnResize &&
        onColumnResize(
          columnWidth,
          oldWidth as number,
          omit(copyMergeColumns[colIndex], ['_width']),
          event,
        );

      document.removeEventListener('mousemove', handleHeaderMouseMove);
      document.removeEventListener('mouseup', handleHeaderMouseUp);
      document.onselectstart = null;
      document.ondragstart = null;
    };

    document.addEventListener('mousemove', handleHeaderMouseMove);
    document.addEventListener('mouseup', handleHeaderMouseUp);
  };

  const handlePaginationChange = (current: number, size: number) => {
    // todo current 条件是否成立
    if (pagination && !('current' in pagination)) {
      updateCurrentPage(1);
      // setCurrentPage(current);
    }
    if (pagination && !('pageSize' in pagination)) {
      updatePageSize(size);
      // setPageSize(size);
    }
    if (typeof pagination?.onChange === 'function') {
      pagination.onChange(current, size);
    }
  };

  const handleScrollVertical = (offset: number, availableSize: number) => {
    setScrollTop((prev) => {
      let newOffset = prev + offset;
      newOffset = Math.max(0, newOffset);
      newOffset = Math.min(newOffset, scrollHeight - availableSize);
      if (prev !== newOffset) {
        const item = cachePosition.find((p) => p.bottom >= newOffset);
        if (item && item.index !== lastStartRowIndex.current) {
          // console.log(`item.index: ${item.index}`);
          lastStartRowIndex.current = item.index;
          setStartOffset(item.top);
          setStartRowIndex(item.index);
        }
      }
      return newOffset;
    });
    // const item = cachePosition.find((p) => p.bottom >= offset);
    // if (item && item.index !== startRowIndex) {
    //   // console.log(`item.index: ${item.index}`);
    //   setStartOffset(item.top);
    //   setStartRowIndex(item.index);
    // }
    // if (offset !== scrollTop) {
    //   setScrollTop(offset);
    // }
  };

  const handleScrollHorizontal = (offset: number) => {
    setScrollLeft(offset);
  };

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

  // useEffect(() => {
  //   if (pagination && 'current' in pagination) {
  //     setCurrentPage(pagination?.current || 1);
  //   }
  //   if (pagination && 'pageSize' in pagination) {
  //     setPageSize(pagination?.pageSize || 10);
  //   }
  // }, [pagination]);

  // todo rowSelection 待测试
  useEffect(() => {
    if (rowSelection && 'selectedRowKeys' in rowSelection) {
      if (selectionType === 'checkbox') {
        const { checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(
          rowSelection.selectedRowKeys || [],
        );
        updateHalfSelectedKeys(halfCheckedKeys);
        updateSelectedKeys(checkedKeys);
      } else {
        updateHalfSelectedKeys([]);
        updateSelectedKeys(rowSelection.selectedRowKeys || []);
      }
      // const { checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(
      //   rowSelection.selectedRowKeys || [],
      // );
      // setSelectedKeys(checkedKeys);
      // setHalfSelectedKeys(halfCheckedKeys);
    }
  }, [selectionType, rowSelection?.selectedRowKeys, fillMissSelectedKeys]);

  // useEffect(() => {
  //   if (treeProps?.expandedRowKeys) {
  //     setTreeExpandKeys(treeProps.expandedRowKeys);
  //   }
  // }, [treeProps]);

  // todo columns 主要是过滤排序吧
  // useEffect(() => {
  //   setColumns(originColumns);
  // }, [originColumns]);

  // column todo
  // useEffect(() => {
  //   let exist = false;
  //   const filter: FilterStateType<T>[] = [];
  //   flattenColumns.forEach((col) => {
  //     if ('filteredValue' in col) {
  //       exist = true;
  //       filter.push({
  //         filteredValue: col?.filteredValue || [],
  //         dataIndex: col?.dataIndex || col?.key,
  //         filterMethod: col?.filterMethod,
  //       });
  //     }
  //   });
  //   exist && setFilterState(filter);
  // }, [flattenColumns]);

  // 4. 待测试-分页情况下表头的全选只针对当前页面数据
  // const checked = useMemo(() => {
  //   if (!selectedKeys.length) {
  //     return false;
  //   }
  //   const isSame = currPageKeys.every((key) => {
  //     return selectedKeys.indexOf(key) >= 0;
  //   });
  //   const isExist = currPageKeys.some((key) => {
  //     return selectedKeys.indexOf(key) >= 0;
  //   });
  //   return isSame ? true : isExist ? 'indeterminate' : false;
  // }, [selectedKeys, currPageKeys]);

  const checked = useMemo(() => {
    if (!selectedKeys.length) {
      return false;
    }
    const isAllChecked = currentPageAllKeys.every((key) => {
      return selectedKeys.indexOf(key) >= 0;
    });
    const isHalfChecked = currentPageAllKeys.some((key) => {
      return selectedKeys.indexOf(key) >= 0;
    });
    return isAllChecked ? true : isHalfChecked ? 'indeterminate' : false;
  }, [selectedKeys, currentPageAllKeys]);

  // const isTree = useMemo(() => {
  //   const data = list.filter((d) => d?.children && d.children.length);
  //   return data.length > 0;
  // }, [list]);
  const isTree = useMemo(() => {
    const data = currentPageData.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [currentPageData]);

  // todo columns
  // const scrollWidth = useMemo(() => {
  //   if (width) return width;
  //   return columnsWithWidth.reduce((total, col) => {
  //     return total + (Number(parseValue(col.width)) || 0);
  //   }, 0);
  // }, [width, columnsWithWidth]);

  // const scrollWidth = useMemo(() => {
  //   return flattenColumns.reduce((total, column) => {
  //     return total + column.width;
  //   }, 0);
  // }, [flattenColumns]);

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

  // 考虑renderMaxRows 小于容器高度时候会出现底部空白 这时候取的renderMaxRows刚好为能撑开容器高度那一行的行号
  // const getRenderMaxRows = useCallback(() => {
  //   if (renderMaxRows <= 0 || renderMaxRows > list.length || !showScrollbarY) {
  //     return list.length;
  //   }
  //   if (virtualContainerHeight) {
  //     const virtualContainerAvailableHeight =
  //       virtualContainerHeight - (showScrollbarX ? BAR_WIDTH : 0);
  //     const start = (currentPage - 1) * pageSize + startRowIndex;
  //     const sumHeight = getSumHeight(start, start + renderMaxRows);
  //     if (sumHeight > virtualContainerAvailableHeight) {
  //       return renderMaxRows;
  //     } else {
  //       const item = cachePosition.find((c) => c.top >= virtualContainerAvailableHeight);
  //       return item?.index ?? renderMaxRows;
  //     }
  //   }
  //   return renderMaxRows;
  // }, [
  //   renderMaxRows,
  //   list,
  //   showScrollbarY,
  //   virtualContainerHeight,
  //   showScrollbarX,
  //   cachePosition,
  //   startRowIndex,
  //   getSumHeight,
  //   currentPage,
  //   pageSize,
  // ]);

  const getRenderMaxRows = useCallback(() => {
    const item = cachePosition.find((c) => c.top >= virtualContainerHeight);
    if (item) {
      return renderMaxRows >= item.index ? renderMaxRows : item.index;
    }
    return renderMaxRows;
  }, [virtualContainerHeight, renderMaxRows, cachePosition]);

  // 已修复bug 分页滚动到底部 切换到最后一页发现是空白的 在于 startRowIndex 大于数据开始行数
  // 考虑分页后最后一列的数据的高度小于容器的高度 滚动条是否会出现
  // useEffect(() => {
  //   // 如果没有垂直滚动条 startRowIndex 永远为0
  //   if (startRowIndex >= list.length) {
  //     setStartRowIndex(0);
  //     setStartOffset(0);
  //     setStartRowIndex(0);
  //     setScrollTop(0);
  //   }
  // }, [list, startRowIndex]);
  useEffect(() => {
    // 如果没有垂直滚动条 startRowIndex 永远为0
    if (startRowIndex >= currentPageData.length) {
      setStartRowIndex(0);
      setStartOffset(0);
      setStartRowIndex(0);
      setScrollTop(0);
    }
  }, [currentPageData, startRowIndex]);

  useEffect(() => {
    if (virtualContainerRef.current) {
      const { height: containerHeight } = virtualContainerRef.current.getBoundingClientRect();
      setVirtualContainerHeight(containerHeight);
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    let y = 0;
    let pixelX = 0;
    let pixelY = 0;

    const updateScrollbarPosition = (offset: number) => {
      if (scrollBarRef.current) {
        const thumbSize = scrollBarRef.current.clientHeight;
        const ratio =
          (scrollHeight - virtualContainerHeight) / (virtualContainerHeight - thumbSize);
        scrollBarRef.current.style.transform = `translateY(${offset / ratio}px)`;
      }
    };

    const handleWheel = (event: any) => {
      const target = getParent(event.target, virtualContainerRef.current);
      if (target !== virtualContainerRef.current) return;
      const normalized = normalizeWheel(event);
      pixelX = normalized.pixelX;
      pixelY = normalized.pixelY;

      if (Math.abs(pixelX) > Math.abs(pixelY)) {
        pixelY = 0;
      } else {
        pixelX = 0;
      }

      // vertical wheel
      if (pixelX === 0) {
        y += pixelY;
        y = Math.max(0, y);
        y = Math.min(y, scrollHeight - virtualContainerHeight);

        if (y !== lastScrollTop.current) {
          const item = cachePosition.find((p) => p.bottom > y);
          if (item) {
            if (lastStartRowIndex.current !== item.index) {
              setStartRowIndex(item.index);
              lastStartRowIndex.current = item.index;
            }
            const offset = y - item.top;
            updateScrollbarPosition(y);
            tbodyRef.current.style.transform = `translateY(-${offset}px)`;
          }
          lastScrollTop.current = y;
        }

        pixelY = 0;
      }

      // horizontal wheel
      // if (pixelY.current === 0) {
      //   let offset = scrollLeft + pixelX.current;
      //   offset = Math.max(0, offset);
      //   offset = Math.min(offset, scrollWidth - virtualContainerAvailableWidth);
      //   if (offset === scrollLeft) return;
      //   handleHorizontalScroll(offset);
      //   pixelX.current = 0;
      // }
      ticking = false;
    };

    const wheelListener = (event: any) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleWheel(event);
        });
        ticking = true;
      }
      event.preventDefault();
    };

    virtualContainerRef.current?.addEventListener('wheel', wheelListener, { passive: false });

    return () => {
      virtualContainerRef.current?.removeEventListener('wheel', wheelListener);
    };
  }, [scrollHeight, virtualContainerHeight, cachePosition]);

  // todo 这个获取有问题 如果在不同demo 之间切换获取到的值偏大
  useEffect(() => {
    if (tableContainer.current) {
      setContainerWidth(tableContainer.current.clientWidth);
    }
  }, []);

  const handleBarScroll = (offset: number) => {
    offset = Math.max(0, offset);
    offset = Math.min(offset, scrollHeight - virtualContainerHeight);
    if (offset !== lastScrollTop.current) {
      const item = cachePosition.find((p) => p.bottom > offset);
      if (item) {
        if (lastStartRowIndex.current !== item.index) {
          setStartRowIndex(item.index);
          lastStartRowIndex.current = item.index;
        }
        if (tbodyRef.current) {
          tbodyRef.current.style.transform = `translateY(-${offset - item.top}px)`;
        }
      }
      lastScrollTop.current = offset;
    }
  };

  const renderVirtualBody = () => {
    return (
      <div
        className={classnames({
          'virtual-container': true,
        })}
        ref={virtualContainerRef}
      >
        <div className="virtual-content">
          <div
            className="table-tbody"
            ref={tbodyRef}
            // style={{
            //   width: scrollWidth,
            //   marginTop: `${startOffset}px`,
            //   transform: `translate(-${scrollLeft}px, -${scrollTop}px)`,
            // }}
          >
            <table style={{ width: scrollWidth }}>
              <Colgroup
                // colWidths={colWidths}
                // columns={columnsWithWidth}
                columns={flattenColumns}
              />
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
                dataSource={currentPageData.slice(
                  startRowIndex,
                  startRowIndex + getRenderMaxRows(),
                )}
                // columns={flatColumns}
                columns={flattenColumns}
                // columns={columnsWithWidth}
                keyLevelMap={keyLevelMap}
                // treeLevelMap={treeLevel.current}
                treeExpandKeys={treeExpandKeys}
                selectedKeys={selectedKeys}
                halfSelectedKeys={halfSelectedKeys}
                onSelect={handleSelect}
                onTreeExpand={handleTreeExpand}
                // onBodyRender={handleBodyRender}
                onBodyRender={() => {}}
                onUpdateRowHeight={handleUpdateRowHeight}
                getRecordKey={getRecordKey}
              />
            </table>
          </div>
        </div>
        {showScrollbarY ? (
          <VirtualScrollBar
            orientation="vertical"
            size={virtualContainerHeight}
            contentSize={scrollHeight}
            ref={scrollBarRef}
            onScroll={handleBarScroll}
          />
        ) : null}
        {/*{showScrollbarY ? (*/}
        {/*  <ScrollBar*/}
        {/*    orientation="vertical"*/}
        {/*    size={virtualContainerHeight}*/}
        {/*    contentSize={scrollHeight}*/}
        {/*    offset={scrollTop}*/}
        {/*    onScroll={handleVerticalScroll}*/}
        {/*  />*/}
        {/*) : null}*/}
      </div>
    );
  };

  const handleHorizontalScroll = (offset: number) => {
    // console.log(`horizontal: ${offset}`);
    let offsetRight = 0;
    if (tbodyRef.current) {
      // tbodyRef.current.scrollLeft = offset;
      const bodyTable = tbodyRef.current.querySelector('table');
      const clientWidth = tbodyRef.current.clientWidth;
      const maxScrollWidth = bodyTable.scrollWidth - clientWidth;
      // const maxScrollWidth = scrollWidth - clientWidth;
      offsetRight = maxScrollWidth - offset;
    }
    if (theadRef.current) {
      theadRef.current.querySelector('table').style.transform = `translateX(-${offset}px)`;
      // theadRef.current.scrollLeft = offset;
    }
    // console.log(`offsetRight: ${offsetRight}`);
    [theadRef.current, tbodyRef.current].forEach((el) => {
      if (!el) return;
      // el.style.transform = `translateX(-${offset}px)`;
      // el.scrollLeft = offset;
      el.querySelectorAll('.cell-fixed-left, .cell-fixed-right').forEach(
        (cell: HTMLTableDataCellElement) => {
          if (cell.classList.contains('cell-fixed-left')) {
            cell.style.transform = `translateX(${offset}px)`;
          } else if (cell.classList.contains('cell-fixed-right')) {
            cell.style.transform = `translateX(-${offsetRight}px)`;
          }
          if (cell.classList.contains('cell-is-last-fixedLeft')) {
            if (offset > 0) {
              cell.classList.add('cell-fixed-last-left');
            } else {
              cell.classList.remove('cell-fixed-last-left');
            }
          } else if (cell.classList.contains('cell-is-first-fixedRight')) {
            if (offsetRight > 0) {
              cell.classList.add('cell-fixed-first-right');
            } else {
              cell.classList.remove('cell-fixed-first-right');
            }
          }
        },
      );
    });
  };

  // 1. 考虑没有设置height 时候展示数据范围 没有设置height 就不展示滚动条 设置了height 需要和容器的高度做对比
  // 2. 考虑分页时候设置pageSize 大于renderMaxRows
  const renderBody = () => {
    return virtualized ? (
      renderVirtualBody()
    ) : (
      <ScrollBars onHorizontalScroll={handleHorizontalScroll}>
        <div
          className="table-tbody"
          ref={tbodyRef}
          // style={{
          //   width: scrollWidth,
          //   marginTop: `${startOffset}px`,
          //   transform: `translate(-${scrollLeft}px, -${scrollTop}px)`,
          // }}
        >
          <table style={{ width: scrollWidth }}>
            <Colgroup
              // colWidths={colWidths}
              // columns={columnsWithWidth}
              columns={flattenColumns}
            />
            <Tbody
              {...props}
              bordered
              empty={empty}
              isTree={isTree}
              scrollLeft={scrollLeft}
              offsetRight={offsetRight}
              startRowIndex={startRowIndex}
              // startRowIndex={0}
              dataSource={currentPageData}
              // dataSource={list.slice(startRowIndex, startRowIndex + getRenderMaxRows())}
              // columns={flatColumns}
              columns={flattenColumns}
              // columns={columnsWithWidth}
              keyLevelMap={keyLevelMap}
              // treeLevelMap={treeLevel.current}
              treeExpandKeys={treeExpandKeys}
              selectedKeys={selectedKeys}
              halfSelectedKeys={halfSelectedKeys}
              onSelect={handleSelect}
              onTreeExpand={handleTreeExpand}
              onBodyRender={() => {}}
              onUpdateRowHeight={handleUpdateRowHeight}
              getRecordKey={getRecordKey}
            />
          </table>
        </div>
      </ScrollBars>
    );
    // return (
    //   <VirtualList
    //     scrollWidth={scrollWidth}
    //     // scrollWidth={getScrollWidth()}
    //     scrollHeight={scrollHeight}
    //     scrollTop={scrollTop}
    //     scrollLeft={scrollLeft}
    //     showScrollbarX={showScrollbarX}
    //     showScrollbarY={showScrollbarY}
    //     onMount={handleMount}
    //     onScrollVertical={handleScrollVertical}
    //     onScrollHorizontal={handleScrollHorizontal}
    //   >
    //     <div
    //       className="table-tbody"
    //       ref={tbodyRef}
    //       style={{
    //         width: scrollWidth,
    //         marginTop: `${startOffset}px`,
    //         transform: `translate(-${scrollLeft}px, -${scrollTop}px)`,
    //       }}
    //     >
    //       <table style={{ width: scrollWidth }}>
    //         <Colgroup colWidths={colWidths} columns={columnsWithWidth} />
    //         <Tbody
    //           {...props}
    //           bordered
    //           empty={empty}
    //           isTree={isTree}
    //           scrollLeft={scrollLeft}
    //           offsetRight={offsetRight}
    //           startRowIndex={startRowIndex}
    //           // startRowIndex={0}
    //           // dataSource={list}
    //           dataSource={list.slice(startRowIndex, startRowIndex + getRenderMaxRows())}
    //           // columns={flatColumns}
    //           columns={columnsWithWidth}
    //           treeLevelMap={treeLevel.current}
    //           treeExpandKeys={treeExpandKeys}
    //           selectedKeys={selectedKeys}
    //           halfSelectedKeys={halfSelectedKeys}
    //           onSelect={handleSelect}
    //           onTreeExpand={handleTreeExpand}
    //           onBodyRender={handleBodyRender}
    //           onUpdateRowHeight={handleUpdateRowHeight}
    //         />
    //       </table>
    //     </div>
    //   </VirtualList>
    // );
  };

  const renderHeader = () => {
    return (
      <div
        ref={theadRef}
        className={classnames({
          'table-thead': true,
          'table-head-gutter': showScrollbarY,
        })}
      >
        <table
          style={{
            width: scrollWidth,
            // transform: `translate(-${scrollLeft}px, 0)`,
          }}
        >
          <Colgroup
            // colWidths={colWidths}
            // columns={columnsWithWidth}
            columns={flattenColumns}
          />
          <Thead
            bordered
            checked={checked}
            locale={locale}
            columns={fixedColumns}
            // columns={columnsWithFixed}
            // scrollLeft={scrollLeft}
            // offsetRight={offsetRight}
            sorterStates={sorterStates}
            filterStates={filterStates}
            // filterState={filterState}
            expandable={expandable}
            rowSelection={rowSelection}
            renderSorter={renderSorter}
            headerCellClassName={headerCellClassName}
            headerCellStyle={headerCellStyle}
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
