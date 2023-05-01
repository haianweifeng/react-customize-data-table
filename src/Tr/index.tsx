import classnames from 'classnames';
import React, { useMemo, useRef } from 'react';
import type {
  ColumnType,
  Expandable,
  PrivateColumnsType,
  RowSelection,
  TreeExpandable,
} from '../interface';
import Td from '../Td';
import { CLASS_CELL_FIXED_LEFT, CLASS_ROW, CLASS_ROW_EXPAND, PREFIXCLS } from '../utils/constant';

interface TrProps<T> {
  rowData: T;
  isTree: boolean;
  rowIndex: number;
  striped: boolean;
  expanded: boolean;
  bordered: boolean;
  recordKey: React.Key;
  treeLevel: number;
  treeIndent: number;
  treeExpanded: boolean;
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  treeProps?: TreeExpandable<T>;
  columns: PrivateColumnsType<T>;
  checked: 'indeterminate' | boolean;
  virtualized: boolean;
  offsetLeft: number;
  offsetRight: number;
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
  rowStyle?: ((record: T, index: number) => React.CSSProperties) | React.CSSProperties;
  cellClassName?: ((column: ColumnType<T>, rowIndex: number, colIndex: number) => string) | string;
  cellStyle?:
    | ((column: ColumnType<T>, rowIndex: number, colIndex: number) => React.CSSProperties)
    | React.CSSProperties;
  onRowEvents?: (record: T, rowIndex: number) => object;
  onCellEvents?: (record: T, rowIndex: number) => object;
}

function Tr<T extends { key?: number | string; children?: T[] }>(props: TrProps<T>) {
  const {
    striped,
    checked,
    rowData,
    rowIndex,
    columns,
    expanded,
    expandable,
    bordered,
    virtualized,
    offsetLeft,
    rowStyle,
    rowClassName,
    onRowEvents,
    ...restProps
  } = props;

  const trRef = useRef<HTMLTableRowElement>(null);
  const expandTrRef = useRef<HTMLTableRowElement>(null);

  const renderExpandRow = () => {
    const expandColumn = columns.find((column) => {
      if ('type' in column && column.type && column.type === 'expand') {
        return column;
      }
    });
    if (
      !expandColumn ||
      (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) ||
      !expanded
    )
      return;

    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(rowData, rowIndex);

    const style = virtualized && offsetLeft ? { transform: `translateX(${offsetLeft}px)` } : {};

    return (
      <tr
        key={`${rowIndex}_expand`}
        className={classnames({ [cls ?? '']: !!cls, [CLASS_ROW_EXPAND]: true })}
        ref={expandTrRef}
      >
        <td
          colSpan={columns.length}
          style={style}
          className={classnames({
            [`${PREFIXCLS}-cell-ignore-right-border`]: bordered,
            [CLASS_CELL_FIXED_LEFT]: true,
          })}
        >
          {expandable?.expandedRowRender &&
            expandable?.expandedRowRender(rowData, rowIndex, expanded)}
        </td>
      </tr>
    );
  };

  const rowEvents = useMemo(() => {
    if (typeof onRowEvents === 'function') {
      return onRowEvents(rowData, rowIndex);
    }
    return {};
  }, [rowData, rowIndex, onRowEvents]);

  const renderCells = () => {
    const cells = [];
    let isExist = false;
    let isFirstDefaultColumn = false;
    for (let i = 0; i < columns.length; i++) {
      let colSpan = 1;
      let rowSpan = 1;
      const column = columns[i];
      if (
        ('type' in column &&
          column.type &&
          !['expand', 'radio', 'checkbox'].includes(column.type)) ||
        (!('type' in column) && !isExist)
      ) {
        isExist = true;
        isFirstDefaultColumn = true;
      }
      if (typeof column?.onCell === 'function') {
        const cellProps = column.onCell(rowData, rowIndex);
        colSpan = cellProps?.colSpan ?? 1;
        rowSpan = cellProps?.rowSpan ?? 1;
      }
      if (!colSpan || !rowSpan) continue;
      const ignoreRightBorder =
        bordered && (i === columns.length - 1 || colSpan + i === columns.length);
      cells.push(
        <Td
          key={i}
          checked={checked}
          expanded={expanded}
          colIndex={i}
          rowIndex={rowIndex}
          column={column}
          rowSpan={rowSpan}
          colSpan={colSpan}
          rowData={rowData}
          expandable={expandable}
          virtualized={virtualized}
          offsetLeft={offsetLeft}
          ignoreRightBorder={ignoreRightBorder}
          isFirstDefaultColumn={isFirstDefaultColumn}
          {...restProps}
        />,
      );
      isFirstDefaultColumn = false;
    }

    return cells;
  };

  const classes: Record<string, boolean> = {
    [CLASS_ROW]: true,
    [`${PREFIXCLS}-row-even`]: striped && rowIndex % 2 !== 0,
    [`${PREFIXCLS}-row-odd`]: striped && rowIndex % 2 === 0,
    [`${PREFIXCLS}-row-selected`]: !!checked,
  };

  if (rowClassName && rowClassName(rowData, rowIndex)) {
    classes[rowClassName(rowData, rowIndex)] = !!rowClassName(rowData, rowIndex);
  }

  const style: React.CSSProperties =
    typeof rowStyle === 'function' ? rowStyle(rowData, rowIndex) ?? {} : rowStyle || {};

  return (
    <>
      <tr ref={trRef} key={rowIndex} style={style} className={classnames(classes)} {...rowEvents}>
        {renderCells()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
