import React, { useMemo, useRef, useState, useEffect, useCallback, useContext } from 'react';
import classnames from 'classnames';
import useColumns from '../hooks/useColumns';
import useSorter from '../hooks/useSorter';
import useFilter from '../hooks/useFilter';
import useExpand from '../hooks/useExpand';
import useSelection from '../hooks/useSelection';
import usePagination from '../hooks/usePagination';
import useTreeExpand from '../hooks/useTreeExpand';
import Thead from '../Thead';
import Tbody from '../Tbody';
import VirtualBody from '../VirtualBody';
import Colgroup from '../Colgroup';
import Pagination from '../Pagination';
import Spin from '../Spin';
import type {
  TreeLevelType,
  LevelRecordType,
  RowKeyType,
  CachePositionType,
  LocalType,
} from '../interface';
import type {
  ColumnsType,
  ColumnType,
  RowSelection,
  Expandable,
  TreeExpandable,
  ColumnGroupType,
  PrivateColumnsType,
  PrivateColumnType,
  PrivateColumnGroupType,
  ResizeInfo,
} from '../interface1';
import VirtualList from '../VirtualList';
import type { PaginationProps } from '../index';
import '../style/index.less';
import { getRowKey, getParent } from '../utils/util';
import { BAR_WIDTH } from '../utils/constant';
import { omitColumnProps } from '../utils/util';
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
  /** 表格行的style */
  rowStyle?: (record: T, index: number) => React.CSSProperties | React.CSSProperties;
  /** 表体单元格的类名 */
  cellClassName?: (column: ColumnType<T>, rowIndex: number, colIndex: number) => string | string;
  /** 表体单元格的style */
  cellStyle?: (
    column: ColumnType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  /** 表头单元格的类名 */
  headerCellClassName?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => string | string;
  /** 表头单元格的style */
  headerCellStyle?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  /** 表头行的类名 */
  headerRowClassName?: (rowIndex: number) => string | string;
  /** 表头行的style */
  headerRowStyle?: (rowIndex: number) => React.CSSProperties | React.CSSProperties;
  /** 设置表头行事件 */
  onHeaderRowEvents?: (rowIndex: number) => object;
  /** 设置表头行单元格事件 */
  onHeaderCellEvents?: (column: ColumnType<T> | ColumnGroupType<T>, rowIndex: number) => object;
  /** 设置表体行事件 */
  onRowEvents?: (record: T, rowIndex: number) => object;
  /** 设置表体单元格事件 */
  onCellEvents?: (record: T, rowIndex: number) => object;
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
  onColumnResize?: (
    newWidth: number,
    oldWidth: number,
    column: ColumnType<T>,
    event: Event,
  ) => void;
  /** 表格行是否可选择配置项 todo header 需要表头空一行 */
  rowSelection?: RowSelection<T>;
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
// todo bug 多级表头中选中B D 两个过滤 最后一列fixed:right 出现问题
// todo 还未测试列宽设为百分比的情况
// todo bug columnWidth: '160' 不起作用
// todo bug 如果dataIndex 在data 中找不到对应字段数据 是不是要加个key 给用户自己设置
// todo 2.单元格word-break 样式更改
// 设置colgroup 列的宽度  然后获取每个单元格最后渲染的宽度 重新设置 colgroup 的宽度
function Table<T extends { key?: number | string; children?: T[] }>(props: TableProps<T>) {
  const localeContext = useContext(LocaleContext);

  const {
    width,
    height,
    striped,
    bordered,
    style = {},
    className = '',
    size = 'default',
    showHeader = true,
    rowKey = 'key',
    loading,
    columns,
    dataSource,
    pagination,
    // columns: originColumns,
    treeProps,
    expandable,
    rowSelection,
    onSort,
    onFilter,
    renderMaxRows = 20,
    rowHeight = 46,
    virtualized,
    empty = 'No data',
    onColumnResize,
    locale = localeContext.table,
    headerCellStyle,
    headerCellClassName,
    headerRowStyle,
    headerRowClassName,
    onHeaderRowEvents,
    onHeaderCellEvents,
    rowStyle,
    rowClassName,
    cellStyle,
    cellClassName,
    onRowEvents,
    onCellEvents,
  } = props;

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
    return getLevelInfo(dataSource, 0);
  }, [dataSource, getLevelInfo]);

  const selectionType = useMemo(() => {
    const column = columns.find(
      (column) => 'type' in column && (column?.type === 'checkbox' || column?.type === 'radio'),
    );
    if (column) return (column as ColumnType<T>).type as 'checkbox' | 'radio';
    return rowSelection ? rowSelection?.type || 'checkbox' : undefined;
  }, [columns, rowSelection?.type]);

  const flattenDataSource = useMemo(() => {
    return flatRecords(dataSource);
  }, [dataSource]);

  const allKeys = useMemo(() => {
    return flattenDataSource.map((record) => {
      return getRecordKey(record);
    });
  }, [flattenDataSource, getRecordKey]);

  const [
    mergeColumns,
    fixedColumns,
    flattenColumns,
    updateMergeColumns,
    initMergeColumns,
    flatColumns,
    addWidthForColumns,
  ] = useColumns(columns, rowSelection, expandable);

  const [
    selectedKeys,
    halfSelectedKeys,
    fillMissSelectedKeys,
    handleSelect,
    updateHalfSelectedKeys,
    updateSelectedKeys,
  ] = useSelection(
    dataSource,
    maxTreeLevel,
    levelRecordMap,
    getRecordKey,
    rowSelection,
    selectionType,
  );

  const [filterStates, updateFilterStates, getFilterData] = useFilter(mergeColumns);

  const [sorterStates, getSortData, handleSortChange] = useSorter(mergeColumns, onSort);

  const [currentPage, pageSize, updateCurrentPage, updatePageSize] = usePagination(pagination);

  const [expandedRowKeys, handleExpand] = useExpand(allKeys, expandable);

  const [treeExpandKeys, handleTreeExpand] = useTreeExpand(allKeys, treeProps);

  // todo 待测试有没有考虑树形中children data 的排序 过滤
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

  const flattenCurrentPageData = useMemo(() => {
    return flatRecords(currentPageData);
  }, [flatRecords, currentPageData]);

  const currentPageAllKeys = useMemo(() => {
    return flattenCurrentPageData.map((data) => {
      return getRecordKey(data);
    });
  }, [flattenCurrentPageData, getRecordKey]);

  const resizeLineRef = useRef<HTMLDivElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const theadRef = useRef<any>(null);
  const tbodyRef = useRef<any>(null);

  const lastScrollLeft = useRef<number>(0);

  const lastRestOffsetRight = useRef<number>(0);

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

  const [virtualContainerWidth, setVirtualContainerWidth] = useState<number>(0);

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const [virtualContainerHeight, setVirtualContainerHeight] = useState<number>(0);

  const [scrollWidth, setScrollWidth] = useState<number>(width || 0);

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  const [scrollTop, setScrollTop] = useState<number>(0);

  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const [startOffset, setStartOffset] = useState<number>(0);

  // todo 应该是基于list 进行获取所有records keys
  // todo list 如果在这里添加了treeChilren 数据遇到虚拟列表会被切分 应该放到tbody 中处理 已处理 待测试
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

  const handleResize = useCallback(
    (targetColumns: PrivateColumnsType<T>) => {
      if (tbodyRef.current) {
        let widthSum = 0;
        let noWidthColumnsCount = 0;
        const noMaxWidthColumnKeys: React.Key[] = [];
        const tbodyWidth = width || tbodyRef.current.offsetWidth;

        const columnsWidth = new Map<React.Key, number>();

        const flattenTargetColumns = flatColumns(targetColumns);

        flattenTargetColumns.map((column) => {
          if (column.width) {
            widthSum += parseInt(`${column.width}`, 10);
          } else {
            noWidthColumnsCount++;
            if (!column.maxWidth) {
              noMaxWidthColumnKeys.push(column._columnKey);
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
            columnsWidth.set(column._columnKey, parseInt(`${column.width}`, 10));
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
            columnsWidth.set(column._columnKey, Math.max(parseInt(`${columnWidth}`, 10), 0));
          }
        });

        if (remainWidth > 0) {
          averageWidth = parseInt(`${remainWidth / noMaxWidthColumnKeys.length}`, 10);
          flattenTargetColumns.map((c) => {
            if (noMaxWidthColumnKeys.indexOf(c._columnKey) >= 0) {
              const oldWidth = columnsWidth.get(c._columnKey);
              columnsWidth.set(c._columnKey, parseInt(`${Number(oldWidth) + averageWidth}`, 10));
            }
          });
        }

        const tableWidth = [...columnsWidth.values()].reduce((total, columnWidth) => {
          return total + columnWidth;
        }, 0);

        const widthColumns = addWidthForColumns(columnsWidth, targetColumns);

        setScrollWidth(tableWidth);
        updateMergeColumns(widthColumns);
      }
    },
    [width, flatColumns, addWidthForColumns],
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
      rowSelection.onSelectAll(selected, selectedRecords, flattenCurrentPageData);
    }
    if (rowSelection?.onChange) {
      rowSelection.onChange(finalSelectedKeys, selectedRecords);
    }

    if (rowSelection && !rowSelection?.selectedRowKeys) {
      updateSelectedKeys(finalSelectedKeys);
    }
  };

  const handleFilterChange = (
    col: PrivateColumnType<T> | PrivateColumnGroupType<T>,
    checkedValue: React.Key[],
  ) => {
    const index = filterStates.findIndex((filterState) => filterState.key === col._columnKey);
    if (index >= 0) {
      const copyFilterState = [...filterStates];
      const item = copyFilterState[index];
      item.filteredValue = [...checkedValue];
      copyFilterState.splice(index, 1, item);
      if (!('filteredValue' in col)) {
        updateFilterStates(copyFilterState);
      }
      if (typeof onFilter === 'function') {
        const filterInfo: Record<React.Key, React.Key[]> = {};
        copyFilterState.forEach((filterState) => {
          filterInfo[filterState.key] = filterState.filteredValue;
        });
        onFilter(filterInfo);
      }
      if (pagination && !('current' in pagination)) {
        updateCurrentPage(1);
      }
      if (typeof pagination?.onChange === 'function') {
        pagination.onChange(1, pageSize);
      }
    }
  };

  const handleHeaderMouseDown = (resizeInfo: ResizeInfo, col: PrivateColumnType<T>) => {
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
    // 由于是取flatColumns 所以是最后一层的columns 所以只能限制成没有column.children 的才能伸缩列
    const handleHeaderMouseUp = (event: Event) => {
      let oldWidth = 0;
      const columnWidth =
        parseInt(resizeEl.style.left, 10) - (resizingRect.left - tableContainerRect.left);

      const modifyWidthForColumns = (
        columnWidth: number,
        columnKey: React.Key,
        targetColumns: PrivateColumnsType<T>,
      ) => {
        const widthColumns: PrivateColumnsType<T> = [];
        targetColumns.map((column) => {
          if ('children' in column && column.children.length) {
            widthColumns.push({
              ...column,
              children: modifyWidthForColumns(columnWidth, columnKey, column.children),
            });
          } else {
            if (column._columnKey === columnKey) {
              oldWidth = column._width as number;
              widthColumns.push({ ...column, width: columnWidth });
            } else {
              widthColumns.push({ ...column });
            }
          }
        });
        return widthColumns;
      };

      handleResize(modifyWidthForColumns(columnWidth, col._columnKey, mergeColumns));
      onColumnResize && onColumnResize(columnWidth, oldWidth, omitColumnProps(col), event);
      resizeEl.style.cssText = `display: none`;

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
      updateCurrentPage(current);
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

  // 4. 待测试-分页情况下表头的全选只针对当前页面数据
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
              <Colgroup columns={flattenColumns} />
              <Tbody
                empty={empty}
                striped={!!striped}
                bordered={!!bordered}
                selectionType={selectionType}
                startRowIndex={startRowIndex}
                dataSource={currentPageData.slice(
                  startRowIndex,
                  startRowIndex + getRenderMaxRows(),
                )}
                columns={flattenColumns}
                keyLevelMap={keyLevelMap}
                getRecordKey={getRecordKey}
                selectedKeys={selectedKeys}
                halfSelectedKeys={halfSelectedKeys}
                expandedRowKeys={expandedRowKeys}
                treeProps={treeProps}
                expandable={expandable}
                rowSelection={rowSelection}
                rowClassName={rowClassName}
                rowStyle={rowStyle}
                cellClassName={cellClassName}
                cellStyle={cellStyle}
                onRowEvents={onRowEvents}
                onCellEvents={onCellEvents}
                handleSelect={handleSelect}
                handleExpand={handleExpand}
                treeExpandKeys={treeExpandKeys}
                handleTreeExpand={handleTreeExpand}
                onUpdateRowHeight={handleUpdateRowHeight}
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

  // todo 发生过滤后纵向滚动条重置为0 横向滚动条保持原来位置不变
  const handleHorizontalScroll = useCallback((offset: number) => {
    console.log(`horizontal: ${offset}`);
    let offsetRight = 0;
    if (tbodyRef.current) {
      // tbodyRef.current.parentNode.style.transform = `translateX(-${offset}px)`;
      const bodyTable = tbodyRef.current.querySelector('table');
      const clientWidth = tbodyRef.current.clientWidth;
      // console.log(`clientWidth: ${clientWidth}`);
      // console.log(`scrollWidth: ${bodyTable.scrollWidth}`);
      const maxScrollWidth = bodyTable.scrollWidth - clientWidth;
      offsetRight = maxScrollWidth - offset;
      // console.log(`offsetRight: ${offsetRight}`);
    }
    if (theadRef.current) {
      theadRef.current.querySelector('table').style.transform = `translateX(-${offset}px)`;
    }
    [theadRef.current, tbodyRef.current].forEach((el) => {
      if (!el) return;
      el.querySelectorAll('th, td').forEach((cell: HTMLTableDataCellElement) => {
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
      });
    });
    lastScrollLeft.current = offset;
    lastRestOffsetRight.current = offsetRight;
  }, []);

  const currDataSource = useMemo(() => {
    return virtualized
      ? currentPageData.slice(startRowIndex, startRowIndex + getRenderMaxRows())
      : currentPageData;
  }, [virtualized, currentPageData, startRowIndex, getRenderMaxRows]);
  // todo 待实现了纵向滚动后 测试如果是虚拟的话 滚动时候没有监听currDataSource 新添加的数据会不会固定
  useEffect(() => {
    // if (isMount) {
    //   // setTimeout(() => {
    //   //   handleHorizontalScroll(lastScrollLeft.current);
    //   // }, 0);
    //   handleHorizontalScroll(lastScrollLeft.current);
    // }
    handleHorizontalScroll(lastScrollLeft.current);
  }, [mergeColumns, currDataSource, handleHorizontalScroll]);

  // 1. 考虑没有设置height 时候展示数据范围 没有设置height 就不展示滚动条 设置了height 需要和容器的高度做对比
  // 2. 考虑分页时候设置pageSize 大于renderMaxRows
  const renderBody = () => {
    return (
      <ScrollBars onHorizontalScroll={handleHorizontalScroll}>
        <div ref={tbodyRef} className="table-tbody">
          <table style={{ width: scrollWidth }}>
            <Colgroup columns={flattenColumns} />
            <Tbody
              empty={empty}
              striped={!!striped}
              bordered={!!bordered}
              selectionType={selectionType}
              startRowIndex={startRowIndex}
              dataSource={currDataSource}
              // dataSource={
              //   virtualized
              //     ? currentPageData.slice(startRowIndex, startRowIndex + getRenderMaxRows())
              //     : currentPageData
              // }
              columns={flattenColumns}
              keyLevelMap={keyLevelMap}
              getRecordKey={getRecordKey}
              selectedKeys={selectedKeys}
              halfSelectedKeys={halfSelectedKeys}
              expandedRowKeys={expandedRowKeys}
              treeProps={treeProps}
              expandable={expandable}
              rowSelection={rowSelection}
              rowClassName={rowClassName}
              rowStyle={rowStyle}
              cellClassName={cellClassName}
              cellStyle={cellStyle}
              onRowEvents={onRowEvents}
              onCellEvents={onCellEvents}
              handleSelect={handleSelect}
              handleExpand={handleExpand}
              treeExpandKeys={treeExpandKeys}
              handleTreeExpand={handleTreeExpand}
              onUpdateRowHeight={handleUpdateRowHeight}
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
        <table style={{ width: scrollWidth }}>
          <Colgroup columns={flattenColumns} />
          <Thead
            bordered
            locale={locale}
            checked={checked}
            columns={fixedColumns}
            sorterStates={sorterStates}
            filterStates={filterStates}
            headerCellStyle={headerCellStyle}
            headerCellClassName={headerCellClassName}
            headerRowStyle={headerRowStyle}
            headerRowClassName={headerRowClassName}
            onSort={handleSortChange}
            onSelectAll={handleSelectAll}
            onFilterChange={handleFilterChange}
            onMouseDown={handleHeaderMouseDown}
            onHeaderRowEvents={onHeaderRowEvents}
            onHeaderCellEvents={onHeaderCellEvents}
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
