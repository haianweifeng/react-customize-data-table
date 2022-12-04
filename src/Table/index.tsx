import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import Thead from '../Thead';
import Tbody from '../Tbody';
import Colgroup from '../Colgroup';
import Pagination from '../Pagination';
import type {
  RowSelectionType,
  ColumnsType,
  ColumnsGroupType,
  ExpandableType,
  TreeExpandableType,
  ScrollType,
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
} from '../interface';
import type { PaginationProps } from '../index';
import '../style/index.less';
import { getRowKey, toPoint, findParentByKey } from '../utils/util';
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
  loading?: boolean;
  /** 是否显示表头  todo header */
  showHeader?: boolean;
  /** 表格大小 */
  size?: 'default' | 'small';
  /** 表格行的类名 */
  rowClassName?: (record: T, index: number) => string;
  /** 设置头部行属性 todo 和 onRow 用法一样是事件集合器 需要确定是不是需要 header 存在这个api 感觉没必要存在 */
  onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行事件监听器集合属性 todo columns 发生了改变 */
  onRowEvents?: (columns: any, index: number) => any;
  /** 分页 */
  pagination?: PaginationProps;
  /** disabled 为 true，禁用全部选项 todo 好像不需要 */
  disabled?: (data: any) => boolean | boolean;
  /** 空数据文案 */
  empty?: string | React.ReactNode;
  /** 单行表格的预期高度 */
  rowHeight?: number;
  /** 单次render的最大行数 */
  rowsInView?: number;
  /** 表格是否可以滚动 设置滚动时表格的宽 高 */
  scroll?: ScrollType;
  /** 滚动条滚动后回调函数 */
  onScroll?: (x: number, y: number) => void;
  /** 列宽伸缩后的回调 */
  onColumnResize?: (newColumns: any) => void;
  /** 表格行是否可选择配置项 todo header 需要表头空一行 */
  rowSelection?: RowSelectionType<T>;
  /** 自定义排序图标 */
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  /** 排序取消事件 */
  onSortCancel?: (col: ColumnsType<T>, order: 'asc' | 'desc') => void;
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
// todo scroll: { width, height } 设置滚动时候表格的宽度 高度
// todo 如果没有筛选到数据时候提示文本
// 设置colgroup 列的宽度  然后获取每个单元格最后渲染的宽度 重新设置 colgroup 的宽度
function Table<T extends { key?: number | string; children?: T[] }>(props: TableProps<T>) {
  const {
    className = '',
    style = {},
    // size = 'default',
    scroll = {},
    showHeader = true,
    bordered,
    rowKey = 'key',
    dataSource,
    columns,
    expandable,
    rowSelection,
    treeProps,
    renderSorter,
    onSort,
    onFilter,
    pagination,
  } = props;

  const SELECTION_EXPAND_COLUMN_WIDTH = 44;

  const tbodyTableRef = useRef<any>(null);
  const maxTreeLevel = useRef<number>(0);
  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);
  const levelRecord = useRef<LevelRecordType<T>>({} as LevelRecordType<T>);

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

  const formatColumns = useMemo(() => {
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
        title: '',
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
        title: '',
        width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });
    }

    return cols;
  }, [columns, expandable, rowSelection]);

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
    return getFlatColumns(formatColumns);
  }, [getFlatColumns, formatColumns]);

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
    // console.log(records);
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

  // const [startRowIndex, setStartRowIndex] = useState<number>(0);

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

  const converToPixel = useCallback((val: string | number | undefined) => {
    if (typeof val === 'number' || val === undefined) return val;
    const res = toPoint(val);
    const { width } = tbodyTableRef.current.getBoundingClientRect();
    return width * res;
  }, []);

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
      setColWidths(widths);
    },
    [converToPixel, flatColumns],
  );

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

  const list = useMemo(() => {
    const records: T[] = [];

    currentPageData.forEach((d) => {
      records.push(d);
      const childrenRecords = getTreeChildrenData(d);
      records.push(...childrenRecords);
    });

    return records;
  }, [currentPageData, getTreeChildrenData]);

  const renderBody = () => {
    return (
      <div className="table-tbody" ref={tbodyTableRef}>
        <table style={{ width: scroll.width }}>
          <Colgroup colWidths={colWidths} columns={flatColumns} />
          <Tbody
            {...props}
            // startRowIndex={startRowIndex}
            startRowIndex={0}
            dataSource={list}
            columns={flatColumns}
            treeLevelMap={treeLevel.current}
            treeExpandKeys={treeExpandKeys}
            selectedKeys={selectedKeys}
            halfSelectedKeys={halfSelectedKeys}
            onSelect={handleSelect}
            onTreeExpand={handleTreeExpand}
            onBodyRender={handleBodyRender}
          />
        </table>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="table-thead">
        <table style={{ width: scroll.width }}>
          <Colgroup colWidths={colWidths} columns={flatColumns} />
          <Thead
            checked={checked}
            columns={formatColumns}
            sorterState={sorterState}
            filterState={filterState}
            expandable={expandable}
            rowSelection={rowSelection}
            renderSorter={renderSorter}
            onSelectAll={handleSelectAll}
            onSort={handleSortChange}
            onFilterChange={handleFilterChange}
          />
        </table>
      </div>
    );
  };

  // todo 等增加loading 时候把disabled: loading
  const renderPagination = () => {
    if (pagination) {
      // disabled: loading,
      const pageProps = Object.assign(
        {
          current: currentPage,
          pageSize: pageSize,
          total: totalData.length,
        },
        pagination,
        { onChange: handlePaginationChange },
      );
      return <Pagination {...pageProps} className="table-pagination" />;
    }
    return null;
  };

  // todo
  const tableWrapClass = classnames({
    'table-container': true,
    size: true,
    'table-bordered': bordered,
    [className]: !!className,
  });
  return (
    <>
      <div style={style} className={tableWrapClass}>
        {showHeader ? renderHeader() : null}
        {renderBody()}
      </div>
      {renderPagination()}
    </>
  );
}

export default Table;
