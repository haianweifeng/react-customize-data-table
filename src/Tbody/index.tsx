import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import Tr from '../Tr';
import type {
  ColumnType,
  Expandable,
  RowSelection,
  TreeExpandable,
  PrivateColumnsType,
} from '../interface';
import {
  CLASS_CELL_EMPTY,
  CLASS_EMPTY_CONTENT,
  CLASS_ROW,
  CLASS_ROW_EXPAND,
  PREFIXCLS,
} from '../utils/constant';

interface TbodyProps<T> {
  empty: React.ReactNode;
  isTree: boolean;
  dataSource: T[];
  striped: boolean;
  bordered: boolean;
  startRowIndex: number;
  columns: PrivateColumnsType<T>;
  keyLevelMap: Map<React.Key, number>;
  selectedKeys: React.Key[];
  halfSelectedKeys: React.Key[];
  expandedRowKeys: React.Key[];
  treeExpandKeys: React.Key[];
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  treeProps?: TreeExpandable<T>;
  tbodyClientWidth: number;
  virtualized: boolean;
  offsetLeft: number;
  offsetRight: number;
  getRecordKey: (record: T) => any;
  selectionType: 'radio' | 'checkbox' | undefined;
  handleExpand: (expanded: boolean, record: T, recordKey: number | string) => void;
  handleTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  handleSelect: (
    isRadio: boolean,
    isChecked: boolean,
    record: T,
    recordKey: React.Key,
    selected: boolean,
    event: Event,
  ) => void;
  rowClassName?: (record: T, index: number) => string;
  rowStyle?: (record: T, index: number) => React.CSSProperties | React.CSSProperties;
  cellClassName?: (column: ColumnType<T>, rowIndex: number, colIndex: number) => string | string;
  cellStyle?: (
    column: ColumnType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  onRowEvents?: (record: T, rowIndex: number) => object;
  onCellEvents?: (record: T, rowIndex: number) => object;
  onUpdate: (rects: { rowIndex: number; rowHeight: number }[]) => void;
}

function Tbody<T extends { key?: number | string; children?: T[] }>(props: TbodyProps<T>) {
  const {
    empty,
    isTree,
    columns,
    bordered,
    dataSource,
    getRecordKey,
    treeExpandKeys,
    selectionType,
    selectedKeys,
    halfSelectedKeys,
    expandedRowKeys,
    treeProps,
    keyLevelMap,
    startRowIndex,
    tbodyClientWidth,
    onUpdate,
    ...restProps
  } = props;

  const tbodyRef = useRef<any>(null);

  useEffect(() => {
    const update = () => {
      const rects: { rowIndex: number; rowHeight: number }[] = [];
      tbodyRef.current
        .querySelectorAll(`.${CLASS_ROW}`)
        ?.forEach((trNode: HTMLTableRowElement, index: number) => {
          if (!trNode) return;
          let { height } = trNode.getBoundingClientRect();
          if (Number.isNaN(height)) height = 0;
          let expandHeight = 0;
          if (
            trNode.nextElementSibling &&
            trNode.nextElementSibling.classList.contains(CLASS_ROW_EXPAND)
          ) {
            expandHeight = trNode.nextElementSibling.clientHeight;
          }
          rects.push({ rowIndex: index + startRowIndex, rowHeight: height + expandHeight });
        });
      onUpdate && onUpdate(rects);
    };
    if (!tbodyRef.current) return;
    update();
  }, [startRowIndex, columns, expandedRowKeys, dataSource, onUpdate]);

  const renderTr = (rowData: T, rowIndex: number) => {
    const recordKey = getRecordKey(rowData);
    let checked: boolean | 'indeterminate' = false;
    const hasChildren = rowData?.children && rowData.children.length;

    if (selectionType === 'radio' || !hasChildren) {
      checked = selectedKeys.indexOf(recordKey) >= 0;
    } else {
      checked =
        selectedKeys.indexOf(recordKey) >= 0
          ? true
          : halfSelectedKeys.indexOf(recordKey) >= 0
          ? 'indeterminate'
          : false;
    }

    const expanded = expandedRowKeys.indexOf(recordKey) >= 0;

    const treeLevel = keyLevelMap.get(recordKey) || 0;
    const treeExpanded = treeExpandKeys.indexOf(recordKey) >= 0;
    const treeIndent = treeProps?.indentSize || 15;

    return (
      <Tr
        key={rowIndex}
        rowData={rowData}
        isTree={isTree}
        rowIndex={rowIndex}
        expanded={expanded}
        bordered={bordered}
        recordKey={recordKey}
        treeLevel={treeLevel}
        treeIndent={treeIndent}
        treeExpanded={treeExpanded}
        treeProps={treeProps}
        columns={columns}
        checked={checked}
        {...restProps}
      />
    );
  };

  return (
    <tbody ref={tbodyRef}>
      {!dataSource.length ? (
        <tr key="empty-placeholder" className={`${PREFIXCLS}-row-placeholder`}>
          <td
            colSpan={columns.length}
            className={classnames({
              [CLASS_CELL_EMPTY]: true,
              [`${PREFIXCLS}-cell-ignore-right-border`]: bordered,
            })}
          >
            <div className={CLASS_EMPTY_CONTENT} style={{ width: tbodyClientWidth }}>
              {empty}
            </div>
          </td>
        </tr>
      ) : null}
      {dataSource.map((d, i: number) => renderTr(d, i + startRowIndex))}
    </tbody>
  );
}
export default Tbody;
