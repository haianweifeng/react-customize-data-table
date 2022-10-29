import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import Thead from '../Thead';
import Tbody from '../Tbody';
import Colgroup from '../Colgroup';
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
  // SelectedInfo,
  TreeLevelType,
  LevelRecordType,
  RowKeyType,
} from '../interface';
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
  /** 设置头部行属性 todo 和 onRow 用法一样是事件集合器 需要确定是不是需要 header */
  onHeaderRow?: (columns: ColumnsType<T>[], index: number) => any;
  /** 设置行事件监听器集合属性 todo columns 发生了改变 */
  onRowEvents?: (columns: any, index: number) => any;
  // todo
  pagination?: any;
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
  /** 支持的排序方式 */
  sortDirections?: ['ascend', 'descend'];
  /** 排序取消事件 */
  onSortCancel?: (cancelName: string, order: 'ascend' | 'descend') => void;
  /** 排序事件 todo 防止向服务端请求时候需要带上相应的字段 */
  onSort: (column: any, order: 'ascend' | 'descend') => void;
  /** 配置展开属性 todo header 需要表头空一行 */
  expandable?: ExpandableType<T>;
  /** 配置树形数据属性 */
  treeProps?: TreeExpandableType<T>;
}
// todo 还未测试列宽设为百分比的情况
// todo scroll: { width, height } 设置滚动时候表格的宽度 高度
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
  } = props;

  const SELECTION_EXPAND_COLUMN_WIDTH = 48;

  const tbodyTableRef = useRef<any>(null);
  const maxTreeLevel = useRef<number>(0);
  const treeLevel = useRef<TreeLevelType>({} as TreeLevelType);
  const levelRecord = useRef<LevelRecordType<T>>({} as LevelRecordType<T>);

  const isRadio = rowSelection?.type === 'radio';

  const [colWidths, setColWidths] = useState<number[]>([]);

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

  const { records: allRecords, keys: allKeys } = useMemo(() => {
    return flatData(dataSource);
  }, [dataSource, flatData]);

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

  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return allKeys;
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

  const list = useMemo(() => {
    const records: T[] = [];

    dataSource.forEach((d) => {
      records.push(d);
      const childrenRecords = getTreeChildrenData(d);
      records.push(...childrenRecords);
    });

    return records;
  }, [dataSource, getTreeChildrenData]);

  // 是否可以把getFloatColumns 移到formatColumns
  const formatColumns = useMemo(() => {
    let insertIndex = 0;
    const cols = columns.map((column, index: number) => {
      const { title } = column;
      // todo 待测试 insertBeforeColumnName 在嵌套表头 只能放在最外层的columns中
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

  const converToPixel = useCallback((val: string | number | undefined) => {
    if (typeof val === 'number' || val === undefined) return val;
    const res = toPoint(val);
    const { width } = tbodyTableRef.current.getBoundingClientRect();
    return width * res;
  }, []);

  // todo 不同例子之间切换时候头部和body 之间没有对齐
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
            // todo 待测试列宽设为0
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
    if (!rowSelection?.selectedRowKeys) {
      setSelectedKeys(selectKeys);
    }

    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(selectKeys, selectedRows);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    let selectedRows: T[];
    let selectKeys: (number | string)[];
    if (selected) {
      const { checkedKeys, checkedRowWithKey, halfCheckedKeys } = fillMissSelectedKeys(allKeys);
      selectKeys = checkedKeys;
      selectedRows = Object.values(checkedRowWithKey);
      setHalfSelectedKeys(halfCheckedKeys);
    } else {
      selectKeys = [];
      selectedRows = [];
      setHalfSelectedKeys([]);
    }

    if (rowSelection?.onSelectAll) {
      rowSelection.onSelectAll(selected, selectedRows, allRecords);
    }
    if (rowSelection?.onChange) {
      rowSelection.onChange(selectKeys, selectedRows);
    }

    if (!rowSelection?.selectedRowKeys) {
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

  useEffect(() => {
    if (rowSelection?.selectedRowKeys) {
      const { checkedKeys, halfCheckedKeys } = fillMissSelectedKeys(rowSelection.selectedRowKeys);
      setSelectedKeys(checkedKeys);
      setHalfSelectedKeys(halfCheckedKeys);
    }
  }, [rowSelection, fillMissSelectedKeys]);

  useEffect(() => {
    if (treeProps?.expandedRowKeys) {
      setTreeExpandKeys(treeProps.expandedRowKeys);
    }
  }, [treeProps]);

  const checked = useMemo(() => {
    if (!selectedKeys.length) {
      return false;
    }
    return selectedKeys.length === allKeys.length ? true : 'indeterminate';
  }, [selectedKeys, allKeys]);

  const renderBody = () => {
    return (
      <div className="table-tbody">
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
            expandable={expandable}
            rowSelection={rowSelection}
            onSelectAll={handleSelectAll}
          />
        </table>
      </div>
    );
  };

  // todo
  const tableWrapClass = classnames({
    'table-container': true,
    size: true,
    bordered: bordered,
    [className]: !!className,
  });
  return (
    <div style={style} className={tableWrapClass}>
      {showHeader ? renderHeader() : null}
      {renderBody()}
    </div>
  );
}

export default Table;
