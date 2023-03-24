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
import type { RowKeyType, CachePositionType, LocalType } from '../interface';
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
  CachePosition,
} from '../interface1';
import VirtualList from '../VirtualList';
import type { PaginationProps } from '../index';
import '../style/index.less';
import { getRowKey, getParent } from '../utils/util';
import { BAR_THUMB_SIZE, BAR_WIDTH } from '../utils/constant';
import { omitColumnProps } from '../utils/util';
import LocaleContext from '../LocalProvider/context';
import ScrollBar from '../ScrollBar';
import ScrollBars from '../ScrollBars';
import VirtualScrollBar from '../VirtualScrollBar';
import Bar from '../Bar';
import normalizeWheel from 'normalize-wheel';
import ResizeObserver from 'resize-observer-polyfill';
import { isEqual } from 'lodash';
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
  /** 是否开启虚拟列表 */
  virtualized?: boolean;
  /** 监听滚动回调函数 */
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
    onScroll,
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

  const [currentPage, pageSize, updateCurrentPage, handlePaginationChange] =
    usePagination(pagination);

  const [expandedRowKeys, handleExpand] = useExpand(allKeys, expandable);

  const [treeExpandKeys, handleTreeExpand] = useTreeExpand(allKeys, treeProps);

  // todo 待测试有没有考虑树形中children data 的排序 过滤
  // todo 应该是基于list 进行获取所有records keys
  // todo list 如果在这里添加了treeChilren 数据遇到虚拟列表会被切分 应该放到tbody 中处理 已处理 待测试
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

  const getDataByTreeExpandKeys = useCallback(
    (data: T[]) => {
      const records: T[] = [];
      data.map((d) => {
        records.push(d);
        const recordKey = getRecordKey(d);
        if (d.children && d.children.length && treeExpandKeys.indexOf(recordKey) >= 0) {
          records.push(...getDataByTreeExpandKeys(d.children));
        }
      });
      return records;
    },
    [treeExpandKeys],
  );

  const displayedData = useMemo(() => {
    return getDataByTreeExpandKeys(currentPageData);
  }, [currentPageData, getDataByTreeExpandKeys]);

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

  const lastStartRowIndex = useRef<number>(0);

  const [isMount, setIsMount] = useState<boolean>(false);

  const [scrollWidth, setScrollWidth] = useState<number>(width || 0);

  const [startRowIndex, setStartRowIndex] = useState<number>(0);

  // const [cachePosition, setCachePosition] = useState<CachePosition[]>(() => {
  //   return dataSource.map((d, index) => {
  //     return {
  //       index,
  //       top: index * rowHeight,
  //       bottom: (index + 1) * rowHeight,
  //       height: rowHeight,
  //     };
  //   });
  // });

  const lastCachePosition = useRef<CachePosition[]>([]);

  const [cachePosition, setCachePosition] = useState<CachePosition[]>([]);
  // 全打开后 点击隐藏后高度出现空白
  // 如果是有展开行且是虚拟滚动 展开行再后面滚动时候才会渲染会导致tbodyScrollHeight处于变化中
  // expandedRowKeys 是不是只要在mount 时候考虑 是这个useEffect 更新快还是handleUpdate 更新快 结果是不需要加入依赖项否则有bug
  useEffect(() => {
    const positions: CachePosition[] = [];
    getDataByTreeExpandKeys(dataSource).map((d, index) => {
      const recordKey = getRecordKey(d);
      const rowExpandable = expandable?.rowExpandable && expandable?.rowExpandable(d);
      const finalHeight =
        expandedRowKeys.indexOf(recordKey) >= 0 && rowExpandable ? rowHeight * 2 : rowHeight;
      const top = index === 0 ? 0 : positions[index - 1].bottom;
      positions.push({
        index,
        top,
        bottom: top + finalHeight,
        height: finalHeight,
      });
    });
    lastCachePosition.current = positions;
    setCachePosition(positions);
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [dataSource, rowHeight, getDataByTreeExpandKeys]);

  // todo 点击扩展行后引起cachePosition 变化后 scrollTop 的更新计算 setRowHeight
  // todo 滚动到底部了但是改变了列宽引起的高度变化 scrollTop 的更新计算 width: 150 -> 180
  // todo 待测试如果是可变行高会不会触发重新计算
  // todo 这里没有添加依赖项看eslint 在提交时候会不会报错

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

  useEffect(() => {
    if (isMount) {
      handleResize(initMergeColumns);
    }
  }, [initMergeColumns, handleResize, isMount]);
  // console.log(mergeColumns);

  useEffect(() => {
    setIsMount(true);
  }, []);

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

  const mouseLeave = useRef<boolean>(true);

  const wheelXEndTimer = useRef<number>(0);
  const wheelYEndTimer = useRef<number>(0);

  // 表体实际偏移量
  const tbodyScrollTop = useRef<number>(0);

  // 纵向滚动偏移量
  const lastScrollTop = useRef<number>(0);
  const lastScrollLeft = useRef<number>(0);

  const realTbodyRef = useRef<HTMLTableElement>(null);
  const resizeObserverIns = useRef<any>(null);

  const barYRef = useRef<HTMLDivElement>(null);
  const barXRef = useRef<HTMLDivElement>(null);

  const [tbodyClientWidth, setTbodyClientWidth] = useState<number>(0);
  const [tbodyScrollWidth, setTbodyScrollWidth] = useState<number>(0);

  const [tbodyClientHeight, setTbodyClientHeight] = useState<number>(0);

  const [showScrollbarY, setShowScrollbarY] = useState<boolean>(false);
  const [showScrollbarX, setShowScrollbarX] = useState<boolean>(false);

  const handleUpdate = useCallback((rects: { rowIndex: number; rowHeight: number }[]) => {
    let hasChange = false;
    const prevPosition = [...lastCachePosition.current];
    rects.map((rect, i) => {
      const index = prevPosition.findIndex((c) => c.index === rect.rowIndex);
      if (index >= 0) {
        const item = { ...prevPosition[index] };
        const newRowHeight = rect.rowHeight;
        const diff = item.height - newRowHeight;
        if (diff) {
          hasChange = true;
          // console.log(`index: ${index}`);
          // todo 如果存在差距的话得更新下scrollTop  startOffset
          const top = index === 0 ? 0 : prevPosition[index - 1].bottom;
          prevPosition[index].height = newRowHeight;
          prevPosition[index].top = top;
          prevPosition[index].bottom = top + newRowHeight;
          for (let j = index + 1; j < prevPosition.length; j++) {
            const topValue = prevPosition[j - 1].bottom;
            prevPosition[j].top = topValue;
            prevPosition[j].bottom = prevPosition[j].height + topValue;
          }
          // item.height = newRowHeight;
          // item.bottom = item.bottom - diff;
          // item.top = index === 0 ? 0 : prevPosition[index - 1].bottom;
          // prevPosition.splice(index, 1, item);
          // for (let j = index + 1; j < prevPosition.length; j++) {
          //   prevPosition[j].top = prevPosition[j - 1].bottom;
          //   prevPosition[j].bottom = prevPosition[j].bottom - diff;
          // }
        }
      }
    });
    if (hasChange) {
      lastCachePosition.current = prevPosition;
      setCachePosition(prevPosition);
    }
  }, []);

  // todo 为什么输出mergeColumns 或者cachePosition 都是好几遍 是不是那些废弃代码里的setState 导致的
  const handleUpdateRowHeight = useCallback((newRowHeight: number, rowIndex: number) => {
    // console.log(`rowHeight: ${newRowHeight}`);
    // console.log(`rowIndex: ${rowIndex}`);
    const prevPosition = [...lastCachePosition.current];
    const index = prevPosition.findIndex((c) => c.index === rowIndex);
    if (index >= 0) {
      const item = { ...prevPosition[index] };
      const diff = item.height - newRowHeight;
      if (diff) {
        // todo 如果存在差距的话得更新下scrollTop  startOffset
        item.height = newRowHeight;
        item.bottom = item.bottom - diff;
        for (let j = index + 1; j < prevPosition.length; j++) {
          prevPosition[j].top = prevPosition[j - 1].bottom;
          prevPosition[j].bottom = prevPosition[j].bottom - diff;
        }
        prevPosition.splice(index, 1, item);
        lastCachePosition.current = prevPosition;
        setCachePosition(prevPosition);
      }
    }
    // if (!isEqual(prevPosition, lastCachePosition.current)) {
    //   setCachePosition(prevPosition);
    // }
    // lastCachePosition.current = prevPosition;
    // setCachePosition((prevPosition) => {
    //   const index = prevPosition.findIndex((c) => c.index === rowIndex);
    //   if (index >= 0) {
    //     const item = { ...prevPosition[index] };
    //     const diff = item.height - newRowHeight;
    //     if (diff) {
    //       // todo 如果存在差距的话得更新下scrollTop  startOffset
    //       item.height = newRowHeight;
    //       item.bottom = item.bottom - diff;
    //       for (let j = index + 1; j < prevPosition.length; j++) {
    //         prevPosition[j].top = prevPosition[j - 1].bottom;
    //         prevPosition[j].bottom = prevPosition[j].bottom - diff;
    //       }
    //       prevPosition.splice(index, 1, item);
    //     }
    //   }
    //   return [...prevPosition];
    // });
  }, []);

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
  // 改成平摊数据后的高度
  const tbodyScrollHeight = useMemo(() => {
    return getSumHeight(0, displayedData.length);
  }, [getSumHeight, displayedData]);
  // console.log(`tbodyScrollHeight: ${tbodyScrollHeight}`);
  // console.log(cachePosition);

  useEffect(() => {
    lastScrollTop.current = 0;
    tbodyScrollTop.current = 0;
    setStartRowIndex(0);
  }, [sorterStates, filterStates, currentPage, pageSize]);

  // todo 树形结构的分页测试
  // 如果扩展行是全打开然后滚动到底部的话再关闭某一行的扩展行 这时候滚动范围是按当时全部打开的高度计算超过了实际的滚动范围
  useEffect(() => {
    // console.log('约束');
    tbodyScrollTop.current = Math.min(
      tbodyScrollTop.current,
      tbodyScrollHeight - tbodyClientHeight,
    );
    lastScrollTop.current = Math.min(lastScrollTop.current, tbodyScrollHeight - tbodyClientHeight);
  }, [expandedRowKeys, tbodyScrollHeight, tbodyClientHeight]);

  useEffect(() => {
    const update = () => {
      // console.log('update');
      if (tbodyRef.current) {
        const tbodyNode = tbodyRef.current;
        const clientWidth = tbodyNode.clientWidth;
        const scrollWidth = tbodyNode.scrollWidth;
        const clientHeight = tbodyNode.clientHeight;
        const hasXScrollbar = scrollWidth > clientWidth;
        const hasYScrollbar = tbodyScrollHeight > clientHeight;
        if (hasXScrollbar && barXRef.current) {
          const thumbSize = Math.max((clientWidth / scrollWidth) * clientWidth, BAR_THUMB_SIZE);
          const scale = (scrollWidth - clientWidth) / (clientWidth - thumbSize);
          barXRef.current.style.transform = `translateX(${lastScrollLeft.current / scale}px)`;
        }
        if (hasYScrollbar && barYRef.current) {
          const thumbSize = Math.max(
            (clientHeight / tbodyScrollHeight) * clientHeight,
            BAR_THUMB_SIZE,
          );
          // console.log(`tbodyScrollHeight: ${tbodyScrollHeight}`);
          // console.log(`lastScrollTop.current: ${lastScrollTop.current}`);
          const scale = (tbodyScrollHeight - clientHeight) / (clientHeight - thumbSize);
          // const y = Math.min(lastScrollTop.current, tbodyScrollHeight - clientHeight) / scale;
          // console.log(`final: ${y}`);
          barYRef.current.style.transform = `translateY(${lastScrollTop.current / scale}px)`;
          // barYRef.current.style.transform = `translateY(${Math.min(lastScrollTop.current, tbodyScrollHeight - clientHeight) / scale}px)`;
        }
        setTbodyClientWidth(clientWidth);
        setTbodyScrollWidth(scrollWidth);
        setTbodyClientHeight(clientHeight);
        setShowScrollbarY(hasYScrollbar);
        setShowScrollbarX(hasXScrollbar);
      }
    };

    const resizeObserver = () => {
      resizeObserverIns.current = new ResizeObserver((entries) => {
        let contentRect = entries[0].contentRect;
        if (!(contentRect.width || contentRect.height)) return;
        update();
      });
      realTbodyRef.current && resizeObserverIns.current.observe(realTbodyRef.current);
    };

    resizeObserver();
    return () => {
      resizeObserverIns.current?.disconnect();
    };
  }, [tbodyScrollHeight, currentPage, pageSize, sorterStates]);

  const handleHorizontalScroll = useCallback((offsetLeft: number, isWheel: boolean = true) => {
    // console.log(`horizontal: ${offsetLeft}`);
    let offsetRight = 0;
    if (tbodyRef.current) {
      const clientWidth = tbodyRef.current.clientWidth;
      const scrollWidth = tbodyRef.current.scrollWidth;
      const maxScrollWidth = scrollWidth - clientWidth;
      offsetRight = maxScrollWidth - offsetLeft;
    }
    // if (theadRef.current) {
    //   theadRef.current.querySelector('table').style.transform = `translateX(-${offsetLeft}px)`;
    // }
    [theadRef.current, tbodyRef.current].forEach((el, index) => {
      if (!el) return;
      el.querySelector('table').style.transform = `translate(-${offsetLeft}px, -${
        index === 0 ? 0 : tbodyScrollTop.current
      }px)`;
      el.querySelectorAll('th, td').forEach((cell: HTMLTableDataCellElement) => {
        if (
          cell.classList.contains('cell-empty') &&
          cell.querySelector('.empty-placeholder-content')
        ) {
          (cell.querySelector(
            '.empty-placeholder-content',
          ) as any)!.style.transform = `translateX(${offsetLeft}px)`;
        }
        if (cell.classList.contains('cell-fixed-left')) {
          cell.style.transform = `translateX(${offsetLeft}px)`;
        } else if (cell.classList.contains('cell-fixed-right')) {
          cell.style.transform = `translateX(-${offsetRight}px)`;
        }
        if (cell.classList.contains('cell-is-last-fixedLeft')) {
          if (offsetLeft > 0) {
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
    lastScrollLeft.current = offsetLeft;
    if (isWheel) {
      onScroll && onScroll(offsetLeft, lastScrollTop.current);
    }
  }, []);

  const handleVerticalScroll = useCallback(
    (offsetTop: number, isWheel = true) => {
      // console.log(`vertical: ${offsetTop}`);
      if (virtualized) {
        const item = cachePosition.find((p) => p.bottom > offsetTop);
        if (item) {
          if (lastStartRowIndex.current !== item.index) {
            setStartRowIndex(item.index);
            lastStartRowIndex.current = item.index;
          }
          if (realTbodyRef.current) {
            const finalOffsetTop = offsetTop - item.top;
            tbodyScrollTop.current = finalOffsetTop;
            realTbodyRef.current.style.transform = `translate(-${lastScrollLeft.current}px, -${finalOffsetTop}px)`;
          }
        }
      } else {
        if (realTbodyRef.current) {
          realTbodyRef.current.style.transform = `translate(-${lastScrollLeft.current}px, -${offsetTop}px)`;
        }
        tbodyScrollTop.current = offsetTop;
      }
      lastScrollTop.current = offsetTop;
      if (isWheel) {
        onScroll && onScroll(lastScrollLeft.current, offsetTop);
      }
    },
    [cachePosition, virtualized],
  );
  // console.log(`startRowIndex: ${startRowIndex}`);

  // 由于表头表体是通过div 包裹 会导致滚动时候表体先有了scrollLeft 然后表头才有导致更新不同步 表头总是慢于表体 所以采用自定义wheel 事件触发滚动
  useEffect(() => {
    let moveY = 0;
    let moveX = 0;
    let ticking = false;

    let pixelX = 0;
    let pixelY = 0;

    const wheelEndDetector = (target: HTMLElement, isVertical: boolean) => {
      window.clearTimeout(isVertical ? wheelYEndTimer.current : wheelXEndTimer.current);
      const wheelEndTimer = window.setTimeout(() => {
        target.classList.remove('scrollbar-track-scrolling');
        if (mouseLeave.current) {
          target.classList.remove('scrollbar-track-active');
        }
      }, 600);
      if (isVertical) {
        wheelYEndTimer.current = wheelEndTimer;
      } else {
        wheelXEndTimer.current = wheelEndTimer;
      }
    };

    const handleWheel = () => {
      const isVertical = pixelX === 0;

      const thumbEl = isVertical ? barYRef.current : barXRef.current;

      if (!thumbEl) return;

      if (tbodyRef.current) {
        const tbodyEl = tbodyRef.current;

        const clientW = tbodyEl.clientWidth;
        const scrollW = tbodyEl.scrollWidth;

        const clientH = tbodyEl.clientHeight;
        const scrollH = tbodyScrollHeight;

        // vertical wheel
        if (isVertical) {
          moveY = lastScrollTop.current;
          moveY += pixelY;
          moveY = Math.max(0, moveY);
          moveY = Math.min(moveY, scrollH - clientH);

          if (moveY !== lastScrollTop.current) {
            const thumbSize = thumbEl.offsetHeight;
            const scale = (scrollH - clientH) / (clientH - thumbSize);
            thumbEl.style.transform = `translateY(${moveY / scale}px)`;
            handleVerticalScroll(moveY);
            // lastScrollTop.current = moveY;
          }

          pixelY = 0;
        } else {
          // horizontal wheel
          moveX = lastScrollLeft.current;
          moveX += pixelX;
          moveX = Math.max(0, moveX);
          moveX = Math.min(moveX, scrollW - clientW);

          if (moveX !== lastScrollLeft.current) {
            const thumbSize = thumbEl.offsetWidth;
            const scale = (scrollW - clientW) / (clientW - thumbSize);
            thumbEl.style.transform = `translateX(${moveX / scale}px)`;
            handleHorizontalScroll(moveX);
            lastScrollLeft.current = moveX;
          }

          pixelX = 0;
        }
      }

      const barEl = thumbEl!.parentNode as HTMLElement;
      if (barEl) {
        barEl.classList.add('scrollbar-track-scrolling');
      }
      wheelEndDetector(barEl, isVertical);
    };

    const wheelListener = (event: any) => {
      const normalized = normalizeWheel(event);
      pixelX = normalized.pixelX;
      pixelY = normalized.pixelY;

      if (Math.abs(pixelX) > Math.abs(pixelY)) {
        pixelY = 0;
      } else {
        pixelX = 0;
      }

      const isVertical = pixelX === 0;

      if (!ticking) {
        requestAnimationFrame(() => {
          handleWheel();
          ticking = false;
        });
        ticking = true;
      }
      if (showScrollbarY && isVertical) {
        event.preventDefault();
      }
      if (showScrollbarX && !isVertical) {
        event.preventDefault();
      }
    };

    if (!showScrollbarY && !showScrollbarX) return;

    tbodyRef.current?.addEventListener('wheel', wheelListener, { passive: false });
    return () => {
      tbodyRef.current?.removeEventListener('wheel', wheelListener);
    };
  }, [
    showScrollbarY,
    showScrollbarX,
    tbodyScrollHeight,
    handleHorizontalScroll,
    handleVerticalScroll,
  ]);

  useEffect(() => {
    const handleMouseEnter = (event: any) => {
      mouseLeave.current = false;
      const scrollBarTrackNode = getParent(event.target, '.scrollbar-track');
      if (
        scrollBarTrackNode &&
        scrollBarTrackNode.classList.contains('scrollbar-track-scrolling')
      ) {
        scrollBarTrackNode.classList.remove('scrollbar-track-scrolling');
        scrollBarTrackNode.classList.add('scrollbar-track-active');
      }
    };

    const handleMouseLeave = (event: any) => {
      mouseLeave.current = true;
      const scrollBarTrackNode = getParent(event.target, '.scrollbar-track');
      if (scrollBarTrackNode) {
        setTimeout(() => {
          if (!scrollBarTrackNode.classList.contains('scrollbar-track-scrolling')) {
            scrollBarTrackNode.classList.remove('scrollbar-track-active');
          }
        }, 600);
      }
    };

    barYRef.current?.parentNode?.addEventListener('mouseenter', handleMouseEnter);
    barXRef.current?.parentNode?.addEventListener('mouseenter', handleMouseEnter);

    barYRef.current?.parentNode?.addEventListener('mouseleave', handleMouseLeave);
    barXRef.current?.parentNode?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      barYRef.current?.parentNode?.removeEventListener('mouseenter', handleMouseEnter);
      barXRef.current?.parentNode?.removeEventListener('mouseenter', handleMouseEnter);

      barYRef.current?.parentNode?.removeEventListener('mouseleave', handleMouseLeave);
      barXRef.current?.parentNode?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showScrollbarY, showScrollbarX]);

  // 考虑renderMaxRows 小于容器高度时候会出现底部空白 这时候取的renderMaxRows刚好为能撑开容器高度那一行的行号
  const getRenderMaxRows = useCallback(() => {
    const item = cachePosition.find((c) => c.top >= tbodyClientHeight);
    return item && tbodyClientHeight ? Math.max(renderMaxRows, item.index) : renderMaxRows;
  }, [tbodyClientHeight, renderMaxRows, cachePosition]);

  const currDataSource = useMemo(() => {
    return virtualized
      ? displayedData.slice(startRowIndex, startRowIndex + getRenderMaxRows())
      : displayedData;
  }, [virtualized, displayedData, startRowIndex, getRenderMaxRows]);
  // console.log(currDataSource);

  useEffect(() => {
    handleVerticalScroll(lastScrollTop.current, false);
  }, [expandedRowKeys, handleVerticalScroll]);

  // useEffect(() => {
  //   handleVerticalScroll(Math.min(lastScrollTop.current, tbodyScrollHeight - tbodyClientHeight), false);
  // }, [expandedRowKeys, tbodyScrollHeight, tbodyClientHeight, handleVerticalScroll]);

  useEffect(() => {
    handleHorizontalScroll(lastScrollLeft.current, false);
  }, [mergeColumns, currDataSource, expandedRowKeys, handleHorizontalScroll]);

  const isTree = useMemo(() => {
    const data = displayedData.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [displayedData]);

  const renderBody = () => {
    return (
      <div className="tbody-container">
        <div ref={tbodyRef} className="table-tbody">
          <table
            ref={realTbodyRef}
            style={{ width: scrollWidth }}
            className={classnames({ 'empty-tbody-table': !currDataSource.length })}
          >
            <Colgroup columns={flattenColumns} />
            <Tbody
              empty={empty}
              isTree={isTree}
              striped={!!striped}
              bordered={!!bordered}
              selectionType={selectionType}
              startRowIndex={startRowIndex}
              dataSource={currDataSource}
              columns={flattenColumns}
              keyLevelMap={keyLevelMap}
              getRecordKey={getRecordKey}
              selectedKeys={selectedKeys}
              halfSelectedKeys={halfSelectedKeys}
              expandedRowKeys={expandedRowKeys}
              treeProps={treeProps}
              expandable={expandable}
              rowSelection={rowSelection}
              tbodyClientWidth={tbodyClientWidth}
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
              onUpdate={handleUpdate}
            />
          </table>
        </div>
        {showScrollbarY && (
          <Bar
            orientation="vertical"
            size={tbodyClientHeight}
            contentSize={tbodyScrollHeight}
            ref={barYRef}
            onScroll={handleVerticalScroll}
          />
        )}
        {showScrollbarX && (
          <Bar
            orientation="horizontal"
            size={tbodyClientWidth}
            contentSize={tbodyScrollWidth}
            ref={barXRef}
            onScroll={handleHorizontalScroll}
          />
        )}
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div
        ref={theadRef}
        className={classnames({
          'table-thead': true,
          // 'table-head-gutter': showScrollbarY,
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
