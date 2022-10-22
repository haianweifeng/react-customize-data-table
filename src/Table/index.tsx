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
  SelectedInfo,
  TreeLevelType,
} from '../interface';
import '../style/index.less';
import { getRowKey, toPoint } from '../utils/util';
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
  rowKey: string | ((row: T) => string | number);
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

  const initSelectedKeys: (number | string)[] =
    rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];

  const tbodyTableRef = useRef<any>(null);
  const treeLevelRef = useRef<TreeLevelType>({} as TreeLevelType);

  const [colWidths, setColWidths] = useState<number[]>([]);

  // todo 待测试 selectInfoMaps
  const getInfosFromData = useCallback(
    (data: T[], startIndex: number = 0, level: number = 0) => {
      const records: T[] = [];
      const keys: (string | number)[] = [];
      const selectInfos: SelectedInfo<T>[] = [];

      data.forEach((d, i) => {
        const key = getRowKey(rowKey, d, startIndex + i);
        keys.push(key);
        records.push(d);
        treeLevelRef.current[key] = level;
        if (initSelectedKeys.indexOf(key) >= 0) {
          selectInfos.push({ key, record: d });
        }
        if (d?.children && d.children.length) {
          const infos = getInfosFromData(d.children, startIndex + i + 1, level + 1);
          startIndex = infos.records.length + i;
          records.push(...infos.records);
          keys.push(...infos.keys);
        }
      });

      return { records, keys, selectInfos };
    },
    [rowKey, getRowKey, initSelectedKeys],
  );

  const infosFromData = useMemo(() => {
    return getInfosFromData(dataSource);
  }, [dataSource, getInfosFromData]);

  // const [startRowIndex, setStartRowIndex] = useState<number>(0);

  // todo 考虑选择了树形中的子项
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(() => {
    return rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  });

  // const getSelectedMaps = (data: T[], startIndex: number = 0) => {
  //   const selectMaps: SelectedMap<T>[] = [];
  //   const keys: (number | string)[] = rowSelection?.selectedRowKeys || rowSelection?.defaultSelectedRowKeys || [];
  //   data.forEach((d, i) => {
  //     const key = getRowKey(rowKey, d, startIndex + i);
  //     if (keys.indexOf(key) >= 0) {
  //       selectMaps.push({ key, record: d });
  //       if (d?.children && d.children.length) {
  //         const res = getSelectedMaps(d.children, startIndex + i + 1);
  //         startIndex = res.length + i;
  //         selectMaps.push(...selectMaps);
  //       }
  //     }
  //   });
  //   return selectMaps;
  // };

  const [selectedInfos, setSelectedInfos] = useState<SelectedInfo<T>[]>(() => {
    return infosFromData.selectInfos;
  });
  // console.log(selectedInfos);

  // 优化过
  // const getAllTreeKeys = (data: T[], startIndex: number = 0) => {
  //   const keys: (string | number)[] = [];
  //   data.forEach((d, i) => {
  //     const key = getRowKey(rowKey, d, startIndex + i);
  //     keys.push(key);
  //     if (d?.children && d.children.length) {
  //       const treeKeys = getAllTreeKeys(d.children, startIndex + i + 1);
  //       startIndex = treeKeys.length + i;
  //       keys.push(...treeKeys);
  //     }
  //   });
  //   return keys;
  // };

  // 优化过
  const [treeExpandKeys, setTreeExpandKeys] = useState<(string | number)[]>(() => {
    if (
      treeProps?.defaultExpandAllRows &&
      !(treeProps?.defaultExpandedRowKeys || treeProps?.expandedRowKeys)
    ) {
      return infosFromData.keys;
      // return getAllTreeKeys(dataSource);
    }
    return treeProps?.expandedRowKeys || treeProps?.defaultExpandedRowKeys || [];
  });

  // todo 优化过 待测试 rowKey 为undefined 情况
  const getTreeChildrenData = useCallback(
    (parent: T, parentIndex: number) => {
      const records: T[] = [];
      const data = parent?.children;
      const parentKey = getRowKey(rowKey, parent, parentIndex);
      if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parentKey) >= 0) {
        data.forEach((item, i) => {
          records.push(item);
          const childrenRecords = getTreeChildrenData(item, parentIndex + 1 + i);
          records.push(...childrenRecords);
        });
      }
      return records;
    },
    [rowKey, getRowKey, treeExpandKeys],
  );

  // 优化过
  const list = useMemo(() => {
    const records: T[] = [];
    const startIndex: number = 0;

    dataSource.forEach((d, i) => {
      records.push(d);
      const childrenRecords = getTreeChildrenData(d, startIndex + i);
      records.push(...childrenRecords);
    });

    return records;
  }, [dataSource, getTreeChildrenData]);

  // 优化过
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

  // const getSelectedItemInfos = (data: T[]) => {
  //   const selectedItems: T[] = [];
  //   const selectedRowKeys: (string | number)[] = [];
  //   data.forEach((d) => {
  //     selectedRowKeys.push(d.rowKey);
  //     selectedItems.push(d);
  //     if (d?.children && d.children.length) {
  //       const infos = getSelectedItemInfos(d.children)
  //       selectedItems.push(...infos.selectedItems);
  //       selectedRowKeys.push(...infos.selectedRowKeys);
  //     }
  //   });
  //   return { selectedItems, selectedRowKeys };
  // };

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
  // todo
  const handleSelect = (keys: (number | string)[], selectInfos: SelectedInfo<T>[]) => {
    // console.log(keys);
    // console.log(selectInfos);
    if (!rowSelection?.selectedRowKeys) {
      setSelectedKeys(keys);
    }
    setSelectedInfos(selectInfos);
    // setSelectedMaps(selectedInfos);
  };

  const handleSelectAll = (selected: boolean) => {
    console.log(selected);
    // const { selectedItems, selectedRowKeys } = getSelectedItemInfos(formatData);
    // const selectedRows = omitRowsProps<T>(selectedItems);
    //
    // if (rowSelection?.onSelectAll) {
    //   rowSelection.onSelectAll(selected, selected ? selectedRows : [], selectedRows);
    // }
    // if (rowSelection?.onChange) {
    //   rowSelection.onChange(selected ? selectedRowKeys : [], selected ? selectedRows : []);
    // }
    //
    // if (!rowSelection?.selectedRowKeys) {
    //   setSelectedKeys(selected ? selectedRowKeys : []);
    // }
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
      setSelectedKeys(rowSelection.selectedRowKeys);
    }
  }, [rowSelection]);

  useEffect(() => {
    if (treeProps?.expandedRowKeys) {
      setTreeExpandKeys(treeProps.expandedRowKeys);
    }
  }, [treeProps]);
  // console.log(selectedKeys);
  // console.log(list);
  // todo list bug 数据不全
  const checked = useMemo(() => {
    const res = list.every((l, i) => {
      const key = getRowKey(rowKey, l, i);
      return selectedKeys.indexOf(key) >= 0;
    });
    return res ? true : selectedKeys.length ? 'indeterminate' : false;
  }, [list, selectedKeys, getRowKey]);

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
            originDataSource={dataSource}
            columns={flatColumns}
            treeLevelMap={treeLevelRef.current}
            treeExpandKeys={treeExpandKeys}
            selectedKeys={selectedKeys}
            selectedInfos={selectedInfos}
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
